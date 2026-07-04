"""CLI entry point: extract line items from one payslip file and read-merge-
write them into a single JSON document at --output, in the shared import
format the web app's "Import from JSON" step understands."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image

from .amounts import AMOUNT_PATTERN, parse_amount
from .classify import classify_row
from .image_ocr import ocr_words_from_image, ocr_words_from_pdf
from .layout import Row, reconstruct_rows
from .pdf_text import extract_words_from_pdf, has_usable_text_layer
from .schema import validate_document

SCHEMA_VERSION = 1


def extract_rows(path: Path) -> tuple[list[Row], str]:
    """Returns (rows, source) where source is "pdf_text" or "ocr"."""
    if path.suffix.lower() == ".pdf":
        pages = extract_words_from_pdf(str(path))
        if has_usable_text_layer(pages):
            return reconstruct_rows([w for page in pages for w in page]), "pdf_text"
        pages = ocr_words_from_pdf(str(path))
        return reconstruct_rows([w for page in pages for w in page]), "ocr"

    words = ocr_words_from_image(Image.open(path))
    return reconstruct_rows(words), "ocr"


def rows_to_line_items(rows: list[Row], month: str, employer: str, source: str) -> list[dict]:
    """Converts classified rows into import-schema line items. Rows with no
    recognizable amount or category are silently skipped -- they're page
    headers, section titles, or noise, not line items."""
    line_items = []
    for row in rows:
        amount_matches = list(AMOUNT_PATTERN.finditer(row.text))
        if not amount_matches:
            continue
        amount_match = amount_matches[-1]  # amounts are usually the rightmost column

        amount = parse_amount(amount_match.group(0))
        if amount is None:
            continue

        category, sars_code = classify_row(row.text)
        if category is None:
            continue

        item: dict = {
            "month": month,
            "employer": employer,
            "category": category,
            "amount": amount,
            "_source": source,
        }
        if sars_code:
            item["sarsCode"] = sars_code

        label = row.text[: amount_match.start()].strip()
        if label:
            item["description"] = label

        if row.confidence is not None:
            item["_confidence"] = round(row.confidence, 2)

        line_items.append(item)
    return line_items


def load_existing(output_path: Path) -> dict:
    if not output_path.exists():
        return {"schemaVersion": SCHEMA_VERSION, "lineItems": []}
    return json.loads(output_path.read_text())


def merge_documents(
    existing: dict, new_line_items: list[dict], mode: str, tax_year: str | None
) -> dict:
    line_items = (
        new_line_items if mode == "replace" else [*existing.get("lineItems", []), *new_line_items]
    )
    document: dict = {"schemaVersion": SCHEMA_VERSION, "lineItems": line_items}
    if tax_year:
        document["taxYear"] = tax_year
    elif "taxYear" in existing:
        document["taxYear"] = existing["taxYear"]
    return document


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="payslip-extractor",
        description=(
            "Extracts payslip line items from a local PDF or image into the "
            "shared JSON import format -- fully offline, no cloud OCR."
        ),
    )
    parser.add_argument("input", type=Path, help="Path to a payslip PDF or image file")
    parser.add_argument("--month", required=True, help="ISO month this payslip covers, e.g. 2025-03")
    parser.add_argument("--employer", required=True, help="Employer name for this payslip")
    parser.add_argument("--tax-year", help='SA tax year, e.g. "2025/26"')
    parser.add_argument("--output", required=True, type=Path, help="JSON file to read/merge/write")

    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument(
        "--merge", action="store_const", dest="mode", const="merge", help="Append to --output (default)"
    )
    mode_group.add_argument(
        "--replace", action="store_const", dest="mode", const="replace", help="Overwrite --output"
    )
    parser.set_defaults(mode="merge")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)

    rows, source = extract_rows(args.input)
    new_line_items = rows_to_line_items(rows, args.month, args.employer, source)

    existing = load_existing(args.output)
    document = merge_documents(existing, new_line_items, args.mode, args.tax_year)

    errors = validate_document(document)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1

    args.output.write_text(json.dumps(document, indent=2) + "\n")
    print(f"Wrote {len(new_line_items)} line item(s) ({args.mode}) to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
