import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.BROWSER || 'chromium';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4395';
const widths = (process.env.WIDTHS || '430,390,375,320,768').split(',').map(Number);
const evidence = new URL(process.env.EVIDENCE_DIR || '../docs/review-packages/mobile-site-local/', import.meta.url);
await fs.mkdir(evidence, { recursive: true });
const browser = await playwright[engine].launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
// Layout checks must never send an inquiry or subscription.
await context.route('**/api/**', route => route.request().method() === 'GET' ? route.continue() : route.abort());
const page = await context.newPage();
const report = { base, engine, widths, routes: [], resources: [], layouts: [], interactions: [], boundaries: [], errors: [] };
page.on('pageerror', error => report.errors.push({ url: page.url(), message: error.message }));

function measure() {
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden],.reader-trap,.apas-trap');
  const desc = el => ({ tag: el.tagName, id: el.id, class: typeof el.className === 'string' ? el.className : el.className.baseVal, text: el.textContent.trim().slice(0, 100) });
  const outside = (a, b, tolerance = 1) => a.left < b.left - tolerance || a.right > b.right + tolerance || a.top < b.top - tolerance || a.bottom > b.bottom + tolerance;
  const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  const view = { left: 0, right: innerWidth };
  const all = [...document.querySelectorAll('body *')].filter(visible);
  const overflow = all.filter(el => !el.closest('svg,.skip-link') && outside(el.getBoundingClientRect(), view)).map(desc);
  const clipped = [];
  for (const el of all.filter(el => !el.closest('svg') && el.matches('h1,h2,h3,h4,p,button,label,figcaption,a'))) {
    const range = document.createRange(); range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter(r => r.width && r.height);
    if (rects.some(r => r.left < -1 || r.right > innerWidth + 1) && !el.matches('.skip-link')) clipped.push({ ...desc(el), reason: 'text outside viewport' });
    for (let owner = el.parentElement; owner && owner !== document.body; owner = owner.parentElement) {
      const style = getComputedStyle(owner);
      if (['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY)) {
        if (rects.some(r => outside(r, owner.getBoundingClientRect(), 2))) clipped.push({ ...desc(el), reason: 'clipped by ancestor', owner: desc(owner) });
      }
    }
  }
  const smallTargets = all.filter(el => el.matches('button,input:not([type=checkbox]),select,textarea,summary,[role=tab],.ha-links a,.fcol a,.fsocial a,.takeaway-action,.apas-email,.text-link,.reader-invitation-copy>a,.discussion-actions a,.read-link,.reader-route h5 a,.visual-parent,.notebook-read,.lens-opening-actions a,.apas-academy-link'))
    .filter(el => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map(el => ({ ...desc(el), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
  const smallInputs = all.filter(el => el.matches('input:not([type=checkbox]),select,textarea') && parseFloat(getComputedStyle(el).fontSize) < 16).map(desc);
  const svgs = [...document.querySelectorAll('svg')].filter(el => visible(el) && el.querySelector('text'));
  const diagrams = svgs.map(svg => {
    const texts = [...svg.querySelectorAll('text')].filter(visible);
    const boxes = [...svg.querySelectorAll('rect')].filter(visible).map(el => el.getBoundingClientRect()).filter(r => r.width > 30 && r.height > 20).sort((a,b) => a.width*a.height-b.width*b.height);
    const issues = [], collisions = [], tiny = [];
    for (const text of texts) {
      const r = text.getBoundingClientRect(), matrix = text.getScreenCTM();
      const pixels = parseFloat(getComputedStyle(text).fontSize) * Math.hypot(matrix.a, matrix.b);
      if (pixels < 11.9) tiny.push({ text: text.textContent, pixels });
      if (outside(r, svg.getBoundingClientRect(), 1)) issues.push({ text: text.textContent, reason: 'outside SVG' });
      // Assign a label to the smallest box containing its anchor, not the box its ink happens to fit.
      const anchor = new DOMPoint(text.x.baseVal[0]?.value || 0, text.y.baseVal[0]?.value || 0).matrixTransform(matrix);
      const owner = boxes.find(b => anchor.x > b.left && anchor.x < b.right && anchor.y > b.top && anchor.y < b.bottom);
      if (owner && outside(r, owner, 1)) issues.push({ text: text.textContent, reason: 'outside owner box' });
    }
    for (let i=0; i<texts.length; i++) for (let j=i+1; j<texts.length; j++) if (overlap(texts[i].getBoundingClientRect(), texts[j].getBoundingClientRect())) collisions.push([texts[i].textContent,texts[j].textContent]);
    return { figure: svg.closest('figure')?.id || svg.id, labels: texts.length, issues, collisions, tiny };
  });
  return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, overflow, clipped, smallTargets, smallInputs, diagrams,
    brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
    media: [...document.querySelectorAll('canvas,video,iframe')].map(el => ({ ...desc(el), width: el.getBoundingClientRect().width })),
  };
}

async function settle() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => { img.loading='eager'; return img.decode().catch(()=>{}); }));
    document.getAnimations().forEach(animation => { try { animation.finish(); } catch {} });
  });
}

try {
  await page.goto(base);
  const sitemapPaths = await page.evaluate(async () => {
    const xml = new DOMParser().parseFromString(await (await fetch('/sitemap.xml')).text(), 'application/xml');
    return [...xml.querySelectorAll('loc')].map(el => new URL(el.textContent).pathname);
  });
  const pending = [...new Set(['/', ...sitemapPaths])], seen = new Set();
  while (pending.length) {
    const path = pending.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    let response;
    try { response = await page.goto(base + path); }
    catch (error) { report.routes.push({path,status:0,finalPath:null,error:error.message}); continue; }
    const links = await page.locator('a[href]').evaluateAll(links => links.map(a => a.href));
    report.routes.push({ path, status: response.status(), finalPath: new URL(page.url()).pathname, title: await page.title() });
    for (const link of links) {
      const url = new URL(link);
      if (![new URL(base).origin, 'https://hardeepanand.com'].includes(url.origin) || /^\/(admin|api)\//.test(url.pathname)) continue;
      if (/\.(xml|json|png|jpg|webp|svg|pdf)$/.test(url.pathname)) continue;
      if (!seen.has(url.pathname)) pending.push(url.pathname);
    }
  }
  for (const path of ['/rss.xml','/feed.json','/sitemap.xml']) {
    const response = await context.request.get(base + path);
    const body = await response.text();
    report.resources.push({ path, status: response.status(), type: response.headers()['content-type'], bytes: body.length, draftExcluded: !body.includes('the-question-missing-from-the-ai-jobs-debate') });
  }
  console.log(JSON.stringify({ inventory: report.routes, resources: report.resources }));
  const routes = [...new Set(report.routes.map(r => r.finalPath).filter(Boolean)), '/missing-mobile-audit-page/'];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width >= 700 ? 1024 : 844 });
    for (const path of routes) {
      const response = await page.goto(base + path);
      await settle();
      const row = { path, status: response.status(), ...await page.evaluate(measure) };
      assert.equal(row.width,width,'Viewport metadata must prevent desktop-width mobile rendering.');
      report.layouts.push(row);
      if ([320,390,768].includes(width)) await page.screenshot({ path: new URL(`${engine}-${width}-${path.replaceAll('/','_') || 'home'}.png`, evidence).pathname, fullPage:true });
      if(width===320) {
        for(const figure of await page.locator('figure.editorial-figure,figure.figure').all()) {
          await figure.screenshot({path:new URL(`${engine}-320-${path.replaceAll('/','_')}-${await figure.getAttribute('id')}.png`,evidence).pathname,style:'.ha-nav{visibility:hidden!important}'});
        }
        for(const selector of ['.reader-invitation','.substack-discussion','.nl-card','.page-head']) {
          if(await page.locator(selector).count())await page.locator(selector).screenshot({path:new URL(`${engine}-320-${path.replaceAll('/','_')}-${selector.slice(1)}.png`,evidence).pathname,style:'.ha-nav{visibility:hidden!important}'});
        }
      }
      console.log(JSON.stringify({ path,width,overflow:row.overflow.length,clipped:row.clipped.length,smallTargets:row.smallTargets.length,smallInputs:row.smallInputs.length,diagramIssues:row.diagrams.flatMap(d=>[...d.issues,...d.collisions,...d.tiny]).length }));
    }
    await page.goto(base + '/');
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
    const menu = await page.locator('#main-links').boundingBox();
    assert.ok(menu.x >= 0 && menu.x + menu.width <= width + 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
    await page.locator('.menu-toggle').click();
    await page.locator('#main-links a[href="/writing/"]').click();
    await page.waitForURL(url=>url.pathname==='/writing/');
    assert.equal(new URL(page.url()).pathname,'/writing/');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
    const count = () => page.locator('[data-discovery-entry]:visible').count();
    await page.locator('[data-room-search]').fill('nature'); assert.equal(await count(),1);
    await page.locator('[data-room-search]').fill('mobile-audit-no-match'); assert.equal(await count(),0);
    assert.equal(await page.locator('[data-room-empty]').isVisible(),true);
    await page.locator('[data-room-reset]').click(); assert.equal(await count(),6);
    await page.locator('[data-room-topic]').selectOption('AI & governance'); assert.equal(await count(),2);
    await page.locator('[data-discovery-entry]:visible h3 a').first().click();
    await page.waitForURL(url=>url.pathname!=='/writing/');
    await page.goBack();
    await page.waitForFunction(()=>document.querySelector('[data-room-topic]')?.value==='AI & governance');
    assert.equal(await count(),2);
    await page.locator('[data-room-reset]').click();
    await page.locator('[data-room-view="start-here"]').click(); assert.equal(await count(),6);
    await page.locator('[data-room-view="visual-index"]').click();
    await page.locator('[data-room-more]').click(); assert.equal(await count(),9);
    report.interactions.push({width,menu:'open/escape/navigate passed',discovery:'search/empty/clear/topic/start-here/visual-index/load-more/back passed'});
  }
  // Short landscape screens need a scrollable menu, not an inaccessible bottom CTA.
  await page.setViewportSize({width:844,height:390});
  await page.goto(base+'/');
  await page.locator('.menu-toggle').click();
  await page.locator('#main-links .nav-cta').scrollIntoViewIfNeeded();
  const subscribeBox=await page.locator('#main-links .nav-cta').boundingBox();
  assert.ok(subscribeBox.y>=0&&subscribeBox.y+subscribeBox.height<=390);
  await page.locator('#main-links .nav-cta').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  report.interactions.push({landscape:'844x390 menu scroll and Subscribe navigation passed'});

  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:844}});
  await nojs.goto(base+'/writing/');
  assert.equal(await nojs.locator('#main-links a:visible').count(),6);
  assert.equal(await nojs.locator('.reading-entry:visible').count(),6);
  assert.equal(await nojs.locator('.visual-entry:visible').count(),9);
  report.interactions.push({nojs:'320px public navigation, six essays and nine diagram links remain visible'});
  await nojs.close();

  await page.setViewportSize({width:320,height:844});
  await page.goto(base+'/');
  await page.locator('#newsletter-email').fill('not-an-email');
  assert.equal(await page.locator('#newsletter-email').evaluate(el=>el.checkValidity()),false);
  await page.locator('#newsletter-email').fill('reader@example.com');
  assert.equal(await page.locator('#newsletter-email').evaluate(el=>el.checkValidity()),true);
  assert.match(await page.locator('[data-signup-form]').getAttribute('action'),/^https:\/\//);
  report.interactions.push({signup:'input typing, validity and external form destination checked; nothing submitted'});
  await page.locator('.notebook-work-note summary').click();
  const video=await page.locator('.notebook-work-note video').evaluate(async el=>{
    el.load();
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Video metadata timed out')),15000);el.addEventListener('loadedmetadata',()=>{clearTimeout(timer);resolve();},{once:true});el.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Video failed'));},{once:true});});
    return {duration:el.duration,width:el.videoWidth,height:el.videoHeight,controls:el.controls,inline:el.playsInline};
  });
  assert.ok(video.duration>0&&video.width>0&&video.controls&&video.inline);
  await settle();
  report.layouts.push({path:'/ (introduction expanded)',status:200,...await page.evaluate(measure)});
  report.interactions.push({video});

  // Exercise dormant readiness-dependent forms locally using mocked responses only.
  if (new URL(base).hostname==='127.0.0.1') {
    await page.route('**/api/inquiries',route=>route.fulfill({json:{ready:true}}));
    await page.route('**/api/subscriptions',route=>route.fulfill({json:{ready:true}}));
    for (const path of ['/','/writing/data-governance/']) {
      await page.goto(base+path);
      const form=path==='/'?page.locator('[data-crm-opt-in]'):page.locator('.apas-contact-form');
      await form.waitFor({state:'visible'});
      if(path==='/')await page.locator('[data-reader-consent]').check();
      await settle();
      report.layouts.push({path:path+' (mock-ready form)',status:200,...await page.evaluate(measure)});
      await form.screenshot({path:new URL(`${engine}-ready-${path==='/'?'signup':'inquiry'}.png`,evidence).pathname});
    }
    await page.unroute('**/api/inquiries');
    await page.unroute('**/api/subscriptions');
    report.interactions.push({conditionalForms:'320px mocked ready layouts and consent/name disclosure checked; no submission'});
  }

  for (const path of routes.filter(p=>/^\/(writing|climb)\/.+/.test(p))) {
    await page.goto(base+path);
    const print=page.locator('[data-print-takeaways]');
    if(await print.count()) {
      await page.evaluate(()=>{window.print=()=>{};});
      await print.click();
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.article-takeaways').isVisible(),true);
      assert.equal(await page.locator('.post-head').isVisible(),false);
      const email=await page.locator('.takeaway-actions a[href^="mailto:"]').getAttribute('href');
      assert.ok(decodeURIComponent(email).includes('https://hardeepanand.com'+path));
      await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      await page.emulateMedia({media:'screen'});
      report.interactions.push({path,share:'print isolation and article-attributed email checked without sending'});
    }
  }
  await page.evaluate(()=>localStorage.setItem('ha-theme','obsidian'));
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const path of routes) {
    const response=await page.goto(base+path); await settle();
    report.layouts.push({path:path+' (obsidian/reduced-motion)',status:response.status(),...await page.evaluate(measure)});
    assert.equal(await page.locator('.figure-replay:visible').count(),0);
  }
  if(new URL(base).protocol==='https:') {
    for(const path of ['/writing/the-question-missing-from-the-ai-jobs-debate/','/writing/governance-at-operating-speed/']) {
      const response=await context.request.get(base+path,{maxRedirects:0});
      report.boundaries.push({path,status:response.status()});
      assert.equal(response.status(),404);
    }
    for(const path of ['/admin/','/admin/ideas/','/admin/profile/','/admin/theme/','/api/ideas']) {
      const response=await context.request.get(base+path,{maxRedirects:0});
      const access=new URL(response.headers().location).hostname.endsWith('.cloudflareaccess.com');
      report.boundaries.push({path,status:response.status(),access});
      assert.equal(response.status(),302); assert.ok(access);
    }
    for(const [path,target] of [['/climb/','/writing/'],['/case-studies/example','/case-studies/'],['/case-studies/example/nested','/case-studies/'],['/ai-watch/digest/','/ai-watch/'],['/lexicon/old-entry','/writing/']]) {
      const response=await context.request.get(base+path,{maxRedirects:0});
      const location=new URL(response.headers().location,base).pathname;
      report.boundaries.push({path,status:response.status(),location});
      assert.ok([301,302].includes(response.status())); assert.equal(location,target);
    }
  }
} finally {
  await fs.writeFile(new URL(`${engine}-results.json`, evidence), JSON.stringify(report,null,2));
  await browser.close();
}
const failures = report.layouts.filter(r => r.documentWidth > r.width || r.overflow.length || r.clipped.length || r.smallTargets.length || r.smallInputs.length || r.brokenImages.length || r.diagrams.some(d=>d.issues.length||d.collisions.length||d.tiny.length));
console.log(JSON.stringify({ engine, routes:report.routes.length, layouts:report.layouts.length, failures:failures.length, errors:report.errors }));
if (process.env.AUDIT_ONLY !== '1') {
  assert.equal(failures.length,0,'Responsive findings remain; inspect the JSON report.');
  assert.equal(report.errors.length,0);
  assert.ok(report.routes.every(r=>r.status===200),'A public route failed.');
  assert.ok(report.resources.every(r=>r.status===200 && r.draftExcluded));
}
