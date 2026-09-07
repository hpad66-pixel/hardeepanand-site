const icon = (paths) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const printer = icon('<path d="M7 8V3h10v5M7 17H4V9h16v8h-3"/><path d="M7 14h10v7H7zM17 11h.01"/>');
const envelope = icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>');
const linkedin = icon('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.01M11 17v-7m0 3c0-4 6-4 6 0v4"/>');
const plain = s => s.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&quot;', '"').trim();

export function addTakeawayActions(html, title, canonical) {
  return html.replace(/<section class="article-takeaways"[\s\S]*?<\/section>/, section => {
    const points = [...section.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m,i) => `${i+1}. ${plain(m[1])}`);
    const question = section.match(/<p class="takeaways-question">([\s\S]*?)<\/p>/)?.[1] || '';
    const body = `${title}\nBy Hardeep Anand · The Systems Lens\n\n${points.join('\n\n')}\n\n${plain(question)}\n\nRead the article: ${canonical}`;
    const mailto = `mailto:?subject=${encodeURIComponent(`Takeaways: ${title}`)}&amp;body=${encodeURIComponent(body)}`;
    const tools = `<div class="takeaway-actions" aria-label="Save or share these takeaways"><button type="button" class="takeaway-action" data-print-takeaways hidden>${printer}<span>Print takeaways</span></button><a class="takeaway-action" href="${mailto}">${envelope}<span>Email takeaways</span></a><a class="takeaway-action" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer">${linkedin}<span>Share on LinkedIn</span></a></div>`;
    const attribution = `<p class="takeaways-attribution">${title}<br>Hardeep Anand · The Systems Lens<br>${canonical}</p>`;
    return section.replace('<ol class="takeaways-list">', `${tools}<ol class="takeaways-list">`).replace('</section>', `${attribution}</section>`);
  });
}
