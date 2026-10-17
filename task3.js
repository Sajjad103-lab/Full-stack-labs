// Task 3 - Safe Student Profile Update Service
const student = {
  id: 101, name: 'Ali', marks: 0, scholarship: false,
  address: { city: 'Islamabad', sector: 'F-10' },
  contact: { email: 'ali@university.edu' },
};
const update = {
  name: 'Ali Khan',
  address: { city: 'Rawalpindi' },
  contact: { phone: '03001234567' },
};

// Main service: returns a NEW object, never touches the originals.
function updateStudent(current, changes = {}) {
  // object rest: separate nested objects from simple fields
  const { address: oldAddress = {}, contact: oldContact = {}, ...oldRest } = current;
  const { address: newAddress, contact: newContact, ...newRest } = changes;

  // nullish coalescing keeps valid falsy values (0, false, '') and only falls back on null/undefined
  const merged = {};
  for (const key of Object.keys(oldRest)) merged[key] = newRest[key] ?? oldRest[key];
  // fields that exist only in the update (new simple properties)
  const extras = Object.fromEntries(Object.entries(newRest).filter(([k, v]) => !(k in oldRest) && v !== undefined));

  return {
    ...merged,
    ...extras,
    address: { ...oldAddress, ...newAddress },   // spread: shallow merge, sector kept, city replaced
    contact: { ...oldContact, ...newContact },   // email kept, phone added
  };
}

const updated = updateStudent(student, update);
console.log('Updated:', updated);
console.log('Original untouched:', student);

// valid falsy values must survive
console.log('Falsy kept:', updateStudent(student, { marks: 0, scholarship: false, name: '' }));
// null / undefined fall back to the old value
console.log('null/undefined ignored:', updateStudent(student, { name: undefined, marks: null }));
console.log('Empty update:', updateStudent(student, {}));

// ---- Feature demonstrations ----
// object destructuring + renaming + default values + nested destructuring
const { id: studentId, name: studentName, scholarship: hasScholarship = true,
        address: { city: currentCity, sector }, contact: { email, phone = 'not provided' } } = updated;
console.log('Destructured:', { studentId, studentName, hasScholarship, currentCity, sector, email, phone });

// array destructuring (+ skipping and rest)
const [firstKey, , thirdKey, ...otherKeys] = Object.keys(updated);
console.log('Array destructuring:', firstKey, thirdKey, otherKeys);

// rest parameters: apply any number of updates in order
function applyUpdates(base, ...changes) {
  return changes.reduce((acc, change) => updateStudent(acc, change), base);
}
console.log('Rest params:', applyUpdates(student, { name: 'A' }, { marks: 55 }, { address: { sector: 'G-9' } }));

// optional chaining + nullish coalescing on missing paths
console.log('Optional chaining:', update?.address?.sector, '|', update?.contact?.email ?? 'no email in update', '|', update.profile?.photo?.url);

// property shorthand
const makeSummary = (name, marks) => ({ name, marks });
console.log('Shorthand:', makeSummary(updated.name, updated.marks));

// ---- Reference challenge ----
console.log('\nReference checks');
console.log('student === updated               :', student === updated, '-> updateStudent builds a brand-new top-level object literal');
console.log('student.address === updated.address:', student.address === updated.address, '-> address was rebuilt with { ...old, ...new }, so it is a new object');
console.log('student.contact === updated.contact:', student.contact === updated.contact, '-> contact was rebuilt too, so it is a new object');
console.log('Note: spread is SHALLOW. If we had written { ...student, ...update } the unchanged nested objects would be shared references.');
const shallow = { ...student };
console.log('shallow copy shares address        :', shallow.address === student.address);
