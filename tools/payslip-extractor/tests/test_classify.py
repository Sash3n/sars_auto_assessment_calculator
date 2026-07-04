from payslip_extractor.classify import classify_row, find_sars_code, suggest_category

# suggest_category cases mirror src/lib/ocr/suggestField.test.ts exactly, so
# the two implementations can't silently drift apart.


def test_suggests_paye_for_paye_labelled_amounts():
    assert suggest_category("PAYE Tax 3,567.16") == "paye"
    assert suggest_category("Pay as you Earn 3 506.27") == "paye"


def test_suggests_uif_for_uif_labelled_amounts():
    assert suggest_category("UIF Contribution 177.12") == "uif"
    assert suggest_category("Unemployment Insurance Fund 177.12") == "uif"


def test_suggests_employee_retirement_contribution_for_the_employees_own_deduction():
    assert suggest_category("Retirement Funding- Employee 188.01") == "employee_retirement_contribution"
    assert suggest_category("Retirement Annuity 4 200.00") == "employee_retirement_contribution"


def test_suggests_employer_retirement_fringe_benefit_for_the_employers_non_cash_contribution():
    assert (
        suggest_category("Retirement Funding - Employer 564.04") == "employer_retirement_fringe_benefit"
    )
    assert (
        suggest_category("Pension fund contributions Fringe Benefit 6449.00")
        == "employer_retirement_fringe_benefit"
    )


def test_suggests_general_fringe_benefit_for_general_fringe_benefit_line_items():
    assert suggest_category("General Fringe Benefits 367.00") == "general_fringe_benefit"
    assert suggest_category("Company car fringe benefit 2000.00") == "general_fringe_benefit"


def test_suggests_basic_salary_for_a_total_cash_style_summary_row():
    assert suggest_category("Total Cash Portion 25,511.38") == "basic_salary"
    assert suggest_category("Gross Income 45,000.00") == "basic_salary"


def test_does_not_suggest_basic_salary_for_a_single_itemised_earnings_line():
    assert suggest_category("Basic Salary 18,801.38") is None
    assert suggest_category("Telephone Allowance 6,710.00") is None


def test_returns_none_for_amounts_matching_no_known_category():
    assert suggest_category("Net Pay 21,579.09") is None
    assert suggest_category("Total Deductions 3,932.29") is None


# SARS source-code lookup, additive to the ported keyword heuristic.


def test_finds_a_recognized_sars_code_in_a_row():
    assert find_sars_code("Basic Salary (3601) 18801.38") == "3601"


def test_finds_no_code_when_none_is_present():
    assert find_sars_code("Basic Salary 18801.38") is None


def test_does_not_mistake_an_amounts_own_leading_digits_for_a_sars_code():
    # "3567.16" starts with a 3xxx-shaped run of digits -- must not be
    # misread as SARS code 3567 just because it's immediately followed by
    # a decimal point.
    assert find_sars_code("PAYE Tax 3567.16") is None
    assert find_sars_code("Employer contribution 4102.50") is None


def test_classify_row_prefers_a_recognized_sars_code_over_the_keyword_guess():
    # Keyword heuristic alone would return None for "Basic Salary", but the
    # code makes the category unambiguous.
    category, code = classify_row("Basic Salary (3601) 18801.38")
    assert category == "basic_salary"
    assert code == "3601"


def test_classify_row_falls_back_to_keyword_guess_when_no_code_is_recognized():
    category, code = classify_row("UIF Contribution 177.12")
    assert category == "uif"
    assert code is None


def test_classify_row_keeps_an_unrecognized_code_as_metadata_but_still_uses_keyword_guess():
    # 3698 is a plausible-shaped SARS income code (3xxx) that isn't in our
    # mapping table -- it should still be surfaced as metadata.
    category, code = classify_row("UIF Contribution (3698) 177.12")
    assert category == "uif"
    assert code == "3698"
