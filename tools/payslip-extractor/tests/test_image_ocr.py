from payslip_extractor.image_ocr import MIN_CONFIDENCE, words_from_tesseract_data


def test_converts_tesseract_data_into_words_with_confidence():
    data = {
        "text": ["Basic", "Salary", "18801.38"],
        "conf": [95, 92, 88],
        "left": [10, 45, 300],
        "top": [100, 101, 100],
        "width": [30, 35, 60],
        "height": [12, 12, 12],
    }

    words = words_from_tesseract_data(data)

    assert [w.text for w in words] == ["Basic", "Salary", "18801.38"]
    assert words[0].confidence == 0.95
    assert words[0].x0 == 10
    assert words[0].x1 == 40
    assert words[0].y1 == 112


def test_skips_blank_tokens():
    data = {"text": ["", "  ", "Basic"], "conf": [0, 0, 90], "left": [0, 0, 10], "top": [0, 0, 100], "width": [0, 0, 30], "height": [0, 0, 12]}
    words = words_from_tesseract_data(data)
    assert [w.text for w in words] == ["Basic"]


def test_filters_out_low_confidence_tokens():
    data = {
        "text": ["garbage", "Basic"],
        "conf": [MIN_CONFIDENCE - 1, MIN_CONFIDENCE + 1],
        "left": [0, 10],
        "top": [0, 100],
        "width": [10, 30],
        "height": [10, 12],
    }
    words = words_from_tesseract_data(data)
    assert [w.text for w in words] == ["Basic"]
