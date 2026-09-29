const message = document.getElementById("authMessage");

document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    })
  });

  const data = await response.json();

  if (!response.ok) {
    message.textContent = data.message;
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.location.href = "/";
});

document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: document.getElementById("registerName").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value
    })
  });

  const data = await response.json();

  if (!response.ok) {
    message.textContent = data.message;
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.location.href = "/";
});
