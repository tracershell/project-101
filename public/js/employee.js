// employee.js

// 정렬 함수
function sortTable(n) {
  const table = document.getElementById("employeeTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.rows);
  const asc = table.dataset.sortAsc !== "true";
  table.dataset.sortAsc = asc;

  rows.sort((a, b) => {
    const x = a.cells[n].innerText.toLowerCase();
    const y = b.cells[n].innerText.toLowerCase();
    return asc ? x.localeCompare(y) : y.localeCompare(x);
  });

  rows.forEach(row => tbody.appendChild(row));
}

// DOM 로드 후 바인딩
document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll("#employeeTable thead th");
  headers.forEach((th, index) => {
    th.addEventListener("click", () => sortTable(index));
  });

  const printBtn = document.querySelector(".table-header button");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }
});
