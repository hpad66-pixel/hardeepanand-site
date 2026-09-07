---
name: systems-lens-editorial
description: Collaboratively draft, review, illustrate, and prepare Hardeep Anand’s Systems Lens articles for his website and publication. Use for his editorial articles and refinements to their shared design and workflow.
---

# The Systems Lens editorial workflow

Work with Hardeep as a sparring partner: establish the argument, challenge weak connections, show a rendered draft, incorporate feedback, and publish the reviewed version only when he approves publication. Approval of a visual change is not approval to publish. Preserve his first-person experience and quote wording; do not invent experience, attribution, numbers, or evidence.

## Voice and argument

Write in Hardeep’s direct, systems-oriented voice: concrete utility situations, respect for operators, a provocative but defensible thesis, and practical actions that retain value without purchasing his services. Explain technical terms at first use. Distinguish water-sector requirements from electric-sector requirements. Mark illustrative scenarios and curves as conceptual rather than measured outcomes. A correlation after an intervention is not proof of its cause.

Use the Vital Signs pilot as the quality benchmark, not merely a color reference. Do not turn an entire article into repeated three-box sequences. Choose the visual structure to fit the claim: a bottleneck, comparison, convergence, feedback loop, traceable lineage, or evidence gate. Motion must be clearly perceptible and explain the relationship; a short connector drawing itself is not enough. Inspect playback and replay in the browser before describing an illustration as animated.

Review each diagram against its adjacent argument. Arrows must represent an actual dependency, sequence, or feedback path. Avoid duplicating prose with decorative quote images. Prefer diagrams that clarify a relationship readers could not grasp as quickly in text. Verify changing regulatory and numerical claims against primary sources; flag unresolved claims before publication.

## Approved visual language

Ivory background #f5f3ed, ink #092b3e, deep cobalt accent #174bc5. Use the website’s theme variables so diagrams blend seamlessly into the article and work in dark mode. No separate colored canvas or pasted-card appearance. Inherit Newsreader for editorial serif titles and Inter for diagram labels and body text. Center figure titles with generous breathing room, an italic serif treatment, and a small numbered label as a deliberate break from prose.

Build editable inline SVGs with accessible title/description and unique IDs, plus independently composed narrow-screen layouts when needed. Labels must remain readable on a phone. Animate only meaningful flow or progression, finish within five seconds, keep a complete static reading, respect reduced motion, and support replay. Export static versions for print/email platforms that cannot support SVG or animation.

Pull quotes use a quiet cobalt quotation mark, generous spacing, Hardeep Anand in the editorial serif, and The Systems Lens beneath. Do not fabricate quotations from paraphrases.

## APAS attribution

Include a restrained author-and-company signature on articles: Hardeep Anand · APAS Consulting, with a clear path to the consulting inquiry and a verified website link. Every article should include a relevant commercial next step for APAS; Hardeep explicitly wants his thought leadership to support consulting inquiries. Keep advice independently useful. For utility/data articles, the approved entry offer is a Data Readiness Diagnostic: one consequential decision, assessment of its sources and ownership, provenance and transformation lineage, quality gaps and anomalies to investigate, and a prioritized readiness plan. Explain these in reader language. Tailor the invitation to the article’s thesis rather than pasting an unrelated pitch. For personal leadership essays, connect naturally to advisory work instead of forcing a data-service offer. Prefer a short, clearly labeled note form with explicit permission to store contact details and respond. Route it through the website server to APAS CRM staging at apascrm.com, retaining the source article and message. Keep credentials server-only and show success only after a confirmed CRM receipt. The current site implementation and activation requirements are documented in docs/article-crm-intake.md. Use an inquiry CTA with article context; do not claim a purchased booking or automatic submission. Connect any commercial invitation to the specific problem the article helps readers recognize. Do not invent case-study results, fixed engagement terms, certifications, or proof of delivery. Hardeep confirmed the public company URL as https://apas.ai/; the inquiry email is hardeep@apas.ai.

## Reader value

End with specific takeaways written as actions plus explanations, not cryptic slogans. Include a useful question for the reader’s next meeting. Provide labeled print, email, and LinkedIn controls. Printing should isolate a readable takeaway sheet with title, author, and canonical link. Email/share links open the reader’s own workflow; never send or post on their behalf without authorization.

Comments require verified reader sign-in enforced on the server, separate from private studio/idea-library authorization. Do not represent unconfigured authentication as functional. Preserve private access restrictions.

## Local implementation

The current project is /Users/apas/hardeepanand-site. Inspect its current implementation rather than assuming it has not changed. Reference src/styles/illustrated-essay.css, scripts/build-vital-signs-figures.mjs, src/lib/illustrated-figures.js, and src/lib/takeaway-actions.js for the approved pilot. Other articles may be stored in content/published-pages.json rather than Markdown. Keep OneWater Lexicon, OneWater Minute, and Living Brain off the public site until Hardeep asks to restore them.

Render and inspect the article at desktop and phone widths; check label clipping, figure placement, coherent narrative transitions, takeaway controls, and theme contrast. Run the project’s build, relevant tests, and link/feed validation before presenting publication readiness. Substack is a separate publication destination: confirm available integration and use supported static assets; do not promise automatic sync without a verified publishing connection.

## Maintaining this skill

When Hardeep changes a shared editorial preference, update this same skill rather than creating a competing variant. Distinguish an article-specific exception from a reusable preference. Keep the version-controlled source in editorial-skills/systems-lens-editorial/SKILL.md synchronized with the installed copy at ~/.codex/skills/systems-lens-editorial/SKILL.md. Explain the change briefly. Unapproved experiments belong in previews, not in the permanent style rules.
