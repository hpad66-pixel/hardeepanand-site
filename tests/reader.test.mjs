import test from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {safeReader} from '../src/server/ideas.js';
test('private reader preserves text and inline styles but removes active content',async()=>{
const html='<html><head><meta http-equiv="refresh" content="0;url=https://example.com"><style>h1{color:navy}</style></head><body><h1 onclick="alert(1)">A private idea</h1><script>alert(1)</script><iframe src="https://example.com"></iframe><a href="https://example.com" ping="https://example.com">External</a><img src="https://example.com/track"><form action="https://example.com"><input></form></body></html>';
const mf=new Miniflare({modules:true,script:`${safeReader.toString()}\nexport default {fetch(){return safeReader(new Response(${JSON.stringify(html)}));}}`});
try{const response=await mf.dispatchFetch('http://localhost/');const body=await response.text();assert.match(body,/A private idea/);assert.match(body,/h1\{color:navy\}/);assert.doesNotMatch(body,/<script|<iframe|<meta|<form|onclick=|https:\/\/example/);assert.match(response.headers.get('content-security-policy'),/script-src 'none'/);assert.match(response.headers.get('content-security-policy'),/sandbox/);assert.match(response.headers.get('cache-control'),/no-store/);}finally{await mf.dispose();}
});
