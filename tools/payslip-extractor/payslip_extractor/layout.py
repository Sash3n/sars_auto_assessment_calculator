"""Generic bounding-box-based row reconstruction.

Deliberately not tuned to any one payslip vendor's layout: words are
clustered into rows purely by vertical (y) overlap, then ordered
left-to-right by x position within each row. This is what lets the tool
survive a new payslip format without per-template rework, at the cost of
being less precise than a hand-tuned template would be.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Word:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    # 0-1 OCR confidence; None for text extracted from a real PDF text
    # layer, where there is no OCR uncertainty to report.
    confidence: float | None = None


@dataclass(frozen=True)
class Row:
    words: tuple[Word, ...]

    @property
    def text(self) -> str:
        return " ".join(w.text for w in self.words)

    @property
    def confidence(self) -> float | None:
        confidences = [w.confidence for w in self.words if w.confidence is not None]
        if not confidences:
            return None
        return sum(confidences) / len(confidences)


def reconstruct_rows(words: list[Word], y_tolerance: float = 3.0) -> list[Row]:
    """Groups words sharing a y-band into rows, then sorts each row's words
    left-to-right. Assumes rows don't interleave vertically, which holds for
    ordinary tabular payslip layouts."""
    if not words:
        return []

    sorted_words = sorted(words, key=lambda w: (w.y0, w.x0))

    clusters: list[list[Word]] = [[sorted_words[0]]]
    cluster_y0 = sorted_words[0].y0
    cluster_y1 = sorted_words[0].y1

    for word in sorted_words[1:]:
        overlaps = word.y0 <= cluster_y1 + y_tolerance and word.y1 >= cluster_y0 - y_tolerance
        if overlaps:
            clusters[-1].append(word)
            cluster_y0 = min(cluster_y0, word.y0)
            cluster_y1 = max(cluster_y1, word.y1)
        else:
            clusters.append([word])
            cluster_y0, cluster_y1 = word.y0, word.y1

    return [Row(words=tuple(sorted(cluster, key=lambda w: w.x0))) for cluster in clusters]
