// Task 6 - Legacy Course Registration using error-first callbacks (no Promises, no async/await)
const students = {
  101: { id: 101, name: 'Ali', completed: ['CS301', 'CS302'], registered: [] },
  102: { id: 102, name: 'Sara', completed: [], registered: [] },
  103: { id: 103, name: 'Usman', completed: ['CS301'], registered: ['CS401'] },
};
const courses = {
  CS401: { code: 'CS401', prerequisites: ['CS301'], seats: 2 },
  CS402: { code: 'CS402', prerequisites: [], seats: 0 },
};

// Each stage calls its callback EXACTLY once, always through `return callback(...)`.
function loadStudent(studentId, callback) {
  setTimeout(() => {
    const student = students[studentId];
    if (!student) return callback(new Error(`Student ${studentId} does not exist`));
    return callback(null, student);
  }, 50);
}

function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const course = courses[courseCode];
    if (!course) return callback(new Error(`Course ${courseCode} does not exist`));
    const missing = course.prerequisites.filter((code) => !student.completed.includes(code));
    if (missing.length > 0) return callback(new Error(`Prerequisite not completed: ${missing.join(', ')}`));
    return callback(null, course);
  }, 50);
}

function checkSeats(course, callback) {
  setTimeout(() => {
    if (course.seats <= 0) return callback(new Error(`Course ${course.code} is full`));
    return callback(null, course);
  }, 50);
}

function registerCourse(student, course, callback) {
  setTimeout(() => {
    if (student.registered.includes(course.code)) return callback(new Error(`Student ${student.id} is already registered in ${course.code}`));
    student.registered.push(course.code);
    course.seats -= 1;
    return callback(null, { studentId: student.id, course: course.code, status: 'REGISTERED' });
  }, 50);
}

// The dependent sequence. Every error stops the flow because we `return done(error)` immediately.
function registerForCourse(studentId, courseCode, done) {
  loadStudent(studentId, (err1, student) => {
    if (err1) return done(err1);
    checkPrerequisites(student, courseCode, (err2, course) => {
      if (err2) return done(err2);
      checkSeats(course, (err3, openCourse) => {
        if (err3) return done(err3);
        registerCourse(student, openCourse, (err4, confirmation) => {
          if (err4) return done(err4);
          return done(null, confirmation);
        });
      });
    });
  });
}

// Test runner (also callback based): runs one case after another.
const tests = [
  [101, 'CS401', 'success'],
  [999, 'CS401', 'student does not exist'],
  [102, 'CS401', 'prerequisite not completed'],
  [101, 'CS402', 'course is full'],
  [103, 'CS401', 'already registered'],
  [101, 'CS401', 'registering the same student twice'],
];
function runTest(i) {
  if (i === tests.length) return console.log('All tests finished');
  const [studentId, courseCode, label] = tests[i];
  return registerForCourse(studentId, courseCode, (error, result) => {
    if (error) console.log(`[${label}] FAILED: ${error.message}`);
    else console.log(`[${label}] OK:`, result);
    runTest(i + 1);
  });
}
runTest(0);

/* Why callbacks do not scale:
   1. Nesting ("callback hell"): every extra dependent step pushes the code one level deeper (pyramid of doom),
      so reading order no longer matches execution order and adding/removing a step means re-indenting everything.
   2. Error handling is manual and repeated: each level needs its own `if (err) return done(err)`. Forgetting one
      guard, or forgetting `return`, lets the flow continue with undefined data, or calls the callback twice.
   3. No central place for errors (no try/catch across async boundaries) and no easy way to run steps in parallel,
      retry, or add a timeout. Promises and async/await solve these problems (Tasks 7 and 8). */
