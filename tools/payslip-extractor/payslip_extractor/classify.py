"""Row -> LineItemCategory classification.

Ports the keyword heuristic from src/lib/ocr/suggestField.ts, then adds a
SARS IRP5 source-code lookup that takes precedence whenever a recognized
code is visible on the row -- codes are unambiguous where keywords are a
best-effort guess.
"""

from __future__ import annotations

import re

CATEGORIES = (
    "basic_salary",
    "bonus",
    "allowance",
    "employer_retirement_fringe_benefit",
    "general_fringe_benefit",
    "paye",
    "uif",
    "employee_retirement_contribution",
    "other_non_tax",
)

# Common SARS IRP5 source codes seen on SA payslips/ITA34s, mapped directly
# to a category. Not exhaustive -- unrecognized codes fall through to the
# keyword heuristic below.
SARS_CODE_CATEGORY = {
    "3601": "basic_salary",
    "3605": "bonus",
    "3713": "allowance",
    "3817": "employer_retirement_fringe_benefit",
    "3801": "general_fringe_benefit",
    "4001": "employee_retirement_contribution",
    "4102": "uif",
    "4115": "paye",
}

# A negative lookahead excludes the leading digits of a currency amount
# (e.g. the "3567" in "3567.16") from being mistaken for a SARS code -- a
# real code is never immediately followed by a decimal point.
_SARS_CODE_PATTERN = re.compile(r"\b(3\d{3}|4\d{3})\b(?!\.\d)")


def find_sars_code(text: str) -> str | None:
    match = _SARS_CODE_PATTERN.search(text)
    return match.group(1) if match else None


def suggest_category(context: str) -> str | None:
    """A hint only -- mirrors suggestField.ts's keyword heuristic exactly."""
    text = context.lower()

    if re.search(r"\buif\b|unemployment insurance", text):
        return "uif"
    if re.search(r"\bpaye\b|pay as you earn", text):
        return "paye"

    # Employer retirement contributions are a non-cash fringe benefit, not
    # the employee's own deductible contribution -- route them to their own
    # category rather than the employee's retirement deduction.
    if re.search(r"retirement|pension|provident", text):
        if re.search(r"employer|fringe benefit", text):
            return "employer_retirement_fringe_benefit"
        return "employee_retirement_contribution"

    if re.search(r"fringe benefit|company car", text):
        return "general_fringe_benefit"

    # Only a genuine total/summary row is a safe gross salary suggestion --
    # a single earnings line (e.g. Basic Salary) can omit allowances and
    # other taxable cash components.
    if re.search(r"total\s*(cash|earnings|remuneration|income|pay)|\bgross\b", text):
        return "basic_salary"

    return None


def classify_row(context: str) -> tuple[str | None, str | None]:
    """Returns (category, sars_code). A recognized SARS code wins over the
    keyword guess; an unrecognized code is still returned for the caller to
    keep as metadata even when the category falls back to a keyword guess."""
    sars_code = find_sars_code(context)
    if sars_code in SARS_CODE_CATEGORY:
        return SARS_CODE_CATEGORY[sars_code], sars_code
    return suggest_category(context), sars_code
