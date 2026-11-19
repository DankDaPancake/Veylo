"""Export four BOOYAH-14 PDFs without machine-specific local-file links.

Requires Python 3, Pandoc, Poppler pdfinfo and WeasyPrint 70.0. Run from any
directory; paths are resolved from this script, never from an old repository.
Markdown links and source PNGs are not changed. No Figma/API calls are made.
"""

from __future__ import annotations

import hashlib
import html
import json
import logging
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit

from weasyprint import HTML
from weasyprint.urls import URLFetcher


ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT
EVIDENCE = Path(__file__).resolve().parent / "prototype"
SOURCES = ('docs/analysis-and-design/use-cases/UC-F04-F08-Delivery-Reporting.md', 'docs/analysis-and-design/use-cases/prototypes/F04-F08/F04-F08-Prototype-Handoff.md', 'docs/analysis-and-design/use-cases/prototypes/F04-F08/UC11-UC15-Handoff.md', 'docs/test/f04-f08-delivery-reporting/Verification-Report.md')

CSS = """
@page { size: A4; margin: 15mm 14mm 17mm;
  @bottom-right { content: counter(page); font-size: 8pt; color: #52606d; }
}
body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt;
       line-height: 1.4; color: #17212b; }
h1 { font-size: 19pt; line-height: 1.2; color: #064e3b; }
h2 { font-size: 13pt; margin-top: 18pt; color: #065f46;
     break-after: avoid; }
h3, strong { break-after: avoid; }
p { orphans: 3; widows: 3; }
a { color: #047857; text-decoration: underline; }
code, pre { font-family: 'DejaVu Sans Mono', monospace; font-size: 7.4pt;
            white-space: pre-wrap; overflow-wrap: anywhere; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0;
        font-size: 7.2pt; line-height: 1.3; table-layout: auto; }
th, td { border: 0.5pt solid #cbd5e1; padding: 5pt;
         vertical-align: top; overflow-wrap: anywhere; }
th { background: #e6f4ed; text-align: left; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
img { display: block; max-width: 100%; max-height: 180mm;
      width: auto; height: auto; margin: 7pt auto;
      object-fit: contain; break-inside: avoid; }
figure { margin: 10pt 0; break-inside: avoid; }
figcaption { font-size: 8pt; text-align: center; }
.screenshot-figure { break-inside: avoid; margin: 10pt 0; }
.screenshot-figure > p { margin: 0 0 6pt; }
ul, ol { padding-left: 17pt; }
.local-file-reference { color: inherit; }
"""


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def command(*args: str, stdin: str | None = None) -> str:
    return subprocess.run(
        args, input=stdin, capture_output=True, text=True, check=True
    ).stdout


def ast(source: Path) -> dict:
    return json.loads(command("pandoc", "-f", "gfm", "-t", "json", str(source)))


def prepare(value: object, source: Path, stats: dict) -> object:
    if isinstance(value, list):
        return [prepare(item, source, stats) for item in value]
    if not isinstance(value, dict):
        return value
    if value.get("t") in {"Link", "Image"}:
        target = value["c"][-1][0]
        url = urlsplit(target)
        if value["t"] == "Image":
            assert not url.scheme and url.path, target
            image = (source.parent / unquote(url.path)).resolve()
            assert image.is_relative_to(ROOT) and image.is_file(), image
            stats["screenshot_figures"] += 1
        elif url.scheme in {"http", "https", "mailto"}:
            assert url.scheme == "mailto" or url.netloc, target
            stats["external_links_retained"] += 1
        elif target.startswith("#"):
            stats["internal_links_retained"] += 1
        else:
            assert not url.scheme, f"Unsupported local URI: {target}"
            path = (source.parent / unquote(url.path)).resolve()
            assert path.is_relative_to(ROOT) and path.exists(), path
            stats["local_links_rendered_as_plain_labels"] += 1
            # Keep the original visible label, including inline formatting.
            # Do not emit an <a href> for a local artifact: WeasyPrint would
            # otherwise turn it into a machine-specific file: annotation.
            return {
                "t": "Span",
                "c": [
                    ["", ["local-file-reference"], [["title", target]]],
                    prepare(value["c"][1], source, stats),
                ],
            }
    return {key: prepare(item, source, stats) for key, item in value.items()}


def group_screenshots(tree):
    """Keep each existing screen caption and its image on the same PDF page."""
    blocks = tree["blocks"]
    result = []
    index = 0
    while index < len(blocks):
        caption = blocks[index]
        image = blocks[index + 1] if index + 1 < len(blocks) else {}
        if (
            caption.get("t") == "Para" and len(caption["c"]) == 1
            and caption["c"][0].get("t") == "Strong"
            and image.get("t") == "Para" and len(image["c"]) == 1
            and image["c"][0].get("t") == "Image"
        ):
            result.append({"t": "Div", "c": [
                ["", ["screenshot-figure"], []], [caption, image]
            ]})
            index += 2
        else:
            result.append(caption)
            index += 1
    tree["blocks"] = result
    return tree


def check_image_bounds(document, expected):
    """Inspect the pinned renderer's layout to reject clipped/split screenshots."""
    count = 0
    for page in document.pages:
        page_box = page._page_box
        left, top = page_box.content_box_x(), page_box.content_box_y()
        right, bottom = left + page_box.width, top + page_box.height
        stack = [page_box]
        while stack:
            box = stack.pop()
            stack.extend(getattr(box, "children", ()))
            if box.element_tag != "img":
                continue
            count += 1
            x, y = box.content_box_x(), box.content_box_y()
            assert x >= left - 1 and y >= top - 1, ("image starts outside page", x, y)
            assert x + box.width <= right + 1, "image exceeds page width"
            assert y + box.height <= bottom + 1, "image exceeds page height"
    assert count == expected, (count, expected)


class LocalFetcher(URLFetcher):
    def __init__(self):
        super().__init__(allowed_protocols={"file", "data"}, fail_on_errors=True)

    def fetch(self, url, headers=None):
        parsed = urlsplit(url)
        if parsed.scheme == "file":
            path = Path(unquote(parsed.path)).resolve()
            if not path.is_relative_to(ROOT):
                raise ValueError(f"Export resource outside this repository: {path}")
        elif parsed.scheme != "data":
            raise ValueError("PDF resources must be local; external links are not fetched")
        return super().fetch(url, headers)


class WarningCapture(logging.Handler):
    def __init__(self):
        super().__init__(logging.WARNING)
        self.messages: list[str] = []

    def emit(self, record):
        self.messages.append(record.getMessage())


def main():
    assert (ROOT / "AGENTS.md").is_file()
    existing = json.loads((EVIDENCE / "pdf-export-record.json").read_text())
    records = {row["source"]: row for row in existing}
    capture = WarningCapture()
    logger = logging.getLogger("weasyprint")
    logger.addHandler(capture)
    for relative in SOURCES:
        source = BASE / relative
        stats = {
            "screenshot_figures": 0,
            "external_links_retained": 0,
            "internal_links_retained": 0,
            "local_links_rendered_as_plain_labels": 0,
        }
        tree = group_screenshots(prepare(ast(source), source, stats))
        body = command("pandoc", "-f", "json", "-t", "html5", stdin=json.dumps(tree))
        assert not re.search(r'<a\b[^>]*href=[\"\'](?:file:|/tmp/)', body, re.I)
        page = (
            '<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f"<title>{html.escape(source.stem)}</title><style>{CSS}</style>"
            f"</head><body>{body}</body></html>"
        )
        destination = source.with_suffix(".pdf")
        capture.messages.clear()
        # Render and validate outside the deliverable before replacing its PDF.
        with tempfile.TemporaryDirectory(prefix="booyah14-pdf-") as temp:
            output = Path(temp) / destination.name
            document = HTML(
                string=page, base_url=source.parent.as_uri() + "/",
                url_fetcher=LocalFetcher(),
            ).render()
            check_image_bounds(document, stats["screenshot_figures"])
            document.write_pdf(output, optimize_images=False)
            assert not capture.messages, capture.messages
            annotations = command("pdfinfo", "-url", str(output))
            assert "file:" not in annotations, annotations
            assert output.read_bytes().startswith(b"%PDF-")
            destination.write_bytes(output.read_bytes())
        records[relative] = {
            "source": relative,
            "pdf": str(destination.relative_to(BASE)),
            "source_sha256": sha256(source),
            "pdf_sha256": sha256(destination),
            "pdf_bytes": destination.stat().st_size,
            **stats,
            "warnings": list(capture.messages),
            "renderer": "WeasyPrint 70.0 / Pandoc GFM JSON",
            "local_link_policy": "plain PDF labels; relative links preserved in Markdown",
            "resources": "source PNGs loaded from this repository; no network fetch",
            "screenshot_page_bounds": "all images inside page content bounds",
            "caption_layout": "screen caption and image kept together",
        }
        print(f"Exported {relative}: {stats}")
    ordered = [records[row["source"]] for row in existing]
    (EVIDENCE / "pdf-export-record.json").write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2) + "\n"
    )


if __name__ == "__main__":
    main()
