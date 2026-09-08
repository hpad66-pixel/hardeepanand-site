import fs from 'node:fs';
const ink='var(--text,#092b3e)',blue='var(--figure-accent,#174bc5)',muted='var(--text-dim,#52616a)',rule='var(--line,#d4d9d7)',paper='var(--bg,#f5f3ed)';
const text=(x,y,s,size=17,color=ink)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" style="font-family:var(--font-display,Georgia,serif)">${s}</text>`;
const path=(d,color=ink,width=2,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const draw=(d,delay=0)=>path(d,rule,2)+path(d,blue,3,`pathLength="1" class="vs-motion sc-draw" style="animation-delay:${delay}s"`);
const reveal=(s,delay)=>`<g class="vs-motion sc-reveal" style="animation-delay:${delay}s">${s}</g>`;
const circle=(x,y,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${paper}" stroke="${blue}" stroke-width="2"/>`;
const glyph=(x,y,kind)=>`<g transform="translate(${x} ${y})">${kind==='compass'?circle(0,0,25)+path('M-9 12 L-2 -17 L10 -12 L2 17 Z',blue)+circle(0,0,3):kind==='book'?path('M0 24 V-18 Q-15 -29 -34 -18 V21 Q-17 10 0 24 Q17 10 34 21 V-18 Q16 -29 0 -18')+path('M-25 -9 L-9 -5 M9 -5 L25 -9',blue):kind==='pencil'?path('M-21 20 L13 -23 L24 -14 L-10 29 L-26 34 Z M-21 20 L-10 29 M8 -17 L19 -8',blue):path('M-26 22 L-4 0 Q-13 -14 -1 -24 L2 -8 L15 -5 L23 -17 Q31 0 11 10 L-14 34 Z',blue)}</g>`;
const specs=[
 ['adapt-dont-pivot','carry-the-map','Your experience comes with you.','A continuous climbing route links accumulated judgment to a new ascent. The earlier route remains visible as the new one is drawn.'],
 ['adapt-dont-pivot','old-judgment-new-tools','Weave what you know into what you learn.','Three strands—experience, learning, and practice—cross and come together in one useful workflow. Experience supplies judgment, learning connects new capabilities, and practice checks the result.'],
 ['in-your-head','leave-the-loop','Give the thought a way out.','A looping line opens into a deliberate next action. The drawing illustrates a choice about attention, not a medical claim.'],
 ['in-your-head','open-the-gate','A list is a start. Closing the loop is the work.','A written question moves through a gate to a completed action. Completion can mean doing the work, asking for help, or deliberately letting go.']
];
function compose(kind,m){
 const w=m?380:820;let h=400,b='';
 if(kind==='carry-the-map'){
  h=m?470:415;
  const ridge=m?'M12 328 L67 217 L109 259 L200 91 L245 163 L289 126 L369 302':'M20 310 L165 172 L238 223 L429 48 L505 134 L574 93 L800 306';
  b+=path(ridge,rule,2)+path(m?'M175 136 L200 91 L220 122 L231 112':'M387 88 L429 48 L458 79 L479 65',rule);
  const route=m?'M35 363 C118 390 157 339 112 306 S58 284 112 259 S266 277 235 217 S151 215 198 175 S250 140 289 126':'M54 345 C226 389 281 325 196 286 S105 261 238 223 S526 288 504 201 S367 230 421 148 S521 162 574 93';
  b+=draw(route);
  const dots=m?[[35,363,'Experience'],[112,306,'Judgment'],[235,217,'New skills']]:[[54,345,'Experience'],[196,286,'Judgment'],[504,201,'New skills']];
  dots.forEach(([x,y,s],i)=>{b+=reveal(circle(x,y,5)+text(x+(m?35:15),y+31,s,m?15:19),i*.65);});
  const fx=m?289:574,fy=m?126:93;
  b+=reveal(path(`M${fx} ${fy} V${fy-47} l30 9 -30 12`,blue)+text(m?273:646,m?60:45,'Still you. Further up.',m?17:21,blue),1.9);
  b+=text(w/2,h-10,'The first climb becomes part of the second.',m?17:21,muted);
 }else if(kind==='old-judgment-new-tools'){
  h=m?490:390;
  const colors=[ink,blue,'var(--figure-secondary,#507da0)'];
  const labels=['Experience','Learning','Practice'];
  const subtitles=['Bring judgment','Connect tools','Check the result'];
  const routes=m?[
   'M63 98 C63 162 310 166 310 229 S92 270 132 348',
   'M190 98 C190 159 70 167 70 229 S266 275 190 348',
   'M317 98 C317 154 190 170 190 229 S75 286 248 348'
  ]:[
   'M173 73 C340 73 339 269 473 269 S610 122 667 145',
   'M173 173 C332 173 360 72 473 72 S610 190 667 183',
   'M173 273 C327 273 345 170 473 170 S600 277 667 221'
  ];
  labels.forEach((label,i)=>{
   const x=m?[63,190,317][i]:80,y=m?49:69+i*100;
   b+=text(x,y,label,m?18:21,colors[i])+text(x,y+24,subtitles[i],m?12:14,muted);
   b+=path(routes[i],rule,1.5)+path(routes[i],colors[i],4,`pathLength="1" class="vs-motion sc-draw" style="animation-delay:${i*.35}s"`);
  });
  if(m){
   b+=reveal(path('M113 361 Q190 383 267 361',blue,2)+text(190,414,'One useful workflow.',26,blue)+text(190,448,'Your judgment stays in the loop.',16,muted),1.9);
  }else{
   b+=reveal(path('M686 129 Q708 183 686 237',blue,2)+text(753,174,'Useful',23,blue)+text(753,203,'work',23,blue),1.9);
   b+=text(w/2,358,'Your judgment stays in the loop.',21,muted);
  }
 }else if(kind==='leave-the-loop'){
  h=m?490:340;const cx=m?172:205,cy=m?147:157;
  const d=`M${cx+18} ${cy+7} C${cx+65} ${cy-60} ${cx-94} ${cy-74} ${cx-71} ${cy+19} S${cx+145} ${cy+94} ${cx+119} ${cy-32} S${cx-140} ${cy-114} ${cx-119} ${cy+36} S${cx+170} ${cy+137} ${cx+153} ${cy-13}`;
  b+=path(d,rule,2)+path(d,ink,2,'pathLength="1" class="vs-motion sc-draw"');
  b+=text(cx,cy+11,'What if…',22);
  const exit=m?`M${cx+153} ${cy-13} C365 298 60 247 111 368 Q140 401 263 392`:`M${cx+153} ${cy-13} C373 5 438 256 526 178 S662 117 758 152`;
  b+=draw(exit,.8);
  const x=m?281:764,y=m?392:153;
  b+=reveal(circle(x,y,13)+path(`M${x-6} ${y} l4 5 8 -10`,blue)+text(m?192:654,m?452:262,'One useful next action.',m?22:25,blue),2.1);
  if(!m)b+=text(206,304,'Thinking can circle.',17,muted);
 }else{
  h=m?590:385;const xx=m?52:76,yy=m?35:67;
  b+=path(`M${xx} ${yy} h${m?126:148} v140 h-${m?126:148} Z`,rule);
  b+=path(`M${xx+24} ${yy+34} h70 M${xx+24} ${yy+62} h53 M${xx+24} ${yy+90} h80`,ink,1.5)+text(xx+(m?63:74),yy+168,'Write it.',22);
  const gx=m?205:375,gy=m?246:95;
  b+=path(`M${gx} ${gy+113} V${gy} h84 v113`,ink,2);
  b+=reveal(path(`M${gx+4} ${gy+4} l58 -23 v112 l-58 17 Z`,blue,2)+circle(gx+43,gy+47,3),.9);
  b+=text(gx+40,gy+151,'Work through it.',m?18:22);
  const endx=m?125:717,endy=m?489:151;
  const route=m?'M178 105 C340 105 165 210 205 310 M289 310 C370 350 350 450 149 489':'M226 151 H369 M463 151 H689';
  b+=draw(route,.5)+reveal(circle(endx,endy,25)+path(`M${endx-12} ${endy} l8 9 17 -22`,blue,3)+text(endx,endy+62,'Close it.',22,blue),2);
  if(!m)b+=text(w/2,350,'Done. Delegated with a handoff. Or deliberately released.',18,muted);
 }
 return {w,h,b};
}
for(const [slug,name,title,desc] of specs){
 const dir=`public/images/articles/${slug}`;fs.mkdirSync(dir,{recursive:true});
 for(const mobile of [false,true]){
  const {w,h,b}=compose(name,mobile),id=`sc-${name}-${mobile?'m':'w'}`;
  fs.writeFileSync(`${dir}/${name}${mobile?'-mobile':''}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" class="vital-graphic" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">${desc}</desc><style>.sc-draw{stroke-dasharray:1;animation:sc-line 2.8s ease both}.sc-reveal{animation:sc-arrive 1.1s ease both;transform-box:fill-box;transform-origin:center}@keyframes sc-line{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@keyframes sc-arrive{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.sc-draw,.sc-reveal{animation:none!important}}</style>${b}</svg>`);
 }
}
console.log('Built four Second Climb illustrations in desktop and mobile layouts.');
