import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeCopySource} from '../functions/api/save.js';
test('partial copy edits preserve earlier source edits and unrelated fields',()=>{
 const source='export const copy = {"home.headline":"Earlier edit","about.p1":"Keep this"};';
 const merged=mergeCopySource(source,{'home.lede':'New edit'});
 assert(merged.includes('Earlier edit'));assert(merged.includes('Keep this'));assert(merged.includes('New edit'));
});
test('refuses unrecognized source rather than overwriting it',()=>assert.throws(()=>mergeCopySource('unexpected source',{'home.lede':'Change'})));
