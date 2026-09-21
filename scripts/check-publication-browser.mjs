import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4395';
const evidence = new URL(process.env.EVIDENCE_DIR || '../docs/review-packages/publication-evidence/', import.meta.url);
await fs.mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const report = { base, layouts: [], interactions: {}, article: [], errors };
const screenshot = name => new URL(name, evidence).pathname;

function layoutCheck() {
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const nodes = [...document.querySelectorAll('main *')].filter(visible);
  const overflow = nodes.filter(el => {
    if (el.closest('svg, .reader-trap')) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
  }).map(el => ({tag:el.tagName, class:el.className, text:el.textContent.slice(0,80)}));
  return {
    width: innerWidth, documentWidth: document.documentElement.scrollWidth, overflow,
    brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
    fonts: document.fonts.check('18px Inter') && document.fonts.check('28px Newsreader'),
    featuredTop: document.querySelector('#featured-title')?.getBoundingClientRect().top,
  };
}
function diagramCheck() {
  const issues = [], collisions = [], crossings = [];
  let labels = 0;
  const visible = [...document.querySelectorAll('svg.diagram')].filter(s => getComputedStyle(s).display !== 'none');
  for (const svg of visible) {
    const texts = [...svg.querySelectorAll('text')], rects = [...svg.querySelectorAll('rect')];
    for (const t of texts) {
      labels++;
      const b = t.getBBox(), x = Number(t.getAttribute('x')), y = Number(t.getAttribute('y'));
      const owner = rects.find(r => x >= r.x.baseVal.value && x <= r.x.baseVal.value+r.width.baseVal.value && y >= r.y.baseVal.value && y <= r.y.baseVal.value+r.height.baseVal.value);
      if (owner) {
        const r = owner.getBBox();
        if (b.x < r.x+7 || b.y < r.y+5 || b.x+b.width > r.x+r.width-7 || b.y+b.height > r.y+r.height-5) issues.push({figure:svg.closest('figure').id,text:t.textContent});
      }
      const v = svg.viewBox.baseVal;
      if (b.x < 0 || b.y < 0 || b.x+b.width > v.width || b.y+b.height > v.height) issues.push({outsideSVG:t.textContent});
    }
    for (let i=0;i<texts.length;i++) for (let j=i+1;j<texts.length;j++) {
      const a=texts[i].getBBox(), b=texts[j].getBBox();
      if (a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y) collisions.push([texts[i].textContent,texts[j].textContent]);
    }
    for (const path of svg.querySelectorAll('path.connector,path.connector-risk,path.connector-soft')) {
      for (const t of texts) {
        const b=t.getBBox();
        for(let d=3;d<path.getTotalLength()-3;d+=2){
          const p=path.getPointAtLength(d);
          if(p.x>b.x-1&&p.x<b.x+b.width+1&&p.y>b.y-1&&p.y<b.y+b.height+1){crossings.push({figure:svg.closest('figure').id,text:t.textContent});break;}
        }
      }
    }
  }
  const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);
  return {width:innerWidth,labels,issues,collisions,crossings,uniqueIds:ids.length===new Set(ids).size,
    figures:document.querySelectorAll('figure.figure').length,
    minLabelPixels:Math.min(...visible.flatMap(s=>[...s.querySelectorAll('text')].map(t=>parseFloat(getComputedStyle(t).fontSize)*t.getScreenCTM().a))),
    accessible:[...document.querySelectorAll('svg.diagram')].every(s=>s.getAttribute('aria-labelledby')?.split(' ').every(id=>document.getElementById(id))),
  };
}

for (const width of [1920,1440,1024,820,390,320]) {
  await page.setViewportSize({width,height:width<600?844:1000});
  for (const [name,path] of [['home','/'],['library','/writing/'],['nature','/writing/nature-already-has-the-math/']]) {
    const response = await page.goto(base+path);
    assert.equal(response.status(),200);
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});
    const layout = await page.evaluate(layoutCheck);
    report.layouts.push({name,...layout});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:screenshot(`${name}-${width}.png`),fullPage:true});
    if(name==='home')await page.screenshot({path:screenshot(`home-${width}-viewport.png`)});
    if(name==='nature') {
      await page.evaluate(()=>document.querySelectorAll('.flow-trace').forEach(el=>el.remove()));
      report.article.push(await page.evaluate(diagramCheck));
      if(width===1440||width===320)for(const figure of await page.locator('figure.figure').all())await figure.screenshot({path:screenshot(`${width}-${await figure.getAttribute('id')}.png`),style:'.ha-nav,.skip-link{visibility:hidden!important}'});
    }
  }
}

await page.setViewportSize({width:1440,height:1000});
await page.goto(base+'/writing/');
const search=page.locator('[data-room-search]'),topic=page.locator('[data-room-topic]');
const count=()=>page.locator('[data-discovery-entry]:visible').count();
assert.equal(await count(),6);
await search.fill('nature'); assert.equal(await count(),1);
await search.fill('no-match-zzzz'); assert.equal(await count(),0);
assert.equal(await page.locator('[data-room-empty]').isVisible(),true);
await page.locator('[data-room-reset]').click(); assert.equal(await count(),6);
await topic.selectOption('AI & governance'); assert.equal(await count(),2);
await page.locator('[data-room-reset]').click();
await page.locator('[data-room-view="start-here"]').click(); assert.equal(await count(),6);
await page.locator('[data-room-view="visual-index"]').click(); assert.equal(await count(),6);
await page.locator('[data-room-more]').click(); assert.equal(await count(),9);
await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
await page.screenshot({path:screenshot('visual-index-desktop.png'),fullPage:true});
await page.locator('[data-room-view="all"]').focus();
await page.keyboard.press('ArrowRight');
assert.equal(await page.locator('[data-room-view="start-here"]').getAttribute('aria-selected'),'true');
await page.goto(base+'/writing/#visual-index');
assert.equal(await page.locator('[data-room-view="visual-index"]').getAttribute('aria-selected'),'true');
const visualLinks=await page.locator('.visual-image').evaluateAll(links=>links.map(a=>a.href));
for(const link of visualLinks){await page.goto(link);assert.ok(await page.locator(new URL(link).hash).count());}
report.interactions.discovery='6 essays, 6 routes, 9 diagram anchors; search, empty, clear, topic, tabs, keyboard, deep links and load more passed';
await page.setViewportSize({width:320,height:844});
await page.goto(base+'/');
await page.locator('.menu-toggle').click();
assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
await page.keyboard.press('Escape');
assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
await page.goto(base+'/writing/#visual-index');
await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
await page.screenshot({path:screenshot('visual-index-320.png'),fullPage:true});
report.interactions.mobileMenu='open and Escape close passed';

const motion=[];
for(const width of [1440,320]){
 await page.setViewportSize({width,height:1000});
 await page.goto(base+'/writing/nature-already-has-the-math/');
 await page.evaluate(()=>document.querySelectorAll('.figure-replay').forEach(b=>b.click()));
 await page.waitForTimeout(350);
 const early=await page.locator('.flow-trace').evaluateAll(paths=>paths.map(p=>getComputedStyle(p).strokeDashoffset));
 await page.waitForTimeout(1400);
 const mid=await page.locator('.flow-trace').evaluateAll(paths=>paths.map(p=>getComputedStyle(p).strokeDashoffset));
 await page.locator('#fig-hydrologic').screenshot({path:screenshot(`motion-${width}.png`),style:'.ha-nav,.skip-link{visibility:hidden!important}'});
 await page.waitForTimeout(4000);
 motion.push({width,early,mid,changed:JSON.stringify(early)!==JSON.stringify(mid),remaining:await page.locator('.flow-trace').count()});
}
report.interactions.motion=motion;
await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
await page.reload();
report.interactions.reducedMotion=await page.evaluate(()=>({traces:document.querySelectorAll('.flow-trace').length,replayHidden:[...document.querySelectorAll('.figure-replay')].every(b=>getComputedStyle(b).display==='none'),bodyBackground:getComputedStyle(document.querySelector('.nature-prose')).backgroundColor}));
await page.screenshot({path:screenshot('nature-320-reduced-dark.png'),fullPage:true});
await page.locator('[data-print-takeaways]').count().then(n=>report.interactions.printControls=n);
await page.pdf({path:screenshot('nature-print.pdf'),format:'A4',printBackground:true});
await page.evaluate(()=>{window.print=()=>{};});
await page.locator('[data-print-takeaways]').click();
assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('print-takeaways')),true);
await page.emulateMedia({media:'print'});
assert.equal(await page.locator('.article-takeaways').isVisible(),true);
assert.equal(await page.locator('.post-head').isVisible(),false);
assert.equal(await page.locator('.article-takeaways li').count(),5);
await page.pdf({path:screenshot('takeaway-sheet.pdf'),format:'A4',printBackground:true});
const email=await page.locator('a[href^="mailto:"]').first().getAttribute('href');
assert.ok(decodeURIComponent(email).includes('Ask where the AI answer came from'));
assert.ok(decodeURIComponent(email).includes('https://hardeepanand.com/writing/nature-already-has-the-math/'));
report.interactions.takeaways='Print isolation and five points, canonical attribution, email content and link verified without sending';
await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
await page.emulateMedia({media:'screen'});

await page.evaluate(()=>localStorage.setItem('ha-theme','obsidian'));
await page.goto(base+'/');
await page.screenshot({path:screenshot('home-saved-dark.png'),fullPage:true});
report.interactions.savedDark=await page.evaluate(()=>{const el=document.querySelector('.reading-room');return {theme:document.documentElement.dataset.theme,text:getComputedStyle(el).color,background:getComputedStyle(document.querySelector('.notebook-home')).backgroundColor};});
await page.evaluate(()=>localStorage.removeItem('ha-theme'));

const nojs=await browser.newPage({javaScriptEnabled:false});
await nojs.goto(base+'/writing/');
report.interactions.nojs={essays:await nojs.locator('.reading-entry:visible').count(),routes:await nojs.locator('.reader-route:visible').count(),diagrams:await nojs.locator('.visual-entry:visible').count()};
await nojs.close();
for(const route of ['/about/','/work/','/writing/vital-signs/','/writing/data-governance/','/writing/fifty-steps-back/','/climb/adapt-dont-pivot/','/climb/in-your-head/']){
 const response=await page.goto(base+route);assert.equal(response.status(),200);
 await page.evaluate(()=>document.fonts.ready);
 report.layouts.push({name:route,...await page.evaluate(layoutCheck)});
}
await fs.writeFile(new URL('browser-results.json',evidence),JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify({layouts:report.layouts.map(r=>({name:r.name,width:r.width,documentWidth:r.documentWidth,overflow:r.overflow.length,brokenImages:r.brokenImages.length})),article:report.article.map(r=>({...r,issues:r.issues.length,collisions:r.collisions.length,crossings:r.crossings.length})),interactions:{...report.interactions,motion:motion.map(({width,changed,remaining})=>({width,changed,remaining}))},errors},null,2));
assert.ok(report.layouts.every(r=>r.documentWidth<=r.width&&r.overflow.length===0&&r.brokenImages.length===0));
assert.ok(report.article.every(r=>r.issues.length===0&&r.collisions.length===0&&r.crossings.length===0&&r.uniqueIds&&r.accessible));
assert.equal(errors.length,0);
