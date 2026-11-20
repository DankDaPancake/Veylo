## Why

[BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) needs reviewable use-case specifications and prototype evidence for PA3 Section D. The evidence must show that riders can find safe location guidance and dispatchers can review source-backed drafts even when AI preparation fails.

## What Changes

- Deliver English `UC-F06-F07-Guides.md` with embedded prototype PNGs for UC15, UC16 and UC18. UC17 remains reserved.
- Connect EP11-B in the BOOYAH-14 repository walkthrough to `S15-02`, the same UC15 full-guide view used by search. Use the local BOOYAH-25 kit and the shared Atrium A fixture to verify the return to the originating stop state.
- Walk through raw note capture, asynchronous AI preparation, manual drafting and explicit dispatcher approval using synthetic fixtures.
- Exclude runtime F06/F07, AI provider integration, API or database changes, F02 work, and shared model or package ownership.

## Capabilities

### New Capabilities

- `guide-use-case-package`: PA3 specification, prototype and review evidence for F06/F07.

### Modified Capabilities

## Impact

The deliverables belong under `docs/analysis-and-design/use-cases/`. BOOYAH-24 supplies the model and receives the reviewed traceability handoff. BOOYAH-25 supplies the prototype kit. BOOYAH-26 supplies the accepted requirements baseline for final review. BOOYAH-29 owns the assembled package. Nguyen Thanh Trung owns the ticket and Ly Huynh Minh Dang is the designated independent reviewer.
