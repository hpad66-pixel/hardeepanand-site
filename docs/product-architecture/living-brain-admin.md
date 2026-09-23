# Living Brain Admin Architecture

## Product vision

HardeepAnand.com is the polished public lens. The admin portal is the operating studio for content, audience intelligence, and release control. Brain.apas.ai is the raw knowledge and vectorization layer that can ingest conversations, notes, articles, documents, and working thoughts.

The product should prove the pattern on Hardeep's own public brain, then become something APAS can offer to individuals, expert groups, and companies.

## One product, tiered engines

The light and enterprise versions should not be separate products. They should share the same UI shell, API contracts, content model, identity, audit trail, CRM handoff, and entitlement checks.

The tier changes capability:

- Free: limited public questions, for example five questions per day, with source-grounded answers and strong rate limits.
- Professional/light: relational Postgres tables, markdown canonical records, vector search, semantic relationship tables, content workflow, analytics, and CRM handoff.
- Enterprise: the same product surface with an Apache Jena graph backend added for richer RDF/SPARQL reasoning, ontology governance, enterprise connectors, higher limits, team roles, and deeper audit controls.

## Storage contract

Markdown remains the canonical editorial format for articles, notes, and draft artifacts. Every object should be addressable as both a source document and a database record:

- Markdown source: author-readable, Git-friendly, portable, reviewable.
- Postgres row: operational metadata, ownership, status, timestamps, relationships, and workflow state.
- Vector record: embeddings for retrieval.
- Semantic edge table: lightweight graph relationships for the light tier.
- Jena graph: enterprise graph store using the same canonical IDs and relationship vocabulary.

## Core object model

- Knowledge item: raw conversation, note, source document, article, idea, transcript, or imported page.
- Canonical artifact: reviewed markdown, published article, offer page, course unit, or client insight.
- Relationship: supports, contradicts, expands, cites, came-from, published-as, belongs-to-topic, informs-offer.
- Evidence boundary: source, confidence, privacy classification, approval state, and whether it can be public.
- Entitlement: tenant, user, plan, daily question limits, feature flags, graph engine, connector access, storage limit, model limit.

## Orchestration flow

1. Raw intake lands in brain.apas.ai.
2. Intake normalizes to markdown plus metadata.
3. Postgres stores the item, ownership, source boundaries, and workflow state.
4. Vectorization stores retrieval chunks and embeddings.
5. Relationship extraction writes semantic edges in the light tier.
6. Admin studio lets Hardeep review, connect, promote, draft, approve, publish, unpublish, and analyze.
7. Public site shows only approved/published artifacts.
8. CRM receives consented inquiries and marketing intent signals.
9. Enterprise tier can mirror the same canonical IDs and relationships into Apache Jena.

## Client and APAS operator surfaces

The product has two primary signed-in surfaces.

Client surface:

- Simple sign-on.
- Talk to the brain.
- Upload documents.
- Paste or import LinkedIn articles.
- Add notes, links, transcripts, and rough thoughts.
- See clear instructions about what to upload, what stays private, and what can become public.
- Ask questions within the client's entitlement limits.

APAS operator surface:

- Review raw intake.
- Classify privacy and publication boundaries.
- Normalize useful material into markdown.
- Extract people, topics, claims, sources, and relationship candidates.
- Push a raw item or reviewed batch into the selected processing pipeline.
- Promote processed knowledge into article drafts, client insights, knowledge maps, offers, or CRM follow-up.

The "push to graph" action is not a different product per tier. It is one orchestration action with a tier-aware processor:

- Light tier: parse, chunk, vectorize, write Postgres records, and create semantic relationship rows.
- Enterprise tier: perform the same steps, then publish canonical IDs and relationships into Apache Jena for RDF/SPARQL-backed graph reasoning.

Every processor must preserve the same canonical IDs, source references, review status, tenant, owner, and entitlement context so a light customer can upgrade without replatforming their knowledge.

## Admin UI directions

1. Editorial Command Center: best immediate build. Content status, draft review, QA, publication, unpublish, release ledger.
2. Living Brain Studio: knowledge map, source-to-article lineage, chat with the brain, promote raw thought into usable artifacts.
3. Marketing Intelligence Cockpit: analytics map, source channels, content-to-offer funnel, CRM-ready segments.

Recommended path: build the Editorial Command Center first, add Living Brain panels into it, then make the Marketing Intelligence Cockpit the growth layer.

## Required product boundaries

- Saving a draft is not publishing.
- Approval is not deployment.
- Raw conversations are private by default.
- Public content must be explicitly approved and traceable to source boundaries.
- Analytics should be aggregate and privacy-safe unless the visitor explicitly submits a form or signs in.
- CRM handoff must distinguish anonymous interest signals from consented contact records.
