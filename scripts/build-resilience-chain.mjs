import { mkdirSync, writeFileSync } from 'node:fs';
const dir = 'public/images/articles/governance-at-operating-speed';
mkdirSync(dir, { recursive: true });
const labels = [['Data','Trusted sources'],['AI','Bounded permissions'],['Handoffs','Shared ownership'],['Resources','Money + time'],['Recovery','Practiced together']];
for (const mobile of [false,true]) {
  const id = `resilience-chain-${mobile ? 'mobile' : 'wide'}`;
  const width = mobile ? 360 : 840, height = mobile ? 535 : 275;
  let links = '';
  for (let i=0;i<5;i++) {
    const x = mobile ? 76 : 110+i*155, y = mobile ? 64+i*100 : 120;
    const scale = mobile ? .73 : 1;
    const angle = mobile ? (i%2 ? 64 : 116) : (i%2 ? -23 : 23);
    const shape = i === 2 ? '<path d="M-44-30 H36 M70-25 A30 30 0 0 1 55 30 H-55 A30 30 0 0 1-55-30 H-44"/><path class="chain-repair" d="M36-30 H55 A30 30 0 0 1 70-25" pathLength="1"/>' : '<rect x="-85" y="-30" width="170" height="60" rx="30"/>';
    links += `<g class="chain-link ${i===2?'chain-weak':''} ${i>2?'chain-beyond':''}" transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" fill="none" stroke="${i===2?'var(--chain-blue,#174bc5)':'var(--text,#092b3e)'}" stroke-width="7" stroke-linecap="round">${shape}</g>`;
    links += mobile ? `<g transform="translate(160 ${y-7})"><text class="chain-label" font-size="17" font-weight="600" fill="${i===2?'var(--chain-blue,#174bc5)':'var(--text,#092b3e)'}">${labels[i][0]}</text><text y="24" font-size="12" fill="var(--text-dim,#52616a)">${labels[i][1]}</text>${i===2?'<text y="44" font-size="11" fill="var(--chain-blue,#174bc5)">The connection to strengthen</text>':''}</g>` : `<g text-anchor="middle" transform="translate(${x} ${i%2 ? 26 : 225})"><text font-size="16" font-weight="600" fill="${i===2?'var(--chain-blue,#174bc5)':'var(--text,#092b3e)'}">${labels[i][0]}</text><text y="22" font-size="12" fill="var(--text-dim,#52616a)">${labels[i][1]}</text></g>`;
  }
  writeFileSync(`${dir}/resilience-chain${mobile?'-mobile':''}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" style="font-family:Inter,Arial,sans-serif"><title id="${id}-title">Strengthening the shared handoff</title><desc id="${id}-desc">Five interlocking links represent data, AI, handoffs, resources, and recovery. In the original view, the cobalt handoff link has a gap; the supported view closes it. It represents an unclear responsibility between teams, not an individual at fault. Agreeing an owner and a witnessed check strengthens this connection; every other link still needs care. Conceptual illustration, not a measured resilience score.</desc>${links}</svg>\n`);
}
