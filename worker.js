/* SiteLens personal CORS proxy — deploy as a free Cloudflare Worker.

   1. Sign in / sign up at https://dash.cloudflare.com
   2. Workers & Pages → Create Worker → give it a name → Deploy
   3. Edit code → replace everything with this file → Save and Deploy
   4. Copy your worker URL (https://<name>.<account>.workers.dev),
      append "/?url=" and paste it into SiteLens → ⚙ Proxy settings.

   Free tier: 100,000 requests/day — plenty for personal auditing. */

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': '*',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const target = new URL(request.url).searchParams.get('url');
    if (!target) return new Response('Usage: ?url=https://example.com', { status: 400, headers: CORS });
    try {
      const res = await fetch(target, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteLens/1.0)' },
      });
      const body = await res.arrayBuffer();
      return new Response(body, {
        status: res.status,
        headers: { ...CORS, 'content-type': res.headers.get('content-type') || 'text/html; charset=utf-8' },
      });
    } catch (e) {
      return new Response('Proxy error: ' + e, { status: 502, headers: CORS });
    }
  },
};
