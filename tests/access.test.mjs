import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAccess, ACCESS_TEAM, ACCESS_AUDIENCE } from '../src/server/access.js';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='test-key';
const enc=v=>Buffer.from(typeof v==='string'?v:JSON.stringify(v)).toString('base64url');
const certs=async()=>Response.json({keys:[jwk]});
const base={iss:ACCESS_TEAM,aud:[ACCESS_AUDIENCE],email:'owner@example.com',exp:Math.floor(Date.now()/1000)+300};
async function request(claims=base){const head=enc({alg:'RS256',kid:jwk.kid});const payload=enc(claims);const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(`${head}.${payload}`));return new Request('https://hardeepanand.com/api/save',{headers:{'Cf-Access-Jwt-Assertion':`${head}.${payload}.${Buffer.from(sig).toString('base64url')}`}});}
test('accepts a signed, unexpired token for this application',async()=>assert.equal(await verifyAccess(await request(),{},certs),true));
test('rejects unsigned spoofed assertions',async()=>assert.equal(await verifyAccess(new Request('https://hardeepanand.com/api/save',{headers:{'Cf-Access-Jwt-Assertion':'forged'}}),{},certs),false));
test('rejects expiration, wrong audience, wrong issuer and missing email',async()=>{for(const claim of [{exp:1},{aud:['another-app']},{iss:'https://other.cloudflareaccess.com'},{email:''}])assert.equal(await verifyAccess(await request({...base,...claim}),{},certs),false);});
test('enforces the configured owner identity',async()=>assert.equal(await verifyAccess(await request(),{ALLOWED_EMAIL:'someoneelse@example.com'},certs),false));
test('rejects a tampered signed token',async()=>{const r=await request();const parts=r.headers.get('Cf-Access-Jwt-Assertion').split('.');parts[1]=enc({...base,email:'attacker@example.com'});r.headers.set('Cf-Access-Jwt-Assertion',parts.join('.'));assert.equal(await verifyAccess(r,{},certs),false);});
