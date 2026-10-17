// Student.js - default export
export default class Student {
  constructor(id, name, courses = []) {
    this.id = id;
    this.name = name;
    this.courses = courses;
  }

  get marksList() {
    return this.courses.map((course) => course.marks);
  }
}
