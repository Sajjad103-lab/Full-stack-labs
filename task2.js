
let currentPrime = 11;


function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}


let candidate = currentPrime + 1;
while (!isPrime(candidate)) {
  candidate++;
}

let nextPrime = candidate;


console.log(`Given prime number: ${currentPrime}`);
console.log(`The prime number after ${currentPrime} is: ${nextPrime}`);