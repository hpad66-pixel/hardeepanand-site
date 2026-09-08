import {validateDraft} from './draft-schema.js';
export async function startVisualEditor(root){
 if(new URLSearchParams(location.search).get('edit')!=='1')return;
 const article=document.querySelector('article.post');if(!article)return;
 const toolbar=root.querySelector('.ve-toolbar'),panel=root.querySelector('.ve-inspector'),status=root.querySelector('[data-ve-status]');
 const save=root.querySelector('[data-ve-save]'),undo=root.querySelector('[data-ve-undo]'),redo=root.querySelector('[data-ve-redo]');
 const say=text=>status.textContent=text;
 toolbar.hidden=false;root.querySelector('.ve-entry')?.remove();
 const path=root.dataset.articlePath,endpoint='/api/editor/drafts?article='+encodeURIComponent(path);
 let stored;
 try{const response=await fetch(endpoint,{redirect:'error',headers:{Accept:'application/json'}});if(!response.ok)throw Error();stored=await response.json();}
 catch{say('Open the private studio to sign in, then return to this article.');save.disabled=true;const a=document.createElement('a');a.href='/admin/';a.textContent='Open studio ↗';a.className='ve-sign-in';toolbar.append(a);root.querySelector('[data-ve-close]').onclick=()=>location.assign(path);return;}
 const slots=new Map(),originals=new Map(),blueprint=[];
 // Stable targets preserve inline emphasis, citations, links, and SVG structure.
 const proseRoots=[article.querySelector('.post-head h1'),...article.querySelectorAll('.prose'),...article.querySelectorAll('.resilience-chain header,.resilience-chain blockquote,.resilience-chain figcaption')].filter(Boolean);
 let textIndex=0;
 proseRoots.forEach(prose=>{
  const walker=document.createTreeWalker(prose,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode()){const node=walker.currentNode;
   if(node.textContent.trim()&&!node.parentElement.closest('svg,script,style,button,input,textarea,select,[data-ve-text]'))nodes.push(node);
  }
  nodes.forEach(node=>{const span=document.createElement('span'),id='t'+textIndex++;span.dataset.veText=id;span.textContent=node.textContent;node.replaceWith(span);slots.set(id,span);originals.set(id,{text:span.textContent});blueprint.push([id,span.textContent]);});
 });
 let svgIndex=0;
 article.querySelectorAll('svg').forEach(svg=>{
  if(svg.closest('.apas-signature,.substack-discussion,button'))return;
  svg.querySelectorAll('g,path,rect,circle,ellipse,line,polyline,polygon,text,tspan').forEach(el=>{
   if(el.closest('defs,clipPath,mask,marker,pattern,symbol'))return;
   const id='s'+svgIndex++;el.dataset.veSvg=id;slots.set(id,el);
   const attrs=Object.fromEntries([...el.attributes].filter(a=>a.name!=='data-ve-svg').map(a=>[a.name,a.value]));
   originals.set(id,{attrs,text:el.childElementCount?undefined:el.textContent});blueprint.push([id,el.tagName,attrs,el.childElementCount?null:el.textContent]);
  });
 });
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(blueprint)));
 const baseFingerprint=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
 let revision=stored.draft?.revision||null,changes={},savedState='{}',history=['{}'],cursor=0,selected=null,preview=false,busy=false;
 const state=()=>JSON.stringify(changes);
 const isDirty=()=>state()!==savedState;
 const enable=()=>{save.disabled=busy||!isDirty();undo.disabled=cursor===0;redo.disabled=cursor===history.length-1;};
 function apply(id){const el=slots.get(id),original=originals.get(id),change=changes[id]||{};
  if(id[0]==='t'){el.textContent=change.text??original.text;return;}
  for(const key of ['transform','fill','stroke','font-size','style']){if(original.attrs[key]===undefined)el.removeAttribute(key);else el.setAttribute(key,original.attrs[key]);}
  if(original.text!==undefined)el.textContent=change.text??original.text;
  if(change.dx!==undefined||change.dy!==undefined||change.scale!==undefined){
   // SVG matrices are composed after the original placement, in the parent's coordinate system.
   const originalTransform=original.attrs.transform||'';
   el.setAttribute('transform',`translate(${change.dx||0} ${change.dy||0}) ${originalTransform} scale(${change.scale||1})`);
   const matrix=el.transform?.baseVal.consolidate()?.matrix;
   if(matrix)el.style.setProperty('transform',`matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e},${matrix.f})`);el.style.setProperty('transform-box','view-box');el.style.setProperty('transform-origin','0px 0px');
  }
  for(const key of ['fill','stroke'])if(change[key]!==undefined){el.setAttribute(key,change[key]);el.style.setProperty(key,change[key]);}
  if(change.fontSize!==undefined){el.setAttribute('font-size',String(change.fontSize));el.style.setProperty('font-size',change.fontSize+'px');}
 }
 function applyAll(){slots.forEach((_,id)=>apply(id));}
 function record(){const next=state();if(history[cursor]!==next){history=history.slice(0,cursor+1);history.push(next);if(history.length>100)history.shift();cursor=history.length-1;}say(isDirty()?'Unsaved changes':'Draft saved');enable();}
 function update(id,patch,commit=true){changes[id]={...(changes[id]||{id}),...patch};apply(id);if(commit)record();}
 function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const draft=()=>({schema:1,articlePath:path,baseFingerprint,revision,changes:Object.values(changes)});
 if(stored.draft){
  try{const valid=validateDraft(stored.draft);if(valid.baseFingerprint!==baseFingerprint||valid.changes.some(c=>!slots.has(c.id)))throw Error('Source changed');changes=Object.fromEntries(valid.changes.map(c=>[c.id,c]));applyAll();savedState=state();history=[state()];say('Saved draft restored · '+stored.storage);}
  catch{say('The article source changed. Export the previous draft before starting over.');root.querySelector('[data-ve-export]').onclick=()=>download('previous-visual-draft.json',JSON.stringify(stored.draft,null,2),'application/json');root.querySelector('[data-ve-close]').onclick=()=>location.assign(path);return;}
 }else say('Click article text or select a diagram · '+stored.storage);
 function setEditing(on){document.body.classList.toggle('ve-active',on);slots.forEach((el,id)=>{if(id[0]==='t'){el.contentEditable=on?'plaintext-only':'false';el.spellcheck=true;}else{el.setAttribute('tabindex',on?'0':'-1');}});}
 setEditing(true);enable();
 const help=root.querySelector('.ve-help');help.hidden=!!stored.draft;root.querySelector('[data-ve-help-close]').onclick=()=>help.hidden=true;
 slots.forEach((el,id)=>{if(id[0]!=='t')return;
  el.addEventListener('input',()=>{changes[id]={id,text:el.textContent};record();});
  el.addEventListener('paste',event=>{event.preventDefault();document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));});
  el.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();document.execCommand('insertText',false,'\n');}});
 });
 article.addEventListener('click',event=>{if(!preview&&event.target.closest('[data-ve-text],svg'))event.preventDefault();},true);
 const colorValue=value=>{const m=value.match(/^rgb\((\d+), (\d+), (\d+)\)$/);return m?'#'+m.slice(1).map(n=>Number(n).toString(16).padStart(2,'0')).join(''):/^#[\da-f]{6}$/i.test(value)?value:'#174bc5';};
 function select(el){
  article.querySelectorAll('.ve-selected').forEach(e=>e.classList.remove('ve-selected'));selected=el;
  if(!el){panel.hidden=true;return;}el.classList.add('ve-selected');panel.hidden=false;help.hidden=true;
  const id=el.dataset.veSvg,c=changes[id]||{},style=getComputedStyle(el),original=originals.get(id),leafText=['text','tspan'].includes(el.tagName)&&original.text!==undefined;
  root.querySelector('[data-ve-selection]').textContent=leafText?'Edit this label':`Edit ${el.tagName==='g'?'group':el.tagName}`;
  root.querySelector('[data-ve-label-wrap]').hidden=!leafText;root.querySelector('[data-ve-font-wrap]').hidden=!['text','tspan'].includes(el.tagName);
  root.querySelector('[data-ve-label]').value=el.textContent;
  for(const input of root.querySelectorAll('[data-ve-prop]')){const k=input.dataset.veProp;input.value=c[k]??(k==='scale'?1:k==='fontSize'?Math.round(parseFloat(style.fontSize)):k==='fill'||k==='stroke'?colorValue(style[k]):0);}
  root.querySelector('[data-ve-parent]').disabled=!el.parentElement?.dataset.veSvg;
 }
 article.addEventListener('pointerdown',event=>{
  if(preview||event.button!==0)return;const el=event.target.closest('[data-ve-svg]');if(!el)return;
  select(el);el.focus({preventScroll:true});event.preventDefault();
  const parent=el.parentElement,svg=el.ownerSVGElement,matrix=parent.getScreenCTM?.();if(!matrix)return;
  let inverse;try{inverse=matrix.inverse();}catch{return;}
  const point=(x,y)=>new DOMPoint(x,y).matrixTransform(inverse),start=point(event.clientX,event.clientY),id=el.dataset.veSvg,original={...(changes[id]||{})};let moved=false;
  el.setPointerCapture(event.pointerId);
  const move=e=>{const p=point(e.clientX,e.clientY),dx=Math.round(((original.dx||0)+p.x-start.x)*10)/10,dy=Math.round(((original.dy||0)+p.y-start.y)*10)/10;if(Math.abs(p.x-start.x)+Math.abs(p.y-start.y)<2&&!moved)return;moved=true;update(id,{dx:Math.max(-2000,Math.min(2000,dx)),dy:Math.max(-2000,Math.min(2000,dy))},false);};
  const end=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',end);if(moved){record();select(el);}};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 });
 article.addEventListener('keydown',event=>{
  const el=event.target.closest('[data-ve-svg]');if(preview||!el)return;
  if(event.key==='Enter'){event.preventDefault();select(el);return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();const id=el.dataset.veSvg,c=changes[id]||{},amount=event.shiftKey?10:1;update(id,{dx:Math.max(-2000,Math.min(2000,(c.dx||0)+(event.key==='ArrowRight'?amount:event.key==='ArrowLeft'?-amount:0))),dy:Math.max(-2000,Math.min(2000,(c.dy||0)+(event.key==='ArrowDown'?amount:event.key==='ArrowUp'?-amount:0)))});select(el);
 });
 root.querySelector('[data-ve-label]').addEventListener('input',event=>{if(selected)update(selected.dataset.veSvg,{text:event.target.value});});
 root.querySelectorAll('[data-ve-prop]').forEach(input=>input.addEventListener('input',()=>{
  if(!selected||!input.checkValidity()||input.value==='')return;const k=input.dataset.veProp,value=['fill','stroke'].includes(k)?input.value:Number(input.value);update(selected.dataset.veSvg,{[k]:value});
 }));
 root.querySelector('[data-ve-parent]').onclick=()=>{if(selected?.parentElement?.dataset.veSvg)select(selected.parentElement);};
 root.querySelector('[data-ve-deselect]').onclick=()=>select(null);
 root.querySelector('[data-ve-reset]').onclick=()=>{if(selected){const id=selected.dataset.veSvg;delete changes[id];apply(id);record();select(selected);}};
 root.querySelector('[data-ve-svg]').onclick=()=>{
  if(!selected)return;const source=selected.ownerSVGElement,clone=source.cloneNode(true);
  // Resolve theme-dependent styles so the exported SVG stands on its own.
  const sourceNodes=[source,...source.querySelectorAll('*')],cloneNodes=[clone,...clone.querySelectorAll('*')];
  sourceNodes.forEach((node,i)=>{const copy=cloneNodes[i];if(!(node instanceof SVGElement))return;const css=getComputedStyle(node);for(const property of ['fill','stroke','stroke-width','font-family','font-size','font-weight','text-anchor','opacity'])copy.style.setProperty(property,css.getPropertyValue(property));copy.style.setProperty('animation','none');copy.removeAttribute('data-ve-svg');copy.removeAttribute('tabindex');copy.classList.remove('ve-selected');});
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');download(path.split('/').filter(Boolean).at(-1)+'-diagram.svg',new XMLSerializer().serializeToString(clone),'image/svg+xml');
 };
 function travel(step){if(cursor+step<0||cursor+step>=history.length)return;cursor+=step;changes=JSON.parse(history[cursor]);applyAll();if(selected)select(selected);say(isDirty()?'Unsaved changes':'Draft saved');enable();}
 undo.onclick=()=>travel(-1);redo.onclick=()=>travel(1);
 root.querySelector('[data-ve-preview]').onclick=event=>{preview=!preview;setEditing(!preview);panel.hidden=true;help.hidden=true;article.querySelectorAll('.ve-selected').forEach(e=>e.classList.remove('ve-selected'));event.target.textContent=preview?'Resume editing':'Preview';say(preview?'Draft preview · not published':'Click text or select a diagram');};
 root.querySelector('[data-ve-export]').onclick=()=>download(path.split('/').filter(Boolean).at(-1)+'-visual-draft.json',JSON.stringify(draft(),null,2),'application/json');
 save.onclick=async()=>{
  if(busy)return;busy=true;enable();say('Saving draft…');const sending=state();
  try{const payload=validateDraft(draft());const response=await fetch(endpoint,{method:'PUT',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw Error(result.error||'Save failed.');revision=result.draft.revision;savedState=sending;say(isDirty()?'Saved. Newer edits still need saving.':'Draft saved · '+result.storage);}
  catch(error){say(error.message||'Save failed. Your edits remain here; export a backup.');}
  finally{busy=false;enable();}
 };
 root.querySelector('[data-ve-close]').onclick=()=>{if(!isDirty()||confirm('Leave without saving these changes?'))location.assign(path);};
 window.addEventListener('beforeunload',event=>{if(isDirty()){event.preventDefault();event.returnValue='';}});
 document.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey))return;if(event.key.toLowerCase()==='s'){event.preventDefault();save.click();}if(event.key.toLowerCase()==='z'){event.preventDefault();travel(event.shiftKey?1:-1);}});
}
