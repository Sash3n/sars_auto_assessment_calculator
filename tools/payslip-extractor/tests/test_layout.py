from payslip_extractor.layout import Word, reconstruct_rows


def test_groups_words_sharing_a_y_band_into_one_row():
    words = [
        Word(text="Basic", x0=10, y0=100, x1=40, y1=112),
        Word(text="Salary", x0=45, y0=101, x1=80, y1=113),
        Word(text="18801.38", x0=300, y0=100, x1=360, y1=112),
    ]
    rows = reconstruct_rows(words)
    assert len(rows) == 1
    assert rows[0].text == "Basic Salary 18801.38"


def test_separates_words_on_different_lines_into_different_rows():
    words = [
        Word(text="Basic", x0=10, y0=100, x1=40, y1=112),
        Word(text="PAYE", x0=10, y0=130, x1=40, y1=142),
    ]
    rows = reconstruct_rows(words)
    assert [r.text for r in rows] == ["Basic", "PAYE"]


def test_orders_rows_top_to_bottom_regardless_of_input_order():
    words = [
        Word(text="Second", x0=10, y0=130, x1=50, y1=142),
        Word(text="First", x0=10, y0=100, x1=50, y1=112),
    ]
    rows = reconstruct_rows(words)
    assert [r.text for r in rows] == ["First", "Second"]


def test_orders_words_within_a_row_left_to_right_regardless_of_input_order():
    words = [
        Word(text="18801.38", x0=300, y0=100, x1=360, y1=112),
        Word(text="Salary", x0=45, y0=101, x1=80, y1=113),
        Word(text="Basic", x0=10, y0=100, x1=40, y1=112),
    ]
    rows = reconstruct_rows(words)
    assert rows[0].text == "Basic Salary 18801.38"


def test_empty_input_returns_no_rows():
    assert reconstruct_rows([]) == []


def test_row_confidence_averages_word_confidence():
    words = [
        Word(text="Basic", x0=10, y0=100, x1=40, y1=112, confidence=0.9),
        Word(text="Salary", x0=45, y0=101, x1=80, y1=113, confidence=0.7),
    ]
    rows = reconstruct_rows(words)
    assert rows[0].confidence == 0.8


def test_row_confidence_is_none_when_no_word_carries_confidence():
    words = [Word(text="Basic", x0=10, y0=100, x1=40, y1=112)]
    rows = reconstruct_rows(words)
    assert rows[0].confidence is None
