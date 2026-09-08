import fs from 'node:fs';
const critical=[21,22,3,14,9,17,10,13,17,11,23,34,19,20,27,23,26,14,23,20,21,14,19,15,20,35,26,20,32,31,25,26,22,26,23,21,40,22,60,28,36,27,84,39,46,40,23,51,35,45,57,98,142,372,606];
const high=[154,87,100,160,162,139,102,133,225,148,203,266,231,200,231,232,198,165,168,148,210,189,159,139,163,225,210,258,246,185,278,244,212,273,308,246,306,344,250,345,320,183,403,329,448,339,269,327,268,271,388,600,913,1177,1906];
const dir='public/images/articles/governance-at-operating-speed';
const rows=critical.map((c,i)=>({month:`${2022+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`,critical:c,high:high[i]}));
fs.writeFileSync(`${dir}/disclosures.csv`,'month,critical,high\n'+rows.map(r=>`${r.month},${r.critical},${r.high}`).join('\n')+'\n');
for(const mobile of [false,true]){
 const w=mobile?380:820,h=mobile?390:450,l=mobile?38:58,r=mobile?273:660,t=55,b=mobile?284:335;
 const ink='var(--text,#092b3e)',blue='var(--figure-accent,#174bc5)',muted='var(--text-dim,#52616a)',rule='var(--line,#d4d9d7)';
 const label=(x,y,s,size=13,color=muted,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
 const x=i=>l+i*(r-l)/54,y=v=>b-v*(b-t)/2000;
 let svg=label(l,25,'Monthly disclosed CVEs · 21 organizations',mobile?14:18,ink);
 for(const tick of [0,500,1000,1500,2000])svg+=`<path d="M${l} ${y(tick)}H${r}" stroke="${rule}" stroke-width="1"/>`+label(l-8,y(tick)+4,tick.toLocaleString('en-US'),mobile?11:13,muted,'end');
 for(const i of [0,12,24,36,48])svg+=label(x(i),b+25,String(2022+i/12),mobile?11:14,muted,'middle');
 [high,critical].forEach((values,index)=>{
  const color=index?ink:blue;
  svg+=`<polyline points="${values.map((v,i)=>`${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${mobile?2.4:3}" ${index?'stroke-dasharray="5 4"':''} stroke-linejoin="round"/>`;
  svg+=`<circle cx="${r}" cy="${y(values.at(-1))}" r="4" fill="${color}"/>`;
  svg+=label(r+10,y(values.at(-1))-4,index?'606':'1,906',mobile?18:23,color)+label(r+10,y(values.at(-1))+16,index?'Critical':'High',mobile?12:15,color);
 });
 svg+=label(l,h-37,'January 2022 – July 2026',mobile?13:16,ink)+label(l,h-14,'Luke Emberson / Epoch AI · CC BY 4.0',mobile?11:13);
 const id=`cve-${mobile?'m':'w'}`;
 fs.writeFileSync(`${dir}/disclosures${mobile?'-mobile':''}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" class="vital-graphic" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">Monthly high and critical vulnerability disclosures</title><desc id="${id}-desc">January 2022 to July 2026, 21 organizations. High severity is the solid cobalt line; critical is the dashed ink line. July values: 1,906 high and 606 critical. Counts measure public disclosures, not attacks. Adapted from Luke Emberson, Epoch AI, CC BY 4.0.</desc><g style="font-family:var(--font-body,Inter,Arial,sans-serif)">${svg}</g></svg>`);
}
console.log('Built source-attributed disclosure chart and CSV.');
