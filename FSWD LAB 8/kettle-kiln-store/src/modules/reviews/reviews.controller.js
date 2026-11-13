const reviews = require('./reviews.service');
const { validateReview } = require('./reviews.validator');

module.exports = {
  list: () => [200, reviews.list()],
  create: ({ user, body }) => [201, reviews.create(user, validateReview(body))],
};
