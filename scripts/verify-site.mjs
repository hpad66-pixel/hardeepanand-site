import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const html=files(root).filter(f=>f.endsWith('.html'));
const problems=[];
for(const file of html){
 const content=readFileSync(file,'utf8');
 if(!file.includes('/admin/')) {
  for(const pattern of [/localhost:4399/,/onsubmit="return false/,/Placeholders\. Your real/])if(pattern.test(content))problems.push(`${file}: unfinished public behavior`);
  assert.match(content,/<title>[^<]+<\/title>/);assert.match(content,/<meta name="description"/);
 }
 const route=path.relative(root,file).replace(/index\.html$/,'');
 for(const match of content.matchAll(/(?:href|src)="([^"<>]+)"/g)){
  const value=match[1];if(/^(?:https?:|mailto:|data:|blob:|\/cdn-cgi\/)/.test(value))continue;
  const url=new URL(value,`https://hardeepanand.com/${route}`);
  let target=path.join(root,decodeURIComponent(url.pathname));
  const candidates=[target,path.join(target,'index.html')];
  if(target.endsWith('.html'))candidates.push(path.join(target.slice(0,-5),'index.html'));
  const found=candidates.find(c=>existsSync(c)&&!c.endsWith(path.sep));
  if(!found)problems.push(`${route}: missing ${value}`);
 }
}
const feed=JSON.parse(readFileSync(path.join(root,'feed.json'),'utf8'));
assert(feed.items.length>=10);for(const item of feed.items)assert(item.content_html||item.content_text,`Feed item lacks content: ${item.url}`);
assert.equal(new Set(feed.items.map(i=>i.id)).size,feed.items.length,'Duplicate feed IDs');
assert(!readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('/admin/'));
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log(`Verified ${html.length} rendered pages, internal links and assets, ${feed.items.length} feed entries, and sitemap exclusions.`);
