import os
import re
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

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

            snippet = re.sub(r'\|+', ' ', snippet)
            snippet = re.sub(r'-{2,}', ' ', snippet)
            snippet = re.sub(r'\s+', ' ', snippet).strip()

            if len(snippet) > 250:
                snippet = snippet[:250].rsplit(" ", 1)[0] + "..."

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
            title = r.get("title", "").strip()
            snippet = r.get("content", "").strip()
            snippet = re.sub(r'\s+', ' ', snippet)
            results.append(f"• {title}: {snippet}")
        return "\n".join(results)
    except Exception as e:
        print(f"[Warning] Tavily places search error for '{destination}': {e}")
        return ""
