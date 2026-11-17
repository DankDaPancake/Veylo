# Veylo Project Context & OpenSpec Guidelines

**Application:** Veylo (Last-Mile Delivery Management & Crowdsourced Location Intelligence)  
**Organization:** Group 09 — CS300 Introduction to Software Engineering  
**Primary Governance:** `src/constitution.md`  

## Unified Technology Stack
- **Language:** **TypeScript** (End-to-End type safety across Frontend & Backend)
- **Framework:** **Next.js 14+ (App Router)** with **React**
- **Database:** **PostgreSQL**
- **ORM:** **Prisma ORM** (`schema.prisma` for data modeling & migrations)
- **Styling:** **Tailwind CSS**
- **Mapping:** **Leaflet.js** with **OpenStreetMap (OSM)**
- **AI Integration:** OpenAI / Gemini API (TypeScript client) for unstructured note normalization

## System Architecture
Veylo comprises three operational subsystems:
1. **Central Administration Subsystem:** RBAC, hub configuration, global audit logs.
2. **Delivery Hub Dispatcher Subsystem:** Bulk order ingestion, heuristic clustering, map routing override, real-time fleet monitor.
3. **Mobile Field Delivery Subsystem:** Sequential stop execution, digital proof-of-delivery (photo/signature), crowdsourced delivery-note submission.

## OpenSpec SDD Standards
- **Requirement Definitions:** Always state requirements using RFC 2119 keywords (`SHALL`, `MUST`, `SHOULD`, `MAY`).
- **Scenarios:** Pair every requirement with testable BDD scenarios using `WHEN` (trigger/input) and `THEN` (observable outcome).
- **Change Lifecycle:** Use `/opsx-propose` to initiate proposals in `openspec/changes/`, complete tasks via `/opsx-apply`, and archive with `/opsx-archive`.
