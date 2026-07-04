from payslip_extractor.schema import validate_document

VALID_DOCUMENT = {
    "schemaVersion": 1,
    "taxYear": "2025/26",
    "lineItems": [
        {
            "month": "2025-03",
            "employer": "Old Co",
            "category": "basic_salary",
            "sarsCode": "3601",
            "amount": 18801.38,
        }
    ],
}


def test_accepts_a_valid_document():
    assert validate_document(VALID_DOCUMENT) == []


def test_rejects_wrong_schema_version():
    document = {**VALID_DOCUMENT, "schemaVersion": 2}
    errors = validate_document(document)
    assert len(errors) == 1


def test_rejects_an_unknown_category():
    document = {
        **VALID_DOCUMENT,
        "lineItems": [{**VALID_DOCUMENT["lineItems"][0], "category": "not_a_category"}],
    }
    errors = validate_document(document)
    assert len(errors) == 1


def test_rejects_a_negative_amount():
    document = {
        **VALID_DOCUMENT,
        "lineItems": [{**VALID_DOCUMENT["lineItems"][0], "amount": -5}],
    }
    errors = validate_document(document)
    assert len(errors) == 1


def test_rejects_a_malformed_month():
    document = {
        **VALID_DOCUMENT,
        "lineItems": [{**VALID_DOCUMENT["lineItems"][0], "month": "March 2025"}],
    }
    errors = validate_document(document)
    assert len(errors) == 1


def test_collects_every_error_across_multiple_line_items_not_just_the_first():
    document = {
        **VALID_DOCUMENT,
        "lineItems": [
            {**VALID_DOCUMENT["lineItems"][0], "month": "not-a-month"},
            {**VALID_DOCUMENT["lineItems"][0], "category": "not_a_category"},
            {**VALID_DOCUMENT["lineItems"][0], "amount": -5},
        ],
    }
    errors = validate_document(document)
    assert len(errors) == 3


def test_missing_line_items_field_is_rejected():
    document = {"schemaVersion": 1}
    errors = validate_document(document)
    assert len(errors) == 1
