

const http = require('node:http');

// ---------- In-memory "database" ----------
const db = {
  students:   { items: [], nextId: 1 },
  teachers:   { items: [], nextId: 1 },
  attendance: { items: [], nextId: 1 },
  marks:      { items: [], nextId: 1 },
};

const studentExists = (id) => db.students.items.some((s) => s.id === Number(id));

// ---------- Validation rules per module ----------
const rules = {
  students: {
    required: ['name', 'rollNo', 'className'],
    unique: ['rollNo'],
  },
  teachers: {
    required: ['name', 'subject'],
    unique: [],
  },
  attendance: {
    required: ['studentId', 'date', 'status'],
    unique: [],
    check: (b) => {
      if (!studentExists(b.studentId)) return 'studentId does not exist';
      if (!['Present', 'Absent', 'Leave'].includes(b.status))
        return 'status must be Present, Absent or Leave';
    },
  },
  marks: {
    required: ['studentId', 'subject', 'obtained', 'total'],
    unique: [],
    check: (b) => {
      if (!studentExists(b.studentId)) return 'studentId does not exist';
      if (isNaN(b.obtained) || isNaN(b.total) || Number(b.total) <= 0)
        return 'obtained and total must be numbers (total > 0)';
      if (Number(b.obtained) < 0 || Number(b.obtained) > Number(b.total))
        return 'obtained must be between 0 and total';
    },
  },
};

function validate(module, body, ignoreId) {
  const rule = rules[module];
  for (const f of rule.required)
    if (body[f] === undefined || body[f] === '') return `${f} is required`;
  for (const f of rule.unique)
    if (db[module].items.some((i) => i[f] === body[f] && i.id !== ignoreId))
      return `${f} must be unique`;
  return rule.check ? rule.check(body) : null;
}

// ---------- Helper: read and parse JSON request body ----------
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ---------- Server ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // Objects can't be sent directly by res.end(), so we stringify to JSON text.
  const reply = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  };

  try {
    // ----- Original routes -----
    if (req.method === 'GET' && url.pathname === '/health') {
      return reply(200, { status: 'ok' });
    }
    if (req.method === 'GET' && url.pathname === '/hello') {
      return reply(200, { message: `Hello ${url.searchParams.get('name') ?? 'Guest'}` });
    }

    // ----- Bonus: student report  GET /students/:id/report -----
    const rep = url.pathname.match(/^\/students\/(\d+)\/report$/);
    if (req.method === 'GET' && rep) {
      const id = Number(rep[1]);
      const student = db.students.items.find((s) => s.id === id);
      if (!student) return reply(404, { error: 'students not found' });
      const attendance = db.attendance.items.filter((a) => a.studentId === id);
      const marks = db.marks.items.filter((m) => m.studentId === id);
      const present = attendance.filter((a) => a.status === 'Present').length;
      return reply(200, {
        student,
        attendancePercent: attendance.length
          ? Number(((present / attendance.length) * 100).toFixed(1)) : null,
        attendance,
        marks,
      });
    }

    // ----- CRUD routes: /students, /teachers, /attendance, /marks -----
    const m = url.pathname.match(/^\/(students|teachers|attendance|marks)(?:\/(\d+))?$/);
    if (m) {
      const module = m[1];
      const id = m[2] ? Number(m[2]) : null;
      const store = db[module];

      // CREATE
      if (req.method === 'POST' && id === null) {
        const body = await readJson(req);
        const err = validate(module, body);
        if (err) return reply(400, { error: err });
        const item = { id: store.nextId++, ...body };
        if (item.studentId !== undefined) item.studentId = Number(item.studentId);
        store.items.push(item);
        return reply(201, item);
      }

      // READ ALL (optional filter e.g. /marks?studentId=1)
      if (req.method === 'GET' && id === null) {
        let list = store.items;
        for (const [k, v] of url.searchParams)
          list = list.filter((i) => String(i[k]) === v);
        return reply(200, list);
      }

      // READ ONE
      if (req.method === 'GET' && id !== null) {
        const item = store.items.find((i) => i.id === id);
        if (!item) return reply(404, { error: `${module} not found` });
        return reply(200, item);
      }

      // UPDATE
      if ((req.method === 'PUT' || req.method === 'PATCH') && id !== null) {
        const idx = store.items.findIndex((i) => i.id === id);
        if (idx === -1) return reply(404, { error: `${module} not found` });
        const body = await readJson(req);
        const merged = { ...store.items[idx], ...body, id };
        const err = validate(module, merged, id);
        if (err) return reply(400, { error: err });
        if (merged.studentId !== undefined) merged.studentId = Number(merged.studentId);
        store.items[idx] = merged;
        return reply(200, merged);
      }

      // DELETE
      if (req.method === 'DELETE' && id !== null) {
        const idx = store.items.findIndex((i) => i.id === id);
        if (idx === -1) return reply(404, { error: `${module} not found` });
        const [removed] = store.items.splice(idx, 1);
        if (module === 'students') { // cascade
          db.attendance.items = db.attendance.items.filter((a) => a.studentId !== id);
          db.marks.items = db.marks.items.filter((x) => x.studentId !== id);
        }
        return reply(200, { message: `${module} deleted`, removed });
      }

      return reply(405, { error: 'Method not allowed' });
    }

    reply(404, { error: 'Route not found' });
  } catch (error) {
    reply(400, { error: error.message });
  }
});

server.listen(3002, () => console.log('Try http://localhost:3002/students'));
