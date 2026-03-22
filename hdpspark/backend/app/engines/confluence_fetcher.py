"""Confluence page content fetcher and text extractor."""

from __future__ import annotations

import re
from typing import Optional

import httpx
from bs4 import BeautifulSoup


def _extract_page_id_from_url(url: str) -> Optional[str]:
    """Extract page ID from various Confluence URL formats."""
    # /pages/viewpage.action?pageId=12345
    match = re.search(r"pageId=(\d+)", url)
    if match:
        return match.group(1)
    # /wiki/spaces/SPACE/pages/12345/Title
    match = re.search(r"/pages/(\d+)", url)
    if match:
        return match.group(1)
    return None


def _extract_base_url(url: str) -> str:
    """Extract base Confluence URL."""
    match = re.match(r"(https?://[^/]+)", url)
    return match.group(1) if match else ""


async def fetch_confluence_page(
    url: str,
    username: Optional[str] = None,
    api_token: Optional[str] = None,
) -> str:
    """Fetch and extract text content from a Confluence page.

    Supports both authenticated API access and public page scraping.
    """
    page_id = _extract_page_id_from_url(url)
    base_url = _extract_base_url(url)

    # Try API access first if credentials provided
    if page_id and base_url and username and api_token:
        try:
            return await _fetch_via_api(base_url, page_id, username, api_token)
        except Exception:
            pass

    # Fall back to scraping the page directly
    return await _scrape_page(url)


async def _fetch_via_api(
    base_url: str, page_id: str, username: str, api_token: str
) -> str:
    """Fetch page content via Confluence REST API."""
    api_url = f"{base_url}/wiki/rest/api/content/{page_id}?expand=body.storage"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(api_url, auth=(username, api_token))
        resp.raise_for_status()
        data = resp.json()
        html_body = data.get("body", {}).get("storage", {}).get("value", "")
        return _html_to_text(html_body)


async def _scrape_page(url: str) -> str:
    """Scrape a Confluence page for its text content."""
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return _html_to_text(resp.text)


def _html_to_text(html: str) -> str:
    """Convert HTML to clean text, preserving structure."""
    soup = BeautifulSoup(html, "html.parser")

    # Remove scripts, styles
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()

    # Try to find main content area
    main = (
        soup.find("div", {"id": "main-content"})
        or soup.find("div", {"class": "wiki-content"})
        or soup.find("article")
        or soup
    )

    lines = []
    for elem in main.find_all(["h1", "h2", "h3", "h4", "p", "li", "td", "th", "tr"]):
        text = elem.get_text(strip=True)
        if text:
            prefix = ""
            if elem.name.startswith("h"):
                prefix = "#" * int(elem.name[1]) + " "
            elif elem.name == "li":
                prefix = "- "
            lines.append(f"{prefix}{text}")

    return "\n".join(lines)


def extract_text_content(raw_text: str) -> str:
    """Clean and normalize raw text input."""
    # Strip excessive whitespace while preserving structure
    lines = [line.strip() for line in raw_text.split("\n")]
    return "\n".join(line for line in lines if line)
