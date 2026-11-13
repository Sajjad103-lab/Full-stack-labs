export const redirectToLogin = (next) =>
  { location.href = 'login.html?next=' + encodeURIComponent(next); };
