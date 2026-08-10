'''
# LangGraph Multi-Agent Travel Booking System — 100% Dynamic AI Pipeline
'''

import os
import sys
import re
import json
import time
import concurrent.futures
from typing import TypedDict, Annotated, Optional
import operator

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import psycopg
from langgraph.graph import StateGraph, START, END

try:
    from langgraph.checkpoint.postgres import PostgresSaver
except ImportError:
    PostgresSaver = None
from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
)

from langchain_groq import ChatGroq

from tools.tavily_tool import tavily_search, tavily_search_places
from tools.flight_tool import search_flights, extract_route_cities
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
groq_key = os.getenv("GROQ_API_KEY", "")

try:
    if groq_key:
        llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=groq_key)
    else:
        llm = None
except Exception as e:
    print(f"[Warning] ChatGroq initialization warning: {e}")
    llm = None

def sanitize_activity_text(text: str) -> bool:
    if not text:
        return False
    s = str(text).strip()
    if len(s) < 3:
        return False
    noise_patterns = [
        r'^\s*#{1,6}\s*', r'\bTitle:\b', r'\bPhoto:\b', r'\bRead more\b', r'\bComments\b',
        r'\bRelated\b', r'\bPinterest\b', r'\bautocomplete\b', r'\bsearch result\b',
        r'\bHome\s*/\b', r'\[\.\.\.\]', r'http://', r'https://', r'www\.'
    ]
    for pat in noise_patterns:
        if re.search(pat, s, re.IGNORECASE):
            return False
    return True

def validate_hotel_results(hotel_text: str, destination: str, origin: str) -> tuple[str, list, list]:
    if not hotel_text or "No live hotel results found" in hotel_text or "No live accommodation results found" in hotel_text:
        return "", [], []

    dest_lower = destination.lower().strip()
    orig_lower = origin.lower().strip() if origin else ""

    # Common cities that should never appear as hotels unless destination is that city
    unrelated_cities = ["goa", "mumbai", "delhi", "paris", "london", "tokyo", "new york", "dubai", "rome", "bali"]
    unrelated_cities = [c for c in unrelated_cities if c not in dest_lower]

    blocks = hotel_text.split('\n\n')
    valid_blocks = []
    rejected_blocks = []

    for b in blocks:
        b_lower = b.lower()
        # Reject if block belongs strictly to origin city when origin != destination
        if orig_lower and orig_lower != dest_lower and orig_lower in b_lower and dest_lower not in b_lower:
            rejected_blocks.append(b)
            continue

        # Reject if block contains unrelated major destination city that does not match target destination
        has_unrelated_city = any(c in b_lower for c in unrelated_cities if c not in b_lower.replace(c, ''))
        # If block mentions an unrelated city and NOT target destination, reject it
        if has_unrelated_city and dest_lower not in b_lower:
            rejected_blocks.append(b)
            continue

        valid_blocks.append(b)

    return "\n\n".join(valid_blocks), valid_blocks, rejected_blocks

def safe_llm_invoke(messages, fallback_text=""):
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key or "your_" in groq_key.lower() or "placeholder" in groq_key.lower():
        return AIMessage(content=fallback_text)

    models = [
        "llama-3.1-8b-instant",
        "llama-3.3-70b-versatile"
    ]
    for m in models:
        try:
            temp_llm = ChatGroq(model=m, temperature=0.3, groq_api_key=groq_key, request_timeout=8.0)
            res = temp_llm.invoke(messages)
            if res and res.content and res.content.strip():
                return res
        except Exception as e:
            print(f"[Notice] Groq LLM model '{m}' error: {e}")
            continue

    return AIMessage(content=fallback_text)

def clean_dest_name(text: str) -> Optional[str]:
    if not text: return None
    s = text.strip()
    prefixes = [
        r'^\s*i\s+want\s+to\s+go\s+to\s+',
        r'^\s*i\s+want\s+to\s+visit\s+',
        r'^\s*i\s+want\s+to\s+travel\s+to\s+',
        r'^\s*i\s+want\s+to\s+',
        r'^\s*want\s+to\s+go\s+to\s+',
        r'^\s*want\s+to\s+visit\s+',
        r'^\s*want\s+to\s+',
        r'^\s*plan\s+a\s+trip\s+to\s+',
        r'^\s*plan\s+trip\s+to\s+',
        r'^\s*plan\s+to\s+visit\s+',
        r'^\s*trip\s+to\s+',
        r'^\s*travel\s+to\s+',
        r'^\s*heading\s+to\s+',
        r'^\s*go\s+to\s+',
        r'^\s*visit\s+',
        r'^\s*explore\s+'
    ]
    for p in prefixes:
        s = re.sub(p, '', s, flags=re.IGNORECASE).strip()
    
    s = re.sub(r'\s*(?:for\s+)?\d+\s*days?.*$', '', s, flags=re.IGNORECASE).strip()
    words = s.split()
    if len(words) > 4:
        s = " ".join(words[:4])
    if not s or s.lower() in ["the", "a", "an", "days", "day", "trip", "plan", "somewhere"]:
        return None
    return s.title()

def parse_travel_intent(query: str) -> dict:
    query_clean = query.strip()

    # 1. Try AI Intent Parser via LLM
    ai_prompt = f"""You are a strict travel intent parser. Parse the user query into structured JSON.

User Query: "{query_clean}"

Return ONLY a raw JSON object with this exact structure:
{{
  "origin": "<city name if explicitly stated as departure location in prompt, else null>",
  "destination": "<target destination city/region/country name>",
  "country": "<country name for destination>",
  "duration_days": <integer between 1 and 12>,
  "multi_destination": <boolean>,
  "flight_required": <boolean true ONLY if origin is NOT null>
}}

CRITICAL RULES:
1. If no explicit departure location is mentioned (e.g. "ooty 4 days", "I want to visit Ooty for 3 days", "plan a trip to Paris for 5 days", "7 days in Japan"), "origin" MUST be null and "flight_required" MUST be false.
2. DO NOT invent an origin city. DO NOT assume user's current location.
3. Extract duration in days (1 to 12). Default to 3 if not specified.
"""
    ai_resp = safe_llm_invoke([
        SystemMessage(content="You are a strict JSON-only travel parser. Return raw JSON only with no markdown wrapping."),
        HumanMessage(content=ai_prompt)
    ], fallback_text="")

    if ai_resp and ai_resp.content and ai_resp.content.strip():
        raw_json = ai_resp.content.strip()
        if raw_json.startswith("```"): raw_json = raw_json.split("\n", 1)[-1]
        if raw_json.endswith("```"): raw_json = raw_json.rsplit("```", 1)[0]
        raw_json = raw_json.strip()
        try:
            parsed = json.loads(raw_json)
            if isinstance(parsed, dict) and parsed.get("destination"):
                dest = str(parsed["destination"]).strip().title()
                orig = str(parsed["origin"]).strip().title() if parsed.get("origin") else None
                country = str(parsed.get("country", "International")).strip().title()
                dur = max(1, min(12, int(parsed.get("duration_days", 3))))
                flight_req = bool(orig and orig.lower() != "null")
                if not flight_req: orig = None

                return {
                    "user_query": query,
                    "origin": orig,
                    "destination": dest,
                    "country": country,
                    "duration_days": dur,
                    "multi_destination": bool(parsed.get("multi_destination", False)),
                    "flight_required": flight_req
                }
        except Exception as e:
            print(f"[Notice] AI Intent Parser JSON parse fallback: {e}")

    # 2. Rule-based Fallback Parser
    query_lower = query_clean.lower()
    
    match_d = re.search(r'(\d+)\s*-?\s*(?:day|days)', query_lower)
    num_days = 3
    if match_d:
        num_days = max(1, min(12, int(match_d.group(1))))
    else:
        word_map = { "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12 }
        for w, v in word_map.items():
            if re.search(rf'\b{w}\s*-?\s*(?:day|days)\b', query_lower):
                num_days = v
                break

    dep_c, dep_code, arr_c, arr_code = extract_route_cities(query_clean)
    has_explicit_origin = dep_c is not None and dep_code is not None

    to_match = re.search(r'(?:from\s+)?(.+?)\s+(?:to|-)\s+(.+)', query_clean, re.IGNORECASE)
    dest_candidate = None
    orig_candidate = None
    if to_match and has_explicit_origin:
        orig_candidate = clean_dest_name(to_match.group(1))
        dest_candidate = clean_dest_name(to_match.group(2))
    else:
        dest_candidate = clean_dest_name(query_clean) or arr_c

    if dest_candidate:
        dest_candidate = re.sub(r'\s*(?:for\s+)?\d+\s*days?$', '', dest_candidate, flags=re.IGNORECASE).strip()

    orig_final = orig_candidate or (dep_c.title() if has_explicit_origin and dep_c else None)
    dest_final = dest_candidate.title() if dest_candidate else "Destination"

    return {
        "user_query": query_clean,
        "origin": orig_final,
        "destination": dest_final,
        "country": "International",
        "duration_days": num_days,
        "multi_destination": bool(orig_final and dest_final),
        "flight_required": bool(has_explicit_origin and orig_final)
    }

class TravelState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    user_query: str
    origin: Optional[str]
    destination: Optional[str]
    country: Optional[str]
    duration_days: int
    flight_required: bool
    flight_results: str
    hotel_results: str
    places_results: str
    places_data: list
    itinerary: str
    trip_story: str
    llm_calls: int

def validate_and_repair_itinerary_data(data: dict, destination: str, duration_days: int, places_data: list = None) -> dict:
    dest_title = (destination or "Destination").title()
    
    generic_banned = [
        "cultural sightseeing", "heritage sightseeing",
        "explore historic monuments", "visit scenic spots", "explore local attractions",
        "morning landmark tour", "cultural & heritage visit", "gourmet dining", "bazaar stroll",
        "arrival & sightseeing", "culture & dining", "highlights & departure"
    ]

    if not isinstance(data, dict):
        data = {}

    days = data.get("days", [])
    if not isinstance(days, list):
        days = []

    # Enforce days count equals requested duration
    if len(days) < duration_days:
        for missing_d in range(len(days) + 1, duration_days + 1):
            days.append({
                "day": missing_d,
                "title": f"{dest_title} Day {missing_d} Highlights",
                "summary": f"Discover prominent sights and local culture in {dest_title}.",
                "ai_story": f"Day {missing_d} brings new discoveries across landmark quarter of {dest_title}.",
                "activities": []
            })
    elif len(days) > duration_days:
        days = days[:duration_days]

    used_names = set()

    # Pre-load attraction pool strictly from AI places_data (or dynamically constructed for target destination)
    attraction_pool = []
    if places_data and isinstance(places_data, list) and len(places_data) > 0:
        for p in places_data:
            if isinstance(p, dict) and p.get("name"):
                attraction_pool.append({
                    "name": p.get("name"),
                    "description": p.get("description", f"Explore {p.get('name')} in {dest_title}."),
                    "category": p.get("category", "Landmark"),
                    "duration_minutes": 120
                })

    pool_index = 0

    for idx, day_obj in enumerate(days):
        day_num = idx + 1
        day_obj["day"] = day_num

        raw_title = day_obj.get("title", "").strip()
        raw_title = re.sub(r'^Day\s+\d+:\s*', '', raw_title, flags=re.IGNORECASE)
        if not raw_title or any(b in raw_title.lower() for b in generic_banned) or not sanitize_activity_text(raw_title):
            raw_title = f"{dest_title} Day {day_num} Highlights"
        day_obj["title"] = raw_title

        if not day_obj.get("summary") or not sanitize_activity_text(day_obj.get("summary")):
            day_obj["summary"] = f"Explore top sights and regional experiences in {dest_title}."
        if not day_obj.get("ai_story") or not sanitize_activity_text(day_obj.get("ai_story")):
            day_obj["ai_story"] = f"Day {day_num} brings memorable experiences across famous landmarks and local culture in {dest_title}."

        # Strip any price strings from ai_story text
        day_obj["ai_story"] = re.sub(r'₹\s*[\d,]+(?:/night)?', '', day_obj["ai_story"])
        day_obj["ai_story"] = re.sub(r'\$\s*[\d,]+(?:/night)?', '', day_obj["ai_story"])

        activities = day_obj.get("activities", [])
        if not isinstance(activities, list):
            activities = []

        valid_activities = []
        for act in activities:
            if isinstance(act, dict) and act.get("name"):
                name = act.get("name", "").strip()
                desc = act.get("description", "").strip()
                
                # Strip prices from activity text
                desc = re.sub(r'₹\s*[\d,]+(?:/night)?', '', desc)
                desc = re.sub(r'\$\s*[\d,]+(?:/night)?', '', desc)

                name_lower = name.lower()
                is_banned = any(b in name_lower for b in generic_banned)
                is_duplicate = name_lower in used_names
                is_clean_name = sanitize_activity_text(name)
                is_clean_desc = sanitize_activity_text(desc) if desc else True

                if not is_banned and not is_duplicate and is_clean_name and is_clean_desc:
                    used_names.add(name_lower)
                    act["description"] = desc
                    valid_activities.append(act)

        default_times = ["08:30 AM", "11:00 AM", "01:30 PM", "04:00 PM", "07:00 PM"]

        # GUARANTEE: Every day MUST have at least 3 unique activities!
        while len(valid_activities) < 3:
            found_cand = False
            while attraction_pool and pool_index < len(attraction_pool) * 6:
                candidate = attraction_pool[pool_index % len(attraction_pool)]
                pool_index += 1
                cand_name = candidate["name"]
                if cand_name.lower() not in used_names:
                    used_names.add(cand_name.lower())
                    act_idx = len(valid_activities)
                    t_str = default_times[act_idx % len(default_times)]
                    valid_activities.append({
                        "time": t_str,
                        "name": cand_name,
                        "description": candidate["description"],
                        "category": candidate.get("category", "Landmark"),
                        "duration_minutes": candidate.get("duration_minutes", 120),
                        "ai_reason": f"AI selected highlight for {dest_title}."
                    })
                    found_cand = True
                    break

            if len(valid_activities) < 3 and not found_cand:
                act_idx = len(valid_activities)
                t_str = default_times[act_idx % len(default_times)]
                if act_idx == 0:
                    synth_title = f"{dest_title} Heritage Walk & Central Landmark"
                elif act_idx == 1:
                    synth_title = f"{dest_title} Scenic Overlook & Botanical Garden"
                elif act_idx == 2:
                    synth_title = f"{dest_title} Cultural Bazaar & Local Culinary Spot"
                else:
                    synth_title = f"{dest_title} Day {day_num} Scenic Sight #{act_idx + 1}"
                
                if synth_title.lower() not in used_names:
                    used_names.add(synth_title.lower())
                    valid_activities.append({
                        "time": t_str,
                        "name": synth_title,
                        "description": f"Explore prominent cultural landmarks, historic architecture, and scenic spots in {dest_title}.",
                        "category": "Landmark",
                        "duration_minutes": 120,
                        "ai_reason": f"Destination highlight for {dest_title}."
                    })

        for act_i, act in enumerate(valid_activities):
            if not act.get("time"):
                act["time"] = default_times[act_i % len(default_times)]
            if not act.get("category"):
                act["category"] = "Landmark"
            if not act.get("duration_minutes"):
                act["duration_minutes"] = 120
            # Strip any prices
            if "estimated_cost" in act:
                del act["estimated_cost"]
            if "currency" in act:
                del act["currency"]
            if not act.get("ai_reason"):
                act["ai_reason"] = f"Curated highlight for {dest_title}."

        day_obj["activities"] = valid_activities

    data["destination"] = dest_title
    data["duration_days"] = duration_days
    data["days"] = days
    return data

def format_itinerary_to_markdown(itinerary_data: dict) -> str:
    dest = itinerary_data.get("destination", "Destination")
    duration = itinerary_data.get("duration_days", len(itinerary_data.get("days", [])))
    days = itinerary_data.get("days", [])

    markdown_lines = [f"### Master {duration}-Day Travel Plan for: {dest}\n"]

    for d in days:
        d_num = d.get("day", 1)
        d_title = d.get("title", f"Day {d_num}: {dest} Exploration")
        if not d_title.lower().startswith(f"day {d_num}"):
            d_header = f"Day {d_num}: {d_title}"
        else:
            d_header = d_title

        markdown_lines.append(f"**{d_header}**")
        for act in d.get("activities", []):
            t_str = act.get("time", "09:00 AM")
            name = act.get("name", "Attraction")
            desc = act.get("description", "")
            markdown_lines.append(f"- {t_str}: {name} - {desc}")
        markdown_lines.append("")

    return "\n".join(markdown_lines)

# 1. Flight Agent — Activate ONLY when explicit origin is present
def flight_agent(state: TravelState):
    print(f"\n==================== [FLIGHT AGENT DEBUG] ====================")
    print(f"[Flight Agent] started")
    query = state.get("user_query", "")
    intent = parse_travel_intent(query)
    flight_req = intent.get("flight_required", False)
    origin = intent.get("origin")
    dest = intent.get("destination")

    if not flight_req or not origin or not dest:
        print(f"[Flight Agent] SKIPPED (destination-only query, no origin specified)")
        print(f"[Flight Agent] completed")
        print(f"=============================================================\n")
        return {
            "flight_results": "",
            "flight_required": False,
            "origin": None,
            "messages": [AIMessage(content="Flight Agent skipped (destination-only query)")],
            "llm_calls": state.get("llm_calls", 0) + 1
        }

    print(f"[Flight Agent] EXECUTING FLIGHT SEARCH: '{origin}' -> '{dest}'")
    flight_data = search_flights(query)
    print(f"[Flight Agent] completed")
    print(f"=============================================================\n")
    return {
        "flight_results": flight_data,
        "flight_required": True,
        "origin": origin,
        "messages": [AIMessage(content=f"Flight results fetched for {origin} -> {dest}")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# 2. Hotel Agent — Dynamic AI & Search strictly for Target Destination
def hotel_agent(state: TravelState):
    print(f"\n==================== [HOTEL AGENT DEBUG] ====================")
    print(f"[Hotel Agent] started")
    user_query = state.get("user_query", "")
    intent = parse_travel_intent(user_query)
    origin = intent.get("origin")
    destination = intent.get("destination")

    if not destination:
        print(f"[Hotel Agent] ERROR: Destination not specified")
        return {
            "hotel_results": "No live accommodation results found for this destination.",
            "messages": [AIMessage(content="Destination missing")],
            "llm_calls": state.get("llm_calls", 0) + 1
        }

    dest_title = destination.title()
    orig_title = origin.title() if origin else ""

    print(f"[Hotel Agent] Dynamically searching hotels for '{dest_title}'")
    search_query = f"Best top rated luxury 4 star and 5 star hotels in {dest_title}"
    raw_results = tavily_search(search_query)
    validated_text, valid_list, rejected_list = validate_hotel_results(raw_results, dest_title, orig_title)

    # Dynamic AI Fallback if web search is empty or returned invalid city hotels
    if not validated_text or len(valid_list) == 0:
        print(f"[Hotel Agent] Web search empty/invalid for '{dest_title}'. Asking AI dynamically.")
        ai_resp = safe_llm_invoke([
            SystemMessage(content=f"You are a travel assistant. List 4 real, top-rated hotels specifically located in {dest_title}. DO NOT list hotels from other cities."),
            HumanMessage(content=f"List 4 popular luxury and boutique hotels located strictly in {dest_title} with 1-sentence descriptions.")
        ], fallback_text="")

        if ai_resp and ai_resp.content.strip():
            ai_validated_text, ai_valid_list, _ = validate_hotel_results(ai_resp.content.strip(), dest_title, orig_title)
            if ai_valid_list and len(ai_valid_list) > 0:
                validated_text = f"Top Recommended Hotels in {dest_title}:\n{ai_validated_text}"
            else:
                validated_text = f"No live accommodation results found for {dest_title}."
        else:
            validated_text = f"No live accommodation results found for {dest_title}."

    print(f"[Hotel Agent] completed for '{dest_title}'")
    print(f"=============================================================\n")

    return {
        "hotel_results": validated_text,
        "origin": orig_title or None,
        "destination": dest_title,
        "messages": [
            AIMessage(content=f"Hotel information fetched for {dest_title}")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# 3. Places Agent — Dynamic AI Places Discovery Node
def places_agent(state: TravelState):
    print(f"\n==================== [PLACES AGENT DEBUG] ====================")
    print(f"[Places Agent] started")
    user_q = state.get("user_query", "")
    intent = parse_travel_intent(user_q)
    dest_c = intent.get('destination')

    if not dest_c:
        print(f"[Places Agent] ERROR: Destination not specified")
        return {
            "places_results": "",
            "places_data": [],
            "messages": [AIMessage(content="Destination missing")],
            "llm_calls": state.get("llm_calls", 0) + 1
        }

    dest_title = dest_c.title()
    print(f"[Places Agent] Dynamically discovering attractions for '{dest_title}'")
    research_text = tavily_search_places(dest_title)

    discovered_places = []
    if research_text:
        lines = research_text.split("\n")
        for line in lines:
            if line.startswith("• "):
                parts = line[2:].split(":", 1)
                p_name = parts[0].strip()
                p_desc = parts[1].strip() if len(parts) > 1 else f"Popular attraction in {dest_title}."
                if p_name and sanitize_activity_text(p_name):
                    discovered_places.append({
                        "name": p_name,
                        "description": p_desc,
                        "category": "Landmark"
                    })

    # Dynamic AI generation if web search finds fewer than 5 places
    if len(discovered_places) < 5:
        print(f"[Places Agent] Generating additional dynamic places via AI for '{dest_title}'")
        ai_resp = safe_llm_invoke([
            SystemMessage(content=f"You are a travel expert. Return raw JSON array of 8 top tourist attractions located strictly in {dest_title}: [{{\"name\":\"...\", \"description\":\"...\", \"category\":\"...\"}}]"),
            HumanMessage(content=f"Return top 8 tourist attractions and sights in {dest_title}.")
        ], fallback_text="")
        try:
            raw = ai_resp.content.strip()
            if raw.startswith("```"): raw = raw.split("\n", 1)[-1]
            if raw.endswith("```"): raw = raw.rsplit("```", 1)[0]
            ai_places = json.loads(raw.strip())
            if isinstance(ai_places, list):
                for p in ai_places:
                    if isinstance(p, dict) and p.get("name") and sanitize_activity_text(p["name"]):
                        discovered_places.append({
                            "name": p["name"],
                            "description": p.get("description", f"Famous sight in {dest_title}."),
                            "category": p.get("category", "Landmark")
                        })
        except Exception as e:
            print(f"[Places Agent] Dynamic AI JSON parse notice: {e}")

    print(f"[Places Agent] discovered {len(discovered_places)} attractions for '{dest_title}'")
    print(f"[Places Agent] completed")
    print(f"=============================================================\n")

    return {
        "places_results": research_text,
        "places_data": discovered_places,
        "messages": [AIMessage(content=f"Discovered places for {dest_title}")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# 4. Itinerary Agent — Dynamic Day-by-Day Generation
def itinerary_agent(state: TravelState):
    print(f"\n==================== [ITINERARY AGENT DEBUG] ====================")
    print(f"[Itinerary Agent] Started")
    user_q = state.get("user_query", "")
    intent = parse_travel_intent(user_q)
    num_days = intent['duration_days']
    orig_c = intent['origin']
    dest_c = intent.get('destination')

    if not dest_c:
        print(f"[Itinerary Agent] FAILED: Destination missing")
        return {
            "itinerary": "Unable to retrieve travel information right now. Please specify a destination.",
            "trip_story": "",
            "messages": [AIMessage(content="Destination missing")],
            "llm_calls": state.get("llm_calls", 0) + 1
        }

    dest_title = dest_c.title()
    print(f"[Itinerary Agent] Destination: {dest_title}")
    print(f"[Itinerary Agent] Days: {num_days}")

    if num_days and num_days > 12:
        error_msg = "Trips can currently be planned for up to 12 days. Please choose a duration between 1 and 12 days."
        print(f"[Itinerary Agent] FAILED: Duration exceeds maximum limit of 12 days")
        return {
            "itinerary": error_msg,
            "trip_story": "",
            "destination": dest_title,
            "duration_days": num_days,
            "messages": [AIMessage(content=error_msg)],
            "llm_calls": state.get("llm_calls", 0) + 1
        }

    places_data = state.get("places_data", [])
    places_text = state.get("places_results", "")

    places_context = ""
    if places_data:
        places_context = "\n".join([f"- {p['name']}: {p.get('description','')}" for p in places_data if isinstance(p, dict) and p.get('name')])
    else:
        places_context = places_text

    BATCH_SIZE = 6
    all_days = []

    batches = []
    curr = 1
    while curr <= num_days:
        b_end = min(curr + BATCH_SIZE - 1, num_days)
        batches.append((curr, b_end))
        curr = b_end + 1

    def generate_single_batch(b_info):
        b_start, b_end = b_info
        b_count = b_end - b_start + 1
        
        prompt = f"""You are an expert AI Travel Planner. Generate a detailed day-by-day itinerary for Days {b_start} to {b_end} (EXACTLY {b_count} days) of a {num_days}-day trip to {dest_title}.

User Query: "{user_q}"
Origin: "{orig_c or 'Not Specified'}"
Destination: "{dest_title}"

Available Attractions for {dest_title}:
{places_context}

CRITICAL RULES:
1. "days" array MUST contain EXACTLY {b_count} items (Day {b_start} to Day {b_end}).
2. EVERY DAY MUST contain 3 to 5 real, specific places/activities in {dest_title} with specific times (e.g. 08:30 AM, 11:00 AM, 02:00 PM, 04:30 PM, 07:30 PM).
3. EVERY ACTIVITY MUST BE A DISTINCT REAL PLACE OR ATTRACTION. DO NOT REPEAT ANY PLACE NAME.
4. Day titles MUST be place-specific for {dest_title} (e.g. "Day {b_start}: {dest_title} Central Landmarks & Gardens"). DO NOT use repetitive generic titles.
5. Activity descriptions MUST be clean, concise 1-2 sentences. NO raw search text, NO article titles ("Title:"), NO markdown headers ("###"), NO SEO copy, NO prices.
6. ABSOLUTELY NO PRICES or cost amounts anywhere in activity descriptions.

Return ONLY raw JSON:
{{
  "days": [
    {{
      "day": {b_start},
      "title": "<place-specific day title>",
      "summary": "<1-2 sentence overview of the day>",
      "ai_story": "<2-3 sentence travel journal entry>",
      "activities": [
        {{
          "time": "08:30 AM",
          "name": "<real specific place in {dest_title}>",
          "description": "<concise 1-2 sentence summary>",
          "category": "Landmark",
          "duration_minutes": 120,
          "ai_reason": "<1 sentence why selected>"
        }}
      ]
    }}
  ]
}}"""

        batch_resp = safe_llm_invoke([
            SystemMessage(content="You are a strict JSON-only AI travel planner. Return ONLY valid raw JSON with no markdown formatting."),
            HumanMessage(content=prompt)
        ], fallback_text="")

        raw_b = batch_resp.content.strip()
        if raw_b.startswith("```"): raw_b = raw_b.split("\n", 1)[-1]
        if raw_b.endswith("```"): raw_b = raw_b.rsplit("```", 1)[0]
        raw_b = raw_b.strip()

        try:
            parsed_b = json.loads(raw_b)
            return parsed_b.get("days", []) if isinstance(parsed_b, dict) else []
        except Exception as e:
            print(f"[Itinerary Agent] Batch Days {b_start}-{b_end} JSON parse notice: {e}")
            m = re.search(r'\{.*\}', raw_b, re.DOTALL)
            if m:
                try:
                    parsed_b = json.loads(m.group(0))
                    return parsed_b.get("days", []) if isinstance(parsed_b, dict) else []
                except Exception:
                    pass
            return []

    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(10, len(batches))) as executor:
        batch_results = list(executor.map(generate_single_batch, batches))

    for b_days in batch_results:
        all_days.extend(b_days)

    parsed_data = {
        "destination": dest_title,
        "duration_days": num_days,
        "days": all_days
    }

    validated_data = validate_and_repair_itinerary_data(parsed_data, dest_title, num_days, places_data)
    markdown_itinerary = format_itinerary_to_markdown(validated_data)

    story_json_obj = {
        "trip": {
            "destination": dest_title,
            "country": intent.get("country", "International"),
            "duration_days": num_days
        },
        "days": validated_data["days"]
    }
    trip_story_json_str = json.dumps(story_json_obj, indent=2)

    return {
        "itinerary": markdown_itinerary,
        "trip_story": trip_story_json_str,
        "duration_days": num_days,
        "destination": dest_title,
        "origin": orig_c,
        "messages": [AIMessage(content=f"Master {num_days}-day itinerary generated for {dest_title}")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# 5. Final Response Agent
def final_agent(state: TravelState):
    print(f"[Final Agent] generating combined master plan summary")
    final_prompt = f"""
Generate final travel summary.

Flights:
{state.get('flight_results', '')}

Hotels:
{state.get('hotel_results', '')}

Itinerary:
{state.get('itinerary', '')}
"""

    fallback_final = f"""# ✈️ Complete Travel Plan

## 🛫 Flights
{state.get('flight_results', '')}

## 🏨 Accommodations
{state.get('hotel_results', '')}

## 🗓️ Itinerary
{state.get('itinerary', '')}"""

    response = safe_llm_invoke([
        HumanMessage(content=final_prompt)
    ], fallback_text=fallback_final)

    return {
        "messages": [response],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# 6. Story Agent — Price-Free Travel Story Generator
def story_agent(state: TravelState):
    trip_story_val = state.get("trip_story", "")
    intent = parse_travel_intent(state.get("user_query", ""))
    num_days = intent['duration_days']
    dest_c = intent.get('destination', 'Destination')

    if trip_story_val:
        try:
            story_obj = json.loads(trip_story_val)
            if isinstance(story_obj, dict):
                # Ensure no budget/price fields exist in story payload
                if "trip" in story_obj and isinstance(story_obj["trip"], dict):
                    story_obj["trip"].pop("budget", None)
                if "days" in story_obj and isinstance(story_obj["days"], list):
                    for d in story_obj["days"]:
                        if isinstance(d, dict):
                            d["ai_story"] = re.sub(r'₹\s*[\d,]+(?:/night)?', '', d.get("ai_story", ""))
                            d["ai_story"] = re.sub(r'\$\s*[\d,]+(?:/night)?', '', d["ai_story"])
                            for act in d.get("activities", []):
                                if isinstance(act, dict):
                                    act.pop("estimated_cost", None)
                                    act.pop("currency", None)
                                    act["description"] = re.sub(r'₹\s*[\d,]+(?:/night)?', '', act.get("description", ""))
                                    act["description"] = re.sub(r'\$\s*[\d,]+(?:/night)?', '', act["description"])
                trip_story_val = json.dumps(story_obj, indent=2)
        except Exception:
            pass
    else:
        val_data = validate_and_repair_itinerary_data({}, dest_c, num_days, state.get("places_data", []))
        trip_story_val = json.dumps({
            "trip": {
                "destination": dest_c,
                "country": intent.get("country", "International"),
                "duration_days": num_days
            },
            "days": val_data["days"]
        }, indent=2)

    return {
        "trip_story": trip_story_val,
        "messages": [AIMessage(content="Trip story synchronized")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# Construct State Graph Pipeline
graph = StateGraph(TravelState)

graph.add_node("flight_agent", flight_agent)
graph.add_node("hotel_agent", hotel_agent)
graph.add_node("places_agent", places_agent)
graph.add_node("itinerary_agent", itinerary_agent)
graph.add_node("final_agent", final_agent)
graph.add_node("story_agent", story_agent)

graph.add_edge(START, "flight_agent")
graph.add_edge("flight_agent", "hotel_agent")
graph.add_edge("hotel_agent", "places_agent")
graph.add_edge("places_agent", "itinerary_agent")
graph.add_edge("itinerary_agent", "final_agent")
graph.add_edge("final_agent", "story_agent")
graph.add_edge("story_agent", END)

# Checkpointer setup with Postgres and MemorySaver fallback
try:
    if DATABASE_URL and PostgresSaver is not None:
        conn = psycopg.connect(DATABASE_URL, autocommit=True)
        memory = PostgresSaver(conn)
        memory.setup()
        app = graph.compile(checkpointer=memory)
        print("[Success] PostgreSQL checkpointer initialized.")
    else:
        raise Exception("PostgresSaver unavailable or no DATABASE_URL configured.")
except Exception as e:
    print(f"[Notice] Postgres connection skipped/failed: {e}")
    from langgraph.checkpoint.memory import MemorySaver
    memory = MemorySaver()
    app = graph.compile(checkpointer=memory)
    print("[Notice] Using MemorySaver checkpointer for state management.")
