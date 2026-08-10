import os
import re
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

def sanitize_raw_search_text(text: str) -> str:
    if not text:
        return ""
    s = str(text).strip()
    s = re.sub(r'^\s*#{1,6}\s*', '', s, flags=re.MULTILINE)
    s = re.sub(r'\b(?:Title|Photo|Read\s+more|Comments|Related|Pinterest|autocomplete|search\s+result|Home\s*/)\b:?', '', s, flags=re.IGNORECASE)
    s = re.sub(r'http[s]?://\S+', '', s)
    s = re.sub(r'www\.\S+', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def tavily_search(query: str) -> str:
    api_key = os.getenv("TAVILY_API_KEY", "").strip()
    if not api_key or "your_" in api_key.lower() or "placeholder" in api_key.lower():
        return ""

    try:
        clean_query = f"Top rated recommended hotels for {query} in English"
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=clean_query,
            max_results=5
        )

        results = []
        for i, r in enumerate(response.get("results", []), 1):
            title   = r.get("title", "Hotel Details").strip()
            url     = r.get("url", "").strip()
            snippet = r.get("content", "").strip()

            title = sanitize_raw_search_text(title)
            snippet = sanitize_raw_search_text(snippet)

            if len(snippet) > 220:
                snippet = snippet[:220].rsplit(" ", 1)[0] + "..."

            if title:
                link_markdown = f"[{title}]({url})" if url else title
                results.append(f"{i}. **{link_markdown}**\n   {snippet}")

        return "\n\n".join(results) if results else ""
    except Exception as e:
        print(f"[Warning] Tavily search error for '{query}': {e}")
        return ""

def tavily_search_places(destination: str) -> str:
    api_key = os.getenv("TAVILY_API_KEY", "").strip()
    if not api_key or "your_" in api_key.lower() or "placeholder" in api_key.lower():
        return ""

    try:
        clean_query = f"Top tourist attractions landmarks famous places and things to do in {destination}"
        client = TavilyClient(api_key=api_key)
        response = client.search(query=clean_query, max_results=6)
        results = []
        for r in response.get("results", []):
            title = sanitize_raw_search_text(r.get("title", "").strip())
            snippet = sanitize_raw_search_text(r.get("content", "").strip())
            if title and len(title) > 2:
                results.append(f"• {title}: {snippet}")
        return "\n".join(results)
    except Exception as e:
        print(f"[Warning] Tavily places search error for '{destination}': {e}")
        return ""

