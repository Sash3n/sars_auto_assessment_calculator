"""PDF text-layer extraction -- tried first, before any OCR, since a real
text layer sidesteps OCR error entirely for digitally-generated payslip
PDFs."""

from __future__ import annotations

import pdfplumber

from .layout import Word

# Below this many extracted characters on every page, treat the PDF as
# having no real text layer (i.e. it's a scanned image) and fall back to
# OCR instead of returning near-empty results.
MIN_CHARS_FOR_TEXT_LAYER = 20


def extract_words_from_pdf(path: str) -> list[list[Word]]:
    """Extracts word-level bounding boxes per page using the PDF's real text
    layer. Returns one word list per page."""
    pages: list[list[Word]] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            words = page.extract_words()
            pages.append(
                [
                    Word(
                        text=w["text"],
                        x0=w["x0"],
                        y0=w["top"],
                        x1=w["x1"],
                        y1=w["bottom"],
                        confidence=1.0,
                    )
                    for w in words
                ]
            )
    return pages


def has_usable_text_layer(pages: list[list[Word]]) -> bool:
    """True if at least one page has enough extracted text to skip OCR."""
    return any(sum(len(w.text) for w in page) >= MIN_CHARS_FOR_TEXT_LAYER for page in pages)
