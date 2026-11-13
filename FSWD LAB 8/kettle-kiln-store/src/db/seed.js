const products = [
  { id: 1, name: 'Jasmine Pearls',   category: 'Tea',     price: 14, image: '/img/products/jasmine-pearls.svg', description: 'Hand-rolled green tea scented with jasmine.' },
  { id: 2, name: 'Assam Breakfast',  category: 'Tea',     price: 11, image: '/img/products/assam-breakfast.svg', description: 'Malty, bold black tea for mornings.' },
  { id: 3, name: 'Roasted Oolong',   category: 'Tea',     price: 16, image: '/img/products/roasted-oolong.svg', description: 'Toasty, mineral oolong with a long finish.' },
  { id: 4, name: 'Sencha Reserve',   category: 'Tea',     price: 18, image: '/img/products/sencha-reserve.svg', description: 'Fresh, grassy Japanese green tea.' },
  { id: 5, name: 'Stoneware Teapot', category: 'Teaware', price: 48, image: '/img/products/stoneware-teapot.svg', description: 'Hand-finished 600ml teapot with steel infuser.' },
  { id: 6, name: 'Ceramic Cup Set',  category: 'Teaware', price: 32, image: '/img/products/ceramic-cup-set.svg', description: 'Set of two glazed cups.' },
  { id: 7, name: 'Bamboo Tea Scoop', category: 'Teaware', price: 9,  image: '/img/products/bamboo-tea-scoop.svg', description: 'Carved bamboo measuring scoop.' },
  { id: 8, name: 'Cast Iron Kettle', category: 'Teaware', price: 65, image: '/img/products/cast-iron-kettle.svg', description: 'Enamelled 1L kettle that holds heat.' },
];

const reviews = [
  { id: 1, author: 'Sana M.',   rating: 5, text: 'The teacups feel great in the hand. Ordering a second set as a gift.', createdAt: '2026-10-01T10:00:00.000Z' },
  { id: 2, author: 'Daniel K.', rating: 4, text: 'Kettle is heavy but pours perfectly. Arrived well packed.',            createdAt: '2026-10-02T10:00:00.000Z' },
  { id: 3, author: 'Amna R.',   rating: 5, text: 'The jasmine pearls open up beautifully. Best tea I have bought online.', createdAt: '2026-10-03T10:00:00.000Z' },
];

module.exports = { products, reviews };
