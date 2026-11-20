"""Keep each BOOYAH-14 screenshot caption with its image in the review PDF."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

if __name__ == "__main__":
    workspace = Path(__file__).resolve().parent
    source = workspace.parents[1] / "UC-F04-F08-Delivery-Reporting.md"
    shared_exporter = workspace.parents[3] / "management/pa3/export-pdf.py"
    spec = spec_from_file_location("pa3_pdf_exporter", shared_exporter)
    exporter = module_from_spec(spec)
    spec.loader.exec_module(exporter)
    exporter.STYLE += """
p:has(> a[href*="index.html?screen="]) { break-after: avoid; }
"""
    exporter.export_pdf(source, source.with_suffix(".pdf"))
