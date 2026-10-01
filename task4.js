function roundMe(...args) {
  if (args.length === 0) {
    return 0;
  }
  
  const roundedValues = args.map(num => Math.round(num));

  return args.length === 1 ? roundedValues[0] : roundedValues;
}

console.log(roundMe());
console.log(roundMe(4.7));
console.log(roundMe(4.7, 4.4));