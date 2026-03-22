"""OKR (Objectives & Key Results) extraction from text content."""

from __future__ import annotations

import re
from typing import Optional

from app.models.schemas import KeyResult, OKR, HealthScore


# Patterns for detecting OKR structures in text
OBJECTIVE_PATTERNS = [
    r"(?:objective|obj|O)\s*[\d.]*\s*[:\-–]\s*(.+)",
    r"(?:goal|target)\s*[\d.]*\s*[:\-–]\s*(.+)",
    r"#{1,3}\s*(?:objective|obj|O)\s*[\d.]*\s*[:\-–]?\s*(.+)",
]

KEY_RESULT_PATTERNS = [
    r"(?:key result|kr|KR)\s*[\d.]*\s*[:\-–]\s*(.+)",
    r"-\s*(?:KR|kr)\s*[\d.]*\s*[:\-–]\s*(.+)",
    r"(?:result|measure)\s*[\d.]*\s*[:\-–]\s*(.+)",
]

PROGRESS_PATTERN = r"(\d+(?:\.\d+)?)\s*[%/]"
TARGET_PATTERN = r"(?:target|goal)\s*[:\-–]\s*(.+?)(?:\n|$)"


def extract_okrs(text: str) -> list[OKR]:
    """Extract OKRs from unstructured text content."""
    okrs: list[OKR] = []
    lines = text.split("\n")

    current_objective: Optional[str] = None
    current_krs: list[KeyResult] = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for objective
        obj_match = _match_patterns(line, OBJECTIVE_PATTERNS)
        if obj_match:
            # Save previous OKR if exists
            if current_objective:
                okrs.append(_build_okr(current_objective, current_krs))
            current_objective = obj_match
            current_krs = []
            continue

        # Check for key result
        kr_match = _match_patterns(line, KEY_RESULT_PATTERNS)
        if kr_match and current_objective:
            kr = _parse_key_result(kr_match)
            current_krs.append(kr)
            continue

        # Check for bullet points under an objective (potential KRs)
        if current_objective and line.startswith(("-", "*", "•")):
            text_content = line.lstrip("-*• ").strip()
            if len(text_content) > 10:  # Likely a meaningful key result
                kr = _parse_key_result(text_content)
                current_krs.append(kr)

    # Don't forget the last one
    if current_objective:
        okrs.append(_build_okr(current_objective, current_krs))

    # If no structured OKRs found, try to infer from section headers
    if not okrs:
        okrs = _infer_okrs_from_headers(text)

    return okrs


def _match_patterns(text: str, patterns: list[str]) -> Optional[str]:
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _parse_key_result(text: str) -> KeyResult:
    """Parse a key result string into structured data."""
    progress = 0.0
    target = ""

    # Extract percentage
    prog_match = re.search(PROGRESS_PATTERN, text)
    if prog_match:
        progress = float(prog_match.group(1))
        if progress > 1 and progress <= 100:
            pass  # already percentage
        elif progress <= 1:
            progress *= 100

    # Extract target
    target_match = re.search(TARGET_PATTERN, text, re.IGNORECASE)
    if target_match:
        target = target_match.group(1).strip()

    return KeyResult(
        description=text,
        target=target,
        progress_pct=progress,
    )


def _build_okr(objective: str, key_results: list[KeyResult]) -> OKR:
    """Build an OKR with computed confidence score."""
    if not key_results:
        confidence = 0.0
    else:
        avg_progress = sum(kr.progress_pct for kr in key_results) / len(key_results)
        confidence = avg_progress

    if confidence >= 70:
        health = HealthScore.GREEN
    elif confidence >= 40:
        health = HealthScore.AMBER
    else:
        health = HealthScore.RED

    return OKR(
        objective=objective,
        key_results=key_results,
        confidence=confidence,
        health=health,
    )


def _infer_okrs_from_headers(text: str) -> list[OKR]:
    """Try to infer OKRs from markdown-style headers."""
    okrs: list[OKR] = []
    sections = re.split(r"\n#{1,3}\s+", text)

    for section in sections[1:]:  # Skip text before first header
        lines = section.strip().split("\n")
        if not lines:
            continue
        title = lines[0].strip()
        bullets = [
            l.lstrip("-*• ").strip()
            for l in lines[1:]
            if l.strip().startswith(("-", "*", "•"))
        ]
        if bullets:
            krs = [_parse_key_result(b) for b in bullets if len(b) > 5]
            if krs:
                okrs.append(_build_okr(title, krs))

    return okrs
