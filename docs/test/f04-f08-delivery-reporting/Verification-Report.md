# BOOYAH-14 — Prototype Verification Report
Performed by: Trần Lê Hải. Reviewed by: Nguyễn Thành Trung (pending actual review). Edited by: Codex (AI-assisted prototype work); human editor pending.

**Scope:** actual native Figma structure/reactions, PNG files, documented screen/fixture/flow identities and synthetic arithmetic. This is AI verification of prototype artifacts; no human acceptance, real application behavior or backend/performance test is claimed.

## Recorded results
Performed by: Trần Lê Hải. Reviewed by: Nguyễn Thành Trung (pending actual review). Edited by: Codex (AI-assisted prototype work); human editor pending.

| Check | Result / evidence |
| --- | --- |
| Native frames / original Screen Map IDs | 103 / 79 |
| Actual PNG exports | 103 files; 23,515,411 bytes |
| Editable scene descendants | 4363; INSTANCE: 836, FRAME: 462, VECTOR: 1179, TEXT: 1886 |
| Whole-UI raster fills | 0; all screens use native editable text, instances and vectors |
| Reaction nodes / entry flows | 354 / 4 |
| Invalid destinations / same-frame navigation | 0 / 0 |
| Frames reachable from review launcher | 103 / 103 |
| Body overflow / out-of-frame text | 0 / 0 |
| Fonts | Plus Jakarta Sans and JetBrains Mono; no mismatched family |
| Scripted graph paths | 5 passed, including both failed stops and manual eligible-stop choice |
| UC specification structure | 4 UCs; 28 basic steps; 43 alternative flows retained |
| Report arithmetic | Two-date cohort 33.33% Order delivery / 33.33% attempt success / 15.00 min; today-only 50.00% attempt success / 17.50 min |
| Actual UC15 cross-UC connection | Pending; not connected or verified |

## Reproducible checks
Performed by: Trần Lê Hải. Reviewed by: Nguyễn Thành Trung (pending actual review). Edited by: Codex (AI-assisted prototype work); human editor pending.

Run from repository root:

```bash
python3 docs/test/f04-f08-delivery-reporting/verify_prototype.py
```

[Prototype verification JSON](prototype/prototype-verification.json), [PNG hashes/dimensions](prototype/png-verification.json), [final structure](prototype/figma-structure-verified.json), and recorded reaction graphs provide actual evidence. One shared refresh-overlay PNG is 372×252 including 26-pixel optical-shadow padding around its 320×200 frame; all other exports match frame dimensions exactly.

## Export and recovery facts
Performed by: Trần Lê Hải. Reviewed by: Nguyễn Thành Trung (pending actual review). Edited by: Codex (AI-assisted prototype work); human editor pending.

Single-node download-assets calls reached the Education plan read-tool limit, and HTTP asset requests returned empty 202 responses. The supported `use_figma` screenshot queue subsequently exported all 103 actual PNGs inline; no missing image was fabricated or recreated from HTML. Short-lived asset URLs were kept only under `/tmp`, not in deliverables. No paid service or AI image-generation credit was used.

Native bounds/button-label/badge and conditional-navigation defects found during AI checks were corrected. Returned Figma conditions were read back; unsupported nested/multiway conditions were replaced by supported two-way actions. Final graph simulation passed. Temporary exporter/patch wrappers were corrected when their checks failed; only actual final results are reported as passing.

## PDF and file validation
Performed by: Trần Lê Hải. Reviewed by: Nguyễn Thành Trung (pending actual review). Edited by: Codex (AI-assisted prototype work); human editor pending.

The paired PDFs are generated from the final Markdown and actual PNGs. The earlier draft-repair audit found 355 unusable local-file annotations in four PDFs (128 in the UC document, 218 in the main handoff, 3 in the UC11–UC15 handoff and 6 in this report). Earlier source hashes/image checks did not detect that navigation defect; the earlier PDF/link completion claim was too broad.

The corrected export keeps HTTPS links clickable and same-document anchors internal. Relative file links remain valid in Markdown and become plain reference labels in PDF, rather than machine-specific `file:` links. Screenshot images remain embedded; removing an unusable hyperlink does not remove its image. The unchanged Business Rules PDF contains no local-file annotations.

Official integration copies exactly 137 approved artifacts, including all 103 PNGs, and rebases their document and metadata paths. The source draft, unrelated task files, teammates’ work and AI Logs are preserved. The relocated scripts resolve their repository root from their own official location and do not require draft sources. JSON/CSV artifact paths are repository-root-relative. The historical baseline retains its old paths and hashes as provenance; its `official_integration` section records the approved mapping and byte-preserved artifacts for the new layout. Kit provenance records the exact supplied version and hashes; the other cached team kit is not silently substituted.

The [PDF verification metadata](prototype/pdf-verification.json), [document/link/source-preservation results](prototype/document-verification.json) and [repair baseline](provenance/document-repair-baseline.json) record source/PDF hashes, actual image and annotation checks, attribution, preserved functional content and protected artifact hashes. These are AI checks of local artifacts, not new Figma readbacks, human review or real application/API tests. Proposed Business Rules and pending UC15 integration remain unchanged.

From repository root, with Python 3, Pandoc, Poppler tools, Pillow and WeasyPrint 70.0 available:

```bash
python3 docs/test/f04-f08-delivery-reporting/export_documents.py
python3 docs/test/f04-f08-delivery-reporting/verify_documents.py
```

The exporter regenerates only the four affected official PDFs and export metadata. The unchanged rules PDF retains its historical exporter CSS warning; that warning does not indicate a missing image or broken link. Fresh exports must have zero warnings. The verifier checks all five paired documents, including the unchanged rules PDF, and writes validation metadata. Local-file PDF annotations are intentionally absent; external-link checks establish syntax and preservation, not remote availability or reviewer access. Independent prototype walkthrough/review and team policy decisions remain pending, so repaired packaging is not a claim that the whole PA3 team submission has been accepted.

## BOOYAH-15 integration boundary
Performed by: Trần Lê Hải. Reviewed by: Nguyễn Thành Trung (pending actual review). Edited by: Codex (AI-assisted prototype work); human editor pending.

Only the proposed synthetic fixture, S11-02 preview and local EP11-B handoff have evidence here. The actual shared fixture and UC15 Full Guide destination remain pending; see [the handoff](../../analysis-and-design/use-cases/prototypes/F04-F08/UC11-UC15-Handoff.md). Source kit files, the initial empty Figma page and teammate files are preserved. No commit, push, PR or Jira update was made.
