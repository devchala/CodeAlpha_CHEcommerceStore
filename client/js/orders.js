const listBox = document.getElementById("orderList");

(async function () {
  if (!localStorage.getItem("token")) {
    listBox.innerHTML = `<p class="state">Please <a class="link" href="login.html">log in</a> to see your orders.</p>`;
    return;
  }
  try {
    const res = await fetch("/api/orders/my-orders", { headers: authHeaders() });
    if (res.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); listBox.innerHTML = `<p class="state">Session expired. <a class="link" href="login.html">Log in again</a></p>`; return; }
    if (!res.ok) throw new Error();
    const orders = await res.json();
    if (!orders.length) { listBox.innerHTML = `<p class="state">No orders yet. <a class="link" href="/">Start shopping</a></p>`; return; }
    listBox.innerHTML = orders.map((o) => `
      <article class="order-card">
        <div class="order-head">
          <div><strong>Order #${esc(o._id.slice(-6).toUpperCase())}</strong><p>${new Date(o.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p></div>
          <span class="status ${esc(o.status.toLowerCase())}">${esc(o.status)}</span>
        </div>
        ${o.products.map((l) => l.product ? `
          <div class="order-line"><img src="${esc(imgSrc(l.product.image))}" alt=""><span>${esc(l.product.name)}</span><span>× ${l.quantity}</span><span>${money(l.product.price * l.quantity)}</span></div>`
          : `<div class="order-line"><img src="${PLACEHOLDER}" alt=""><span>Product no longer available</span><span>× ${l.quantity}</span><span></span></div>`).join("")}
        <div class="order-total">Total <strong>${money(o.totalAmount)}</strong></div>
      </article>`).join("");
  } catch { listBox.innerHTML = `<p class="state">Could not load orders. Please try again.</p>`; }
})();
