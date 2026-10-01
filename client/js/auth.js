const message = document.getElementById("authMessage");

// Show "please log in to continue" if we were redirected here from the cart
(function showNotice() {
  const n = sessionStorage.getItem("authNotice");
  if (n && message) message.insertAdjacentHTML("beforebegin", `<p class="notice">${esc(n)}</p>`);
})();

function afterAuth(user) {
  const next = sessionStorage.getItem("next");
  sessionStorage.removeItem("next"); sessionStorage.removeItem("authNotice");
  if (user.role === "admin") return (location.href = "admin.html");   // admins go to their own dashboard
  const safe = next && /^\/[\w\-./?=&]*$/.test(next) && !next.startsWith("//");
  location.href = safe ? next : "/";
}

async function submitAuth(url, body, btn) {
  message.textContent = "";
  btn.disabled = true;
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { message.textContent = data.message || "Something went wrong"; return; }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    afterAuth(data.user);
  } catch { message.textContent = "Network error. Please try again."; }
  finally { btn.disabled = false; }
}

document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  submitAuth("/api/auth/login", { email: loginEmail.value, password: loginPassword.value }, e.submitter);
});

document.getElementById("registerForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  submitAuth("/api/auth/register", { name: registerName.value, email: registerEmail.value, password: registerPassword.value }, e.submitter);
});
