const HttpError = require('../../core/http-error');
const { emailOk, postalOk, nonEmptyString } = require('../../utils/validators');

const PAYMENT_METHODS = ['cod', 'demo-card'];

function validateCheckout(b) {
  for (const f of ['name', 'email', 'address', 'city', 'postal', 'payment'])
    if (!nonEmptyString(b[f])) throw new HttpError(400, `${f} is required`);
  if (!emailOk(b.email)) throw new HttpError(400, 'Enter a valid email');
  if (!postalOk(b.postal)) throw new HttpError(400, 'Enter a valid postal code');
  if (!PAYMENT_METHODS.includes(b.payment)) throw new HttpError(400, 'Choose a valid payment method');
}
module.exports = { validateCheckout };
