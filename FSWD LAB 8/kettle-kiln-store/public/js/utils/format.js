export const money = (n) => '$' + Number(n).toFixed(2);
export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
