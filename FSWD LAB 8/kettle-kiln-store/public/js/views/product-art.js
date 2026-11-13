export function productArt({ art, ink }) {
  const c = ink;
  const shapes = {
    tin: `<rect x="14" y="26" width="52" height="46" rx="6" fill="${c}"/><rect x="10" y="16" width="60" height="14" rx="5" fill="${c}" opacity=".75"/><rect x="24" y="40" width="32" height="18" rx="3" fill="#fff" opacity=".85"/>`,
    cup: `<path d="M12 28h48v16a24 24 0 0 1-48 0z" fill="${c}"/><path d="M60 32h6a8 8 0 0 1 0 16h-8" fill="none" stroke="${c}" stroke-width="5"/><rect x="18" y="66" width="36" height="5" rx="2.5" fill="${c}" opacity=".6"/>`,
    pot: `<path d="M16 30h44l4 30a8 8 0 0 1-8 10H20a8 8 0 0 1-8-10z" fill="${c}"/><path d="M60 38h8a6 6 0 0 1 0 12h-6" fill="none" stroke="${c}" stroke-width="5"/><rect x="26" y="20" width="24" height="8" rx="4" fill="${c}" opacity=".75"/>`,
  };
  return `<svg viewBox="0 0 80 80" aria-hidden="true">${shapes[art]}</svg>`;
}
