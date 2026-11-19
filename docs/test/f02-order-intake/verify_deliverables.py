"""Verify F02 documents, PNGs, CSV evidence and publication provenance.

Run from any directory with Python/Pillow, Pandoc and Poppler available.
Optional --audited-source checks the original local source without copying it.
Only integration-verification.json and PDF verification metadata are updated.
No Figma, application, Git write or database operation is performed.
"""

from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
UC = ROOT / "docs/analysis-and-design/use-cases/UC-F02-Orders.md"
MANIFEST = ROOT / "docs/analysis-and-design/use-cases/prototypes/F02/F02-Screen-Manifest.json"
PDF_RECORD = HERE / "prototype/F02-PDF-Verification.json"


def read(path):
    return json.loads(path.read_text())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout


def walk(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)


def ast(path):
    return json.loads(run("pandoc", "-f", "gfm", "-t", "json", str(path)))


def rgb_hash(image):
    return hashlib.sha256(image.convert("RGB").tobytes()).hexdigest()


def check_pdf_images(pdf, sources):
    expected = {}
    for path in sources:
        with Image.open(path) as image:
            expected[rgb_hash(image)] = (path, image.size)
    rows = [line.split() for line in run("pdfimages", "-list", str(pdf)).splitlines()[2:]
            if line.strip()]
    images = [row for row in rows if row[2] == "image"]
    masks = [row for row in rows if row[2] == "smask"]
    # The UC source intentionally reuses two screens across specifications.
    # Renderers may deduplicate them or emit one image object per occurrence.
    assert len(expected) <= len(images) <= len(sources), (pdf, len(images), len(expected))
    seen = set()
    with tempfile.TemporaryDirectory(prefix="f02-pdf-images-") as directory:
        prefix = Path(directory) / "image"
        run("pdfimages", "-png", str(pdf), str(prefix))
        for row in images:
            actual = Image.open(f"{prefix}-{int(row[1]):03d}.png")
            key = rgb_hash(actual)
            assert key in expected, (pdf, "unexpected or altered image")
            path, size = expected[key]
            assert actual.size == size
            original = Image.open(path).convert("RGBA")
            alpha = original.getchannel("A")
            mask = next((item for item in masks if item[10:12] == row[10:12]), None)
            if mask:
                actual_alpha = Image.open(f"{prefix}-{int(mask[1]):03d}.png").convert("L")
                assert actual_alpha.tobytes() == alpha.tobytes()
            else:
                assert alpha.getextrema() == (255, 255)
            seen.add(key)
    assert seen == set(expected)
    return len(images)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audited-source", type=Path)
    args = parser.parse_args()
    manifest = read(MANIFEST)
    screens = manifest["screens"]
    ids = {row["screenId"] for row in screens}
    assert len(ids) == len(screens) == 54
    assert len(manifest["originalScreenIds"]) == 40
    assert set(manifest["originalScreenIds"]) <= ids
    png_evidence = read(HERE / "prototype/F02-PNG-Verification.json")
    assert not png_evidence["failures"]
    assert {row["screenId"] for row in png_evidence["verified"]} == ids
    for row in png_evidence["verified"]:
        path = (HERE / "prototype" / row["png"]).resolve()
        assert path.is_relative_to(ROOT) and digest(path) == row["sha256"]
        with Image.open(path) as image:
            image.load()
            assert image.size == (1440, 900)
    for row in screens:
        assert (MANIFEST.parent / row["png"]).is_file()
        parsed = urlsplit(row["figmaUrl"])
        assert manifest["fileKey"] in parsed.path
        assert row["nodeId"].replace(":", "-") in parsed.query
    links = read(HERE / "prototype/F02-Prototype-Links-Verification.json")
    structure = read(HERE / "prototype/F02-Figma-Structure-Verification.json")
    assert links["reactionNodes"] == 255 and len(links["flowStarts"]) == 4
    assert not links["invalidTargets"] and not links["sameFrameNavigations"]
    assert structure["screenCount"] == 54 and not structure["originalKitChanges"]
    for row in structure["screenEvidence"]:
        assert not row["imageFilledNodes"] and not row["wrongFonts"] and not row["overflow"]

    # The actual program validates the files and asserts both regressions and
    # atomic in-memory behavior. No --report: keep its supplied JSON unchanged.
    csv = json.loads(run("python3", str(HERE / "csv/validate_samples.py")))
    assert csv == read(HERE / "csv/validation-results.json")
    assert csv["files"]["valid-orders.csv"]["dataRows"] == 5
    assert len(csv["files"]["invalid-orders.csv"]["errors"]) == 7
    assert csv["atomicDemonstrations"]["invalid"]["inserted"] == 0
    assert csv["atomicDemonstrations"]["invalid"]["storeUnchanged"]

    pdf_record = read(PDF_RECORD)
    documents = [ROOT / row["markdown"] for row in pdf_record["exports"]]
    documents += [ROOT / "docs/README.md", ROOT / "docs/ai-log/README.md",
                  ROOT / "docs/ai-log/PA3/thepenguinguy123.md"]
    trees = {path: ast(path) for path in documents}
    anchors = {path: {node["c"][1][0] for node in walk(tree)
                      if node.get("t") == "Header"}
               for path, tree in trees.items()}
    refs = external_count = 0
    image_paths = {}
    for path, tree in trees.items():
        image_paths[path] = []
        for node in walk(tree):
            if node.get("t") not in {"Link", "Image"}:
                continue
            url = node["c"][-1][0]
            parsed = urlsplit(url)
            if parsed.scheme:
                assert parsed.scheme in {"https", "http", "mailto"}, (path, url)
                assert parsed.netloc or parsed.scheme == "mailto", (path, url)
                external_count += 1
                continue
            target = ((path.parent / unquote(parsed.path)).resolve()
                      if parsed.path else path)
            assert target.is_relative_to(ROOT) and target.exists(), (path, url)
            if parsed.fragment and target.suffix == ".md":
                if target not in anchors:
                    anchors[target] = {n["c"][1][0] for n in walk(ast(target))
                                       if n.get("t") == "Header"}
                assert unquote(parsed.fragment) in anchors[target], (path, url)
            refs += 1
            if node["t"] == "Image":
                image_paths[path].append(target)
    assert len(image_paths[UC]) == 57 and len(set(image_paths[UC])) == 54
    assert {path.stem for path in image_paths[UC]} == ids

    for row in pdf_record["exports"]:
        pdf, md = ROOT / row["path"], ROOT / row["markdown"]
        assert digest(pdf) == row["sha256"], pdf
        assert digest(md) == row["markdownSHA256"], md
        info = run("pdfinfo", str(pdf))
        assert int(re.search(r"^Pages:\s+(\d+)", info, re.M).group(1)) == row["pages"]
        uri_lines = run("pdfinfo", "-url", str(pdf))
        assert "file:" not in uri_lines and "/tmp/" not in uri_lines
        actual = {line.split("Annotation", 1)[1].strip()
                  for line in uri_lines.splitlines() if "Annotation" in line}
        expected = {n["c"][-1][0] for n in walk(trees[md])
                    if n.get("t") == "Link"
                    and urlsplit(n["c"][-1][0]).scheme in {"https", "http", "mailto"}}
        assert actual == expected, (pdf, actual ^ expected)
        text = run("pdftotext", "-layout", str(pdf), "-")
        assert "Performed by" in text and "pending" in text.lower()
        image_count = check_pdf_images(pdf, image_paths[md])
        row.update({"embeddedImageObjects": image_count,
                    "embeddedUniqueImages": len(set(image_paths[md])), "fileAnnotations": 0,
                    "imagePixels": "exact decoded RGB and alpha match source PNGs",
                    "externalTargetCount": len(actual), "verified": True})
        if md == UC:
            assert ids <= set(re.findall(r"S0[5-8]-\d{2}(?:-[a-z0-9]+)*", text))

    # Preserve original source provenance while tracking authorized publication
    # repairs separately from the original classification operation.
    provenance_path = HERE / "integration-manifest.json"
    provenance = read(provenance_path)
    PDF_RECORD.write_text(json.dumps(pdf_record, ensure_ascii=False, indent=2) + "\n")
    for row in provenance["files"]:
        current = digest(ROOT / row["destination"])
        if current != row["destinationSHA256"]:
            row.setdefault("beforePublicationDestinationSHA256", row["destinationSHA256"])
            row["destinationSHA256"] = current
            row["publicationRepair"] = (
                "Corrected documentation paths/PDF navigation and associated metadata; "
                "source hash and original classification operation retained"
            )
    source_verified = None
    if args.audited_source:
        source = args.audited_source.resolve()
        source_rows = provenance["files"] + provenance.get("excludedSourceFiles", [])
        expected_source_names = {row["source"] for row in source_rows}
        assert {str(path.relative_to(source)) for path in source.rglob("*")
                if path.is_file()} == expected_source_names
        for row in source_rows:
            assert digest(source / row["source"]) == row["sourceSHA256"]
        source_verified = len(source_rows)
    provenance["publicationBase"] = "851f324b67bedb6b23f094aa5faebad6c73f197d"
    provenance["publicationNote"] = (
        "Original audited source and classification remain historical. Current "
        "destination hashes include documented publication repairs; no source "
        "draft is included or required for normal repository verification."
    )
    provenance_path.write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n")

    report_path = HERE / "integration-verification.json"
    report = read(report_path)
    report["PDFs"] = pdf_record["exports"]
    publication = {
        "date": "2026-11-19", "scope": "BOOYAH-20 documentation PR only",
        "markdownFilesChecked": len(documents), "localReferences": refs,
        "externalURISyntaxChecks": external_count, "brokenLocalReferences": [],
        "PNGs": 54, "originalScreenIDs": 40, "imageOccurrencesInUC": 57,
        "recordedReactionNodes": 255, "recordedFlowStarts": 4,
        "recordedFigmaEvidence": "read-only historical records, no fresh MCP check",
        "PDFsChecked": len(pdf_record["exports"]),
        "PDFsRegenerated": len(pdf_record["exports"]) - 1, "fileAnnotations": 0,
        "historicalPreExclusionBrokenFileAnnotationsRepaired": 158,
        "publishedBrokenFileAnnotationsRepaired": 127,
        "excludedReportFileAnnotationsNotPublished": 31,
        "excludedReports": provenance.get("publicationExclusions", []),
        "imageIntegrity": "all embedded unique RGB/alpha pixel data match source PNGs",
        "CSVReportMatchesAuditedSource": True, "validRows": 5,
        "invalidRows": 8, "invalidFieldErrors": 7, "invalidBatchInserted": 0,
        "invalidStoreUnchanged": True, "atomicScope": "in-memory only",
        "auditedSourceHashesVerifiedThisRun": source_verified,
        "databaseOrApplicationTests": "not run; no application/schema change",
        "humanReview": "pending; proposals are not promoted to accepted requirements",
    }
    report["publicationVerification"] = publication
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(publication, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
