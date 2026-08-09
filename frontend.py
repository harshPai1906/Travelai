import os
import streamlit as st
import streamlit.components.v1 as components
import json
from datetime import datetime
from langchain_core.messages import HumanMessage
from main import app

st.set_page_config(
    page_title="AI Travel Booking System",
    page_icon="✈️",
    layout="wide"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ── Light Minimal Theme Tokens ── */
:root {
    --bg-main: #f8fafc;
    --bg-card: #ffffff;
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --primary-light: #eef2ff;
    --accent-cyan: #06b6d4;
    --text-dark: #0f172a;
    --text-muted: #475569;
    --text-light: #64748b;
    --border-color: #e2e8f0;
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.02);
    --shadow-md: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    --shadow-lg: 0 20px 30px -10px rgba(79, 70, 229, 0.12);
}

/* ── Base Reset & Layout ── */
html, body, .stApp {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    background-color: var(--bg-main) !important;
    color: var(--text-dark) !important;
}

/* Smooth fade-in animation for pages */
.stApp > div {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.2); }
    70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}

/* ── Hero Banner ── */
.hero-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%);
    box-shadow: var(--shadow-md);
    padding: 3rem 2.5rem;
    color: #ffffff;
    text-align: center;
    transition: transform 0.3s ease;
}

.hero-badge {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: #ffffff;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.35rem 1rem;
    border-radius: 30px;
    margin-bottom: 1.2rem;
    display: inline-block;
}

.hero-title {
    font-size: 2.75rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.75rem;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.hero-sub {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.05rem;
    max-width: 620px;
    margin: 0 auto;
    font-weight: 400;
    line-height: 1.6;
}

/* ── Input Card Container ── */
.input-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 1.8rem;
    box-shadow: var(--shadow-md);
    margin-bottom: 1.5rem;
}

.input-label {
    color: var(--text-dark);
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Quick Fill Buttons */
div[data-testid="stColumn"] button {
    border-radius: 20px !important;
    border: 1px solid var(--border-color) !important;
    background: var(--bg-card) !important;
    color: var(--text-muted) !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: var(--shadow-sm) !important;
}

div[data-testid="stColumn"] button:hover {
    background: var(--primary-light) !important;
    border-color: var(--primary) !important;
    color: var(--primary) !important;
    transform: translateY(-2px) !important;
}

/* Textarea input */
.stTextArea textarea {
    background: #ffffff !important;
    border: 1.5px solid var(--border-color) !important;
    border-radius: 12px !important;
    color: var(--text-dark) !important;
    font-size: 0.98rem !important;
    padding: 0.9rem 1.1rem !important;
    box-shadow: var(--shadow-sm) !important;
    transition: all 0.2s ease !important;
}

.stTextArea textarea:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15) !important;
}

/* Generate Button */
div[data-testid="stButton"] > button {
    background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 0.9rem 2rem !important;
    font-size: 1.05rem !important;
    font-weight: 600 !important;
    width: 100% !important;
    box-shadow: var(--shadow-md) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

div[data-testid="stButton"] > button:hover {
    box-shadow: var(--shadow-lg) !important;
    transform: translateY(-2px) !important;
    background: linear-gradient(135deg, var(--primary-hover) 0%, #4f46e5 100%) !important;
}

/* ── Streamlit Status Cards (Agent Steps) ── */
[data-testid="stStatusWidget"] {
    background: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 14px !important;
    box-shadow: var(--shadow-sm) !important;
    margin-bottom: 0.8rem !important;
    transition: all 0.2s ease !important;
}

[data-testid="stStatusWidget"]:hover {
    box-shadow: var(--shadow-md) !important;
}

[data-testid="stStatusWidget"] * {
    color: var(--text-dark) !important;
}

[data-testid="stStatusWidget"] summary {
    font-weight: 600 !important;
    color: var(--primary) !important;
}

/* ── Section Headers ── */
.sec-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary-light);
}

.sec-head span {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-dark);
}

/* ── Metrics Bar ── */
.metric-row {
    display: flex;
    gap: 1.2rem;
    margin: 1.5rem 0;
}

.metric-box {
    flex: 1;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 1.2rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s ease;
}

.metric-box:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.metric-val {
    font-size: 1.9rem;
    font-weight: 700;
    color: var(--primary);
}

.metric-lbl {
    font-size: 0.78rem;
    color: var(--text-light);
    margin-top: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
}

/* ── Final Plan Card ── */
.final-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-left: 5px solid var(--primary);
    border-radius: 16px;
    padding: 2rem;
    line-height: 1.8;
    color: var(--text-dark);
    font-size: 0.98rem;
    box-shadow: var(--shadow-md);
    margin-top: 1rem;
}

/* Markdown typography in Final Card */
.final-card h1, .final-card h2, .final-card h3 {
    color: var(--text-dark) !important;
    font-weight: 700 !important;
    margin-top: 1.2rem !important;
}

.final-card a {
    color: var(--primary) !important;
    font-weight: 600 !important;
    text-decoration: none !important;
}
.final-card a:hover {
    text-decoration: underline !important;
}

/* ── Sidebar ── */
section[data-testid="stSidebar"] {
    background: #ffffff !important;
    border-right: 1px solid var(--border-color) !important;
}

.sidebar-title {
    color: var(--text-dark) !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    margin: 1.2rem 0 0.6rem !important;
}

.sidebar-chip {
    background: var(--primary-light);
    border: 1px solid rgba(79, 70, 229, 0.15);
    border-radius: 8px;
    padding: 0.5rem 0.8rem;
    margin-bottom: 0.4rem;
    font-size: 0.84rem;
    font-weight: 500;
    color: var(--primary);
    transition: all 0.2s ease;
}

.sidebar-chip:hover {
    background: #e0e7ff;
    transform: translateX(3px);
}

/* Streamlit Inputs in Light Mode */
.stTextInput input {
    background: #ffffff !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    color: var(--text-dark) !important;
    box-shadow: var(--shadow-sm) !important;
}

.stTextInput input:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15) !important;
}

.stMarkdown, .stMarkdown p, .stMarkdown li {
    color: var(--text-dark) !important;
}

.stMarkdown a {
    color: var(--primary) !important;
    text-decoration: none !important;
    font-weight: 600 !important;
}

.stMarkdown a:hover {
    text-decoration: underline !important;
}

/* Save Bar */
.save-bar {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 0.9rem 1.2rem;
    color: var(--text-muted);
    font-size: 0.88rem;
    margin-top: 0.5rem;
    box-shadow: var(--shadow-sm);
}

.save-bar code {
    color: var(--primary) !important;
    background: var(--primary-light) !important;
    padding: 0.2rem 0.5rem !important;
    border-radius: 6px !important;
}

/* Hide Streamlit default headers */
#MainMenu, footer, header { visibility: hidden; }

/* Download Button */
div[data-testid="stDownloadButton"] > button {
    background: var(--bg-card) !important;
    color: var(--primary) !important;
    border: 1.5px solid var(--primary) !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    box-shadow: var(--shadow-sm) !important;
    transition: all 0.2s ease !important;
}

div[data-testid="stDownloadButton"] > button:hover {
    background: var(--primary-light) !important;
    transform: translateY(-2px) !important;
}
</style>
""", unsafe_allow_html=True)

def render_streamlit_map(query):
    st.markdown("<div class='sec-head'><span>🗺️ Interactive Route Map & Places to Visit</span></div>", unsafe_allow_html=True)
    
    q = query.lower()
    import re
    dest = q
    match_to = re.search(r'(?:to|-)\s+([a-zA-Z\s]+)', q)
    if match_to:
        candidate = re.sub(r'\b(plan|trip|itinerary|itenary|flights|hotels|days|day|for|search|best|mumabai)\b', '', match_to.group(1)).strip()
        if candidate:
            dest = candidate

    is_temple = any(w in q for w in ['temple', 'spiritual', 'shrine', 'mandir', 'darshan', 'worship', 'pilgrimage'])

    if ('goa' in dest or 'goa' in q) and is_temple:
        center = [15.4414, 73.9680]
        places = [
            {"name": "Shri Mangeshi Temple (Ponda)", "day": "Day 1", "lat": 15.4414, "lng": 73.9680, "desc": "Famous 400-yr Lord Shiva temple & 7-storey Deepastambha"},
            {"name": "Shri Shanta Durga Temple (Kavlem)", "day": "Day 1", "lat": 15.4022, "lng": 73.9877, "desc": "Revered 18th-century temple with Indo-Portuguese architecture"},
            {"name": "Mahadev Temple (Tambdi Surla)", "day": "Day 2", "lat": 15.4402, "lng": 74.2536, "desc": "Ancient 12th-century Kadamba basalt stone temple"},
            {"name": "Shri Nagueshi Temple (Bandora)", "day": "Day 2", "lat": 15.4219, "lng": 73.9664, "desc": "Historic 15th-century temple beside ancient water reservoir"},
            {"name": "Shri Kamakshi Temple (Shiroda)", "day": "Day 3", "lat": 15.3619, "lng": 74.0042, "desc": "Historic 16th-century temple of Goddess Kamakshi with Goan water tank"},
            {"name": "Shri Mahalaxmi Temple (Bandora)", "day": "Day 3", "lat": 15.4247, "lng": 73.9649, "desc": "Sacred shrine of Goddess Mahalaxmi with black granite idol"}
        ]
    elif 'goa' in dest or ('goa' in q and 'to goa' in q):
        center = [15.4925, 73.7737]
        places = [
            {"name": "Baga Beach & Calangute Strip", "day": "Day 1", "lat": 15.5553, "lng": 73.7517, "desc": "Famous golden sand beach & shacks"},
            {"name": "Aguada Fort & Lighthouse", "day": "Day 1", "lat": 15.4925, "lng": 73.7737, "desc": "17th-century Portuguese ocean fortress"},
            {"name": "Basilica of Bom Jesus", "day": "Day 2", "lat": 15.5009, "lng": 73.9116, "desc": "UNESCO Baroque church in Old Goa"},
            {"name": "Anjuna Flea Market & Curlies", "day": "Day 2", "lat": 15.5866, "lng": 73.7431, "desc": "Bohemian beachside flea market"},
            {"name": "Dudhsagar Waterfalls", "day": "Day 3", "lat": 15.3144, "lng": 74.3143, "desc": "Spectacular 310m jungle cascade"}
        ]
    elif 'japan' in dest or 'tokyo' in dest or 'kyoto' in dest or 'japan' in q:
        center = [35.6895, 139.6917]
        places = [
            {"name": "Sensō-ji Temple", "day": "Day 1", "lat": 35.7148, "lng": 139.7967, "desc": "Tokyo oldest Buddhist temple"},
            {"name": "Tokyo Skytree", "day": "Day 1", "lat": 35.7101, "lng": 139.8107, "desc": "634m observation tower"},
            {"name": "Akihabara District", "day": "Day 1", "lat": 35.6984, "lng": 139.7731, "desc": "Anime & gaming quarter"},
            {"name": "Meiji Shrine", "day": "Day 2", "lat": 35.6764, "lng": 139.6993, "desc": "Forest Shinto shrine"},
            {"name": "Shibuya Crossing", "day": "Day 2", "lat": 35.6595, "lng": 139.7005, "desc": "World famous scramble crossing"}
        ]
    elif 'paris' in dest or 'france' in dest or 'paris' in q:
        center = [48.8566, 2.3522]
        places = [
            {"name": "Eiffel Tower", "day": "Day 1", "lat": 48.8584, "lng": 2.2945, "desc": "Symbolic 330m iron tower"},
            {"name": "Louvre Museum", "day": "Day 1", "lat": 48.8606, "lng": 2.3376, "desc": "World famous art museum"},
            {"name": "Arc de Triomphe", "day": "Day 1", "lat": 48.8738, "lng": 2.2950, "desc": "Monument on Champs-Élysées"},
            {"name": "Notre-Dame Cathedral", "day": "Day 2", "lat": 48.8530, "lng": 2.3499, "desc": "French Gothic cathedral"},
            {"name": "Montmartre & Sacré-Cœur", "day": "Day 2", "lat": 48.8867, "lng": 2.3431, "desc": "Hilltop artist village"}
        ]
    elif 'dubai' in dest or 'uae' in dest or 'dubai' in q:
        center = [25.1972, 55.2744]
        places = [
            {"name": "Burj Khalifa", "day": "Day 1", "lat": 25.1972, "lng": 55.2744, "desc": "World tallest skyscraper"},
            {"name": "Dubai Mall & Fountains", "day": "Day 1", "lat": 25.1985, "lng": 55.2796, "desc": "Mega shopping & fountain show"},
            {"name": "Dubai Frame", "day": "Day 2", "lat": 25.2355, "lng": 55.3003, "desc": "Architectural skyline landmark"},
            {"name": "Palm Jumeirah & Atlantis", "day": "Day 2", "lat": 25.1304, "lng": 55.1172, "desc": "Artificial island resort"}
        ]
    elif 'mumbai' in dest and 'to ' not in q:
        center = [18.9400, 72.8300]
        places = [
            {"name": "Gateway of India", "day": "Day 1", "lat": 18.9220, "lng": 72.8347, "desc": "Historic arch facing Mumbai harbor"},
            {"name": "Taj Mahal Palace", "day": "Day 1", "lat": 18.9217, "lng": 72.8332, "desc": "1903 heritage luxury hotel"},
            {"name": "Marine Drive", "day": "Day 1", "lat": 18.9438, "lng": 72.8232, "desc": "Queens Necklace promenade"},
            {"name": "CSMT Railway Station", "day": "Day 1", "lat": 18.9398, "lng": 72.8355, "desc": "UNESCO Gothic building"},
            {"name": "Haji Ali Dargah", "day": "Day 2", "lat": 18.9778, "lng": 72.8107, "desc": "Islet mosque in the sea"}
        ]
    elif 'ooty' in dest or 'ooty' in q:
        center = [11.4102, 76.6950]
        places = [
            {"name": "Government Botanical Gardens (Ooty)", "day": "Day 1", "lat": 11.4144, "lng": 76.7118, "desc": "55-acre terraced botanical gardens & 20M year fossil tree"},
            {"name": "Ooty Lake & Boathouse", "day": "Day 1", "lat": 11.4072, "lng": 76.6895, "desc": "Picturesque artificial lake framed by lofty Eucalyptus trees"},
            {"name": "Doddabetta Peak Viewpoint", "day": "Day 2", "lat": 11.4011, "lng": 76.7358, "desc": "Highest Nilgiri mountain peak at 2,637m altitude"},
            {"name": "Nilgiri Mountain Toy Train Railway", "day": "Day 2", "lat": 11.4064, "lng": 76.6961, "desc": "UNESCO World Heritage vintage steam engine train journey"},
            {"name": "Tea Factory & Tea Museum", "day": "Day 3", "lat": 11.4105, "lng": 76.7210, "desc": "Live tea leaves processing tour and fresh tea tasting"}
        ]
    elif 'tamil nadu' in dest or 'chennai' in dest or 'tamil nadu' in q or 'chennai' in q:
        center = [13.0827, 80.2707]
        places = [
            {"name": "Shore Temple & Pancha Rathas (Mahabalipuram)", "day": "Day 1", "lat": 12.6169, "lng": 80.1992, "desc": "UNESCO World Heritage 8th-century granite temples"},
            {"name": "Meenakshi Amman Temple (Madurai)", "day": "Day 1", "lat": 9.9195, "lng": 78.1193, "desc": "Historic Dravidian temple with 14 gopurams"},
            {"name": "Brihadeeswarar Temple (Thanjavur)", "day": "Day 2", "lat": 10.7828, "lng": 79.1318, "desc": "UNESCO 1000-year-old Chola dynasty stone temple"},
            {"name": "Ramanathaswamy Temple & Pamban Bridge (Rameswaram)", "day": "Day 2", "lat": 9.2876, "lng": 79.3129, "desc": "Sacred island temple with India longest pillar corridor"},
            {"name": "Ooty Botanical Gardens & Toy Train", "day": "Day 3", "lat": 11.4102, "lng": 76.6950, "desc": "Queen of Hill Stations in the Nilgiri Mountains"}
        ]
    else:
        cleaned_dest = re.sub(r'\b(plan|trip|itinerary|itenary|flights|hotels|days|day|for|search|best|roam|here|tour|travel|guide|places)\b', '', dest, flags=re.IGNORECASE).strip()
        dest_name = cleaned_dest.title() if cleaned_dest else "Tamil Nadu"
        center = [13.0827, 80.2707]
        places = [
            {"name": f"{dest_name} Heritage Temple & Monument", "day": "Day 1", "lat": center[0] + 0.012, "lng": center[1] - 0.015, "desc": "Historic cultural landmark & architecture"},
            {"name": f"{dest_name} Coastal Citadel & Promenade", "day": "Day 1", "lat": center[0] - 0.008, "lng": center[1] + 0.018, "desc": "Scenic waterfront & ocean deck"},
            {"name": f"{dest_name} Sunset Viewpoint", "day": "Day 2", "lat": center[0] + 0.025, "lng": center[1] + 0.005, "desc": "Golden hour panoramic point"},
            {"name": f"{dest_name} Regional Culinary Bazaar", "day": "Day 2", "lat": center[0] - 0.018, "lng": center[1] - 0.022, "desc": "Authentic regional food night market"}
        ]

    places_json = json.dumps(places)
    center_json = json.dumps(center)

    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body {{ margin: 0; padding: 0; font-family: sans-serif; }}
        #map {{ width: 100%; height: 420px; border-radius: 16px; }}
        .leaflet-popup-content-wrapper {{ border-radius: 12px; padding: 4px; }}
        .pin-label {{ background: #4f46e5; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }}
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var center = {center_json};
        var places = {places_json};
        var map = L.map('map').setView(center, 12);
        L.tileLayer('https://{{s}}.basemaps.cartocdn.com/rastertiles/voyager/{{z}}/{{x}}/{{y}}{{r}}.png', {{
          attribution: '&copy; OpenStreetMap'
        }}).addTo(map);

        var coords = [];
        places.forEach(function(p, i) {{
          coords.push([p.lat, p.lng]);
          var icon = L.divIcon({{
            html: '<div class="pin-label">' + (i + 1) + '</div>',
            className: '',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          }});
          var marker = L.marker([p.lat, p.lng], {{ icon: icon }}).addTo(map);
          marker.bindPopup('<b>' + (i + 1) + '. ' + p.name + '</b><br><small>' + p.day + ' • ' + p.desc + '</small>');
        }});

        if (coords.length > 0) {{
          var polyline = L.polyline(coords, {{ color: '#4f46e5', weight: 4, opacity: 0.8, dashArray: '6, 6' }}).addTo(map);
          map.fitBounds(polyline.getBounds(), {{ padding: [30, 30] }});
        }}
      </script>
    </body>
    </html>
    """
    components.html(html_code, height=440)

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("<div class='sidebar-title'>🌍 AI Travel Planner</div>", unsafe_allow_html=True)
    st.markdown("---")

    thread_id = st.text_input("👤 User ID", value="aarohi_user",
                              help="Your session ID — preserves travel history across queries")

    st.markdown("<div class='sidebar-title'>Powered by</div>", unsafe_allow_html=True)
    for tech in ["🔗 LangGraph", "🧠 Groq · LLaMA 3.3 70B", "🐘 MemorySaver State", "🔍 Tavily Search", "✈️ AviationStack"]:
        st.markdown(f"<div class='sidebar-chip'>{tech}</div>", unsafe_allow_html=True)

    st.markdown("<div class='sidebar-title'>Agent Pipeline</div>", unsafe_allow_html=True)
    for step in ["① Flight Agent", "② Hotel Agent", "③ Itinerary Agent", "④ Final Agent"]:
        st.markdown(f"<div class='sidebar-chip'>{step}</div>", unsafe_allow_html=True)

# ── Hero Banner ───────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero-wrapper">
    <div class="hero-badge">✦ Multi-Agent AI System</div>
    <div class="hero-title">✈️ Intelligent Travel Planner</div>
    <div class="hero-sub">Four autonomous AI agents work together to search flights, discover top-rated hotels, design custom itineraries, and build your perfect trip.</div>
</div>
""", unsafe_allow_html=True)

# ── Quick Destinations Grid ───────────────────────────────────────────────────
DESTINATIONS = [
    ("🇯🇵 Tokyo",     "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80"),
    ("🇫🇷 Paris",     "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80"),
    ("🇮🇳 Mumbai",    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80"),
    ("🇮🇹 Rome",      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80"),
    ("🇦🇪 Dubai",     "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80"),
]

cols = st.columns(5)
for col, (name, img_url) in zip(cols, DESTINATIONS):
    with col:
        st.markdown(f"""
        <div style="border-radius:14px;overflow:hidden;position:relative;height:100px;box-shadow:var(--shadow-sm);transition:all 0.3s ease;">
            <img src="{img_url}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.65);" />
            <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;
                        color:#ffffff;font-size:0.88rem;font-weight:600;letter-spacing:0.02em;">{name}</div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ── Input Card ────────────────────────────────────────────────────────────────
st.markdown("<div class='input-label'>🗺️ Where would you like to travel?</div>", unsafe_allow_html=True)

QUICK = ["Trip to Mumbai for 3 days", "7-day Japan under ₹2L", "Paris 5-day vacation", "Dubai weekend getaway"]
qcols = st.columns(len(QUICK))
quick_fill = ""
for qc, label in zip(qcols, QUICK):
    with qc:
        if st.button(label, key=f"q_{label}"):
            quick_fill = label

user_query = st.text_area(
    "Describe your trip",
    value=quick_fill,
    placeholder="e.g. Plan a 5-day trip to Mumbai including flights, hotels and sightseeing",
    height=90,
    label_visibility="collapsed",
)

generate = st.button("🚀  Generate Travel Plan", use_container_width=True)

# ── Agent Pipeline Output ─────────────────────────────────────────────────────
AGENT_META = {
    "flight_agent":    ("✈️", "Flight Agent — Searching Routes"),
    "hotel_agent":     ("🏨", "Hotel Agent — Locating Accommodations"),
    "itinerary_agent": ("🗓️", "Itinerary Agent — Designing Schedule"),
    "final_agent":     ("🧠", "Final Agent — Assembling Master Plan"),
}

if generate:
    if not user_query.strip():
        st.warning("Please describe your trip first.")
    else:
        config = {"configurable": {"thread_id": thread_id}}
        collected = {"flight_results": "", "hotel_results": "",
                     "itinerary": "", "final_response": "", "llm_calls": 0}

        st.markdown("<div class='sec-head'><span>🤖 Agent Execution Pipeline</span></div>",
                    unsafe_allow_html=True)

        for chunk in app.stream(
            {
                "messages": [HumanMessage(content=user_query)],
                "user_query": user_query,
                "flight_results": "",
                "hotel_results": "",
                "itinerary": "",
                "llm_calls": 0,
            },
            config=config,
            stream_mode="updates",
        ):
            for node_name, state_update in chunk.items():
                icon, label = AGENT_META.get(node_name, ("🔧", node_name))

                with st.status(f"{icon}  {label}", state="complete", expanded=True):
                    if node_name == "flight_agent":
                        text = state_update.get("flight_results", "")
                        collected["flight_results"] = text
                        st.markdown(text or "_No flight data returned._")

                    elif node_name == "hotel_agent":
                        text = state_update.get("hotel_results", "")
                        collected["hotel_results"] = text
                        st.markdown(text or "_No hotel data returned._")

                    elif node_name == "itinerary_agent":
                        text = state_update.get("itinerary", "")
                        collected["itinerary"] = text
                        st.markdown(text or "_No itinerary generated._")

                    elif node_name == "final_agent":
                        msgs = state_update.get("messages", [])
                        text = msgs[-1].content if msgs else ""
                        collected["final_response"] = text
                        st.markdown(text or "_No final response._")

                    collected["llm_calls"] = state_update.get("llm_calls", collected["llm_calls"])

        # Metrics Bar
        st.markdown(f"""
        <div class="metric-row">
            <div class="metric-box"><div class="metric-val">4</div><div class="metric-lbl">Agents Executed</div></div>
            <div class="metric-box"><div class="metric-val">{collected['llm_calls']}</div><div class="metric-lbl">LLM Calls</div></div>
            <div class="metric-box"><div class="metric-val">100%</div><div class="metric-lbl">Pipeline Status</div></div>
        </div>
        """, unsafe_allow_html=True)

        # Final Plan Display Card
        if collected["final_response"]:
            st.markdown("<div class='sec-head'><span>📋 Master Travel Plan</span></div>",
                        unsafe_allow_html=True)
            st.markdown(f"<div class='final-card'>{collected['final_response']}</div>",
                        unsafe_allow_html=True)
            
            # Interactive Route Map in Streamlit
            render_streamlit_map(user_query)

        # Auto-Save & Download
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"travel_plan_{timestamp}.md"
        save_dir = os.path.join(os.path.dirname(__file__), "travel_plans")
        os.makedirs(save_dir, exist_ok=True)

        file_content = f"""# Travel Plan
**Query:** {user_query}
**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**User ID:** {thread_id}

---

## ✈️ Flight Information
{collected['flight_results'] or 'N/A'}

---

## 🏨 Hotel Information
{collected['hotel_results'] or 'N/A'}

---

## 🗓️ Itinerary
{collected['itinerary'] or 'N/A'}

---

## 🧠 Master Travel Plan
{collected['final_response'] or 'N/A'}

---
*LLM Calls: {collected['llm_calls']}*
"""
        with open(os.path.join(save_dir, filename), "w", encoding="utf-8") as f:
            f.write(file_content)

        dl_col, info_col = st.columns([1, 3])
        with dl_col:
            st.download_button("⬇️ Download Plan", data=file_content,
                               file_name=filename, mime="text/markdown",
                               use_container_width=True)
        with info_col:
            st.markdown(f"<div class='save-bar'>📁 Auto-saved to <code>travel_plans/{filename}</code></div>",
                        unsafe_allow_html=True)
