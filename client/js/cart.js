const listEl = document.getElementById("cartItems");
const totalEl = document.getElementById("cartTotal");
const msgEl = document.getElementById("cartMessage");
const checkoutBtn = document.getElementById("checkoutBtn");

function renderCart() {
  const u = currentUser();
  if (!u || u.role === "admin") {
    checkoutBtn.disabled = true; totalEl.textContent = "0.00";
    listEl.innerHTML = u
      ? `<p class="state">Admin accounts don't have a cart. <a href="admin.html" class="link">Go to dashboard</a></p>`
      : `<p class="state">Please <a class="link" href="login.html">log in</a> or <a class="link" href="register.html">create an account</a> to use your cart.</p>`;
    return;
  }
  const cart = getCart();
  checkoutBtn.disabled = !cart.length;
  if (!cart.length) {
    listEl.innerHTML = `<p class="state">Your cart is empty. <a href="/" class="link">Start shopping</a></p>`;
    totalEl.textContent = "0.00";
    return;
  }
  listEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${esc(imgSrc(item.image))}" alt="${esc(item.name)}">
      <div class="cart-meta"><strong>${esc(item.name)}</strong><p>${money(item.price)} each</p></div>
      <div class="qty"><button data-act="dec" data-i="${i}" aria-label="Decrease">−</button><span>${item.quantity}</span><button data-act="inc" data-i="${i}" aria-label="Increase">+</button></div>
      <strong class="line-total">${money(item.price * item.quantity)}</strong>
      <button class="remove" data-act="rm" data-i="${i}" aria-label="Remove">✕</button>
    </div>`).join("");
  totalEl.textContent = cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
}

listEl.addEventListener("click", (e) => {
  const { act, i } = e.target.dataset;
  if (!act) return;
  const cart = getCart(), item = cart[i];
  if (act === "inc" && item.quantity < (item.stock || 99)) item.quantity++;
  if (act === "dec") item.quantity = Math.max(1, item.quantity - 1);
  if (act === "rm") cart.splice(i, 1);
  saveCart(cart); renderCart();
});

checkoutBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const cart = getCart();
  msgEl.className = "msg error";
  if (!token) { msgEl.innerHTML = `Please <a class="link" href="login.html">log in</a> before placing an order.`; return; }

  checkoutBtn.disabled = true; checkoutBtn.textContent = "Placing order…";
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ products: cart.map((i) => ({ product: i._id, quantity: i.quantity })) })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); msgEl.innerHTML = `Session expired. <a class="link" href="login.html">Log in again</a>.`; }
      else msgEl.textContent = data.message;
    } else {
      saveCart([]); msgEl.className = "msg ok";
      msgEl.textContent = `Order placed successfully! Total: ${money(data.totalAmount)}`;
    }
  } catch { msgEl.textContent = "Network error. Please try again."; }
  checkoutBtn.textContent = "Place order"; renderCart();
});

renderCart();
