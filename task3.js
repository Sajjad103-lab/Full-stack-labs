
function createPhoneNumber(numbers) {
  
  const areaCode = numbers.slice(0, 3).join('');
  const prefix = numbers.slice(3, 6).join('');
  const lineNum = numbers.slice(6, 10).join('');
  
  return `(${areaCode}) ${prefix}-${lineNum}`;
}


console.log(createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
