---
title: Seven operating truths for a utility that still thinks it's only a pipe shop
subtitle: McKinsey's seven operating truths, in plain language, for a water utility that still runs like a pipe shop.
deliverable: The Systems Lens article
status: DRAFT
presentation: illustrated
seo_description: FIELD NOTES draft. Seven operating truths for a water utility. Plain captions. Unpublished.
---

<p class="first">The board packet still opens the same way. Capital plan. Consent-order status. A slide about “digital transformation” that nobody can connect to a pump.</p>
<p>Someone asks whether we should buy another dashboard. Someone else says AI. The room nods. Then we go back to pipes — because pipes are what we believe we are.</p>
<p>I don't argue with the pipes. I argue with the self-concept that stops at the pipe. That self-concept is why we keep buying tools that never change how we operate.</p>

<p><strong>Aside.</strong> NextEra's CEO told McKinsey they are a technology company that delivers electricity. Water has not made that flip. We still organize as civil shops with a help desk. Take the identity lesson. Do not copy the scale.</p>

<blockquote class="pullquote"><span class="pq-mark" aria-hidden="true">“</span><p>Tools without identity change become shelfware.</p><cite class="pq-cite"><span class="pq-name">Hardeep Anand</span><span class="pq-publication">The Systems Lens</span></cite></blockquote>

<aside class="essay-status-note"><strong>UNPUBLISHED DRAFT.</strong> Interactive figures live on this branch under <code>/field-notes-drafts/seven-operating-truths/</code>. Do not set <code>status: PUBLISHED</code> and do not run <code>npm run deploy</code> until Hardeep approves. Production builds only ship <code>PUBLISHED</code> pages.</aside>

<p>Open the graphics package (branch preview): <a href="/field-notes-drafts/seven-operating-truths/">FIELD NOTES — Seven operating truths (interactive draft)</a>.</p>

<p>Before the next AI vote, write down whether the tool changes how the crew runs the station, or whether it only adds a screen.</p>

<h2>FIG. 00 — Pipe shop vs one shared picture</h2>
<p>Left is a civil shop that treats software as support, so the dashboard sits unused. Right is the same pipes, with crews, the control room, and capital looking at one picture.</p>
<p><em>Sketch, not a measured comparison of any utility or vendor. NextEra’s capital markets differ from municipal water. Take the identity lesson, not the scale.</em></p>

<h2>The seven truths</h2>
<p>McKinsey leads. Each truth below is one panel. Read them as one system, not a shopping list.</p>

<h2>Truth 1 — AI is not a tool; it’s a teammate</h2>
<p>In a plant, a tool is a wrench. A teammate shares context, watches the weak signal, and still yields to the operator when judgment matters.</p>
<p>Put the model next to the operator on a real call at the station. A slide in a conference room will not tell you if the crew can use it.</p>
<p>Name one decision this quarter where the model sits beside the operator, and the operator still signs.</p>
<h3>FIG. 01</h3>
<p>Sense, then suggest, then a person decides, then you measure again. The station does not run itself because someone bought a model.</p>
<p><em>A sketch of the loop, not a control story for any plant. It does not mean the plant runs itself.</em></p>

<h2>Truth 2 — Know what to build and what to buy</h2>
<p>You do not need another historian. You do need a shared definition of “critical pump,” “SSO event,” and “verified service line” across GIS, CMMS, and the capital plan. Vendors sell features. Only you own what those words mean.</p>
<p>For one painful decision this month, write down what you have to own and what you can buy.</p>
<h3>FIG. 02</h3>
<p>The question has to land in a shared catalog with a named owner. Buying the software is the easy part. Owning what the data means is the work.</p>
<p><em>A route sketch, not a product design and not a compliance certificate.</em></p>

<h2>Truth 3 — Your model isn’t the bottleneck — accessing tribal knowledge is</h2>
<p>Every utility has a person who “just knows” which pump surges after a certain storm. When that person retires, the model does not save you. The missing map does.</p>
<p>Test each truth on a pump station. Walk the site. Open the work order. If you cannot point at the pump, you do not have an example yet.</p>
<p>Pick one rule that only lives in someone’s head. Write it down, name the owner, and put it where the next operator can find it.</p>
<h3>FIG. 03</h3>
<p>Left is what only one operator knows. Right is that same knowledge written down, findable, and owned. A model cannot retrieve what the utility never recorded.</p>
<p><em>A before-and-after sketch. Writing it down does not replace a good operator’s judgment, and no catalog is complete.</em></p>

<h2>Truth 4 — Design for the swap, not the stack</h2>
<p>SCADA, GIS, CMMS, and CIS will change. Put a thin layer of shared meaning on top. Keep the systems underneath replaceable.</p>
<p>If one vendor disappeared tomorrow, which shared definitions would still stand?</p>
<h3>FIG. 04</h3>
<p>The meaning and the platform rules sit in one place. SCADA, GIS, and the work-order system stay replaceable. If you cannot swap a system, the integration is the risk.</p>
<p><em>A sketch, not a vendor pick, and not a requirement to put every database in one place.</em></p>

<h2>Truth 5 — Trust precedes autonomy</h2>
<p>The system earns room the way a new operator does. Under supervision. With evidence. With a person who can override.</p>
<p>Do not widen autonomy without a written evidence gate and a named person who can stop it.</p>
<h3>FIG. 05</h3>
<p>A supervised pilot, then evidence, then a wider rollout. Nobody gets more autonomy without a named person who can stop it.</p>
<p><em>A control-path sketch, not a safety case and not a permit. A person still makes the call.</em></p>

<h2>Truth 6 — Centralize the platform; decentralize the tasks</h2>
<p>Share identity, meaning, access, and audit. Let the plant and the field solve Tuesday on top of that. What fails is pulling every workflow to the center until the people next to the asset wait for permission to think.</p>
<p>Name what has to be shared, and what stays with the crew.</p>
<h3>FIG. 06</h3>
<p>Identity, meaning, access, and audit are shared. Tuesday’s work stays with the crew that does it.</p>
<p><em>A loop of jobs and feedback. It does not prove that trust shows up, and it is not a cause-and-effect claim.</em></p>

<h2>Truth 7 — Adoption is a flywheel, not a rollout</h2>
<p>If the AI spend never changes overtime, SSO frequency, pump failures, or how long it takes to find a record, you do not have adoption. You have a purchase order.</p>
<p>You can have rules and a data warehouse and still have the crew and the capital plan looking at different pictures. Fix that before you buy the next tool.</p>
<p>Pick one vital sign. Draw the baseline. After the tool lands, ask what changed on that sign.</p>
<h3>FIG. 07</h3>
<p>The flat line is what you spent. The curve is whether anything in the system actually moved after the purchase.</p>
<p><em>A sketch, not a real KPI series, and not proof that the spend caused the bend. You still need evidence and judgment.</em></p>

<h2>FIG. 08 — Seven truths as one system</h2>
<p>NextEra’s CEO described an electric utility that changed how it sees itself. The seven truths are what you do after that, on pumps, work orders, and capital.</p>
<p>Seven truths drawn as one system. Identity sits first. The other six do not hold if that piece is missing.</p>
<p><em>A map of the essay, not a maturity score and not a ranking of utilities or vendors.</em></p>

<h2>What to take into your next meeting</h2>
<ol>
<li>Identity: are crews, the control room, and capital looking at one picture, or is software still sitting off to the side?</li>
<li>One place the model sits beside an operator this quarter.</li>
<li>One call on meaning you own, and the commodity you buy.</li>
<li>One rule written down, with an owner, where the next operator can find it.</li>
<li>One vital sign with a baseline, and a check on what changed after the spend.</li>
</ol>
<p>If this is true, what else should also be true in your SCADA, your work orders, and your capital plan?</p>
