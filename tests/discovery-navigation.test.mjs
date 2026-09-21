import test from 'node:test';
import assert from 'node:assert/strict';

test('390px Back restores topic results, nine diagrams, search, and scroll',{
 skip:!process.env.DISCOVERY_BASE_URL||!process.env.PLAYWRIGHT_MODULE,
},async()=>{
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const base=process.env.DISCOVERY_BASE_URL;
  const visible='[data-discovery-entry]:visible';
  await page.goto(`${base}/writing/`);
  await page.locator('[data-room-topic]').selectOption('AI & governance');
  assert.equal(await page.locator(visible).count(),2);
  await page.locator(`${visible} h3 a`).first().click();
  await page.goBack();
  await page.waitForFunction(()=>document.querySelector('[data-room-topic]')?.value==='AI & governance'&&[...document.querySelectorAll('[data-discovery-entry]')].filter(e=>!e.hidden&&e.offsetParent!==null).length===2);
  assert.equal(await page.locator(visible).count(),2);
  await page.locator('[data-room-reset]').click();
  await page.locator('[data-room-view="visual-index"]').click();
  await page.locator('[data-room-more]').click();
  assert.equal(await page.locator(visible).count(),9);
  const ninth=page.locator(`${visible} h4 a`).nth(8);
  await ninth.scrollIntoViewIfNeeded();
  const before=await page.evaluate(()=>window.scrollY);
  await ninth.click();
  await page.goBack();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-discovery-entry]')].filter(e=>!e.hidden&&e.offsetParent!==null).length===9);
  await page.waitForFunction(y=>Math.abs(window.scrollY-y)<5,before);
  assert.equal(await page.locator('[data-room-view="visual-index"]').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator(visible).count(),9);
  assert.equal(await page.locator('[data-room-more]').isVisible(),false);
  await page.reload();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-discovery-entry]')].filter(e=>!e.hidden&&e.offsetParent!==null).length===9);
  await page.goto(`${base}/writing/?view=all`);
  await page.locator('[data-room-search]').fill('governance');
  const matched=await page.locator(visible).count();
  await page.locator(`${visible} h3 a`).first().click();
  await page.goBack();
  await page.waitForFunction(()=>document.querySelector('[data-room-search]')?.value==='governance');
  assert.equal(await page.locator(visible).count(),matched);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  assert.equal(await page.locator(visible).count(),matched);
  console.log(JSON.stringify({width:390,topicBack:2,visualBack:9,scrollBefore:before,searchBack:matched}));
  await page.evaluate(()=>localStorage.setItem('ha-theme','obsidian'));
  await page.reload();
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='obsidian');
  const dark=await page.evaluate(()=>({
   room:getComputedStyle(document.querySelector('[data-reading-room]')).backgroundColor,
   ink:getComputedStyle(document.querySelector('[data-reading-room]')).color,
   input:getComputedStyle(document.querySelector('[data-room-search]')).backgroundColor,
   select:getComputedStyle(document.querySelector('[data-room-topic]')).backgroundColor,
  }));
  assert.equal(dark.room,'rgba(0, 0, 0, 0)');
  assert.equal(dark.ink,'rgb(237, 242, 245)');
  assert.equal(dark.input,'rgb(20, 37, 48)');
  assert.equal(dark.select,dark.input);
 }finally{await browser.close();}
});
