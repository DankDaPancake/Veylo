"""Export PA3 Markdown from the repository using markdown-it-py and WeasyPrint."""

import argparse
from html import escape
from pathlib import Path
import re

from markdown_it import MarkdownIt
from weasyprint import HTML

# UseCaseModel.md pairs each Mermaid source with its owner's rendered PNG.
MERMAID = re.compile(r"^```mermaid[^\n]*\n.*?^```[ \t]*$", re.MULTILINE | re.DOTALL)
RENDERED_PNG = re.compile(r"\s*\[Rendered PNG\]\(([^)]+)\)")

STYLE = """
@page { size: A4; margin: 16mm; }
body { color: #142b28; font: 10pt/1.45 sans-serif; }
h1, h2, h3 { break-after: avoid; }
h1 { font-size: 22pt; }
h2 { font-size: 16pt; }
table { width: 100%; border-collapse: collapse; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th, td { border: 1px solid #bbc9c5; padding: 5pt 7pt; text-align: left; }
th { background: #e8f2ef; }
code { overflow-wrap: anywhere; }
pre { white-space: pre-wrap; }
figure { margin: 8mm 0; break-inside: avoid; }
p:has(img) { break-inside: avoid; }
img { display: block; max-width: 100%; max-height: 156mm; margin: 5mm auto; }
a { color: #0a614f; }
.pagebreak { break-before: page; }
"""


def export_pdf(source: Path, output: Path) -> None:
    text = source.read_text(encoding="utf-8")

    def embed_mermaid(match: re.Match) -> str:
        link = RENDERED_PNG.match(match.string, match.end())
        if link is None:
            raise ValueError(f"{source}: supply a rendered PNG link after each Mermaid block")
        image = link.group(1)
        if not (source.parent / image).is_file():
            raise FileNotFoundError(f"{source}: missing Mermaid export {image}")
        return f"![Mermaid diagram]({image})\n\n"

    text = MERMAID.sub(embed_mermaid, text)
    if re.search(r"^```mermaid", text, re.MULTILINE):
        raise ValueError(f"{source}: supply a rendered PNG link after each Mermaid block")
    text = text.replace("<!-- pagebreak -->", '<div class="pagebreak"></div>')
    renderer = MarkdownIt("gfm-like", {"linkify": False})
    markup = renderer.render(text)
    document = HTML(
        string=f"<!doctype html><html lang='en'><meta charset='utf-8'>"
        f"<title>{escape(source.stem)}</title><style>{STYLE}</style>{markup}</html>",
        base_url=source.parent.resolve().as_uri() + "/",
    )
    document.write_pdf(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sources", type=Path, nargs="+")
    for source in parser.parse_args().sources:
        export_pdf(source, source.with_suffix(".pdf"))
