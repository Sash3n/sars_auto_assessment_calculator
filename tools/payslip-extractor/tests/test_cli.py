import json

from payslip_extractor.cli import load_existing, merge_documents, rows_to_line_items
from payslip_extractor.layout import Row, Word


def _row(text_with_amount: str, confidence: float | None = None) -> Row:
    # Build a single-word row whose text is exactly the given string, which
    # is all rows_to_line_items inspects.
    return Row(words=(Word(text=text_with_amount, x0=0, y0=0, x1=10, y1=10, confidence=confidence),))


def test_rows_to_line_items_classifies_and_extracts_amount():
    rows = [_row("Basic Salary 18801.38"), _row("UIF Contribution 177.12")]

    items = rows_to_line_items(rows, month="2025-03", employer="Old Co", source="pdf_text")

    assert len(items) == 1  # "Basic Salary" alone doesn't suggest a category (see suggestField parity)
    assert items[0]["category"] == "uif"
    assert items[0]["amount"] == 177.12
    assert items[0]["month"] == "2025-03"
    assert items[0]["employer"] == "Old Co"
    assert items[0]["_source"] == "pdf_text"
    assert items[0]["description"] == "UIF Contribution"


def test_rows_to_line_items_skips_rows_with_no_amount_or_no_category():
    rows = [_row("INCOME"), _row("Basic Salary")]  # no amount at all
    items = rows_to_line_items(rows, month="2025-03", employer="Old Co", source="pdf_text")
    assert items == []


def test_rows_to_line_items_includes_sars_code_when_present():
    rows = [_row("Basic Salary (3601) 18801.38")]
    items = rows_to_line_items(rows, month="2025-03", employer="Old Co", source="pdf_text")
    assert items[0]["category"] == "basic_salary"
    assert items[0]["sarsCode"] == "3601"


def test_rows_to_line_items_includes_confidence_only_when_a_word_carries_one():
    rows = [_row("UIF Contribution 177.12", confidence=0.8)]
    items = rows_to_line_items(rows, month="2025-03", employer="Old Co", source="ocr")
    assert items[0]["_confidence"] == 0.8


def test_load_existing_returns_empty_document_when_output_missing(tmp_path):
    document = load_existing(tmp_path / "does-not-exist.json")
    assert document == {"schemaVersion": 1, "lineItems": []}


def test_load_existing_reads_the_file_when_present(tmp_path):
    output = tmp_path / "payslips.json"
    output.write_text(json.dumps({"schemaVersion": 1, "lineItems": [{"foo": "bar"}]}))
    assert load_existing(output) == {"schemaVersion": 1, "lineItems": [{"foo": "bar"}]}


def test_merge_documents_appends_by_default():
    existing = {"schemaVersion": 1, "lineItems": [{"a": 1}]}
    document = merge_documents(existing, [{"b": 2}], mode="merge", tax_year=None)
    assert document["lineItems"] == [{"a": 1}, {"b": 2}]


def test_merge_documents_replaces_when_requested():
    existing = {"schemaVersion": 1, "lineItems": [{"a": 1}]}
    document = merge_documents(existing, [{"b": 2}], mode="replace", tax_year=None)
    assert document["lineItems"] == [{"b": 2}]


def test_merge_documents_prefers_new_tax_year_over_existing():
    existing = {"schemaVersion": 1, "lineItems": [], "taxYear": "2024/25"}
    document = merge_documents(existing, [], mode="merge", tax_year="2025/26")
    assert document["taxYear"] == "2025/26"


def test_merge_documents_keeps_existing_tax_year_when_none_given():
    existing = {"schemaVersion": 1, "lineItems": [], "taxYear": "2024/25"}
    document = merge_documents(existing, [], mode="merge", tax_year=None)
    assert document["taxYear"] == "2024/25"
