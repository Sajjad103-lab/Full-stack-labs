export const MAX_QTY = 20;

// Where is the API? Order of tries:
//  1. window.KK_API_BASE (set it yourself to force a URL)
//  2. same origin  (/api)  - when the page is served by `node server.js`
//  3. http://localhost:3000/api - when the page is opened from another local
//     server such as VS Code Live Server (the API allows cross-origin calls)
async function works(base) {
  try {
    const res = await fetch(base + '/health');
    const data = await res.json();
    return res.ok && data.status === 'ok';
  } catch { return false; }
}

let basePromise;
export function getApiBase() {
  basePromise ??= (async () => {
    if (window.KK_API_BASE) return window.KK_API_BASE;
    if (await works('/api')) return '/api';
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
    if (isLocal && await works('http://localhost:3000/api')) return 'http://localhost:3000/api';
    return '/api';
  })();
  return basePromise;
}
