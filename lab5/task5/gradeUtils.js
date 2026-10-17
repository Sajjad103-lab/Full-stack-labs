// gradeUtils.js - named exports
const BANDS = [
  { min: 85, grade: 'A', points: 4.0 },
  { min: 80, grade: 'A-', points: 3.67 },
  { min: 75, grade: 'B+', points: 3.33 },
  { min: 70, grade: 'B', points: 3.0 },
  { min: 65, grade: 'B-', points: 2.67 },
  { min: 60, grade: 'C+', points: 2.33 },
  { min: 50, grade: 'C', points: 2.0 },
  { min: -Infinity, grade: 'F', points: 0 },
];

function bandFor(marks) {
  if (typeof marks !== 'number' || Number.isNaN(marks)) throw new TypeError(`marks must be a number, received ${typeof marks}`);
  if (marks < 0 || marks > 100) throw new RangeError(`marks must be between 0 and 100, received ${marks}`);
  return BANDS.find((band) => marks >= band.min);
}

export function calculateGrade(marks) {
  return bandFor(marks).grade;
}

export function calculateAverage(marksList) {
  if (!Array.isArray(marksList) || marksList.length === 0) throw new TypeError('marksList must be a non-empty array');
  return Number((marksList.reduce((sum, m) => sum + m, 0) / marksList.length).toFixed(2));
}

// Simple GPA: mean of the grade points of each course (all courses weighted equally).
export function calculateGPA(marksList) {
  if (!Array.isArray(marksList) || marksList.length === 0) throw new TypeError('marksList must be a non-empty array');
  const total = marksList.reduce((sum, m) => sum + bandFor(m).points, 0);
  return Number((total / marksList.length).toFixed(2));
}
