const HttpError = require('../../core/http-error');

function validateReview(b) {
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Rating must be 1 to 5');
  if (typeof b.text !== 'string' || b.text.trim().length < 10) throw new HttpError(400, 'Write at least 10 characters');
  return { rating, text: b.text.trim() };
}
module.exports = { validateReview };
