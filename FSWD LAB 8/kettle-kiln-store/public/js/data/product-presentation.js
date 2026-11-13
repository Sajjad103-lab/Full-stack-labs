// Look-and-feel for each product id. The API owns name, price and description.
const BY_ID = {
  1: { art: 'tin', tone: '#cfe3d4', ink: '#2f6b57', rating: 5 },
  2: { art: 'tin', tone: '#e9d9c4', ink: '#7a4b25', rating: 4 },
  3: { art: 'tin', tone: '#f1e3b8', ink: '#8a6a12', rating: 4 },
  4: { art: 'tin', tone: '#c8dbe6', ink: '#17324d', rating: 5 },
  5: { art: 'pot', tone: '#e6d3d0', ink: '#8d3f36', rating: 5 },
  6: { art: 'cup', tone: '#cfe6e6', ink: '#1d6a6a', rating: 5 },
  7: { art: 'cup', tone: '#dfe8c9', ink: '#56702a', rating: 4 },
  8: { art: 'pot', tone: '#d5d9dd', ink: '#2b3540', rating: 4 },
};
const FALLBACK = { art: 'tin', tone: '#cfe3d4', ink: '#2f6b57', rating: 4 };

// Accepts a product ({ id }) or a cart line ({ productId }).
export const presentationFor = (item) => BY_ID[item.id ?? item.productId] || FALLBACK;
