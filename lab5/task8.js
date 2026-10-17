// Task 8 - Concurrent Academic API Aggregator with async/await
export class HttpError extends Error { constructor(status, url) { super(`HTTP ${status} for ${url}`); this.name = 'HttpError'; this.status = status; } }
export class NetworkError extends Error { constructor(url, cause) { super(`Network failure for ${url}: ${cause.message}`); this.name = 'NetworkError'; } }
export class JsonParseError extends Error { constructor(url, cause) { super(`Invalid JSON from ${url}: ${cause.message}`); this.name = 'JsonParseError'; } }
export class TimeoutError extends Error { constructor(url, ms) { super(`Request to ${url} timed out after ${ms} ms`); this.name = 'TimeoutError'; } }

const DATA = {
  '/users': [
    { id: 1, name: 'Ali', department: 'CS' }, { id: 2, name: 'Sara', department: 'CS' }, { id: 3, name: 'Usman', department: 'SE' },
    { id: 4, name: 'Hina', department: 'AI' }, { id: 5, name: 'Ahmed', department: 'SE' }, { id: 6, name: 'Zoya', department: 'AI' },
  ],
  '/courses': [{ code: 'FSWD', title: 'Full Stack Web Dev' }, { code: 'AI101', title: 'Intro to AI' }, { code: 'DB201', title: 'Databases' }],
  '/results': [
    { studentId: 1, course: 'FSWD', marks: 82 }, { studentId: 2, course: 'FSWD', marks: 91 }, { studentId: 3, course: 'FSWD', marks: 47 },
    { studentId: 4, course: 'FSWD', marks: 73 }, { studentId: 5, course: 'FSWD', marks: 64 }, { studentId: 6, course: 'FSWD', marks: 91 },
  ],
};

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });
}

// Behaves like fetch(): resolves with a response-shaped object, rejects on network failure / abort.
export async function fakeFetch(url, { signal } = {}) {
  await delay(url === '/slow' ? 3000 : 100, signal);
  if (url === '/network-error') throw new TypeError('fetch failed');
  const status = url === '/missing' ? 404 : url === '/broken' ? 500 : 200;
  const ok = status >= 200 && status < 300;
  return {
    ok, status,
    async json() {
      if (url === '/bad-json') return JSON.parse('{ not valid json');
      return DATA[url] ?? { message: url === '/slow' ? 'finally!' : 'ok' };
    },
  };
}

export async function getJSON(url, fetchImplementation) {
  let response;
  try {
    response = await fetchImplementation(url);
  } catch (error) {
    if (error.name === 'AbortError') throw error;     // let timeout handling see it
    throw new NetworkError(url, error);
  }
  if (!response.ok) throw new HttpError(response.status, url);
  try {
    return await response.json();
  } catch (error) {
    throw new JsonParseError(url, error);
  }
}

export async function fetchWithTimeout(url, milliseconds, fetchImplementation = fakeFetch) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), milliseconds);
  try {
    return await getJSON(url, (u) => fetchImplementation(u, { signal: controller.signal }));
  } catch (error) {
    if (error.name === 'AbortError') throw new TimeoutError(url, milliseconds);
    throw error;
  } finally {
    clearTimeout(timerId); // runs on success AND failure
  }
}

export function buildDashboard(users, courses, results) {
  const marksByStudent = results.reduce((acc, r) => ({ ...acc, [r.studentId]: [...(acc[r.studentId] ?? []), r.marks] }), {});
  const perStudent = users.map((u) => {
    const marks = marksByStudent[u.id] ?? [];
    return { ...u, average: marks.length ? marks.reduce((s, m) => s + m, 0) / marks.length : null };
  });
  const graded = perStudent.filter((s) => s.average !== null);
  const top = graded.reduce((best, s) => (s.average > best.average ? s : best));
  const overall = results.reduce((sum, r) => sum + r.marks, 0) / results.length;
  const departments = graded.reduce((acc, s) => {
    const d = acc[s.department] ?? { students: 0, total: 0, failed: 0 };
    return { ...acc, [s.department]: { students: d.students + 1, total: d.total + s.average, failed: d.failed + (s.average < 50 ? 1 : 0) } };
  }, {});
  return {
    totalStudents: users.length,
    totalCourses: courses.length,
    overallAverage: Number(overall.toFixed(2)),
    topStudent: { name: top.name, average: Number(top.average.toFixed(2)) },
    failedStudents: graded.filter((s) => s.average < 50).length,
    departments: Object.fromEntries(Object.entries(departments).map(([k, v]) => [k, { students: v.students, average: Number((v.total / v.students).toFixed(2)), failed: v.failed }])),
  };
}

export async function loadDashboard(fetchImplementation = fakeFetch) {
  // all three start immediately; total time ~ slowest call, not the sum
  const [users, courses, results] = await Promise.all([
    getJSON('/users', fetchImplementation),
    getJSON('/courses', fetchImplementation),
    getJSON('/results', fetchImplementation),
  ]);
  return buildDashboard(users, courses, results);
}

// ---------------- demo ----------------
const started = performance.now();
const dashboard = await loadDashboard();
console.log(`Dashboard loaded in ${Math.round(performance.now() - started)} ms (3 calls x 100 ms each, so concurrent, not ~300 ms)`);
console.log(dashboard);

const scenarios = [
  ['/users', 500, 'success'], ['/missing', 500, '404'], ['/broken', 500, '500'],
  ['/network-error', 500, 'network failure'], ['/bad-json', 500, 'invalid JSON'], ['/slow', 300, 'slow -> timeout'],
];
for (const [url, ms, label] of scenarios) {
  try {
    const data = await fetchWithTimeout(url, ms);
    console.log(`[${label}] OK ->`, Array.isArray(data) ? `${data.length} records` : data);
  } catch (error) {
    console.log(`[${label}] ${error.name}: ${error.message}`);
  }
}
// Promise.all fails fast if one service fails:
try { await Promise.all([getJSON('/users', fakeFetch), getJSON('/broken', fakeFetch)]); }
catch (error) { console.log('Dashboard with one failing service ->', error.name, error.message); }
