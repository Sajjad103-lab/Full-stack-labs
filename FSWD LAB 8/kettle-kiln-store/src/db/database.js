const fs = require('node:fs');
const { DATA_DIR, DB_FILE } = require('../config');
const seed = require('./seed');

// `db` is one shared object; services read/mutate it and call save().
const db = {};

function save() { // temp file + rename, so a crash never corrupts the db
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function addMissingProductImages() {
  let changed = false;
  for (const product of db.products) {
    const original = seed.products.find((p) => p.id === product.id);
    if (!product.image && original) { product.image = original.image; changed = true; }
  }
  if (changed) save();
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
    addMissingProductImages(); // older db.json files have no pictures yet
  } else {
    Object.assign(db, {
      users: [], sessions: {}, products: seed.products, reviews: seed.reviews,
      carts: {}, orders: [], nextIds: { user: 1, review: seed.reviews.length + 1, order: 1 },
    });
    save();
  }
}

module.exports = { db, load, save };
