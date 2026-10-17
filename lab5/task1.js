// Task 1 - Admission Decision and Data Sanitization Engine
const SUPPORTED_PROGRAMS = ['BSCS', 'BSSE', 'BSAI'];

// Explicit conversion. Empty/blank strings would silently become 0 with Number(), so reject them first.
function toNumber(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return NaN; // undefined, null, objects
  if (typeof value === 'string' && value.trim() === '') return NaN;      // '' is falsy-like but Number('') === 0
  return Number(value);
}

function toBoolean(value) {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return null; // unknown
}

function isInRange(n, min, max) {
  return n >= min && n <= max;
}

// Guard clauses: validate first, never calculate merit on bad data.
function validateApplicant(applicant) {
  if (applicant === null || typeof applicant !== 'object') {
    return { valid: false, errors: ['Applicant record is missing'], data: null };
  }
  const errors = [];
  const name = typeof applicant.name === 'string' ? applicant.name.trim() : '';
  if (!name) errors.push('name is missing');

  const numbers = {
    age: toNumber(applicant.age),
    matricMarks: toNumber(applicant.matricMarks),
    intermediateMarks: toNumber(applicant.intermediateMarks),
    entryTest: toNumber(applicant.entryTest),
  };
  for (const [field, value] of Object.entries(numbers)) {
    if (Number.isNaN(value)) errors.push(`${field} is missing or not a valid number`);
  }
  for (const field of ['matricMarks', 'intermediateMarks', 'entryTest']) {
    const v = numbers[field];
    if (!Number.isNaN(v) && !isInRange(v, 0, 100)) errors.push(`${field} must be between 0 and 100`);
  }
  if (!Number.isNaN(numbers.age) && !isInRange(numbers.age, 17, 30)) errors.push('age must be between 17 and 30');

  const program = typeof applicant.program === 'string' ? applicant.program.trim().toUpperCase() : '';
  switch (program) {
    case 'BSCS':
    case 'BSSE':
    case 'BSAI':
      break;
    default:
      errors.push(`unsupported program: "${applicant.program}"`);
  }

  const feePaid = toBoolean(applicant.feePaid);
  if (feePaid === null) errors.push('feePaid must be true or false');

  return { valid: errors.length === 0, errors, data: { id: applicant.id, name, program, feePaid, ...numbers } };
}

function calculateMerit({ matricMarks, intermediateMarks, entryTest }) {
  return matricMarks * 0.2 + intermediateMarks * 0.3 + entryTest * 0.5;
}

// Rules:
//  eligible  = merit >= 70 && entryTest >= 60 && intermediate >= 60
//  SELECTED  = eligible && merit >= 80 && feePaid   (strong merit and fee confirmed)
//  WAITING   = eligible but merit is 70-79.99 or fee not paid yet
//  REJECTED  = not eligible
function decideStatus(data, merit) {
  const eligible = merit >= 70 && data.entryTest >= 60 && data.intermediateMarks >= 60;
  if (!eligible) return 'REJECTED';
  return merit >= 80 && data.feePaid ? 'SELECTED' : 'WAITING';
}

export function processApplicant(applicant) {
  const { valid, errors, data } = validateApplicant(applicant);
  if (!valid) return { id: applicant?.id ?? null, status: 'INVALID DATA', errors, merit: null, program: data?.program ?? null };
  const merit = Number(calculateMerit(data).toFixed(2));
  return { id: data.id, name: data.name, program: data.program, merit, status: decideStatus(data, merit), errors: [] };
}

export function summarize(results) {
  const valid = results.filter((r) => r.status !== 'INVALID DATA');
  const merits = valid.map((r) => r.merit);
  const total = merits.reduce((sum, m) => sum + m, 0);
  const byProgram = results.reduce((acc, r) => {
    const key = r.program ?? 'UNKNOWN';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return {
    validApplicants: valid.length,
    invalidApplicants: results.length - valid.length,
    highestMerit: valid.length ? valid.reduce((a, b) => (b.merit > a.merit ? b : a)) : null,
    lowestMerit: valid.length ? Math.min(...merits) : null,
    averageMerit: valid.length ? Number((total / valid.length).toFixed(2)) : null,
    applicantsPerProgram: byProgram,
  };
}

export function processAll(applicants) {
  const results = [];
  for (const applicant of applicants) results.push(processApplicant(applicant));
  return { results, summary: summarize(results) };
}

// ---------- Demo: normal, boundary, invalid ----------
const applicants = [
  { id: 'A101', name: 'Sara Khan', age: '19', matricMarks: '91', intermediateMarks: '87', entryTest: '78', program: 'BSCS', feePaid: 'true' },
  { id: 'A102', name: 'Ahmed Ali', age: 'twenty', matricMarks: '88', intermediateMarks: '', entryTest: '72', program: 'BSSE', feePaid: 'false' },
  { id: 'A103', name: 'Hassan', age: '18', matricMarks: '76', intermediateMarks: '83', entryTest: '91', program: 'BSAI', feePaid: 'true' },
  // boundary cases
  { id: 'B201', name: 'Edge Merit', age: '17', matricMarks: '70', intermediateMarks: '70', entryTest: '70', program: 'BSCS', feePaid: 'true' },   // merit 70 exactly -> WAITING
  { id: 'B202', name: 'Edge Age', age: '30', matricMarks: '100', intermediateMarks: '100', entryTest: '100', program: 'BSSE', feePaid: 'true' }, // SELECTED
  { id: 'B203', name: 'Low Test', age: '20', matricMarks: '100', intermediateMarks: '100', entryTest: '59', program: 'BSAI', feePaid: 'true' },  // entry test < 60 -> REJECTED
  { id: 'B204', name: 'Fee Pending', age: '21', matricMarks: '90', intermediateMarks: '90', entryTest: '90', program: 'BSCS', feePaid: 'false' }, // WAITING
  // invalid cases
  { id: 'C301', name: 'Too Old', age: '31', matricMarks: '80', intermediateMarks: '80', entryTest: '80', program: 'BSCS', feePaid: 'true' },
  { id: 'C302', name: 'Bad Marks', age: '20', matricMarks: '101', intermediateMarks: '-5', entryTest: '80', program: 'BSCS', feePaid: 'true' },
  { id: 'C303', name: 'Wrong Program', age: '20', matricMarks: '80', intermediateMarks: '80', entryTest: '80', program: 'MBBS', feePaid: 'true' },
  { id: 'C304', name: '', age: null, matricMarks: undefined, intermediateMarks: '80', entryTest: 'abc', program: 'BSSE', feePaid: 'maybe' },
  null,
];

const { results, summary } = processAll(applicants);
console.table(results.map(({ id, name, program, merit, status }) => ({ id, name, program, merit, status })));
console.log('Errors for invalid records:');
results.filter((r) => r.status === 'INVALID DATA').forEach((r) => console.log(' ', r.id, '->', r.errors.join('; ')));
console.log('Summary:', summary);
