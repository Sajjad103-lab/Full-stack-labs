function abs(...args) {
  if (args.length === 0) return 0;
  const result = args.map(num => Math.abs(num));
  return args.length === 1 ? result[0] : result;
}

function ceil(...args) {
  if (args.length === 0) return 0;
  const result = args.map(num => Math.ceil(num));
  return args.length === 1 ? result[0] : result;
}

function floor(...args) {
  if (args.length === 0) return 0;
  const result = args.map(num => Math.floor(num));
  return args.length === 1 ? result[0] : result;
}

console.log(abs());              // 0
console.log(abs(-4.7));          // 4.7
console.log(abs(-4.7, 4.4));     // [4.7, 4.4]

console.log(ceil());             // 0
console.log(ceil(4.1));          // 5
console.log(ceil(4.1, 4.7));     // [5, 5]

console.log(floor());            // 0
console.log(floor(4.7));         // 4
console.log(floor(4.7, 4.1));    // [4, 4]