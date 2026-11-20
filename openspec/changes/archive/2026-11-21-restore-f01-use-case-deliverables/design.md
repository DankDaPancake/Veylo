## Context

See [proposal.md](proposal.md) and [the document contract](specs/f01-use-case-package/spec.md). A short design resolves source identity, asset restoration and when a retained PDF needs regeneration. The existing source is a static screenshot package; an editable interactive prototype source has not been supplied and is not required to recover those original captures.

## Goals / Non-Goals

**Goals:** import the existing owner deliverable and original images with valid repository-relative paths, verify specification completeness and preserve its source/policy boundaries.

**Non-Goals:** rebuild original F01 screens, replace original PNGs with extracted PDF images, implement administration, resolve pending business policy or treat relayed review as approval of later editorial changes.

## Decisions

### Restore the source rather than recreate it

Use [BOOYAH-22's supplied folder](https://drive.google.com/drive/folders/1R3UIXbaaor6hBC_QxPk4upz7yLZEvIrT). Download through read-only access during apply, reject HTML/error responses masquerading as assets, and verify signatures before installing files at the intended paths. Do not overwrite a newly occupied destination without comparing it first.

| Source | Identity / destination |
| --- | --- |
| Markdown | Drive `1-EEHdgZ8J55z74LUf8zoo2fBX_J9Cs4H` → `docs/analysis-and-design/use-cases/UC-F01-Access.md` |
| PDF | Drive `1EOekKQo_0lfXtEoHhGDciyPrlYqE77AN` → sibling `UC-F01-Access.pdf`; source inspected as 11 A4 pages with 18 embedded 1440×900 images |
| Original PNG folder | [prototypes](https://drive.google.com/drive/folders/1RbKvqIxTKfCtv7Gb3vaF1-mitkYNAu9I) → existing `docs/analysis-and-design/use-cases/prototypes/` tree |
| UC01 images | `UC01/S01-01.png` through `S01-06.png` — six files |
| UC02 images | `UC02/S02-01.png` through `S02-05.png` — five files |
| UC03 images | `UC03/S03-01.png` through `S03-04.png` — four files |
| UC04 images | `UC04/S04-01.png` through `S04-03.png` — three files |

Record retrieval identity, hashes, any editorial differences and actual checks in `docs/test/f01-deliverables/README.md`. This is provenance/verification, not a new copy of the use-case specification or AI log. Original PNGs are available, so PDF extraction or regenerated illustrations would be unnecessary and less faithful.

### Authorized supplementary deactivation result

During apply, visual review found that UC02 step 4 points to a confirmation dialog (S02-03) and a list where both accounts remain Active (S02-01). On 21 November 2026 the user explicitly authorized creating an additional prototype. Add S02-06 as a supplementary result screen showing the same selected dispatcher account as Inactive, preserving all 18 original PNGs. Keep a local HTML source, capture it at 1440×900 and label the new evidence as AI-created with human review pending. This illustrates the existing deactivation result only; session impact and pending account policies remain unresolved. The revised Markdown/PDF contains 19 screens; original-source hashes continue to identify only the imported files.

### Separate editorial completeness from policy decisions

Check all four UCs against the eight Section D fields and branch-to-screen references. Make existing descriptions and flow labels explicit when this only restructures supplied text; retain IDs, actions, actors and outcomes. Keep shared denial screens referenced explicitly. Missing business behavior or an image that cannot demonstrate a required state is a finding to surface, not permission to invent a rule or fabricate evidence.

Compare FR-01-1–5 with the identified [Vision integration candidate](../../../../docs/requirements/pa3/Vision-Integration-Candidate.md) and [external model v0.4](https://drive.google.com/file/d/1BJBcPWMsFNr-2qnKkTXYu7afLKCuFiAV/view). Preserve Administrator/Dispatcher separation, one operating hub and draft-policy labels. Jira Done and the source's Kiệt review attribution remain source facts; detailed walkthrough findings are unavailable and no new acceptance is inferred.

### Retain matching output; re-export only when needed

If Markdown is unchanged and text/image correspondence checks pass, retain the supplied PDF. If headings, description labels, attribution or image placement need correction, regenerate the PDF using the existing `docs/management/pa3/export-pdf.py` and installed MarkdownIt/WeasyPrint environment; do not add an exporter or dependency. Record the revised PDF as a new export rather than claiming its hash equals the original. A4/page count may differ after re-export; all four UCs and 18 screens must remain readable.

Check source/local PNG hashes and dimensions, all relative links/anchors, section attribution, eight-field/branch coverage, PDF text and image inventory. Visually inspect all 18 screen assets and every PDF page, including captions, cropping and image/flow association. A single minimal assert-based check under `docs/test/f01-deliverables/` should make file inventory, fields and local-link checks repeatable; avoid a new test framework. Update `docs/README.md` with links to the final pair. No application test/build is needed for unchanged application files.

## Risks / Trade-offs

- Drive contents may change → pin retrieval hashes and recheck the actual downloaded inventory rather than assuming the observed 18 files are unchanged.
- Copying source review attribution may imply new approval → distinguish imported source, editorial work and pending re-review in the handoff.
- Source screenshots may leave a required state ambiguous → report the specific gap; do not silently accept an incomplete flow or expand policy to fill it.
- Both proposed changes update `docs/README.md` → integrate their small index edits sequentially and preserve each other's links; their deliverables otherwise do not depend on each other.

## Migration Plan

Additive documentation/assets only. Rollback removes this package and its index entry through normal reviewed Git changes; no data migration or external Drive/Jira update is involved.
