# payslip-extractor

A local, fully offline command-line tool that pulls payslip line items out of
a PDF or image file and writes them into the JSON format the web app's
Payslips step can bulk-import (see `../../schema/payslip-import.schema.json`).

**Nothing here ever calls a network API.** Extraction is Tesseract (via
`pytesseract`) and `pdfplumber`, both fully local, matching the app's
"never leaves your device" privacy stance even for this personal tool.

## How it works

1. **PDF text layer first** (`pdf_text.py`, via `pdfplumber`) -- if the PDF
   has a real, digitally-generated text layer, its words and bounding boxes
   are read directly. No OCR error is possible on this path.
2. **OCR fallback** (`image_ocr.py`, via `pytesseract` + OpenCV
   preprocessing) -- used only when a PDF has no usable text layer (i.e.
   it's a scanned image), or the input is a photo/screenshot to begin with.
3. **Generic row reconstruction** (`layout.py`) -- words are clustered into
   rows by vertical (y) bounding-box overlap, then ordered left-to-right.
   This is deliberately *not* tuned to any one payslip vendor's layout, so a
   new payslip format doesn't require new code.
4. **Classification** (`classify.py`) -- each row is matched against a known
   SARS IRP5 source code (e.g. `3601`, `3817`) when one is visible, falling
   back to the same keyword heuristic as the in-browser OCR upload
   (`src/lib/ocr/suggestField.ts`) when it isn't.
5. **Schema validation** (`schema.py`) -- output is validated against the
   same `schema/payslip-import.schema.json` the web app's TypeScript parser
   uses, so anything this tool writes is guaranteed importable.

Every line item this tool produces carries `_confidence` (0-1, from OCR word
confidence where applicable) and `_source` (`"pdf_text"` or `"ocr"`)
metadata fields -- hints for a human to double-check low-confidence items,
not an autopilot. These are informational only: the schema's
`additionalProperties: true` means they pass through validation harmlessly
and are simply ignored by the app today.

## Setup

Requires Python 3.11+, plus the Tesseract and Poppler binaries (not Python
packages) on your system:

```bash
# Debian/Ubuntu
sudo apt-get install tesseract-ocr poppler-utils

# macOS
brew install tesseract poppler
```

Then install the Python dependencies and the package itself (editable, so
`payslip_extractor` is importable regardless of your working directory):

```bash
cd tools/payslip-extractor
pip install -r requirements.txt
pip install -e .
```

## Usage

Run once per payslip file (one employer, one month per invocation). The tool
reads, merges, and rewrites a single JSON document at `--output`, so running
it repeatedly across a year's worth of payslips builds up one combined file:

```bash
python -m payslip_extractor.cli path/to/march-payslip.pdf \
  --month 2025-03 \
  --employer "Old Co" \
  --tax-year 2025/26 \
  --output payslips.json

python -m payslip_extractor.cli path/to/april-payslip.pdf \
  --month 2025-04 \
  --employer "Old Co" \
  --output payslips.json  # appends to the March data above
```

Use `--replace` instead of the default `--merge` to overwrite `--output`
rather than append to it. Then paste the contents of `payslips.json` into
the "Import from JSON" panel on the app's Payslips step.

## Testing

```bash
pytest
```

Tests use only synthetic, hand-built fixtures (fabricated word lists,
mocked Tesseract output) -- never real payslip files. If you want to sanity
check extraction against your own real payslips, drop them in `samples/`
(gitignored, never committed) and run the CLI against them manually; real
OCR/layout accuracy can only be validated this way, not by an automated
test.
