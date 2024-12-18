document.addEventListener("DOMContentLoaded", () => {
  const welcomePage = document.getElementById("welcomePage");
  const mainApp = document.getElementById("mainApp");
  const userNameInput = document.getElementById("userName");
  const startAppBtn = document.getElementById("startApp");
  const displayName = document.getElementById("displayName");

  const gpaForm = document.getElementById("gpaForm");
  const gpaTable = document.getElementById("gpaTable").querySelector("tbody");
  const gpaResult = document.getElementById("gpaResult");
  const addRowBtn = document.getElementById("addRow");

  const cgpaForm = document.getElementById("cgpaForm");
  const semester1Table = document.getElementById("semester1Table").querySelector("tbody");
  const semester2Table = document.getElementById("semester2Table").querySelector("tbody");
  const addRowSemester1 = document.getElementById("addRowSemester1");
  const addRowSemester2 = document.getElementById("addRowSemester2");
  const cgpaResult = document.getElementById("cgpaResult");

  const historyTable = document.getElementById("historyTable");
  const clearHistoryBtn = document.getElementById("clearHistory");

  let history = JSON.parse(localStorage.getItem("history")) || [];

  // Welcome Page
  startAppBtn.addEventListener("click", () => {
    const name = userNameInput.value.trim();
    if (name) {
      displayName.textContent = name;
      welcomePage.classList.add("hidden");
      mainApp.classList.remove("hidden");
    }
  });

  // GPA Section: Add Course Button
  addRowBtn.addEventListener("click", () => {
    addCourseRow(gpaTable);
  });

  // CGPA Section: Add Course Buttons for Both Semesters
  addRowSemester1.addEventListener("click", () => {
    addCourseRow(semester1Table);
  });

  addRowSemester2.addEventListener("click", () => {
    addCourseRow(semester2Table);
  });

  // Add a Course Row to a Table
  function addCourseRow(table) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="number" class="courseUnit" placeholder="Unit" required /></td>
      <td>
        <select class="grade" required>
          <option value="">Select Grade</option>
          <option value="5">A (70-100)</option>
          <option value="4">B (60-69)</option>
          <option value="3">C (50-59)</option>
          <option value="2">D (45-49)</option>
          <option value="1">E (40-44)</option>
          <option value="0">F (0-39)</option>
        </select>
      </td>
      <td><button type="button" class="removeRow">Remove</button></td>
    `;
    table.appendChild(row);
  }

  // Remove Course Row from a Table
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("removeRow")) {
      e.target.parentElement.parentElement.remove();
    }
  });

  // GPA Calculation
  gpaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateGPA(gpaTable, gpaResult, "GPA");
  });

  // CGPA Calculation
  cgpaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstSemester = calculateGPA(semester1Table, null);
    const secondSemester = calculateGPA(semester2Table, null);

    if (!firstSemester || !secondSemester) {
      cgpaResult.textContent = "Please enter valid inputs for both semesters.";
      return;
    }

    const totalGP = firstSemester.totalPoints + secondSemester.totalPoints;
    const totalCU = firstSemester.totalUnits + secondSemester.totalUnits;

    const cgpa = (totalGP / totalCU).toFixed(2);
    const remark = generateRemark(cgpa);

    cgpaResult.textContent = `Your CGPA is ${cgpa} (${remark}).`;
    saveHistory("CGPA", cgpa, remark);
  });

  // Helper Functions
  function calculateGPA(table, resultElement, type = null) {
    const rows = table.querySelectorAll("tr");
    let totalUnits = 0;
    let totalPoints = 0;

    rows.forEach((row) => {
      const unit = Number(row.querySelector(".courseUnit").value);
      const grade = Number(row.querySelector(".grade").value);

      if (unit && grade >= 0) {
        totalUnits += unit;
        totalPoints += unit * grade;
      }
    });

    if (totalUnits === 0) return null;

    const gpa = (totalPoints / totalUnits).toFixed(2);
    const remark = generateRemark(gpa);

    if (type) {
      resultElement.textContent = `Your ${type} is ${gpa} (${remark}).`;
      saveHistory(type, gpa, remark);
    }

    return { totalUnits, totalPoints };
  }

  function generateRemark(score) {
    if (score >= 4.5) return "First Class";
    if (score >= 3.5) return "Second Class Upper";
    if (score >= 2.4) return "Second Class Lower";
    if (score >= 1.5) return "Third Class";
    return "Pass";
  }

  function saveHistory(type, value, remark) {
    history.push({ type, value, remark });
    localStorage.setItem("history", JSON.stringify(history));
    loadHistory();
  }

  function loadHistory() {
    historyTable.innerHTML = history
      .map(
        (item, index) => `
        <tr>
          <td>${item.type}</td>
          <td>${item.value}</td>
          <td>${item.remark}</td>
          <td><button onclick="deleteHistory(${index})">Delete</button></td>
        </tr>`
      )
      .join("");
  }

  window.deleteHistory = (index) => {
    history.splice(index, 1);
    localStorage.setItem("history", JSON.stringify(history));
    loadHistory();
  };

  loadHistory();
});