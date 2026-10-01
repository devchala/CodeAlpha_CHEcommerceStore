const box = document.getElementById("productDetail");
const id = new URLSearchParams(location.search).get("id");

(async function () {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error();
    const p = await res.json();
    document.title = `${p.name} | ChalaStore`;
    const out = p.stock < 1;
    box.innerHTML = `
      <div class="detail-img"><img src="${esc(imgSrc(p.image))}" alt="${esc(p.name)}"></div>
      <div class="detail-info">
        <small class="cat">${esc(p.category)}</small>
        <h1>${esc(p.name)}</h1>
        <div class="price big">${money(p.price)}</div>
        <p class="desc">${esc(p.description)}</p>
        <p class="stock ${out ? "out" : ""}">${out ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</p>
        <div class="buy-row">
          <div class="qty"><button id="dec" aria-label="Decrease">−</button><span id="qtyVal">1</span><button id="inc" aria-label="Increase">+</button></div>
          <button class="btn" id="addBtn" ${out ? "disabled" : ""}>${out ? "Sold out" : "Add to cart"}</button>
        </div>
      </div>`;
    let qty = 1;
    const val = document.getElementById("qtyVal");
    document.getElementById("inc").onclick = () => { if (qty < p.stock) val.textContent = ++qty; };
    document.getElementById("dec").onclick = () => { if (qty > 1) val.textContent = --qty; };
    document.getElementById("addBtn").onclick = () => {
      if (!requireCustomer()) return;
      const cart = getCart(), line = cart.find((i) => i._id === p._id);
      const total = (line ? line.quantity : 0) + qty;
      if (total > p.stock) return toast("Not enough stock available");
      if (line) line.quantity = total;
      else cart.push({ _id: p._id, name: p.name, price: p.price, image: p.image, stock: p.stock, quantity: qty });
      saveCart(cart); toast(`${qty} × ${p.name} added to cart`);
    };
  } catch {
    box.innerHTML = `<p class="state">Product not found. <a class="link" href="/">Back to store</a></p>`;
  }
})();
