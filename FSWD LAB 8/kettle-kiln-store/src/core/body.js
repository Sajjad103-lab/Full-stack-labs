const HttpError = require('./http-error');

const MAX_BYTES = 1e6; // ~1 MB

// Read and parse the JSON request body. Always resolves to a plain object.
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let tooBig = false;
    req.on('data', (chunk) => {
      if (tooBig) return;
      raw += chunk;
      if (raw.length > MAX_BYTES) { tooBig = true; reject(new HttpError(413, 'Request body too large')); }
    });
    req.on('end', () => {
      if (tooBig) return;
      if (!raw) return resolve({});
      let value;
      try { value = JSON.parse(raw); }
      catch { return reject(new HttpError(400, 'Invalid JSON body')); }
      if (value === null || typeof value !== 'object' || Array.isArray(value))
        return reject(new HttpError(400, 'JSON body must be an object'));
      resolve(value);
    });
    req.on('error', reject);
  });
}

module.exports = { readJson };
