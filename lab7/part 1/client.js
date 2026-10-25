
const BASE = 'http://localhost:3002';

async function call(method, path, body) {
  const response = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  console.log(`${method} ${path} -> ${response.status}`, JSON.stringify(data));
  return data;
}

async function main() {
  // Student CRUD
  const s = await call('POST', '/students', { name: 'Ali', rollNo: '101', className: 'BSCS-5' });
  await call('GET', '/students');
  await call('GET', `/students/${s.id}`);
  await call('PUT', `/students/${s.id}`, { className: 'BSCS-6' });

  // Teacher CRUD
  const t = await call('POST', '/teachers', { name: 'Sir Ahmed', subject: 'Web Engineering' });
  await call('PUT', `/teachers/${t.id}`, { subject: 'Node.js' });
  await call('GET', '/teachers');

  // Attendance CRUD
  const a = await call('POST', '/attendance', { studentId: s.id, date: '2026-10-25', status: 'Present' });
  await call('PUT', `/attendance/${a.id}`, { status: 'Leave' });
  await call('GET', `/attendance?studentId=${s.id}`);

  // Marks CRUD
  const k = await call('POST', '/marks', { studentId: s.id, subject: 'Web Engineering', obtained: 42, total: 50 });
  await call('PUT', `/marks/${k.id}`, { obtained: 45 });
  await call('GET', `/marks?studentId=${s.id}`);

  // Validation example (student 99 does not exist)
  await call('POST', '/marks', { studentId: 99, subject: 'X', obtained: 1, total: 10 });

  // Report, then deletes
  await call('GET', `/students/${s.id}/report`);
  await call('DELETE', `/marks/${k.id}`);
  await call('DELETE', `/attendance/${a.id}`);
  await call('DELETE', `/teachers/${t.id}`);
  await call('DELETE', `/students/${s.id}`);
  await call('GET', `/students/${s.id}`);
}

main().catch((error) => { console.error('Start server 02 first:', error.message); process.exitCode = 1; });
