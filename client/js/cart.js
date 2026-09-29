const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartMessage = document.getElementById("cartMessage");

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function renderCart() {
  const cart = getCart();

  if (!cart.length) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <p>$${Number(item.price).toFixed(2)} × ${item.quantity}</p>
      </div>
      <button class="btn" onclick="removeItem(${index})">Remove</button>
    </div>
  `).join("");

  cartTotal.textContent = cart
    .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    .toFixed(2);
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

document.getElementById("checkoutBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const cart = getCart();

  if (!token) {
    cartMessage.textContent = "Please login before placing an order.";
    return;
  }

  if (!cart.length) {
    cartMessage.textContent = "Your cart is empty.";
    return;
  }

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      products: cart.map(item => ({
        product: item._id,
        quantity: item.quantity
      })),
      totalAmount: cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    cartMessage.textContent = data.message;
    return;
  }

  localStorage.removeItem("cart");
  cartMessage.textContent = "Order placed successfully!";
  renderCart();
});

renderCart();
