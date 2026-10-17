// main.js - caller: demonstrates try / catch / finally, default + named imports, aliasing
import Student from './Student.js';
import { calculateGPA as gpaOf, calculateGrade } from './gradeUtils.js';
import { processTranscript } from './transcriptService.js';

const rawData = `
[
  { "id": 101, "name": "Ali", "courses": [ { "code": "CS301", "marks": 81 }, { "code": "CS302", "marks": 74 } ] },
  { "id": 102, "name": "Sara", "courses": [ { "code": "CS301", "marks": 93 }, { "code": "CS302", "marks": 55 } ] }
]`;

const cases = [
  ['valid data', rawData],
  ['malformed JSON', '[{ "id": 1, "name": "X", '],
  ['not an array', '{"id": 1}'],
  ['missing student ID', '[{"name":"Ali","courses":[{"code":"CS1","marks":50}]}]'],
  ['duplicate ID', '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":50}]},{"id":1,"name":"B","courses":[{"code":"CS1","marks":60}]}]'],
  ['marks above 100', '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":101}]}]'],
  ['marks below 0', '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":-1}]}]'],
  ['missing course code', '[{"id":1,"name":"A","courses":[{"marks":70}]}]'],
  ['marks not a number', '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":"70"}]}]'],
];

for (const [label, input] of cases) {
  try {
    const json = processTranscript(input);
    console.log(`[OK]   ${label}\n${json}`);
  } catch (error) {
    console.log(`[FAIL] ${label} -> ${error.name}: ${error.message}`);
  } finally {
    console.log(`       (finished processing "${label}")`);
  }
}

console.log('\nDefault import Student:', new Student(1, 'Demo', [{ code: 'X', marks: 90 }]));
console.log('Alias gpaOf([90, 60]) =', gpaOf([90, 60]), '| calculateGrade(77) =', calculateGrade(77));
