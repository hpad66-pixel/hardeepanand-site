import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4395';
const evidence = new URL(process.env.EVIDENCE_DIR || '../docs/review-packages/hero-correction-evidence/', import.meta.url);
await fs.mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
for (const width of [1920,1440,1024,820,650,390,320]) {
  await page.setViewportSize({width,height:width<700?844:1000});
  await page.goto(base);
  await page.evaluate(()=>document.fonts.ready);
  const row = await page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    const text=document.querySelector('.lens-thesis');
    const styles=selector=>{const s=getComputedStyle(document.querySelector(selector));return {family:s.fontFamily,size:parseFloat(s.fontSize),color:s.color};};
    return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,banner:!!document.querySelector('.notebook-opening'),statement:text.textContent,copy:rect('.lens-opening-copy'),image:rect('.lens-rivers'),statementRect:rect('.lens-thesis'),background:getComputedStyle(document.body).backgroundColor,
      typography:Object.fromEntries(['.lens-thesis','.reading-entry h3','.reading-summary','.reading-value p','.reading-meta','.ha-links a'].map(selector=>[selector,styles(selector)])),
      fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight})),
      navOverflow:[...document.querySelectorAll('.ha-nav a,.ha-nav button')].filter(el=>el.getClientRects().length).some(el=>{const r=el.getBoundingClientRect();return r.left<0||r.right>innerWidth+1;})};
  });
  results.push(row);
  assert.equal(row.banner,false);
  assert.match(row.statement,/I make invisible\s*systems legible\./);
  assert.ok(row.documentWidth<=width);
  assert.equal(row.navOverflow,false);
  assert.equal(row.background,'rgb(245, 243, 237)');
  assert.ok(row.statementRect.top<500);
  if(width>650){assert.ok(row.copy.right<=row.image.left);assert.ok(row.image.height>row.image.width);}
  else assert.ok(row.copy.bottom<=row.image.top);
  assert.ok(row.typography['.reading-entry h3'].size>row.typography['.reading-value p'].size*1.6);
  assert.ok(row.typography['.reading-summary'].size>=15);
  assert.match(row.typography['.reading-value p'].family,/Inter/);
  await page.screenshot({path:new URL(`home-${width}-viewport.png`,evidence).pathname});
  if(width===1440||width===390||width===320)await page.screenshot({path:new URL(`home-${width}.png`,evidence).pathname,fullPage:true});
  await page.goto(base+'/writing/');
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:new URL(`library-${width}.png`,evidence).pathname,fullPage:width===390});
}
await page.setViewportSize({width:1440,height:1000});
await page.goto(base);
await page.evaluate(()=>localStorage.setItem('ha-theme','obsidian'));
await page.reload();
const dark=await page.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,hero:getComputedStyle(document.querySelector('.lens-opening')).backgroundColor,thesis:getComputedStyle(document.querySelector('.lens-thesis')).color}));
assert.equal(dark.body,'rgb(16, 24, 32)');
await page.screenshot({path:new URL('home-obsidian.png',evidence).pathname});
await fs.writeFile(new URL('hero-checks.json',evidence),JSON.stringify({base,results,dark},null,2));
await browser.close();
console.log(JSON.stringify({base,widths:results.map(r=>r.width),bannerRemoved:true,sideBySideDesktop:true,stackedPhone:true,fonts:results[0].fonts,typography:results[0].typography,dark},null,2));
