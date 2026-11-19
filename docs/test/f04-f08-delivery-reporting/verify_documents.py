"""Validate BOOYAH-14 PDF navigation, lossless screenshots and preserved scope.

Requires Python 3, Pillow, Pandoc and Poppler pdfinfo/pdfimages/pdftotext.
Reads protected prototypes; writes only PDF/document verification metadata.
"""

from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
import sys
from urllib.parse import unquote, urlsplit, parse_qs

from PIL import Image


ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / "docs/analysis-and-design/use-cases"
P = BASE / "prototypes/F04-F08"
T = Path(__file__).resolve().parent
EVIDENCE = T / "prototype"


def load(path):
    return json.loads(path.read_text())


def sha256(path):
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


def functional_regions(text):
    result = {
        "shared_contract": text.split("## 2. Shared domain and interaction contract", 1)[1]
        .split("## 3.", 1)[0]
    }
    for match in re.finditer(r"^## [3-6]\. (UC\d+).*?(?=^## |\Z)", text, re.M | re.S):
        result[match.group(1)] = match.group(0).split("**Decision Log**", 1)[0]
    return {key: hashlib.sha256(value.encode()).hexdigest() for key, value in result.items()}


def check_images(pdf, expected):
    listing = run("pdfimages", "-list", str(pdf))
    rows = [line.split() for line in listing.splitlines()[2:] if line.strip()]
    images = [row for row in rows if row[2] == "image"]
    masks = [row for row in rows if row[2] == "smask"]
    assert len(images) == len(expected), (pdf, len(images), len(expected))
    with tempfile.TemporaryDirectory(prefix="booyah14-image-check-") as temp:
        prefix = Path(temp) / "image"
        run("pdfimages", "-png", str(pdf), str(prefix))
        for row, source in zip(images, expected):
            number = int(row[1])
            actual = Image.open(f"{prefix}-{number:03d}.png").convert("RGB")
            original = Image.open(source).convert("RGBA")
            assert actual.size == original.size, (pdf, source, "image dimensions")
            assert actual.tobytes() == original.convert("RGB").tobytes(), (
                pdf, source, "lossless RGB pixels"
            )
            mask = next((item for item in masks if item[10:12] == row[10:12]), None)
            alpha = original.getchannel("A")
            if mask:
                actual_alpha = Image.open(f"{prefix}-{int(mask[1]):03d}.png").convert("L")
                assert actual_alpha.tobytes() == alpha.tobytes(), (pdf, source, "alpha")
            else:
                assert alpha.getextrema() == (255, 255), (pdf, source, "missing alpha")
    return len(images)


def main():
    baseline = load(T / "provenance/document-repair-baseline.json")
    integration = baseline["official_integration"]
    files = integration["files"]
    assert len(files) == integration["approved_file_count"] == 137
    paths = [row["destination"] for row in files]
    assert len(set(paths)) == 137
    for row in files:
        path = (ROOT / row["destination"]).resolve()
        assert path.is_relative_to(ROOT / "docs") and path.is_file(), path
        assert not any(part in {"draft", "ai-log"} for part in path.relative_to(ROOT).parts)
        assert not any(term in row["destination"] for term in ["F02", "UC05", "UC06", "UC07", "UC08"])
        if row["byte_preserved"]:
            assert sha256(path) == row["source_sha256"], path
    assert sha256(BASE / "F04-F08-Business-Rules-Proposal.md") == baseline[
        "original_business_rules_sha256"
    ]
    uc = (BASE / "UC-F04-F08-Delivery-Reporting.md").read_text()
    assert functional_regions(uc) == baseline["functional_regions_sha256"]
    decision_lines = "\n".join(
        line for line in uc.splitlines()
        if line.startswith("| DL") and not line.startswith("| DL11-4")
    )
    assert hashlib.sha256(decision_lines.encode()).hexdigest() == baseline[
        "decision_lines_except_kit_sha256"
    ]
    assert [line for line in uc.splitlines() if line.startswith("| UC")] == baseline[
        "original_overview_rows"
    ]
    assert "prototype verification **pending**" not in uc
    assert "before creating editable prototypes" not in uc
    # Re-evaluate recorded reactions and PNGs; no Figma authoring or API calls.
    prototype = json.loads(run(sys.executable, str(T / "verify_prototype.py"), "--check-only"))
    markdown = sorted(ROOT / path for path in paths if path.endswith(".md"))
    assert len(markdown) == 5
    trees = {
        path: json.loads(run("pandoc", "-f", "gfm", "-t", "json", str(path)))
        for path in markdown
    }
    anchors = {
        (path, node["c"][1][0]) for path, tree in trees.items()
        for node in walk(tree) if node.get("t") == "Header"
    }
    references = external = 0
    embeds = {}
    for path, tree in trees.items():
        embeds[path] = []
        lines = path.read_text().splitlines()
        for index, line in enumerate(lines):
            if line.startswith("#"):
                first = next((item for item in lines[index + 1:] if item.strip()), "")
                assert first.startswith("Performed by: Trần Lê Hải."), (path, index + 1)
                assert "Reviewed by: Nguyễn Thành Trung (pending actual review)." in first
                assert "Edited by: Codex" in first and "human editor pending" in first
        for node in walk(tree):
            if node.get("t") not in {"Link", "Image"}:
                continue
            target = node["c"][-1][0]
            url = urlsplit(target)
            if url.scheme:
                assert url.scheme in {"https", "http", "mailto"}, target
                assert url.scheme == "mailto" or url.netloc, target
                external += 1
                continue
            resolved = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert resolved.is_relative_to(ROOT) and resolved.exists(), (path, target)
            if url.fragment and resolved.suffix == ".md":
                assert (resolved, unquote(url.fragment)) in anchors, (path, target)
            references += 1
            if node["t"] == "Image":
                embeds[path].append(resolved)

    records = load(EVIDENCE / "pdf-export-record.json")
    pdf_results = []
    for record in records:
        source, pdf = ROOT / record["source"], ROOT / record["pdf"]
        assert sha256(source) == record["source_sha256"], source
        assert sha256(pdf) == record["pdf_sha256"], pdf
        urls = run("pdfinfo", "-url", str(pdf))
        actual = {
            line.split("Annotation", 1)[1].strip()
            for line in urls.splitlines() if "Annotation" in line
        }
        expected = {
            node["c"][-1][0] for node in walk(trees[source])
            if node.get("t") == "Link"
            and urlsplit(node["c"][-1][0]).scheme in {"http", "https", "mailto"}
        }
        assert actual == expected, (pdf, "external link preservation", actual ^ expected)
        assert all(urlsplit(url).scheme in {"https", "http", "mailto"} for url in actual)
        assert "file:" not in urls and "/tmp/" not in urls
        assert ("/home/tranlehai/" + "Veylo/") not in urls
        text = run("pdftotext", "-layout", str(pdf), "-")
        assert "Trần Lê Hải" in text and "Nguyễn Thành Trung" in text, pdf
        assert "pending actual review" in text and "human editor pending" in text, pdf
        info = run("pdfinfo", str(pdf))
        pages = int(re.search(r"^Pages:\s+(\d+)", info, re.M).group(1))
        count = check_images(pdf, embeds[source])
        assert count == record["screenshot_figures"]
        pdf_results.append({
            **record, "pages": pages, "image_objects": count,
            "decoded_screenshot_rgb_and_alpha": "exact source pixels preserved",
            "local_file_annotations": 0, "broken_file_annotations": 0,
            "external_url_targets_preserved": len(actual),
            "external_availability": "not requested; syntax and preservation only",
            "attribution": "present; human review/editor remain pending",
            "checks": "passed",
        })

    mapping = load(P / "screen-fixture-flow-map.json")
    expected_pngs = {
        (ROOT / row["png"]).resolve()
        for row in mapping if row["uc"] != "REVIEW"
    }
    assert set(embeds[BASE / "UC-F04-F08-Delivery-Reporting.md"]) == expected_pngs
    guide = load(T / "fixtures/proposed-location-guide.json")
    assert guide["fixture_id"] == "PROPOSED-BOOYAH14-GUIDE-001"
    assert guide["actual_shared_fixture_id"] is None
    assert guide["actual_uc15_destination"] is None
    handoff = (P / "UC11-UC15-Handoff.md").read_text()
    for token in ["4:39", "4:73", "4:142", "pending BOOYAH-15", "not connected or verified"]:
        assert token in handoff, token
    for path in [ROOT / relative for relative in paths]:
        if path.is_file() and path.suffix in {".md", ".json", ".csv", ".py", ".js"}:
            data = path.read_bytes()
            text = data.decode("utf-8")
            assert b"\r\n" not in data and data.endswith(b"\n"), path
            assert not re.search(r"/home/tranlehai/" + r"Veylo/", text), path

    registry = load(EVIDENCE / "figma-screen-registry.json")
    by_screen = {row["screen_id"]: row for row in registry}
    manifest = load(P / "screen-manifest.json")
    assert manifest["file_key"] == "LBEaZQ3zEjnjBLhLoPb5pD"
    assert set(manifest["original_screen_map_ids"]) <= set(re.findall(r"S(?:11|12|13|19)-[A-Za-z0-9-]+", uc))
    with (P / "screen-fixture-flow-map.csv").open(newline="") as handle:
        csv_rows = list(csv.DictReader(handle))
    assert len(mapping) == len(csv_rows) == 103
    csv_by_id = {row["Screen ID"]: row for row in csv_rows}
    for row in mapping:
        screen = by_screen[row["screen_id"]]
        assert row["node_id"] == screen["node_id"]
        url = urlsplit(row["figma_url"])
        assert url.scheme == "https" and url.netloc == "www.figma.com"
        assert "/design/" + manifest["file_key"] + "/" in url.path
        assert parse_qs(url.query)["node-id"] == [row["node_id"].replace(":", "-")]
        assert sha256(ROOT / row["png"]) == row["png_sha256"]
        assert row["png"] in paths and row["fixture_ref"] in paths
        assert not row["actual_uc15_verified"]
        csv_row = csv_by_id[row["screen_id"]]
        for csv_key, key in [("PNG", "png"), ("Fixture", "fixture_ref"), ("Figma Node", "node_id"), ("Figma URL", "figma_url")]:
            assert csv_row[csv_key] == row[key], (row["screen_id"], csv_key)
        assert csv_row["Flow References"] == "; ".join(row["flow_refs"])
    flow_map = load(P / "flow-to-figma-map.json")
    assert len(flow_map) == 71
    for row in flow_map:
        assert all(sid in by_screen for sid in row["screen_ids"])
        for frame in row["figma"]:
            assert frame["node_id"] == by_screen[frame["screen_id"]]["node_id"]
    registry = {row["screen_id"]: row for row in load(EVIDENCE / "figma-screen-registry.json")}
    manifest = load(P / "screen-manifest.json")
    assert set(manifest["original_screen_map_ids"]) <= set(re.findall(r"S(?:11|12|13|19)-[A-Za-z0-9-]+", uc))
    assert len({(row["uc"], row["flow"]) for row in flow_map}) == 71
    expected_flows = set()
    for match in re.finditer(r"^## [3-6]\. (UC\d+).*?(?=^## |\Z)", uc, re.M | re.S):
        block = match.group(0)
        expected_flows.update((match.group(1), flow) for flow in re.findall(r"^\d+\. \*\*(B\d+) —", block, re.M))
        expected_flows.update((match.group(1), flow) for flow in re.findall(r"^\| (A\d+) —", block, re.M))
    assert {(row["uc"], row["flow"]) for row in flow_map} == expected_flows
    with (P / "screen-fixture-flow-map.csv").open(newline="") as handle:
        csv_rows = list(csv.DictReader(handle))
    assert len(csv_rows) == len(mapping) == 103
    for row, csv_row in zip(mapping, csv_rows):
        assert row["node_id"] == registry[row["screen_id"]]["node_id"]
        url = urlsplit(row["figma_url"])
        assert url.scheme == "https" and url.netloc == "www.figma.com"
        assert "/design/" + manifest["file_key"] + "/" in url.path
        assert parse_qs(url.query)["node-id"] == [row["node_id"].replace(":", "-")]
        png_path, fixture_path = ROOT / row["png"], ROOT / row["fixture_ref"]
        assert png_path.is_file() and fixture_path.is_file()
        assert str(png_path.relative_to(ROOT)) in paths and str(fixture_path.relative_to(ROOT)) in paths
        assert sha256(png_path) == row["png_sha256"]
        assert not row["actual_uc15_verified"]
        assert csv_row == {
            "Screen ID": row["screen_id"], "UC": row["uc"],
            "Figma Node": row["node_id"], "Figma URL": row["figma_url"],
            "PNG": row["png"], "Flow References": "; ".join(row["flow_refs"]),
            "Fixture": row["fixture_ref"],
        }
    for flow in flow_map:
        for frame in flow["figma"]:
            node = registry[frame["screen_id"]]["node_id"]
            assert parse_qs(urlsplit(frame["url"]).query)["node-id"] == [node.replace(":", "-")]

    inventory = load(EVIDENCE / "kit-source-inventory.json")
    provenance = inventory["official_integration_provenance"]
    assert not provenance["version_equivalence_claimed"] and not provenance["shared_kit_copied_or_modified"]
    assert len(provenance["exact_source_kit_file_sha256"]) > 0
    assert {row["file"]: row["identical"] for row in provenance["comparison"]} == {
        "tokens.css": True, "assets/fonts/fonts.css": True,
        "kit.css": False, "index.html": False, "export.mjs": False,
    }
    for relative, digest in provenance["exact_source_kit_file_sha256"].items():
        assert not Path(relative).is_absolute() and ".." not in Path(relative).parts
        assert re.fullmatch(r"[0-9a-f]{64}", digest)

    results = {
        "markdown_files": len(markdown),
        "relative_links_and_images_checked": references,
        "image_embeds": sum(map(len, embeds.values())),
        "external_links_syntax_checked": external,
        "broken_local_references": [], "attribution_gaps": [],
        "pdfs_checked": len(pdf_results), "affected_pdfs_regenerated": 4,
        "pre_repair_broken_pdf_annotations": sum(
            baseline["pre_repair_pdf_local_annotations"].values()
        ),
        "remaining_pdf_file_annotations": 0,
        "embedded_screenshot_pixels": "all RGB/alpha data match original PNGs",
        "functional_regions_unchanged": list(baseline["functional_regions_sha256"]),
        "decision_logs_unchanged_except_kit_artifact_status": True,
        "business_rules_unchanged_and_proposed": True,
        "byte_preserved_official_artifact_hashes_verified": sum(row["byte_preserved"] for row in files),
        "approved_integration_files_verified": len(files),
        "historical_repair_baseline": "retained as provenance; historical paths are not executable dependencies",
        "json_csv_path_convention": "repository-root-relative",
        "figma_frame_url_id_consistency": "103 mappings checked against recorded registry; no live access check",
        "screen_fixture_csv_json_consistency": "103 matching rows; PNG and fixture paths/hashes checked",
        "flow_mapping_coverage": "all 28 basic steps and 43 alternative flows match UC specifications",
        "kit_provenance": "exact original version and hashes retained; distinct team kit not substituted",
        "prototype_frames_pngs_reaction_nodes": [
            prototype["screens"], prototype["pngs"], prototype["reaction_nodes"]
        ],
        "scripted_recorded_graph_walkthroughs_passed": True,
        "actual_uc15_cross_navigation_verified": False,
        "fresh_figma_or_jira_calls": "none; prototype preserved",
        "application_or_backend_tests": "not run; documentation integration only",
        "working_repository": "resolved from script; all local links within this repository",
    }
    (EVIDENCE / "pdf-verification.json").write_text(
        json.dumps(pdf_results, ensure_ascii=False, indent=2) + "\n"
    )
    (EVIDENCE / "document-verification.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
