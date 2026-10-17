// transcriptService.js - parse, validate, report, serialize
import Student from './Student.js';
import { calculateAverage, calculateGPA, calculateGrade as gradeOf } from './gradeUtils.js'; // aliased named import

export function parseTranscript(rawJson) {
  if (typeof rawJson !== 'string') throw new TypeError('Transcript data must be a JSON string');
  let data;
  try {
    data = JSON.parse(rawJson);
  } catch (error) {
    throw new SyntaxError(`Malformed JSON: ${error.message}`);
  }
  if (!Array.isArray(data)) throw new TypeError('Transcript JSON must contain an array of students');
  return data;
}

export function validateStudents(records) {
  const seenIds = new Set();
  return records.map((record, index) => {
    const label = `Record ${index}`;
    if (record === null || typeof record !== 'object') throw new TypeError(`${label}: student must be an object`);
    const { id, name, courses } = record;
    if (id === undefined || id === null || id === '') throw new TypeError(`${label}: student ID is missing`);
    if (seenIds.has(id)) throw new Error(`${label}: duplicate student ID ${id}`);
    seenIds.add(id);
    if (!Array.isArray(courses) || courses.length === 0) throw new TypeError(`${label} (ID ${id}): courses must be a non-empty array`);
    courses.forEach((course, i) => {
      if (!course || typeof course.code !== 'string' || course.code.trim() === '') throw new TypeError(`Student ${id}, course ${i}: course code is missing`);
      if (typeof course.marks !== 'number' || Number.isNaN(course.marks)) throw new TypeError(`Student ${id}, ${course.code}: marks must be a number`);
      if (course.marks < 0 || course.marks > 100) throw new RangeError(`Student ${id}, ${course.code}: marks ${course.marks} outside 0-100`);
    });
    return new Student(id, name, courses);
  });
}

export function buildReport(students) {
  const rows = students.map((s) => {
    const average = calculateAverage(s.marksList);
    return {
      id: s.id,
      name: s.name,
      courses: s.courses.map(({ code, marks }) => ({ code, marks, grade: gradeOf(marks) })),
      average,
      gpa: calculateGPA(s.marksList),
    };
  });
  return { totalStudents: rows.length, students: rows };
}

export function reportToJSON(report) {
  return JSON.stringify(report, null, 2);
}

export function processTranscript(rawJson) {
  return reportToJSON(buildReport(validateStudents(parseTranscript(rawJson))));
}
