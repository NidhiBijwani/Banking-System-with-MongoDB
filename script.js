const API_BASE = "http://localhost:5000/api";
let transactions = [];

/* =========================
   ON PAGE LOAD
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
});

/* =========================
   LOAD TRANSACTIONS (GET)
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API_BASE}/transactions`);
    const data = await res.json();

    transactions = data;
    renderAllTx(transactions);
    renderRecentTx();

  } catch (err) {
    console.error("Error loading transactions:", err);
    showToast("Failed to load transactions", "❌");
  }
}

/* =========================
   ADD TRANSACTION (POST)
========================= */
async function addTransaction(newTx) {
  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTx)
    });

    const data = await res.json();
    showToast("Transaction successful!", "✅");

    loadTransactions(); // refresh table

  } catch (err) {
    console.error("Error adding transaction:", err);
    showToast("Transaction failed", "❌");
  }
}

/* =========================
   RENDER RECENT (5 rows)
========================= */
function renderRecentTx() {
  const recent = transactions.slice(0, 5);
  document.getElementById("recent-tx").innerHTML =
    recent.map(t => buildTxRow(t, false)).join("");
}

/* =========================
   RENDER ALL TRANSACTIONS
========================= */
function renderAllTx(list) {
  const tbody = document.getElementById("all-tx");

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:32px;">
          No transactions found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map(t => buildTxRow(t, true)).join("");
}

/* =========================
   BUILD TABLE ROW
========================= */
function buildTxRow(t, showBalance = false) {
  const isCredit = t.type === "credit";

  return `
    <tr>
      <td>${t.desc || "-"}</td>
      <td>${t.name || "-"}</td>
      <td>${t.date || "-"}</td>
      <td class="${isCredit ? "tx-amount-pos" : "tx-amount-neg"}">
        ${isCredit ? "+" : "-"}₹${Number(t.amt).toLocaleString("en-IN")}
      </td>
      ${showBalance ? `<td>₹${Number(t.bal || 0).toLocaleString("en-IN")}</td>` : ""}
    </tr>
  `;
}

/* =========================
   TRANSFER CONFIRM
========================= */
async function transferConfirm() {
  const amount = document.getElementById("t-amount").value;
  const name   = document.getElementById("t-name").value;

  if (!amount || !name) {
    showToast("Fill all fields", "⚠️");
    return;
  }

  const newTransaction = {
    desc: "Money Transfer",
    name: name,
    date: new Date().toISOString().split("T")[0],
    type: "debit",
    amt: Number(amount)
  };

  await addTransaction(newTransaction);

  document.getElementById("t-amount").value = "";
  document.getElementById("t-name").value = "";
}

/* =========================
   FILTER FUNCTION
========================= */
function filterTx() {
  const query = document.getElementById("tx-search").value.toLowerCase();

  const filtered = transactions.filter(t =>
    (t.desc && t.desc.toLowerCase().includes(query)) ||
    (t.name && t.name.toLowerCase().includes(query))
  );

  renderAllTx(filtered);
}

/* =========================
   TOAST NOTIFICATION
========================= */
function showToast(message, icon = "✓") {
  const toast = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = message;
  document.getElementById("toast-icon").textContent = icon;

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}