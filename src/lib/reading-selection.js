// Shared selection logic keeps empty, filtered, and growing archives consistent.
export function selectReadings(entries, {topic='All essays',query='',limit=6}={}) {
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matched=entries.filter(entry=>(topic==='All essays'||entry.topic===topic)&&words.every(word=>entry.searchText.toLocaleLowerCase().includes(word)));
 const visible=matched.slice(0,Math.max(1,Math.floor(limit)||6));
 return {ids:visible.map(entry=>entry.id),total:matched.length,hasMore:visible.length<matched.length};
}
