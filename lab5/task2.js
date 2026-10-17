// Task 2 - Academic Performance Intelligence Engine (array methods, no index loops)
const results = [
  { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
  { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
  { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
  { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
  { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
  { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 },
];

// ---- A. Result processing ----
// Grading table checked from the highest band down. First match wins.
const GRADING = [
  { min: 85, grade: 'A', points: 4.0 },
  { min: 80, grade: 'A-', points: 3.67 },
  { min: 75, grade: 'B+', points: 3.33 },
  { min: 70, grade: 'B', points: 3.0 },
  { min: 65, grade: 'B-', points: 2.67 },
  { min: 60, grade: 'C+', points: 2.33 },
  { min: 50, grade: 'C', points: 2.0 },
  { min: -Infinity, grade: 'F', points: 0 },
];

function gradeFor(marks) {
  return GRADING.find((band) => marks >= band.min);
}

const processed = results.map((student) => {
  const { grade, points } = gradeFor(student.marks);
  return { ...student, grade, gradePoints: points, status: grade === 'F' ? 'FAIL' : 'PASS' };
});
console.log('A. Processed results'); console.table(processed);

// ---- B. Ranked merit list (copy first: sort() MUTATES the array it is called on) ----
const ranked = [...results].sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name));
console.log('B. Ranking'); console.table(ranked.map(({ name, marks }, i) => ({ rank: i + 1, name, marks })));
console.log('   original order unchanged:', results.map((r) => r.name).join(', '));

// ---- C. Department statistics (works for any new department such as DS) ----
function departmentStats(list) {
  return list.reduce((acc, { department, marks }) => {
    const current = acc[department] ?? { students: 0, total: 0, highest: -Infinity, passed: 0 };
    return {
      ...acc,
      [department]: {
        students: current.students + 1,
        total: current.total + marks,
        highest: Math.max(current.highest, marks),
        passed: current.passed + (marks >= 50 ? 1 : 0),
      },
    };
  }, {});
}
function withAverages(stats) {
  return Object.fromEntries(
    Object.entries(stats).map(([dept, { total, ...rest }]) => [dept, { students: rest.students, average: Number((total / rest.students).toFixed(2)), highest: rest.highest, passed: rest.passed }])
  );
}
console.log('C. Department statistics'); console.log(withAverages(departmentStats(results)));
console.log('   with a new DS department:', withAverages(departmentStats([...results, { id: 7, name: 'Noor', department: 'DS', course: 'FSWD', marks: 88 }])).DS);

// ---- D. Academic queries ----
const average = results.reduce((sum, r) => sum + r.marks, 0) / results.length;
console.log('D. Queries');
console.log('   first student > 85         :', results.find((r) => r.marks > 85)?.name);
console.log('   index of first failed      :', processed.findIndex((r) => r.status === 'FAIL'));
console.log('   at least one failed        :', processed.some((r) => r.status === 'FAIL'));
console.log('   all marks within 0-100     :', results.every((r) => Number.isFinite(r.marks) && r.marks >= 0 && r.marks <= 100));
console.log(`   above average (${average.toFixed(2)})   :`, results.filter((r) => r.marks > average).map((r) => r.name));
console.log('   top three names            :', ranked.slice(0, 3).map((r) => r.name));
console.log('   [mutating methods used: sort() only, always on a copy; map/filter/slice never mutate]');
