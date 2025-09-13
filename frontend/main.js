const API_BASE = "/api";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  opts.headers = opts.headers || {};
  if (token) opts.headers["Authorization"] = "Bearer " + token;
  if (!opts.body && (opts.method === "POST" || opts.method === "PUT")) {
    opts.headers["Content-Type"] = "application/json";
  }
  if (opts.body && opts.headers["Content-Type"] === "application/json") {
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(API_BASE + path, opts);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res;
}

/* ---------------- AUTH ---------------- */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(signupForm);
    const body = {
      name: f.get("name"),
      email: f.get("email"),
      password: f.get("password"),
      business_name: f.get("business_name"),
    };
    const r = await apiFetch("/auth/signup", { method: "POST", body });
    if (r.token) {
      localStorage.setItem("token", r.token);
      location.href = "dashboard.html";
    } else alert(r.message || "Signup failed");
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(loginForm);
    const body = { email: f.get("email"), password: f.get("password") };
    const r = await apiFetch("/auth/login", { method: "POST", body });
    if (r.token) {
      localStorage.setItem("token", r.token);
      location.href = "dashboard.html";
    } else alert(r.message || "Login failed");
  });
}

/* ---------------- CASHBOOK ---------------- */
const entryForm = document.getElementById("entryForm");
if (entryForm) {
  entryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(entryForm);
    const body = {
      entry_date: f.get("entry_date"),
      party_name: f.get("party_name"),
      amount: f.get("amount"),
      type: f.get("type"),
      note: f.get("note"),
    };
    const res = await apiFetch("/cashbook", { method: "POST", body });
    if (res.id) loadEntries();
  });
}

async function loadEntries() {
  const el = document.getElementById("entries");
  if (!el) return;
  const rows = await apiFetch("/cashbook");
  el.innerHTML = rows
    .map(
      (r) =>
        `<div>${r.entry_date} | ${r.party_name} | ₹${r.amount} | ${r.type} | ${r.note}</div>`
    )
    .join("");
}
loadEntries();

/* ---------------- PAYROLL ---------------- */
const payrollForm = document.getElementById("payrollForm");
if (payrollForm) {
  payrollForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(payrollForm);
    const body = {
      employee_name: f.get("employee_name"),
      salary: f.get("salary"),
      month: f.get("month"),
    };
    const res = await apiFetch("/payroll", { method: "POST", body });
    if (res.id) loadPayroll();
  });
}

async function loadPayroll() {
  const el = document.getElementById("payrollList");
  if (!el) return;
  const rows = await apiFetch("/payroll");
  el.innerHTML = rows
    .map((r) => `<div>${r.month} | ${r.employee_name} | ₹${r.salary}</div>`)
    .join("");
}
loadPayroll();

/* ---------------- SCHEMES ---------------- */
const schemeForm = document.getElementById("schemeForm");
if (schemeForm) {
  schemeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(schemeForm);
    const body = {
      scheme_name: f.get("scheme_name"),
      description: f.get("description"),
      amount: f.get("amount"),
    };
    const res = await apiFetch("/schemes", { method: "POST", body });
    if (res.id) loadSchemes();
  });
}

async function loadSchemes() {
  const el = document.getElementById("schemesList");
  if (!el) return;
  const rows = await apiFetch("/schemes");
  el.innerHTML = rows
    .map((r) => `<div>${r.scheme_name} | ₹${r.amount} | ${r.description}</div>`)
    .join("");
}
loadSchemes();

/* ---------------- DASHBOARD ---------------- */
async function loadDashboard() {
  const el = document.getElementById("dashboard");
  if (!el) return;
  const summary = await apiFetch("/cashbook/summary");
  el.innerHTML = `
    <p>Total Credit: ₹${summary.total_credit || 0}</p>
    <p>Total Debit: ₹${summary.total_debit || 0}</p>
    <p>Balance: ₹${summary.balance || 0}</p>
  `;
}
loadDashboard();
