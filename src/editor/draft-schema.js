export const MAX_DRAFT_BYTES = 512000;
export const validArticlePath = path => typeof path==='string' && /^\/(writing|climb)\/[a-z0-9-]+\/$/.test(path);
export const draftKey = path => `visual-drafts/v1/${path.slice(1,-1).replaceAll('/','--')}.json`;
export function validateDraft(input) {
 if(!input||typeof input!=='object'||input.schema!==1||!validArticlePath(input.articlePath)||!/^[a-f0-9]{64}$/.test(input.baseFingerprint||''))throw Error('Invalid article draft.');
 if(input.revision!==null && !/^[a-f0-9-]{36}$/.test(input.revision||''))throw Error('Invalid draft revision.');
 if(!Array.isArray(input.changes)||input.changes.length>1000)throw Error('Too many changes.');
 const seen=new Set();
 const changes=input.changes.map(c=>{
  if(!c||!/^([ts])\d{1,5}$/.test(c.id||'')||seen.has(c.id))throw Error('Invalid or repeated edit target.');seen.add(c.id);
  if(c.id[0]==='t'){
   if(typeof c.text!=='string'||c.text.length>12000)throw Error('Text is too long.');
   return {id:c.id,text:c.text};
  }
  const out={id:c.id};
  for(const k of ['dx','dy','scale','fontSize'])if(c[k]!==undefined){
   const n=c[k];if(typeof n!=='number'||!Number.isFinite(n)|| (k==='scale'?(n<.1||n>5):k==='fontSize'?(n<6||n>120):Math.abs(n)>2000))throw Error('Invalid diagram size or position.');out[k]=n;
  }
  for(const k of ['fill','stroke'])if(c[k]!==undefined){if(!/^(#[a-f\d]{6}|none)$/i.test(c[k]))throw Error('Use a six-digit color or none.');out[k]=c[k];}
  if(c.text!==undefined){if(typeof c.text!=='string'||c.text.length>2000)throw Error('Diagram label is too long.');out.text=c.text;}
  return out;
 });
 return {schema:1,articlePath:input.articlePath,baseFingerprint:input.baseFingerprint,revision:input.revision,changes};
}
