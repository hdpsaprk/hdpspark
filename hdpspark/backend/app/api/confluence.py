"""Confluence content ingestion API."""

from fastapi import APIRouter, HTTPException

from app.engines.confluence_fetcher import fetch_confluence_page, extract_text_content
from app.engines.okr_extractor import extract_okrs
from app.models.schemas import ConfluenceInput, OKR

router = APIRouter()

_current_okrs: list[OKR] = []
_current_text: str = ""


def get_current_okrs() -> list[OKR]:
    return _current_okrs


def get_current_text() -> str:
    return _current_text


@router.post("/parse")
async def parse_confluence(input_data: ConfluenceInput):
    """Fetch a Confluence page or process raw text, extracting OKRs."""
    global _current_okrs, _current_text

    text = ""

    if input_data.url:
        try:
            text = await fetch_confluence_page(
                url=input_data.url,
                username=input_data.username,
                api_token=input_data.api_token,
            )
        except Exception as e:
            raise HTTPException(
                422, f"Failed to fetch Confluence page: {str(e)}"
            )
    elif input_data.raw_text:
        text = extract_text_content(input_data.raw_text)
    else:
        raise HTTPException(400, "Provide either a URL or raw_text")

    if not text.strip():
        raise HTTPException(422, "No content could be extracted")

    _current_text = text
    okrs = extract_okrs(text)
    _current_okrs = okrs

    return {
        "text_length": len(text),
        "text_preview": text[:500],
        "okrs_found": len(okrs),
        "okrs": [okr.model_dump() for okr in okrs],
    }


@router.get("/okrs")
async def get_okrs():
    """Get currently extracted OKRs."""
    return {"okrs": [okr.model_dump() for okr in _current_okrs]}
