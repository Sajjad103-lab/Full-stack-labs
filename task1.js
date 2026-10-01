
var fullName = "SajjadEjaz";
var age = 21; 
var primaryLanguage = "Burushaki";
var city = "Gilgit";

console.log("--- Individual Variables ---");
console.log("Name: " + fullName);
console.log("Age: " + age);
console.log("Primary Language: " + primaryLanguage);
console.log("city: " + city);
console.log("\n");


var myBiography = {
  name: fullName,
  age: age,
  address: {
    street: "one",
    city: "rawapindi",
    state: "Pakistan",
    country: "PAkistan"
  },
  degreeProgram: {
    title: "Bachelor of Science in Computer Science",
    major: "Full Stack Web Development",
    university: "Air University Islamabad",
    graduationYear: 2028
  }
};

console.log("--- Biography Details from Object ---");
console.log("Name: " + myBiography.name);
console.log("Age: " + myBiography.age + " years");

console.log("\nAddress:");
console.log("  Street: " + myBiography.address.street);
console.log("  City: " + myBiography.address.city);
console.log("  State: " + myBiography.address.state);
console.log("  Country: " + myBiography.address.country);

console.log("\nDegree Program:");
console.log("  Degree: " + myBiography.degreeProgram.title);
console.log("  Major: " + myBiography.degreeProgram.major);
console.log("  University: " + myBiography.degreeProgram.university);
console.log("  Graduation Year: " + myBiography.degreeProgram.graduationYear);