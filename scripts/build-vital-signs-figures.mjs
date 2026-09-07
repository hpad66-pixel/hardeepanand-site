import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Editable, deterministic editorial diagrams. All plotted curves are illustrative.
const out = path.resolve('public/images/articles/vital-signs/v3');
await fs.mkdir(out, { recursive: true });
const C = { paper: 'var(--bg, #f5f3ed)', field: 'var(--bg, #f5f3ed)', ink: 'var(--text, #092b3e)', soft: 'var(--text-dim, #52616a)', blue: 'var(--accent, #124f6b)', gold: 'var(--figure-accent, #174bc5)', red: 'var(--figure-accent, #174bc5)', dead: 'var(--line, #d4d9d7)', rule: 'var(--line, #d4d9d7)' };
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const text = (x,y,s,size=17,color=C.ink,anchor='start',serif=false) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" style="font-family:var(${serif ? "--font-display, 'Newsreader', Georgia, serif" : "--font-body, 'Inter', Arial, sans-serif"})">${esc(s)}</text>`;
const label = (x,y,s,anchor='start',color=C.soft) => `<text x="${x}" y="${y}" fill="${color}" font-size="13" letter-spacing="1.2" text-anchor="${anchor}" style="font-family:var(--font-label, 'Inter', Arial, sans-serif)">${esc(s)}</text>`;
const line = (x1,y1,x2,y2,color=C.rule,width=1,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const curve = (d,color=C.blue,width=2.5,extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (x,y,r,color=C.blue,fill=C.paper,width=2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="${width}"/>`;
const box = (x,y,w,h,fill=C.field,stroke=C.rule) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
const arrow = (x1,y1,x2,y2,color=C.gold) => line(x1,y1,x2,y2,color,2,`marker-end="url(#${color===C.blue?'blue':color===C.dead?'dead':'gold'})"`);
const group = (x,y,content) => `<g transform="translate(${x} ${y})">${content}</g>`;
const motionStyle = `<style>
  .vs-trace { stroke-dasharray:1; stroke-dashoffset:0; animation:vs-draw 4.6s ease both; }
  .vs-orbit { stroke-dasharray:5 95; opacity:0; animation:vs-orbit 4.8s linear both; }
  .vs-signal { stroke-dasharray:5 95; opacity:0; animation:vs-signal 4.6s ease both; }
  .vs-step { stroke-dasharray:1; stroke-dashoffset:0; animation:vs-step 4.8s ease both; }
  @keyframes vs-draw { 0%,8% {stroke-dashoffset:1} 72%,100% {stroke-dashoffset:0} }
  @keyframes vs-orbit {0%{opacity:0;stroke-dashoffset:25} 8%{opacity:1} 90%{opacity:1} 100%{opacity:0;stroke-dashoffset:-75} }
  @keyframes vs-signal {0%{opacity:0;stroke-dashoffset:5} 8%{opacity:1} 65%,88%{opacity:1;stroke-dashoffset:-95} 100%{opacity:0;stroke-dashoffset:-95} }
  @keyframes vs-step {0%{stroke-dashoffset:1;opacity:0} 15%,80%{stroke-dashoffset:0;opacity:1} 100%{stroke-dashoffset:0;opacity:0} }
  @media(prefers-reduced-motion:reduce){.vs-motion{animation:none!important}.vs-orbit,.vs-signal,.vs-step{display:none}}
</style>`;
const svg = (w,h,title,desc,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc" class="vital-graphic">${motionStyle}<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><defs>${['gold','blue','dead'].map(k=>`<marker id="${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="${C[k]}" stroke-width="1.5"/></marker>`).join('')}</defs>${body}</svg>`;
const traced = (d,color=C.blue) => curve(d,C.rule,1.5)+curve(d,color,2.5,'pathLength="1" class="vs-motion vs-trace"');
const signal = d => curve(d,C.ink,3,'pathLength="100" class="vs-motion vs-signal"');

function snapshot(m) {
  const w=m?380:820, panel=m?356:380;
  const snap = label(18,30,'01 / THE SNAPSHOT') + text(18,67,'A reading without a response.',23,C.ink,'start',true)
    + line(24,199,panel-24,199) + line(24,100,24,199)
    + circle(panel/2,143,6,C.red,C.red) + text(panel/2,126,'ONE READING',13,C.red,'middle')
    + text(panel/2,225,'Time →',14,C.soft,'middle')
    + text(18,268,m?'Describe the condition.':'A number can describe the condition.',m?20:16,C.soft)
    + text(18,296,m?'What changed it? Unknown.':'It cannot show what changed it.',m?20:16,C.soft);
  const trend = label(18,30,'02 / THE CURVE') + text(18,67,'The system answers back.',23,C.ink,'start',true)
    + line(24,199,panel-24,199) + line(24,100,24,199)
    + line(24,143,panel-24,143,C.rule,1,'stroke-dasharray="3 5"')
    + traced(`M24 163 C50 158 55 166 70 150 C90 138 96 95 122 100 S154 164 183 171 S230 159 257 174 S${panel-55} 177 ${panel-24} 177`,C.red)
    + line(132,91,132,203,C.gold,1.5,'stroke-dasharray="4 4"')
    + text(146,96,'Intervention',14,C.gold)
    + text(panel/2,225,'Time →',14,C.soft,'middle')
    + text(18,268,m?'Read before and after.':'Read the trend before and after.',m?20:16,C.soft)
    + text(18,296,m?'What explains the change?':'Then ask what explains the change.',m?20:16,C.soft);
  return svg(w,m?676:356,'From a snapshot to a response','A single point contrasts with a continuous illustrative curve. An intervention is marked on the curve.',
    m ? group(12,0,snap)+line(12,330,368,330)+group(12,350,trend) : group(0,12,snap)+line(410,20,410,329)+group(440,12,trend));
}

function loop(m) {
  const w=m?380:820, h=m?506:390, cx=w/2, cy=m?245:190, r=m?108:120;
  let b = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.gold}" stroke-width="2"/>`;
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="4" pathLength="100" class="vs-motion vs-orbit"/>`;
  b += curve(`M${cx+37} ${cy-r+6} Q${cx+67} ${cy-r+15} ${cx+84} ${cy-r+37}`,C.gold,2,'marker-end="url(#gold)"');
  b += curve(`M${cx-37} ${cy+r-6} Q${cx-67} ${cy+r-15} ${cx-84} ${cy+r-37}`,C.gold,2,'marker-end="url(#gold)"');
  b += text(cx,cy-11,'Steer by',27,C.ink,'middle',true)+text(cx,cy+22,'the response.',27,C.ink,'middle',true);
  const node=(x,y,head,sub)=>box(x-79,y-27,158,61)+text(x,y-3,head,18,C.ink,'middle')+text(x,y+20,sub,13,C.soft,'middle');
  if(m) {
    b+=node(cx,cy-r,'COMPARE','Actual vs. intended');
    b+=node(cx,cy+r,'MEASURE AGAIN','Did it improve?');
    b+=box(9,cy-23,100,48)+text(59,cy+6,'SENSE',16,C.blue,'middle');
    b+=box(271,cy-23,100,48)+text(321,cy+6,'ACT',16,C.gold,'middle');
  } else {
    b+=node(cx,cy-r,'COMPARE','Actual vs. intended')+node(cx,cy+r,'MEASURE AGAIN','Did it improve?');
    b+=box(37,151,178,78)+text(126,179,'SENSE',18,C.blue,'middle')+text(126,207,'Read the vital sign',15,C.soft,'middle');
    b+=box(605,151,178,78)+text(694,179,'ACT',18,C.gold,'middle')+text(694,207,'Change the system',15,C.soft,'middle');
    b+=arrow(215,190,285,190,C.blue)+arrow(535,190,605,190);
    b+=curve('M694 229 V310 H499',C.gold,1.5,'marker-end="url(#gold)"');
    b+=label(126,125,'THE INSTRUMENT','middle')+label(694,125,'THE INTERVENTION','middle');
  }
  return svg(w,m?320:350,'A measurement becomes a steering system','Sense, compare, act, and measure again form a continuous feedback loop.',m?group(0,-90,b):b);
}

function framework(m) {
  const w=m?380:820,h=m?666:456;
  const steps=[['01','Name the vital sign','Which number should the money move?'],['02','Draw the baseline','Establish the trend before the work.'],['03','Watch for the bend','Read the response after intervention.'],['04','Feed the answer forward','Let the result shape the next decision.']];
  let b='';
  if(m) {
    b+=line(34,60,34,574,C.gold,2);
    steps.forEach(([n,t,s],i)=>{
      const y=36+i*143;
      b+=circle(34,y+15,20,C.gold,C.paper,1.5)+text(34,y+20,n,14,C.gold,'middle');
      b+=`<circle cx="34" cy="${y+15}" r="23" fill="none" stroke="${C.ink}" stroke-width="2" pathLength="1" class="vs-motion vs-step" style="animation-delay:${i*.85}s;animation-duration:${4.8-i*.85}s"/>`;
      b+=text(68,y+9,t,22,C.ink,'start',true);
      const sub = i===0?['Which KPI should','the money change?']:i===1?['Read the trend','before the work.']:i===2?['Compare before','and after the work.']:['Use the result','in the next decision.'];
      b+=text(68,y+42,sub[0],20,C.soft)+text(68,y+69,sub[1],20,C.soft);
    });
    b+=curve('M34 582 L34 614 L353 614 L353 51 L321 51',C.gold,1.5,'stroke-dasharray="4 5" marker-end="url(#gold)"');
  } else {
    const nodes=[[36,44],[475,44],[475,265],[36,265]];
    b+=arrow(358,93,466,93)+arrow(638,153,638,250)+arrow(466,314,365,314)+arrow(197,251,197,162);
    steps.forEach(([n,t,s],i)=>{
      const [x,y]=nodes[i];
      b+=box(x,y,310,116)+label(x+20,y+28,n,'start',C.gold)+text(x+20,y+60,t,24,C.ink,'start',true);
      b+=`<path d="M${x+20} ${y+37}H${x+47}" fill="none" stroke="${C.ink}" stroke-width="2" pathLength="1" class="vs-motion vs-step" style="animation-delay:${i*.85}s;animation-duration:${4.8-i*.85}s"/>`;
      // Split the most verbose step to preserve readable labels.
      if(i===0) b+=text(x+20,y+88,'Which number should the money move?',15,C.soft);
      else b+=text(x+20,y+88,s,15,C.soft);
    });
    b+=text(410,209,'The Curve Test',28,C.ink,'middle',true)+label(410,233,'FOUR STEPS. ONE CLOSED LOOP.','middle');
  }
  return svg(w,m?630:397,'The Curve Test','Four steps: name the vital sign, draw the baseline, watch for the bend, and feed the answer forward into the next capital decision.',b);
}

function severed(m) {
  const w=m?380:820,h=m?588:358;
  const chart=(x,y,width)=>group(x,y,label(0,0,'THE WARNING')+line(0,106,width,106)+curve(`M0 92 C${width*.2} 95 ${width*.27} 66 ${width*.4} 72 S${width*.7} 33 ${width} 16`,C.blue,3)+text(0,139,'A worsening trend is visible.',16,C.soft));
  let b='';
  if(m) {
    b+=chart(36,36,304)+arrow(190,200,190,239,C.blue);
    b+=box(72,248,236,71)+text(190,276,'REPORTED',17,C.blue,'middle')+text(190,300,'The dashboard has the signal.',15,C.soft,'middle');
    b+=line(190,326,190,350,C.gold,2)+line(190,385,190,409,C.dead,2,'stroke-dasharray="4 4"');
    b+=signal('M190 326 L190 350');
    b+=text(211,373,'No decision follows.',16,C.gold);
    b+=line(181,360,198,352,C.gold,2)+line(181,373,198,365,C.gold,2);
    b+=box(72,421,236,71,C.paper,C.dead)+text(190,449,'UNCHANGED',17,C.soft,'middle')+text(190,473,'The capital plan stays the same.',15,C.soft,'middle');
  } else {
    b+=chart(28,70,213);
    b+=arrow(256,143,310,143,C.blue);
    b+=box(325,106,184,76)+text(417,135,'REPORTED',17,C.blue,'middle')+text(417,161,'Signal received',15,C.soft,'middle');
    b+=line(509,143,547,143,C.gold,2)+line(585,143,619,143,C.dead,2,'stroke-dasharray="4 4"');
    b+=signal('M509 143 L547 143');
    b+=line(552,133,563,150,C.gold,2)+line(565,133,576,150,C.gold,2);
    b+=text(565,92,'NO RESPONSE',13,C.gold,'middle');
    b+=box(630,106,166,76,C.paper,C.dead)+text(713,135,'UNCHANGED',17,C.soft,'middle')+text(713,161,'The capital plan',15,C.soft,'middle');
    b+=curve('M711 196 L711 274 L134 274 L134 248',C.dead,1.5,'stroke-dasharray="5 6"');
    b+=box(270,258,300,32,C.paper,C.paper)+text(420,280,'The result never informs the next decision.',15,C.soft,'middle');
  }
  return svg(w,m?510:303,'The severed loop','A worsening trend reaches a report, but a broken connection prevents a response. The capital plan stays unchanged.',b);
}

function records(m) {
  const w=m?380:820,h=m?710:441;
  const rows=[['SCADA HISTORY','Plant flow + time'],['RAINFALL RECORDS','Storm timing + intensity'],['BILLING + PRODUCTION','Water in + water billed']];
  let b='';
  if(m) {
    rows.forEach(([a,s],i)=>{let y=20+i*81;b+=box(22,y,336,67)+label(39,y+24,a)+text(39,y+49,s,18,C.blue);});
    b+=arrow(190,253,190,293,C.blue);
    b+=box(22,305,336,115)+label(190,332,'CONNECT & CHECK','middle',C.gold)+text(190,359,'Align dates, units and boundaries.',17,C.ink,'middle')+text(190,386,'Mark gaps. Compare like conditions.',17,C.soft,'middle');
    b+=arrow(190,429,190,465);
    b+=box(22,478,336,157)+label(43,507,'A BASELINE YOU CAN USE');
    b+=line(46,591,331,591)+traced('M46 576 C77 568 77 580 101 562 S136 570 159 552 S182 561 204 543 S243 553 269 532 S310 539 331 521');
  } else {
    rows.forEach(([a,s],i)=>{const y=40+i*105;b+=box(15,y,264,81)+label(32,y+29,a)+text(32,y+58,s,18,C.blue);b+=line(279,y+40,309,y+40,C.blue,1.5);});
    b+=line(309,80,309,290,C.blue,1.5)+arrow(309,185,343,185,C.blue);
    b+=box(355,91,213,190)+label(461,123,'CONNECT & CHECK','middle',C.gold)+text(461,161,'Align dates, units',18,C.ink,'middle')+text(461,186,'and boundaries.',18,C.ink,'middle')+line(380,203,543,203)+text(461,230,'Mark gaps. Compare',15,C.soft,'middle')+text(461,252,'like conditions.',15,C.soft,'middle');
    b+=arrow(576,185,612,185);
    b+=box(627,91,183,190)+label(718,123,'THE BASELINE','middle')+line(645,229,791,229)+traced('M645 212 C658 194 669 220 682 200 S709 208 722 186 S750 189 766 168 S783 174 791 156')+text(718,257,'A curve you can read',15,C.soft,'middle');
  }
  return svg(w,m?651:351,'From existing records to a usable baseline','SCADA, rainfall, billing and production records are aligned and checked to create a comparable baseline. The curve is illustrative.',b);
}

const figures = [
  ['01-snapshot-to-curve',snapshot],['02-feedback-loop',loop],['03-curve-test',framework],['04-severed-loop',severed],['05-connected-records',records],
];
const titles = ['From a snapshot to a response', 'The reading is only the beginning', 'Four steps. One closed loop.', 'All the data. None of the response.', 'The first project is connection'];
for (const [name,draw] of figures) {
  for (const mobile of [false,true]) {
    const prefix=`vs-${name.slice(0,2)}-${mobile?'mobile':'wide'}`;
    const source=draw(mobile).replace(/id="([^"]+)"/g,`id="${prefix}-$1"`).replace(/url\(#([^)]+)\)/g,`url(#${prefix}-$1)`).replace('aria-labelledby="title desc"',`aria-labelledby="${prefix}-title ${prefix}-desc"`);
    await fs.writeFile(path.join(out,`${name}${mobile?'-mobile':''}.svg`),source);
    if(!mobile) {
      const i=figures.findIndex(([n])=>n===name);
      const height=Number(source.match(/height="(\d+)"/)[1]);
      const framed=svg(820,height+148,titles[i],'An editorial diagram for The Systems Lens by Hardeep Anand.',
        label(410,28,`FIG. 0${i+1} / VITAL SIGNS`,'middle',C.gold)+
        text(410,80,titles[i],36,C.gold,'middle',true).replace('<text ', '<text font-style="italic" ')+group(0,104,source)+line(24,height+113,796,height+113)+
        text(24,height+131,'Hardeep Anand',14,C.soft)+text(796,height+131,'Conceptual schematic · hardeepanand.com',13,C.soft,'end'));
      // PNG is a static fallback. Resolve CSS variables for the raster renderer;
      // the actual SVGs retain their theme inheritance and animations.
      const raster=framed.replace(/var\(--[^,]+,\s*([^)]+)\)/g,'$1').replace(/<svg /,'<svg style="background:#f5f3ed" ');
      await sharp(Buffer.from(raster),{density:192}).flatten({background:'#f5f3ed'}).png().toFile(path.join(out,`${name}.png`));
    }
  }
}
console.log(`Created ${figures.length} editorial plates, 5 mobile compositions and 5 PNG exports in ${out}`);
