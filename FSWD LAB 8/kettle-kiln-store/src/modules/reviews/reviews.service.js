const { db, save } = require('../../db/database');
const { money } = require('../../utils/money');

function list() {
  const reviews = [...db.reviews].reverse();
  const average = reviews.length ? money(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null;
  return { average, count: reviews.length, reviews };
}

function create(user, { rating, text }) {
  const review = {
    id: db.nextIds.review++,
    author: user ? user.name : 'Guest',
    rating, text,
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  save();
  return review;
}

module.exports = { list, create };
