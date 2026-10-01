const $ = (id) => document.getElementById(id);
const svg = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const VIEWS = {
  overview:  { title: "Overview",  icon: svg('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>') },
  products:  { title: "Products",  icon: svg('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>') },
  orders:    { title: "Orders",    icon: svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>') },
  customers: { title: "Customers", icon: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>') }
};
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
const statusBadge = (s) => `<span class="status ${esc(s.toLowerCase())}">${esc(s)}</span>`;
let products = [];

async function api(path, opts = {}) {
  const res = await fetch("/api/" + path, { ...opts, headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); location.href = "login.html"; }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
const fail = (box, e) => { box.innerHTML = `<p class="state">${esc(e.message)}</p>`; };

/* ---------- Navigation ---------- */
function buildNav() {
  $("adminNav").innerHTML = Object.entries(VIEWS).map(([k, v]) => `<a href="#${k}" data-view="${k}">${v.icon}<span>${v.title}</span></a>`).join("");
}
function closeSidebar() { $("sidebar").classList.remove("open"); $("scrim").classList.remove("show"); }
$("sideToggle").onclick = () => { $("sidebar").classList.add("open"); $("scrim").classList.add("show"); };
$("scrim").onclick = closeSidebar;
$("logoutBtn").onclick = logout;

function showView() {
  const name = VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : "overview";
  document.querySelectorAll(".view").forEach((v) => (v.hidden = v.id !== "view-" + name));
  document.querySelectorAll("#adminNav a").forEach((a) => a.classList.toggle("active", a.dataset.view === name));
  $("viewTitle").textContent = VIEWS[name].title;
  closeSidebar();
  ({ overview: loadOverview, products: loadProducts, orders: loadOrders, customers: loadCustomers })[name]();
}
window.addEventListener("hashchange", showView);

/* ---------- Overview ---------- */
async function loadOverview() {
  try {
    const s = await api("admin/stats");
    const t = s.totals;
    $("statCards").innerHTML = [
      ["Revenue", money(t.revenue), "accent"], ["Orders", t.orders], ["Customers", t.customers], ["Products", t.products]
    ].map(([l, v, c]) => `<div class="stat ${c || ""}"><span>${l}</span><strong>${v}</strong></div>`).join("");

    const max = Math.max(...s.last7.map((d) => d.total), 1);
    $("salesChart").innerHTML = s.last7.map((d) => `
      <div class="bar-col" title="${money(d.total)}"><span class="bar-val">${d.total ? money(d.total).replace(".00", "") : ""}</span>
        <div class="bar" style="height:${Math.max((d.total / max) * 100, 3)}%"></div>
        <span>${new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })}</span></div>`).join("");

    $("statusList").innerHTML = Object.entries(s.byStatus).map(([k, v]) => `<div class="status-row">${statusBadge(k)}<strong>${v}</strong></div>`).join("");

    $("recentOrders").innerHTML = s.recentOrders.length ? s.recentOrders.map((o) => `
      <div class="mini-row"><div><strong>#${esc(o._id.slice(-6).toUpperCase())}</strong><small>${esc(o.customer)} · ${fmtDate(o.createdAt)}</small></div>
      <div class="right">${money(o.totalAmount)}${statusBadge(o.status)}</div></div>`).join("") : `<p class="state">No orders yet.</p>`;

    $("lowStock").innerHTML = s.lowStock.length ? s.lowStock.map((p) => `
      <div class="mini-row"><div class="with-img"><img src="${esc(imgSrc(p.image))}" alt=""><strong>${esc(p.name)}</strong></div>
      <span class="stock-pill ${p.stock === 0 ? "zero" : ""}">${p.stock === 0 ? "Sold out" : p.stock + " left"}</span></div>`).join("") : `<p class="state">All products are well stocked.</p>`;
  } catch (e) { fail($("statCards"), e); }
}

/* ---------- Products ---------- */
const form = $("productForm");
function say(text, ok) { $("adminMsg").textContent = text; $("adminMsg").className = "msg wide " + (ok ? "ok" : "error"); }
function resetForm() { form.reset(); $("pId").value = ""; $("formTitle").textContent = "Add product"; $("cancelBtn").hidden = true; $("pPreview").src = PLACEHOLDER; }

async function loadProducts() {
  try {
    products = await (await fetch("/api/products")).json();
    $("productRows").innerHTML = products.map((p) => `
      <tr><td data-label=""><img src="${esc(imgSrc(p.image))}" alt=""></td>
      <td data-label="Name">${esc(p.name)}</td><td data-label="Category">${esc(p.category)}</td>
      <td data-label="Price">${money(p.price)}</td><td data-label="Stock">${p.stock}</td>
      <td class="row-actions"><button class="mini" data-edit="${esc(p._id)}">Edit</button><button class="mini danger" data-del="${esc(p._id)}">Delete</button></td></tr>`).join("")
      || `<tr><td colspan="6" class="state">No products yet.</td></tr>`;
  } catch (e) { fail($("productRows"), e); }
}

$("pImage").addEventListener("input", (e) => { $("pPreview").src = imgSrc(e.target.value.trim()); });
$("cancelBtn").onclick = () => { resetForm(); say(""); };

$("productRows").addEventListener("click", async (e) => {
  const { edit, del } = e.target.dataset;
  if (edit) {
    const p = products.find((x) => x._id === edit);
    $("pId").value = p._id; $("pName").value = p.name; $("pCategory").value = p.category;
    $("pPrice").value = p.price; $("pStock").value = p.stock; $("pImage").value = p.image;
    $("pDesc").value = p.description; $("pPreview").src = imgSrc(p.image);
    $("formTitle").textContent = "Edit product"; $("cancelBtn").hidden = false;
    form.scrollIntoView({ behavior: "smooth" });
  }
  if (del && confirm("Delete this product?")) {
    try { await api(`products/${del}`, { method: "DELETE" }); toast("Product deleted"); loadProducts(); }
    catch (err) { say(err.message, false); }
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("pId").value;
  $("saveBtn").disabled = true;
  try {
    await api(id ? `products/${id}` : "products", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({
        name: $("pName").value.trim(), category: $("pCategory").value.trim(),
        price: Number($("pPrice").value), stock: Number($("pStock").value),
        image: $("pImage").value.trim(), description: $("pDesc").value.trim()
      })
    });
    say(id ? "Product updated." : "Product added.", true); resetForm(); loadProducts();
  } catch (err) { say(err.message, false); }
  finally { $("saveBtn").disabled = false; }
});

/* ---------- Orders ---------- */
async function loadOrders() {
  try {
    const { orders, statuses } = await api("admin/orders");
    $("orderRows").innerHTML = orders.map((o) => `
      <tr><td data-label="Order"><strong>#${esc(o._id.slice(-6).toUpperCase())}</strong></td>
      <td data-label="Customer">${o.customer ? `${esc(o.customer.name)}<small>${esc(o.customer.email)}</small>` : "Deleted user"}</td>
      <td data-label="Items">${o.items.map((i) => `${esc(i.name)} × ${i.quantity}`).join("<br>")}</td>
      <td data-label="Date">${fmtDate(o.createdAt)}</td><td data-label="Total">${money(o.totalAmount)}</td>
      <td data-label="Status"><select class="status-select ${esc(o.status.toLowerCase())}" data-order="${esc(o._id)}">${statuses.map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")
      || `<tr><td colspan="6" class="state">No orders yet.</td></tr>`;
  } catch (e) { fail($("orderRows"), e); }
}
$("orderRows").addEventListener("change", async (e) => {
  const sel = e.target.closest("[data-order]");
  if (!sel) return;
  try {
    await api(`admin/orders/${sel.dataset.order}/status`, { method: "PUT", body: JSON.stringify({ status: sel.value }) });
    sel.className = "status-select " + sel.value.toLowerCase(); toast("Order status updated");
  } catch (err) { toast(err.message); loadOrders(); }
});

/* ---------- Customers ---------- */
async function loadCustomers() {
  try {
    const users = await api("admin/users");
    $("customerRows").innerHTML = users.map((u) => `
      <tr><td data-label="Name"><strong>${esc(u.name)}</strong></td><td data-label="Email">${esc(u.email)}</td>
      <td data-label="Joined">${fmtDate(u.createdAt)}</td><td data-label="Orders">${u.orders}</td><td data-label="Spent">${money(u.spent)}</td></tr>`).join("")
      || `<tr><td colspan="5" class="state">No customers yet.</td></tr>`;
  } catch (e) { fail($("customerRows"), e); }
}

/* ---------- Start ---------- */
(function init() {
  const u = currentUser();
  const gate = $("adminGate");
  $("themeSlot").innerHTML = THEME_BTN;
  if (!u) { gate.innerHTML = `Please <a class="link" href="login.html">log in</a> with the admin account.`; $("sidebar").hidden = true; return; }
  if (u.role !== "admin") { gate.innerHTML = `This page is for the store admin only. <a class="link" href="/">Back to store</a>`; $("sidebar").hidden = true; return; }
  $("adminName").textContent = u.name;
  $("adminArea").hidden = false;
  buildNav(); showView();
})();
