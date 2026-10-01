/* Kettle & Kiln — shared logic for every page.
   Data lives in localStorage, so this is a front-end demo (no real server). */

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};
const money = n => "$" + n.toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

/* ---------- product data ---------- */
const PRODUCTS = [
  { id: 1, name: "Jasmine Pearl Green Tea", cat: "Tea", price: 18, rating: 5, art: "tin", tone: "#cfe3d4", ink: "#2f6b57", blurb: "Hand-rolled pearls scented with jasmine. 50 g tin." },
  { id: 2, name: "Smoked Lapsang Black", cat: "Tea", price: 16, rating: 4, art: "tin", tone: "#e9d9c4", ink: "#7a4b25", blurb: "Pine-smoked and deep. 50 g tin." },
  { id: 3, name: "Roasted Barley Mugicha", cat: "Tea", price: 14, rating: 4, art: "tin", tone: "#f1e3b8", ink: "#8a6a12", blurb: "Caffeine-free, toasty and sweet. 80 g tin." },
  { id: 4, name: "Highland Oolong", cat: "Tea", price: 22, rating: 5, art: "tin", tone: "#c8dbe6", ink: "#17324d", blurb: "Floral, creamy, steeps five times. 50 g tin." },
  { id: 5, name: "Stoneware Teacup Set (2)", cat: "Teaware", price: 34, rating: 5, art: "cup", tone: "#e6d3d0", ink: "#8d3f36", blurb: "Wheel-thrown cups with a matte glaze." },
  { id: 6, name: "Cast Iron Kettle", cat: "Teaware", price: 68, rating: 4, art: "pot", tone: "#d5d9dd", ink: "#2b3540", blurb: "1.2 L, enamel lined, works on any hob." },
  { id: 7, name: "Bamboo Whisk & Scoop", cat: "Teaware", price: 19, rating: 4, art: "cup", tone: "#dfe8c9", ink: "#56702a", blurb: "For matcha, in a hand-cut bamboo set." },
  { id: 8, name: "Glass Infuser Pot", cat: "Teaware", price: 42, rating: 5, art: "pot", tone: "#cfe6e6", ink: "#1d6a6a", blurb: "Heat-safe borosilicate with a steel filter." },
];

const SEED_REVIEWS = [
  { name: "Amna R.", rating: 5, text: "The jasmine pearls open up beautifully. Best tea I have bought online." },
  { name: "Daniel K.", rating: 4, text: "Kettle is heavy but pours perfectly. Arrived well packed." },
  { name: "Sana M.", rating: 5, text: "The teacups feel great in the hand. Ordering a second set as a gift." },
];

const art = p => {
  const c = p.ink;
  const shapes = {
    tin: `<rect x="14" y="26" width="52" height="46" rx="6" fill="${c}"/><rect x="10" y="16" width="60" height="14" rx="5" fill="${c}" opacity=".75"/><rect x="24" y="40" width="32" height="18" rx="3" fill="#fff" opacity=".85"/>`,
    cup: `<path d="M12 28h48v16a24 24 0 0 1-48 0z" fill="${c}"/><path d="M60 32h6a8 8 0 0 1 0 16h-8" fill="none" stroke="${c}" stroke-width="5"/><rect x="18" y="66" width="36" height="5" rx="2.5" fill="${c}" opacity=".6"/>`,
    pot: `<path d="M16 30h44l4 30a8 8 0 0 1-8 10H20a8 8 0 0 1-8-10z" fill="${c}"/><path d="M60 38h8a6 6 0 0 1 0 12h-6" fill="none" stroke="${c}" stroke-width="5"/><rect x="26" y="20" width="24" height="8" rx="4" fill="${c}" opacity=".75"/>`,
  };
  return `<svg viewBox="0 0 80 80" aria-hidden="true">${shapes[p.art]}</svg>`;
};
const byId = id => PRODUCTS.find(p => p.id === id);

/* ---------- auth (signup / login / logout) ---------- */
const Auth = {
  users: () => store.get("kk_users", []),
  current: () => store.get("kk_session", null),
  // Demo only: btoa is NOT real password security. A real app hashes on the server.
  hash: pw => btoa(unescape(encodeURIComponent(pw))),
  signup(name, email, password) {
    const users = this.users();
    if (users.some(u => u.email === email.toLowerCase())) return { ok: false, msg: "An account with this email already exists. Log in instead." };
    users.push({ name, email: email.toLowerCase(), pw: this.hash(password) });
    store.set("kk_users", users);
    store.set("kk_session", { name, email: email.toLowerCase() });
    return { ok: true };
  },
  login(email, password) {
    const u = this.users().find(u => u.email === email.toLowerCase() && u.pw === this.hash(password));
    if (!u) return { ok: false, msg: "Email or password is incorrect." };
    store.set("kk_session", { name: u.name, email: u.email });
    return { ok: true };
  },
  logout() { localStorage.removeItem("kk_session"); },
};

/* ---------- cart (add / edit / totals) ---------- */
const Cart = {
  items: () => store.get("kk_cart", []),
  save(items) { store.set("kk_cart", items); renderBadge(); },
  add(id) {
    const items = this.items(), row = items.find(i => i.id === id);
    row ? row.qty++ : items.push({ id, qty: 1 });
    this.save(items);
  },
  setQty(id, qty) {
    let items = this.items();
    items = qty < 1 ? items.filter(i => i.id !== id) : items.map(i => (i.id === id ? { ...i, qty: Math.min(qty, 20) } : i));
    this.save(items);
  },
  remove(id) { this.save(this.items().filter(i => i.id !== id)); },
  clear() { this.save([]); },
  count: () => Cart.items().reduce((n, i) => n + i.qty, 0),
  subtotal: () => Cart.items().reduce((n, i) => n + byId(i.id).price * i.qty, 0),
  shipping() { const s = this.subtotal(); return s === 0 || s >= 50 ? 0 : 6; },
  total() { return this.subtotal() + this.shipping(); },
};

/* ---------- shared UI ---------- */
function renderNavbar() {
  const user = Auth.current();
  const authLinks = user
    ? `<li class="nav-item"><span class="nav-link">Hi, ${esc(user.name.split(" ")[0])}</span></li>
       <li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Log out</a></li>`
    : `<li class="nav-item"><a class="nav-link" href="login.html">Log in</a></li>
       <li class="nav-item"><a class="btn btn-leaf btn-sm ms-lg-2" href="signup.html">Sign up</a></li>`;
  $("#navbar").innerHTML = `
  <nav class="navbar navbar-expand-lg kk-nav sticky-top">
    <div class="container">
      <a class="brand navbar-brand" href="index.html">Kettle &amp; Kiln</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item"><a class="nav-link" href="index.html#shop">Shop</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html#reviews">Reviews</a></li>
          <li class="nav-item"><a class="nav-link" href="cart.html">Cart <span class="badge rounded-pill cart-badge" id="cartBadge">0</span></a></li>
          ${authLinks}
        </ul>
      </div>
    </div>
  </nav>`;
  $("#logoutLink")?.addEventListener("click", e => { e.preventDefault(); Auth.logout(); location.href = "index.html"; });
  renderBadge();
}
function renderBadge() { const b = $("#cartBadge"); if (b) b.textContent = Cart.count(); }

function toast(msg) {
  let wrap = $("#toastWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toastWrap";
    wrap.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast align-items-center text-bg-dark border-0";
  el.setAttribute("role", "status");
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  wrap.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2200 });
  el.addEventListener("hidden.bs.toast", () => el.remove());
  t.show();
}

/* Bootstrap validation helper: returns true when the form is valid */
function validate(form) { form.classList.add("was-validated"); return form.checkValidity(); }

/* ---------- pages ---------- */
const Pages = {
  /* Home: product listing, add to cart, reviews */
  home() {
    const grid = $("#productGrid");
    const draw = cat => {
      const list = cat === "All" ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);
      grid.innerHTML = list.map(p => `
        <div class="col-6 col-lg-3">
          <article class="product-card">
            <div class="product-art" style="background:${p.tone}">${art(p)}</div>
            <div class="product-body">
              <span class="product-cat">${p.cat}</span>
              <h3 class="product-title">${esc(p.name)}</h3>
              <span class="rating" aria-label="${p.rating} out of 5 stars">${stars(p.rating)}</span>
              <p class="small text-secondary mt-1">${esc(p.blurb)}</p>
              <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
                <span class="price">${money(p.price)}</span>
                <button class="btn btn-leaf btn-sm add-btn" data-id="${p.id}">Add to cart</button>
              </div>
            </div>
          </article>
        </div>`).join("");
    };
    draw("All");

    $("#filters").addEventListener("click", e => {
      const b = e.target.closest(".filter-btn"); if (!b) return;
      document.querySelectorAll(".filter-btn").forEach(x => x.classList.toggle("active", x === b));
      draw(b.dataset.cat);
    });
    grid.addEventListener("click", e => {
      const b = e.target.closest(".add-btn"); if (!b) return;
      const p = byId(+b.dataset.id);
      Cart.add(p.id);
      toast(`${p.name} added to your cart`);
    });

    /* reviews */
    const list = $("#reviewList");
    const drawReviews = () => {
      const all = [...store.get("kk_reviews", []), ...SEED_REVIEWS];
      list.innerHTML = all.map(r => `
        <div class="review">
          <span class="rating" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</span>
          <p>${esc(r.text)}</p>
          <small class="text-secondary">${esc(r.name)}</small>
        </div>`).join("");
    };
    drawReviews();

    const user = Auth.current();
    const form = $("#reviewForm");
    if (!user) {
      form.outerHTML = `<p class="text-secondary">Want to share your own? <a href="login.html?next=index.html%23reviews">Log in</a> to write a review.</p>`;
    } else {
      form.addEventListener("submit", e => {
        e.preventDefault();
        if (!validate(form)) return;
        const rating = +form.rating.value, text = form.text.value.trim();
        store.set("kk_reviews", [{ name: user.name, rating, text }, ...store.get("kk_reviews", [])]);
        form.reset(); form.classList.remove("was-validated");
        drawReviews(); toast("Thanks, your review is live");
      });
    }
  },

  /* Signup */
  signup() {
    const form = $("#signupForm");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const pw = form.password.value, confirm = form.confirm;
      confirm.setCustomValidity(pw === confirm.value ? "" : "Passwords do not match");
      if (!validate(form)) return;
      const res = Auth.signup(form.name.value.trim(), form.email.value.trim(), pw);
      if (!res.ok) { $("#formError").textContent = res.msg; $("#formError").classList.remove("d-none"); return; }
      location.href = "index.html";
    });
    form.confirm.addEventListener("input", () => form.confirm.setCustomValidity(""));
  },

  /* Login */
  login() {
    const form = $("#loginForm");
    const next = new URLSearchParams(location.search).get("next") || "index.html";
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!validate(form)) return;
      const res = Auth.login(form.email.value.trim(), form.password.value);
      if (!res.ok) { $("#formError").textContent = res.msg; $("#formError").classList.remove("d-none"); return; }
      // only allow same-site relative redirects
      location.href = /^[\w\-./#%]+$/.test(next) && !next.startsWith("//") ? next : "index.html";
    });
  },

  /* Cart: display + edit */
  cart() {
    const box = $("#cartItems"), sum = $("#cartSummary");
    const draw = () => {
      const items = Cart.items();
      if (!items.length) {
        box.innerHTML = `<div class="empty"><h2 class="h4">Your cart is empty</h2><p class="text-secondary">Add a tin of tea to get started.</p><a class="btn btn-leaf" href="index.html#shop">Browse the shop</a></div>`;
        sum.classList.add("d-none"); return;
      }
      sum.classList.remove("d-none");
      box.innerHTML = items.map(i => {
        const p = byId(i.id);
        return `
        <div class="cart-row" data-id="${p.id}">
          <div class="cart-thumb" style="background:${p.tone}">${art(p)}</div>
          <div><h3 class="h6 mb-1">${esc(p.name)}</h3><span class="text-secondary small">${money(p.price)} each</span></div>
          <div class="cart-end d-flex align-items-center gap-3 justify-content-between">
            <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
              <button data-act="dec" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-act="inc" aria-label="Increase quantity">+</button>
            </div>
            <strong>${money(p.price * i.qty)}</strong>
            <button class="btn btn-link text-danger p-0" data-act="del">Remove</button>
          </div>
        </div>`;
      }).join("");
      $("#sumSubtotal").textContent = money(Cart.subtotal());
      $("#sumShipping").textContent = Cart.shipping() ? money(Cart.shipping()) : "Free";
      $("#sumTotal").textContent = money(Cart.total());
      $("#freeNote").textContent = Cart.subtotal() < 50 ? `Add ${money(50 - Cart.subtotal())} more for free shipping.` : "You get free shipping.";
    };
    box.addEventListener("click", e => {
      const btn = e.target.closest("[data-act]"); if (!btn) return;
      const id = +btn.closest(".cart-row").dataset.id;
      const cur = Cart.items().find(i => i.id === id).qty;
      if (btn.dataset.act === "inc") Cart.setQty(id, cur + 1);
      if (btn.dataset.act === "dec") Cart.setQty(id, cur - 1);
      if (btn.dataset.act === "del") Cart.remove(id);
      draw();
    });
    $("#clearCart").addEventListener("click", () => { Cart.clear(); draw(); });
    draw();
  },

  /* Checkout */
  checkout() {
    if (!Auth.current()) { location.href = "login.html?next=checkout.html"; return; }
    if (!Cart.items().length) { location.href = "cart.html"; return; }
    const user = Auth.current(), form = $("#checkoutForm");
    form.name.value = user.name; form.email.value = user.email;

    $("#orderLines").innerHTML = Cart.items().map(i => {
      const p = byId(i.id);
      return `<div class="d-flex justify-content-between small mb-2"><span>${esc(p.name)} × ${i.qty}</span><span>${money(p.price * i.qty)}</span></div>`;
    }).join("");
    $("#sumSubtotal").textContent = money(Cart.subtotal());
    $("#sumShipping").textContent = Cart.shipping() ? money(Cart.shipping()) : "Free";
    $("#sumTotal").textContent = money(Cart.total());

    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!validate(form)) return;
      const id = "KK-" + Date.now().toString().slice(-6);
      const orders = store.get("kk_orders", []);
      orders.unshift({ id, email: user.email, total: Cart.total(), items: Cart.items(), date: new Date().toISOString(),
        ship: { name: form.name.value, address: form.address.value, city: form.city.value, postal: form.postal.value }, pay: form.payment.value });
      store.set("kk_orders", orders);
      const total = Cart.total();
      Cart.clear();
      $("#checkoutView").classList.add("d-none");
      $("#doneView").classList.remove("d-none");
      $("#orderId").textContent = id;
      $("#orderTotal").textContent = money(total);
      window.scrollTo({ top: 0 });
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  const page = document.body.dataset.page;
  if (Pages[page]) Pages[page]();
});