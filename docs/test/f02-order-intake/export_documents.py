"""Export the two published F02 PDFs; preserve source Markdown and PNGs.

Requires Pandoc, Poppler and WeasyPrint 70.0. No network resources are fetched.
Local artifact links remain clickable in Markdown and plain labels in PDFs.
"""

from __future__ import annotations

import hashlib
import html
import json
import logging
from pathlib import Path
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit

from weasyprint import HTML
from weasyprint.urls import URLFetcher

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
RECORD = HERE / "prototype/F02-PDF-Verification.json"
CSS = """
@page { size: A4; margin: 15mm 14mm 17mm;
  @bottom-right { content: counter(page); font-size: 8pt; color: #52606d; } }
body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt;
       line-height: 1.4; color: #17212b; }
h1 { font-size: 19pt; line-height: 1.2; color: #064e3b; }
h2 { font-size: 13pt; color: #065f46; margin-top: 18pt; break-after: avoid; }
p { orphans: 3; widows: 3; }
a { color: #047857; }
code, pre { font-family: 'DejaVu Sans Mono', monospace; font-size: 7.3pt;
            white-space: pre-wrap; overflow-wrap: anywhere; }
table { border-collapse: collapse; width: 100%; font-size: 7.2pt;
        line-height: 1.3; margin: 10pt 0; }
th, td { border: 0.5pt solid #cbd5e1; padding: 5pt; vertical-align: top;
         overflow-wrap: anywhere; }
th { background: #e6f4ed; text-align: left; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
img { display: block; max-width: 100%; max-height: 180mm; width: auto;
      height: auto; margin: 6pt auto; object-fit: contain; break-inside: avoid; }
.screen-figure { break-inside: avoid; margin: 10pt 0; }
.screen-figure > p { margin: 0 0 6pt; }
ul, ol { padding-left: 17pt; }
"""


def run(*args, stdin=None):
    return subprocess.run(
        args, input=stdin, capture_output=True, text=True, check=True
    ).stdout


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def transform(value, source, stats):
    if isinstance(value, list):
        return [transform(item, source, stats) for item in value]
    if not isinstance(value, dict):
        return value
    if value.get("t") in {"Image", "Link"}:
        target = value["c"][-1][0]
        parsed = urlsplit(target)
        if value["t"] == "Image":
            assert not parsed.scheme, target
            path = (source.parent / unquote(parsed.path)).resolve()
            assert path.is_relative_to(ROOT) and path.is_file(), path
            stats["imageOccurrences"] += 1
        elif parsed.scheme in {"https", "http", "mailto"}:
            assert parsed.netloc or parsed.scheme == "mailto", target
            stats["externalLinksRetained"] += 1
        elif target.startswith("#"):
            stats["internalLinksRetained"] += 1
        else:
            assert not parsed.scheme, target
            path = (source.parent / unquote(parsed.path)).resolve()
            assert path.is_relative_to(ROOT) and path.exists(), path
            stats["localLinksAsPlainLabels"] += 1
            return {"t": "Span", "c": [
                ["", [], [["title", target]]],
                transform(value["c"][1], source, stats),
            ]}
    return {key: transform(item, source, stats) for key, item in value.items()}


def group_figures(tree):
    blocks, result, index = tree["blocks"], [], 0
    while index < len(blocks):
        caption = blocks[index]
        image = blocks[index + 1] if index + 1 < len(blocks) else {}
        if (caption.get("t") == "Para" and caption["c"]
                and caption["c"][0].get("t") == "Strong"
                and image.get("t") == "Para" and len(image["c"]) == 1
                and image["c"][0].get("t") == "Image"):
            result.append({"t": "Div", "c": [
                ["", ["screen-figure"], []], [caption, image],
            ]})
            index += 2
        else:
            result.append(caption)
            index += 1
    tree["blocks"] = result
    return tree


class LocalFetcher(URLFetcher):
    def __init__(self):
        super().__init__(allowed_protocols={"file", "data"}, fail_on_errors=True)

    def fetch(self, url, headers=None):
        parsed = urlsplit(url)
        if parsed.scheme == "file":
            assert Path(unquote(parsed.path)).resolve().is_relative_to(ROOT), url
        else:
            assert parsed.scheme == "data", url
        return super().fetch(url, headers)


class WarningCapture(logging.Handler):
    def __init__(self):
        super().__init__(logging.WARNING)
        self.messages = []

    def emit(self, record):
        self.messages.append(record.getMessage())


def check_image_bounds(document, expected):
    count = 0
    for page in document.pages:
        box = page._page_box
        left, top = box.content_box_x(), box.content_box_y()
        right, bottom = left + box.width, top + box.height
        stack = [box]
        while stack:
            item = stack.pop()
            stack.extend(getattr(item, "children", ()))
            if item.element_tag != "img":
                continue
            count += 1
            x, y = item.content_box_x(), item.content_box_y()
            assert x >= left - 1 and y >= top - 1
            assert x + item.width <= right + 1
            assert y + item.height <= bottom + 1
    assert count == expected, (count, expected)


def main():
    evidence = json.loads(RECORD.read_text())
    capture = WarningCapture()
    logging.getLogger("weasyprint").addHandler(capture)
    for row in evidence["exports"]:
        source, pdf = ROOT / row["markdown"], ROOT / row["path"]
        if source.name == "F02-Business-Rules-Proposal.md":
            row["markdownSHA256"] = digest(source)
            row["publicationExport"] = "unchanged original rules PDF"
            continue
        stats = {"imageOccurrences": 0, "externalLinksRetained": 0,
                 "internalLinksRetained": 0, "localLinksAsPlainLabels": 0}
        tree = json.loads(run("pandoc", "-f", "gfm", "-t", "json", str(source)))
        tree = group_figures(transform(tree, source, stats))
        body = run("pandoc", "-f", "json", "-t", "html5", stdin=json.dumps(tree))
        page = (f'<!doctype html><html lang="en"><meta charset="utf-8">'
                f'<title>{html.escape(source.stem)}</title><style>{CSS}</style>'
                f'<body>{body}</body></html>')
        capture.messages.clear()
        document = HTML(string=page, base_url=source.parent.as_uri() + "/",
                        url_fetcher=LocalFetcher()).render()
        check_image_bounds(document, stats["imageOccurrences"])
        with tempfile.TemporaryDirectory(prefix="f02-pdf-") as directory:
            out = Path(directory) / pdf.name
            document.write_pdf(out, optimize_images=False)
            assert not capture.messages, capture.messages
            assert "file:" not in run("pdfinfo", "-url", str(out))
            pdf.write_bytes(out.read_bytes())
        row.update({"sha256": digest(pdf), "markdownSHA256": digest(source),
                    "bytes": pdf.stat().st_size, "pages": len(document.pages),
                    **stats, "fileAnnotations": 0, "renderer": "WeasyPrint 70.0",
                    "imagePageBounds": "passed", "warnings": []})
        print(f"Exported {row['path']}: {row['pages']} pages; {stats}")
    evidence["basis"] = "F02 PR publication: corrected local PDF links; no design rebuild"
    RECORD.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
