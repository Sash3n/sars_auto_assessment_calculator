"""OCR fallback for scanned/photographed payslips -- Tesseract via
pytesseract, entirely local. Only used when a PDF has no usable text layer,
or the input is an image file to begin with."""

from __future__ import annotations

from typing import Any

import cv2
import numpy as np
import pytesseract
from PIL import Image

from .layout import Word

# pytesseract confidence is 0-100; discard low-confidence noise so garbage
# OCR tokens don't pollute row reconstruction.
MIN_CONFIDENCE = 40


def preprocess_image(image: Image.Image) -> np.ndarray:
    """Grayscale + adaptive threshold -- a generic cleanup pass that helps
    Tesseract on photographed/scanned payslips without any vendor-specific
    tuning."""
    gray = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2GRAY)
    return cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15
    )


def words_from_tesseract_data(data: dict[str, list[Any]]) -> list[Word]:
    words: list[Word] = []
    for i, text in enumerate(data["text"]):
        text = text.strip()
        if not text:
            continue
        if int(data["conf"][i]) < MIN_CONFIDENCE:
            continue
        x0, y0 = data["left"][i], data["top"][i]
        words.append(
            Word(
                text=text,
                x0=x0,
                y0=y0,
                x1=x0 + data["width"][i],
                y1=y0 + data["height"][i],
                confidence=int(data["conf"][i]) / 100.0,
            )
        )
    return words


def ocr_words_from_image(image: Image.Image) -> list[Word]:
    """Runs Tesseract with word-level bounding boxes on a single image."""
    processed = preprocess_image(image)
    data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)
    return words_from_tesseract_data(data)


def ocr_words_from_pdf(path: str) -> list[list[Word]]:
    """Rasterizes each page of a scanned PDF and runs OCR on it."""
    from pdf2image import convert_from_path

    pages = convert_from_path(path)
    return [ocr_words_from_image(page) for page in pages]
