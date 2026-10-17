// Task 7 - Promise-based Multi-Service Registration Engine
const students = {
  101: { id: 101, name: 'Ali', completed: ['CS301'], registered: [] },
  102: { id: 102, name: 'Sara', completed: [], registered: [] },
};
const courses = { CS401: { code: 'CS401', prerequisites: ['CS301'], seats: 1 }, CS402: { code: 'CS402', prerequisites: [], seats: 0 } };

function wait(ms, work) {
  return new Promise((resolve, reject) => setTimeout(() => {
    try { resolve(work()); } catch (error) { reject(error); }
  }, ms));
}

export const getStudent = (id) => wait(30, () => { if (!students[id]) throw new Error(`Student ${id} not found`); return students[id]; });
export const getCourse = (code) => wait(30, () => { if (!courses[code]) throw new Error(`Course ${code} not found`); return courses[code]; });
export const checkPrerequisites = (student, course) => wait(30, () => {
  const missing = course.prerequisites.filter((c) => !student.completed.includes(c));
  if (missing.length) throw new Error(`Missing prerequisites: ${missing.join(', ')}`);
  return true;
});
export const checkSeats = (course) => wait(30, () => { if (course.seats <= 0) throw new Error(`${course.code} is full`); return course.seats; });
export const registerStudent = (student, course) => wait(30, () => {
  if (student.registered.includes(course.code)) throw new Error('Already registered');
  student.registered.push(course.code);
  course.seats -= 1;
  return { studentId: student.id, course: course.code, status: 'REGISTERED' };
});
export const sendEmail = (s) => wait(20, () => `email sent to ${s.name}`);
export const sendSMS = (s, shouldFail = false) => wait(20, () => { if (shouldFail) throw new Error('SMS gateway down'); return `sms sent to ${s.name}`; });
export const writeAuditLog = (entry) => wait(20, () => `audit written for ${entry.studentId}`);

// ---- Part A: promise chain. Every .then RETURNS the next promise/value, otherwise the next stage receives undefined. ----
export function registerChain(studentId, courseCode) {
  const ctx = {}; // carries data from stage to stage
  return getStudent(studentId)
    .then((student) => { ctx.student = student; return getCourse(courseCode); })
    .then((course) => { ctx.course = course; return checkPrerequisites(ctx.student, course); })
    .then(() => checkSeats(ctx.course))
    .then(() => registerStudent(ctx.student, ctx.course))
    .then((confirmation) => ({ ...confirmation, student: ctx.student }));
}

// ---- Part B: allSettled gives the outcome of ALL three, even when one rejects ----
export function postRegistration(student, confirmation, smsShouldFail) {
  const services = ['Email', 'SMS', 'Audit'];
  return Promise.allSettled([sendEmail(student), sendSMS(student, smsShouldFail), writeAuditLog(confirmation)])
    .then((outcomes) => outcomes.map((o, i) => ({ service: services[i], status: o.status })));
}

// ---- Part C: two independent course servers ----
const serverA = () => wait(80, () => { throw new Error('Server A is down'); });         // fails fast
const serverB = () => wait(150, () => ({ code: 'CS401', title: 'AI Systems', from: 'B' })); // succeeds, slower
const serverC = () => wait(60, () => { throw new Error('Server C is down'); });

function registerFlow(studentId, courseCode, smsFails) {
  return registerChain(studentId, courseCode)
    .then(({ student, ...confirmation }) =>
      postRegistration(student, confirmation, smsFails).then((report) => ({ confirmation, report })))
    .catch((error) => { console.log('   registration stopped:', error.message); return null; })
    .finally(() => console.log('   (finally: flow for', studentId, courseCode, 'completed)'));
}

console.log('Part A + B: success, SMS fails');
registerFlow(101, 'CS401', true)
  .then((r) => { console.log(r.confirmation); console.table(r.report); })
  .then(() => { console.log('Part A: failures'); return registerFlow(102, 'CS401', false); })   // prerequisite missing
  .then(() => registerFlow(101, 'CS402', false))                                                // course full / not found path
  .then(() => registerFlow(999, 'CS401', false))                                                // unknown student
  .then(() => {
    console.log('Part C: Promise.any vs Promise.race');
    return Promise.race([serverA(), serverB()]).then((v) => console.log('   race     ->', v), (e) => console.log('   race     -> REJECTED:', e.message));
  })
  .then(() => Promise.any([serverA(), serverB()]).then((v) => console.log('   any      ->', v)))
  .then(() => Promise.any([serverA(), serverC()]).catch((e) => console.log('   any (all fail) ->', e.constructor.name, e.errors.map((x) => x.message))));

/* Justification:
   - Part A uses a plain chain because each step depends on the previous result.
   - Part B uses Promise.allSettled: the three services are independent and we want a status for each one;
     Promise.all would reject on the first failure and hide the other results.
   - Part C uses Promise.any: we want the first SUCCESSFUL server. Promise.race settles with whichever finishes
     first, even if that is a rejection (Server A fails at 80 ms, before B succeeds at 150 ms), so race would
     make the system fail although a healthy server exists. any ignores rejections and only rejects with an
     AggregateError when every server fails. */
