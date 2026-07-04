from payslip_extractor.amounts import AMOUNT_PATTERN, parse_amount


def test_parses_amount_with_r_prefix_and_comma_separator():
    assert parse_amount("R 11,978.53") == 11978.53


def test_parses_amount_with_space_separator():
    assert parse_amount("4 200.00") == 4200.0


def test_parses_a_4plus_digit_amount_with_no_separator_at_all():
    # Real SARS ITA34 printouts sometimes omit the separator entirely, e.g.
    # "Pension fund contributions Fringe Benefit ... 6449.00"
    assert parse_amount("6449.00") == 6449.0


def test_rejects_non_numeric_text():
    assert parse_amount("abc") is None


def test_rejects_zero_amount():
    assert parse_amount("0.00") is None


def test_pattern_finds_every_amount_on_a_line():
    matches = [m.group(0).strip() for m in AMOUNT_PATTERN.finditer("Total Deductions 7 883.39 Net Pay 20 116.61")]
    assert matches == ["7 883.39", "20 116.61"]


def test_pattern_ignores_integers_without_a_decimal_portion():
    matches = list(AMOUNT_PATTERN.finditer("Page 2 of 4"))
    assert matches == []
