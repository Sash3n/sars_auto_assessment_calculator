"""Validates output against the shared payslip import schema.

Reads schema/payslip-import.schema.json directly from the repo root rather
than a copy under this tool, so the TS parser
(src/lib/import/payslipImportSchema.ts) and this tool can never drift apart.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft7Validator

# tools/payslip-extractor/payslip_extractor/schema.py -> repo root is 3
# parents up.
_SCHEMA_PATH = Path(__file__).resolve().parents[3] / "schema" / "payslip-import.schema.json"


def load_schema() -> dict[str, Any]:
    return json.loads(_SCHEMA_PATH.read_text())


def validate_document(document: dict[str, Any]) -> list[str]:
    """Validates the whole import document, collecting every error rather
    than failing fast -- matches the TS parser's approach."""
    validator = Draft7Validator(load_schema())
    errors = sorted(validator.iter_errors(document), key=lambda e: list(map(str, e.path)))
    return [f"{'/'.join(str(p) for p in error.path) or '<root>'}: {error.message}" for error in errors]
