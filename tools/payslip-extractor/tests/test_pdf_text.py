from payslip_extractor import pdf_text
from payslip_extractor.layout import Word


class _FakePage:
    def __init__(self, words):
        self._words = words

    def extract_words(self):
        return self._words


class _FakePdf:
    def __init__(self, pages):
        self.pages = pages

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def test_extract_words_from_pdf_maps_pdfplumber_fields_onto_word(monkeypatch):
    fake_words = [{"text": "Basic", "x0": 10.0, "top": 100.0, "x1": 40.0, "bottom": 112.0}]
    monkeypatch.setattr(pdf_text.pdfplumber, "open", lambda path: _FakePdf([_FakePage(fake_words)]))

    pages = pdf_text.extract_words_from_pdf("fake.pdf")

    assert pages == [[Word(text="Basic", x0=10.0, y0=100.0, x1=40.0, y1=112.0, confidence=1.0)]]


def test_has_usable_text_layer_true_when_a_page_has_enough_text():
    pages = [[Word(text="Basic Salary Gross Income Total", x0=0, y0=0, x1=10, y1=10, confidence=1.0)]]
    assert pdf_text.has_usable_text_layer(pages)


def test_has_usable_text_layer_false_for_a_near_empty_scanned_page():
    pages = [[Word(text="x", x0=0, y0=0, x1=10, y1=10, confidence=1.0)]]
    assert not pdf_text.has_usable_text_layer(pages)


def test_has_usable_text_layer_false_for_no_pages():
    assert not pdf_text.has_usable_text_layer([])
