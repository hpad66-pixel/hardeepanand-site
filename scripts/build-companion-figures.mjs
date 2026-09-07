import fs from 'node:fs';
const sets = {
 'data-governance': [
 ['Make knowledge discoverable',['A question','A shared catalog','An accountable owner'],['Find the dataset','Read meaning and access rules','Resolve uncertainty'], 'A catalog preserves the route to knowledge; it does not replace the people responsible for it.'],
 ['Connect the systems through meaning',['Operational systems','Shared descriptions','Traceable decisions'],['Historian · GIS · meters','Identity · ownership · freshness','Know which records were used'], 'The governance layer connects descriptions and responsibilities across systems. It does not require moving every record into one database.'],
 ['Turn documentation into a working practice',['Describe','Detect a change','Review and update'],['Record the starting state','Monitor critical pipelines','Keep owners in the loop'], 'Automation can surface change. Accountable people still decide what the change means and which controls need updating.'],
 ['One foundation, several uses',['Governed records','Evidence and lineage','Reviewable outcomes'],['Known source and owner','Follow data into a decision','Audit · collaboration · AI'], 'A common evidence foundation supports these uses. Each still has its own requirements; a catalog alone does not establish compliance.'],
 ['Build capability in a useful order',['Diagnose one use case','Govern its critical data','Extend into AI'],['Expose the actual gaps','Catalog · lineage · controls','Validate before expanding'], 'Start with one consequential decision. Prove that its data can be found, understood, and traced before widening the program.']
 ],
 'fifty-steps-back': [
 ['Read the pressures together',['Investment needs','Operating obligations','Knowledge continuity'],['Long-lived infrastructure','Daily service and new demands','Capture what people know'], 'These pressures interact. This is a conceptual map, not a quantified forecast or a ranking of risks.'],
 ['Make quiet expertise durable',['Operator experience','A shared record','A stronger next decision'],['What changed and why','Context · asset · response','Learn without starting over'], 'Capture the reasoning behind a repair or operating adjustment, not just the fact that work was completed.'],
 ['Understand before handing over control',['Learn the tool','Test with people','Expand within limits'],['Know what it can miss','Check outputs against reality','Retain oversight and rollback'], 'A supervised pilot can expose data gaps. Expanding autonomy requires evidence that the process and its limits are understood.'],
 ['Identity comes before prediction',['Different local names','Verified asset identities','Comparable histories'],['Pump 3A · P-03 · local tags','Unique asset + model + location','Join the right maintenance records'], 'Two pumps of the same model remain separate assets. Standard names and verified identities prevent their histories from being confused.'],
 ['The step back makes progress possible',['Find your footing','Test one improvement','Carry the learning forward'],['Agree on records and meaning','Measure against a baseline','Repeat with a stronger foundation'], 'Fifty and five hundred are metaphors for readiness and progress, not a promised tenfold return.']
 ]
};
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const ink='var(--text,#092b3e)', blue='var(--figure-accent,#174bc5)', muted='var(--text-dim,#52616a)', rule='var(--line,#d4d9d7)', paper='var(--bg,#f5f3ed)';
const t=(x,y,s,size=16,fill=ink,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}">${esc(s)}</text>`;
const line=(d,color=rule,width=1,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
const flow=(d,delay=0)=>line(d,rule,2)+line(d,blue,3,`pathLength="1" class="vs-motion sl-flow" style="animation-delay:${delay}s"`);
const reveal=(body,delay=0)=>`<g class="vs-motion sl-reveal" style="animation-delay:${delay}s">${body}</g>`;
const ring=(x,y,r=34)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${paper}" stroke="${blue}" stroke-width="2"/>`;
const note=(x,y,a,b)=>t(x,y,a,18)+t(x,y+24,b,13,muted);
const record=(x,y,w,title,sub)=>`<rect x="${x}" y="${y}" width="${w}" height="66" rx="3" fill="${paper}" stroke="${rule}"/>`+t(x+14,y+26,title,16,ink,'start')+t(x+14,y+49,sub,12,muted,'start');
function compose(slug,i,m){
 const w=m?380:820,c=w/2;let b='',h=400;
 if(slug==='data-governance'&&i===1){
  h=m?650:410;
  // Compare a human bottleneck with a discoverable network, keeping the expert in both.
  const panel=(ox,oy,pw,connected)=>{
   const mid=ox+pw/2;let s=t(mid,oy+22,connected?'KNOWLEDGE PEOPLE CAN FIND':'ONE PERSON HOLDS THE MAP',12,blue);
   const xs=[ox+42,mid,ox+pw-42];xs.forEach((x,n)=>{s+=flow(`M${x} ${oy+75} Q${x} ${oy+135} ${mid} ${oy+151}`,n*.3);s+=ring(x,oy+63,16)+t(x,oy+68,['Ops','IT','AI'][n],10);});
   s+=ring(mid,oy+182,31)+t(mid,oy+188,connected?'Catalog':'Sarah',14);
   s+=t(mid,oy+241,connected?'Meaning · source · owner':'Every question waits here',14,muted);
   if(connected){s+=flow(`M${mid} ${oy+214} V${oy+273}`,1.4)+reveal(t(mid,oy+295,'Sarah maintains the knowledge.',13),1.7);}else{s+=t(mid,oy+276,'When she leaves, the map leaves.',13,muted);}
   return s;
  };
  b=m?panel(0,0,w,false)+line('M20 317 H360')+panel(0,332,w,true):panel(0,12,390,false)+line('M410 30 V365')+panel(430,12,390,true);
 }else if(slug==='data-governance'&&i===2){
  h=m?520:400;const names=['Historian','GIS','Meters','Work orders'];
  names.forEach((name,n)=>{const x=m?20+(n%2)*180:20+n*200,y=m?20+Math.floor(n/2)*85:24; b+=record(x,y,m?160:180,name,['Time series','Asset location','Usage','Maintenance'][n]);b+=flow(`M${x+(m?80:90)} ${y+66} V${m?235:155} H${c} V${m?269:185}`,n*.3);});
  const yy=m?270:186;b+=`<rect x="20" y="${yy}" width="${w-40}" height="88" fill="${paper}" stroke="${blue}" stroke-width="2"/>`+t(c,yy+32,'A shared map of the data',m?23:26)+t(c,yy+61,'Meaning · ownership · freshness · access',m?13:16,muted);
  b+=flow(`M${c} ${yy+88} V${yy+130}`,1.4)+reveal(note(c,yy+156,'One traceable decision','Records stay in their source systems.'),1.8);
 }else if(slug==='data-governance'&&i===3){
  h=m?550:380;const left=m?85:160,right=m?295:650,cy=m?220:180;
  b+=t(c,25,'A CHANGE SHOULD TRAVEL TO ITS OWNER',12,blue);
  b+=flow(`M${left} ${cy} C${left} 55 ${right} 55 ${right} ${cy}`,0)+flow(`M${right} ${cy} C${right} ${cy+155} ${left} ${cy+155} ${left} ${cy}`,1.2);
  b+=ring(left,cy,44)+t(left,cy-3,'Source',17)+t(left,cy+20,'changes',14,muted)+ring(right,cy,44)+t(right,cy-3,'Owner',17)+t(right,cy+20,'reviews',14,muted);
  b+=reveal(t(c,m?95:64,'Detect + notify',16,blue),.5)+reveal(t(c,cy+132,'Update the shared description',m?13:16,blue),1.6);
  b+=note(c,h-52,'The loop keeps the catalog useful.','A saved spreadsheet cannot close it by itself.');
 }else if(slug==='data-governance'&&i===4){
  h=m?520:385;const yy=m?315:210;
  b+=`<path d="M25 ${yy} H${w-25} V${yy+80} H25 Z" fill="${paper}" stroke="${blue}" stroke-width="2"/>`+t(c,yy+32,'Governed, traceable records',m?21:26)+t(c,yy+60,'Known source · accountable owner',14,muted);
  ['Audit evidence','Collaboration','AI evaluation'].forEach((s,n)=>{const x=m?c:145+n*265,y=m?35+n*86:62;
   b+=flow(m?`M40 ${yy} V${y+30} H90`:`M${x} ${yy} V${y+56}`,n*.35);
   b+=reveal(record(m?90:x-112,y,m?250:224,s,['Explain a reported result','Reuse data with context','Inspect model inputs'][n]),.6+n*.4);
  });b+=t(c,h-24,'Shared foundation; separate requirements.',14,muted);
 }else if(slug==='data-governance'&&i===5){
  h=m?535:365;const labels=['Find one critical dataset','Trace its journey','Keep controls current','Extend into a model'];
  labels.forEach((s,n)=>{const x=m?25:30+n*195,y=m?25+n*118:230-n*55;
   b+=line(m?`M45 ${y+65} V${y+117}`:`M${x} ${y+42} H${x+178} V${y-13}`,rule,2);
   b+=reveal(ring(x+(m?20:25),y+21,20)+t(x+(m?20:25),y+26,String(n+1),15,blue),n*.45);
   if(m)b+=reveal(t(83,y+19,s,16,ink,'start')+t(83,y+44,['Can a colleague find it?','Can you explain its origin?','Who handles a change?','Are its inputs defensible?'][n],12,muted,'start'),n*.45);
   else b+=reveal(t(x,y+77,s,13,ink,'start'),n*.45);
  });
  if(!m)b+=flow('M50 285 C230 280 480 230 770 72',.2);b+=t(c,h-10,'Earn the next step with evidence.',16,blue);
 }else if(slug==='fifty-steps-back'&&i===1){
  h=m?520:390;const cy=m?255:195;
  const nodes=m?[[c,45,'Investment needs'],[90,425,'New obligations'],[290,425,'Knowledge loss']]:[[130,65,'Investment needs'],[690,65,'New obligations'],[c,330,'Knowledge loss']];
  nodes.forEach(([x,y,s],n)=>{b+=flow(`M${x} ${y+(y<cy?20:-20)} L${c} ${cy}`,n*.4)+t(x,y,s,m?14:18);});
  b+=ring(c,cy,m?75:85)+t(c,cy-16,'The same',19)+t(c,cy+10,'operating team',19)+t(c,cy+39,'Finite time + attention',12,muted);
  b+=reveal(t(c,m?510:385,'Pressures converge. Capacity does not automatically grow.',m?11:14,blue),1.4);
 }else if(slug==='fifty-steps-back'&&i===2){
  h=m?560:380;const x=m?c:130,yy=m?65:175;
  b+=ring(x,yy,43)+t(x,yy-3,'Operator',16)+t(x,yy+18,'experience',14,muted);
  const rx=m?40:305,ry=m?168:50,rw=m?300:270;
  b+=flow(m?`M${c} 108 V168`:`M173 175 H305`,0);
  ['What changed?','Why did we act?','What happened next?'].forEach((s,n)=>b+=reveal(record(rx,ry+n*78,rw,s,['Condition and context','Reasoning behind the response','Outcome and limits'][n]),.4+n*.45));
  b+=flow(m?`M${c} 390 V450`:`M575 175 H662`,1.7);
  b+=reveal(ring(m?c:710,m?493:175,43)+t(m?c:710,m?489:171,'Next',16)+t(m?c:710,m?512:194,'operator',14,muted),2);
 }else if(slug==='fifty-steps-back'&&i===3){
  h=m?570:390;const x=m?c:180,cy=m?135:172,r=m?86:110;
  b+=flow(`M${x} ${cy-r} A${r} ${r} 0 1 1 ${x-1} ${cy-r}`,0);
  b+=t(x,cy-10,'Supervised',22)+t(x,cy+18,'pilot',22)+t(x,cy+45,'Learn · test · compare',12,muted);
  const gx=m?40:385,gy=m?300:100;
  b+=flow(m?`M${x} ${cy+r} V${gy}`:`M290 ${cy} H385`,1);
  b+=line(`M${gx} ${gy} V${gy+142}`,blue,4)+reveal(t(gx+18,gy+25,'EVIDENCE GATE',12,blue,'start')+t(gx+18,gy+58,'Reliable inputs',16,ink,'start')+t(gx+18,gy+86,'Known operating limits',16,ink,'start')+t(gx+18,gy+114,'Human override',16,ink,'start'),1.4);
  b+=reveal(note(m?c:690,m?510:175,'Expand carefully','Keep the ability to stop.'),2.2);
 }else if(slug==='fifty-steps-back'&&i===4){
  h=m?660:440;const left=m?18:30,right=m?210:485;
  b+=t(c,24,'LINK ALIASES. DO NOT MERGE DIFFERENT PUMPS.',m?11:14,blue);
  [['Pump 3A','P-03','Plant A / asset 017'],['Pump B2','PUMP-02','Plant B / asset 042']].forEach((a,n)=>{
   const y=65+n*(m?280:180);b+=record(left,y,m?155:190,a[0],'Local name')+record(left,y+80,m?155:190,a[1],'Work-order name');
   b+=flow(`M${left+(m?155:190)} ${y+33} H${right-20} V${y+74} H${right}`,n*.6)+flow(`M${left+(m?155:190)} ${y+113} H${right-20} V${y+74} H${right}`,n*.6+.2);
   b+=reveal(record(right,y+40,m?155:300,m?`Asset ${n===0?'017':'042'}`:a[2],m?`Plant ${n===0?'A':'B'} · same model`:'Unique identity · same pump model'),.6+n*.6);
   if(m)b+=t(c,y+210,`Keep plant ${n===0?'A':'B'}’s history attached to its own asset.`,12,muted);
  });b+=t(c,h-12,'Same model ≠ same physical asset.',m?16:18,blue);
 }else{
  h=m?490:385;const d=m?'M320 65 C150 20 40 125 65 235 S260 420 325 310':'M740 58 C550 10 230 30 115 170 S340 355 520 250 S700 215 775 160';
  b+=flow(d,0);
  const points=m?[[300,65,'Pause'],[66,235,'Understand'],[240,380,'Test + learn']]:[[715,61,'Pause'],[125,155,'Understand'],[440,294,'Test + learn']];
  points.forEach(([x,y,s],n)=>{b+=reveal(ring(x,y,8)+t(x,y+(n===1?40:-25),s,18),n*.7);});
  b+=reveal(t(m?c:620,m?460:335,'Move forward on firmer ground.',m?19:22,blue),2);
 }
 return {w,h,b};
}
function svg(slug,i,row,m){
 const {w,h,b}=compose(slug,i,m),id=`${slug}-${i}-${m?'m':'w'}`;
 return `<svg class="vital-graphic" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title ${id}-desc" style="font-family:var(--font-body,Inter,Arial,sans-serif)"><title id="${id}-title">${esc(row[0])}</title><desc id="${id}-desc">${esc(row[3])}</desc><style>.sl-flow{stroke-dasharray:1;stroke-dashoffset:0;animation:sl-draw 2.5s ease both}.sl-reveal{animation:sl-reveal 1.2s ease both;transform-box:fill-box;transform-origin:center}@keyframes sl-draw{0%{stroke-dashoffset:1}100%{stroke-dashoffset:0}}@keyframes sl-reveal{0%{opacity:.12;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.sl-flow,.sl-reveal{animation:none!important}}</style>${b}</svg>`;
}
for(const [slug,rows] of Object.entries(sets)){
 const dir=`public/images/articles/${slug}`;fs.mkdirSync(dir,{recursive:true});
 rows.forEach((row,i)=>{for(const mobile of [false,true])fs.writeFileSync(`${dir}/${i+1}${mobile?'-mobile':''}.svg`,svg(slug,i+1,row,mobile));});
}
fs.writeFileSync('src/data/companion-figures.json',JSON.stringify(sets,null,2)+'\n');
