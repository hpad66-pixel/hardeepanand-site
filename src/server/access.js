// Validate the existing Cloudflare Access application, including requests to pages.dev.
// These defaults are public application identifiers, not credentials.
export const ACCESS_TEAM = 'https://apascorp.cloudflareaccess.com';
export const ACCESS_AUDIENCE = '121c3888e488618ca5c248cacf5ac3c0c8837885e171267e5a0de7bc06f72d3a';
const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
export async function verifyAccess(request, env = {}, fetcher = fetch) {
  try {
    const token = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!token || token.length > 16000) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const issuer = env.ACCESS_TEAM_DOMAIN || ACCESS_TEAM;
    const audience = env.ACCESS_AUD || ACCESS_AUDIENCE;
    if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)) return false;
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || !header.kid || claims.iss !== issuer || !Array.isArray(claims.aud) || !claims.aud.includes(audience)) return false;
    if (!Number.isFinite(claims.exp) || claims.exp <= now || (claims.nbf && claims.nbf > now)) return false;
    if (typeof claims.email !== 'string' || !claims.email) return false;
    if (env.ALLOWED_EMAIL && claims.email.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) return false;
    const response = await fetcher(`${issuer}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!response.ok) return false;
    const { keys } = await response.json();
    const jwk = keys?.find(key => key.kid === header.kid && key.kty === 'RSA');
    if (!jwk) return false;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch { return false; }
}
