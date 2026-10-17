// Task 4 - University User Hierarchy and dynamic `this`
class Person {
  constructor(name, email) { // runs when `new` creates the object; `this` is the new object
    this.name = name;
    this.email = email;
  }
  introduce() {
    return `Hi, I am ${this.name} (${this.email})`;
  }
}

class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email); // must be called before using `this`; runs the Person constructor
    this.rollNo = rollNo;
    this.marks = marks;
  }
  introduce() { // method overriding, reuses parent text through super
    return `${super.introduce()}, student with roll no ${this.rollNo}`;
  }
  getResult() {
    return this.marks >= 50 ? `${this.name}: PASS (${this.marks})` : `${this.name}: FAIL (${this.marks})`;
  }
}

class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId;
    this.department = department;
  }
  introduce() {
    return `${super.introduce()}, faculty ${this.employeeId} in the ${this.department} department`;
  }
}

const users = [
  new Student('Ali', 'ali@au.edu.pk', '23-1001', 82),
  new FacultyMember('Dr. Sana', 'sana@au.edu.pk', 'E-77', 'CS'),
  new Student('Usman', 'usman@au.edu.pk', '23-1002', 47),
  new FacultyMember('Dr. Bilal', 'bilal@au.edu.pk', 'E-81', 'SE'),
  new Person('Visitor', 'visitor@au.edu.pk'),
];

// Runtime polymorphism: same call, the actual object's class decides which introduce() runs.
users.forEach((user) => console.log(user.introduce()));

console.log('\ninstanceof checks');
users.forEach((u) => console.log(`${u.name}: Person=${u instanceof Person}, Student=${u instanceof Student}, FacultyMember=${u instanceof FacultyMember}`));
console.log('Student results:', users.filter((u) => u instanceof Student).map((s) => s.getResult()));

// ---- this, call(), bind() ----
const guest = { name: 'Dr. Ahmed', email: 'ahmed@example.com' };
console.log('\ncall():', Person.prototype.introduce.call(guest)); // guest becomes `this`

const student = users[0];
const fn = student.introduce; // detached: only the function is copied, not the object
try {
  console.log(fn());
} catch (error) {
  // Class bodies run in strict mode, so a plain call has this === undefined (not the global object).
  console.log('Detached call failed ->', error.constructor.name + ':', error.message);
}

const safe = student.introduce.bind(student); // returns a new function whose `this` is permanently student
console.log('bind():', safe());
console.log('bind() on another object is ignored:', safe.call(guest));
