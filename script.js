// ===============================
// AUTO-DETECT BASE URL (LOCAL / PROD)
// ===============================
const BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://YOUR-RENDER-APP.onrender.com"; // ← replace once

// ===============================
// AUTH STATE
// ===============================
const token = localStorage.getItem("token");
if (token) showApp();

function showApp() {
  authSection.style.display = "none";
  appSection.style.display = "block";
  loadExpenses();
  loadSubscriptions();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  };
}

/* ===============================
   AUTH
================================ */

async function signup() {
  await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: signupName.value,
      email: signupEmail.value,
      password: signupPassword.value,
    }),
  });
  alert("Signup successful. Please login.");
}

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value,
    }),
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);
  location.reload();
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

/* ===============================
   EXPENSES
================================ */

async function loadExpenses() {
  const res = await fetch(`${BASE}/expenses`, {
    headers: authHeaders(),
  });
  const data = await res.json();

  expenseList.innerHTML = "";
  data.forEach((e) => {
    const li = document.createElement("li");
    li.innerHTML = `${e.title} - ₹${e.amount}
      <button onclick="deleteExpense('${e._id}')">❌</button>`;
    expenseList.appendChild(li);
  });
}

async function addExpense() {
  await fetch(`${BASE}/expenses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      title: title.value,
      amount: amount.value,
    }),
  });
  loadExpenses();
}

async function deleteExpense(id) {
  await fetch(`${BASE}/expenses/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  loadExpenses();
}

/* ===============================
   SUBSCRIPTIONS
================================ */

async function loadSubscriptions() {
  const res = await fetch(`${BASE}/subscriptions`, {
    headers: authHeaders(),
  });
  const data = await res.json();

  subscriptionList.innerHTML = "";
  data.forEach((s) => {
    const days = Math.ceil(
      (new Date(s.renewalDate) - new Date()) / 86400000
    );

    const li = document.createElement("li");
    li.className = days <= 7 ? "expiring" : "";
    li.innerHTML = `${s.serviceName} - ₹${s.amount} (${days} days)
      <button onclick="deleteSubscription('${s._id}')">❌</button>`;
    subscriptionList.appendChild(li);
  });
}

async function addSubscription() {
  await fetch(`${BASE}/subscriptions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      serviceName: serviceName.value,
      amount: subAmount.value,
      renewalDate: renewalDate.value,
    }),
  });
  loadSubscriptions();
}

async function deleteSubscription(id) {
  await fetch(`${BASE}/subscriptions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  loadSubscriptions();
}
