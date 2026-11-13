const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');

module.exports = {
  PORT: process.env.PORT || 3000,
  DATA_DIR: path.join(ROOT, 'data'),
  DB_FILE: path.join(ROOT, 'data', 'db.json'),
  PUBLIC_DIR: path.join(ROOT, 'public'),
  FREE_SHIPPING_OVER: 50, // free shipping above this subtotal
  SHIPPING_FEE: 5,
};
