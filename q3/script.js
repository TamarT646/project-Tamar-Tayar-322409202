const form = document.getElementById("spellForm");
const successMessage = document.getElementById("successMessage");
const errorBox = document.getElementById("formErrors");
const spellList = document.getElementById("spellRequests");
const filterType = document.getElementById("filterType");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  errorBox.textContent = "";
  successMessage.textContent = "";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const spellType = document.getElementById("spellType").value;
  const knowledgeRaw = document.getElementById("knowledge").value.trim();
  const hasWand = document.getElementById("hasWand").value;
  const attemptsRaw = document.getElementById("attempts").value.trim();
  const instructorSignature = document.getElementById("instructorSignature").value.trim();

  // המרה נכונה של ערכים מספריים או null אם ריקים
  const knowledge = knowledgeRaw === "" ? null : parseInt(knowledgeRaw, 10);
  const attempts = attemptsRaw === "" ? null : parseInt(attemptsRaw, 10);

  const spell = {
    id: Date.now(),
    fullName,
    email,
    spellType,
    knowledge,
    hasWand,
    attempts,
    instructorSignature,
    status: "ממתינה"
  };

  const errors = validateForm(spell);
  if (errors.length > 0) {
    errorBox.innerHTML = errors.map(e => `<p>${e}</p>`).join("");
    return;
  }

  saveItem(spell);
  renderItems();
  form.reset();
  successMessage.textContent = "הבקשה נשלחה בהצלחה!";
});

function validateForm(spell) {
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!spell.fullName) errors.push("יש להזין שם מלא.");
  if (!emailPattern.test(spell.email)) errors.push("יש להזין אימייל תקני.");
  if (!spell.spellType) errors.push("יש לבחור סוג לחש.");
  if (spell.knowledge !== null && (isNaN(spell.knowledge) || spell.knowledge < 1 || spell.knowledge > 10))
    errors.push("רמת הידע צריכה להיות בין 1 ל-10.");
  if (spell.attempts !== null && (isNaN(spell.attempts) || spell.attempts < 0))
    errors.push("מספר ניסיונות חייב להיות מספר חיובי.");
  return errors;
}

function saveItem(spell) {
  const spells = loadItems();
  spells.push(spell);
  localStorage.setItem("spells", JSON.stringify(spells));
}

function loadItems() {
  return JSON.parse(localStorage.getItem("spells") || "[]");
}

function renderItems() {
  const spells = loadItems();
  const filter = filterType.value;
  const filtered = filter ? spells.filter(s => s.spellType === filter) : spells;

  spellList.innerHTML = "";

  if (filtered.length === 0) {
    spellList.innerHTML = `<p style="text-align:center; color:#333;">לא נמצאו בקשות מתאימות.</p>`;
    return;
  }

  filtered.forEach(spell => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <p><strong>שם:</strong> ${spell.fullName}</p>
      <p><strong>אימייל:</strong> ${spell.email}</p>
      <p><strong>סוג לחש:</strong> ${spell.spellType}</p>
      <p><strong>רמת ידע:</strong> ${spell.knowledge !== null ? spell.knowledge : "-"}</p>
      <p><strong>שרביט:</strong> ${spell.hasWand}</p>
      <p><strong>ניסיונות:</strong> ${spell.attempts !== null ? spell.attempts : "-"}</p>
      <p><strong>חתימת מדריך:</strong> ${spell.instructorSignature || "-"}</p>
      <p><strong>סטטוס:</strong>
        <select class="status-select" data-id="${spell.id}">
          <option value="ממתינה" ${spell.status === "ממתינה" ? "selected" : ""}>ממתינה</option>
          <option value="מאושרת" ${spell.status === "מאושרת" ? "selected" : ""}>מאושרת</option>
          <option value="נדחתה" ${spell.status === "נדחתה" ? "selected" : ""}>נדחתה</option>
        </select>
      </p>
      <button class="delete-btn" aria-label="מחק בקשה">מחק</button>
    `;

    // הוספת מאזינים לאירועים באופן תקין
    card.querySelector(".status-select").addEventListener("change", (e) => {
      updateItem(spell.id, e.target.value);
    });

    card.querySelector(".delete-btn").addEventListener("click", () => {
      deleteItem(spell.id);
    });

    spellList.appendChild(card);
  });
}

function deleteItem(id) {
  let spells = loadItems();
  spells = spells.filter(s => s.id !== id);
  localStorage.setItem("spells", JSON.stringify(spells));
  renderItems();
}

function updateItem(id, newStatus) {
  const spells = loadItems();
  const index = spells.findIndex(s => s.id === id);
  if (index !== -1) {
    spells[index].status = newStatus;
    localStorage.setItem("spells", JSON.stringify(spells));
    renderItems();
  }
}

filterType.addEventListener("change", renderItems);

window.addEventListener("DOMContentLoaded", renderItems);
