import { getApiBase } from '../config.js';
import { session } from './session.service.js';

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// One place that talks to the REST API: adds the token, parses JSON, throws ApiError.
async function request(method, path, body) {
  const token = session.token();
  const base = await getApiBase();
  let res;
  try {
    res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is it running?');
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401 && token) session.clear(); // token expired / invalid
    throw new ApiError(res.status, data?.error ||
      `Request failed (${res.status}). Start the server with "node server.js" and open http://localhost:3000`);
  }
  return data;
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  delete: (path) => request('DELETE', path),
};
