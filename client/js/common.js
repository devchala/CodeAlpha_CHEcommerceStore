// Shared helpers used by every page
const PLACEHOLDER = "images/placeholder.svg";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Number(n).toFixed(2);
const currentUser = () => JSON.parse(localStorage.getItem("user") || "null");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

// ---- Cart: stored per account, so a visitor never sees another user's cart ----
const cartKey = () => { const u = currentUser(); return u && u.role !== "admin" ? "cart_" + u.id : null; };
const getCart = () => { const k = cartKey(); return k ? JSON.parse(localStorage.getItem(k) || "[]") : []; };
const saveCart = (c) => { const k = cartKey(); if (k) localStorage.setItem(k, JSON.stringify(c)); updateCartCount(); };

// Call before any cart action. Sends guests to login, and stops admins from shopping.
function requireCustomer() {
  const u = currentUser();
  if (!u) {
    sessionStorage.setItem("next", location.pathname + location.search);
    sessionStorage.setItem("authNotice", "Please log in or create an account to add items to your cart.");
    location.href = "login.html";
    return false;
  }
  if (u.role === "admin") { toast("Admin accounts can't shop. Use a customer account."); return false; }
  return true;
}

function imgSrc(src) {
  if (!src) return PLACEHOLDER;
  return /^(https?:|\/|data:)/.test(src) ? src : "/" + src.replace(/^\.?\//, "");
}

// If any image fails to load, swap in the placeholder once.
document.addEventListener("error", (e) => {
  const el = e.target;
  if (el.tagName === "IMG" && !el.dataset.failed) { el.dataset.failed = "1"; el.src = PLACEHOLDER; }
}, true);

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = getCart().reduce((s, i) => s + i.quantity, 0);
}

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.className = "show";
  clearTimeout(t._h); t._h = setTimeout(() => (t.className = ""), 2400);
}

function logout() {
  localStorage.removeItem("token"); localStorage.removeItem("user");
  location.href = "/";
}

// ---- Dark mode ----
const THEME_BTN = `<button class="icon-btn" data-theme-toggle aria-label="Toggle dark mode" title="Toggle dark mode">
  <svg class="i-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  <svg class="i-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
</button>`;

document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-theme-toggle]")) return;
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (err) {}
});

// ---- Storefront navbar / footer ----
function renderNavbar() {
  const bar = document.getElementById("navbar");
  if (!bar) return;
  const u = currentUser();
  const isAdmin = u?.role === "admin";
  let links = `<a href="/#products">Products</a>`;
  if (!u) links += `<a href="login.html">Login</a><a class="btn small" href="register.html">Sign up</a>`;
  else if (isAdmin) links += `<a href="admin.html">Dashboard</a><a href="#" id="logoutLink">Logout</a>`;
  else links += `<a href="orders.html">My orders</a><span class="hello">Hi, ${esc(u.name.split(" ")[0])}</span><a href="#" id="logoutLink">Logout</a>
      <a class="cart" href="cart.html">Cart <span id="cartCount">0</span></a>`;

  bar.innerHTML = `
    <a class="brand" href="/">Chala<span>Store</span></a>
    <div class="nav-right">
      <nav id="mainNav" aria-label="Main">${links}</nav>
      ${THEME_BTN}
      <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
    </div>`;
  const toggle = document.getElementById("menuToggle"), nav = document.getElementById("mainNav");
  toggle.onclick = () => toggle.setAttribute("aria-expanded", nav.classList.toggle("open"));
  nav.onclick = (e) => { if (e.target.closest("a")) nav.classList.remove("open"); };
  const lo = document.getElementById("logoutLink");
  if (lo) lo.onclick = (e) => { e.preventDefault(); logout(); };
}

function renderFooter() {
  const f = document.getElementById("footer");
  if (!f) return;
  f.innerHTML = `
    <div class="footer-grid">
      <div><a class="brand" href="/">Chala<span>Store</span></a><p>Quality products, simple shopping.</p></div>
      <div><h4>Shop</h4><a href="/#products">All products</a><a href="cart.html">Cart</a><a href="orders.html">My orders</a></div>
      <div><h4>Account</h4><a href="login.html">Login</a><a href="register.html">Register</a></div>
      <div><h4>Contact</h4><span>+251935817576 · </span></div>
    </div>
    <p class="copyright">© 2026 ChalaStore all rights reserved!</p>`;
}


function renderFloatingTheme() {
  if (document.body.classList.contains("auth-page")) document.body.insertAdjacentHTML("beforeend", `<div class="float-theme">${THEME_BTN}</div>`);
}

renderNavbar();
renderFooter();
renderFloatingTheme();
updateCartCount();
