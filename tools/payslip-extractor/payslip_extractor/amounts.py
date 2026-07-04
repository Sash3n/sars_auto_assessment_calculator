"""Currency-amount detection, ported from src/lib/ocr/extractNumbers.ts."""

from __future__ import annotations

import re

# Requires a 2-decimal-place suffix so we only pick up currency-shaped
# amounts, not page numbers, dates, or other stray integers. The integer
# part is either grouped with thousands separators (11,978 / 4 200) or, since
# some real payslip printouts omit the separator entirely, one plain run of
# digits (6449) -- either is accepted.
AMOUNT_PATTERN = re.compile(r"R?\s?(?:\d{1,3}(?:[,\s]\d{3})+|\d+)\.\d{2}")


def parse_amount(raw: str) -> float | None:
    """Parses a matched amount string into a positive float, or None."""
    cleaned = re.sub(r"^R\s?", "", raw.strip())
    cleaned = re.sub(r"[,\s]", "", cleaned)
    try:
        value = float(cleaned)
    except ValueError:
        return None
    return value if value > 0 else None
