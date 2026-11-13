const emailOk = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const postalOk = (p) => typeof p === 'string' && /^[A-Za-z0-9 \-]{3,10}$/.test(p);
const nonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

module.exports = { emailOk, postalOk, nonEmptyString };
