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

// EID로 직원 선택
function selectEmployee() {
  const eidInput = document.querySelector('input[name="selectedEid"]');
  const eidValue = eidInput.value.trim();
  const rows = document.querySelectorAll("#employeeTable tbody tr");

  let found = false;

  rows.forEach(row => {
    const eidCell = row.cells[2]; // EID 열
    if (eidCell && eidCell.innerText.trim() === eidValue) {
      found = true;

      // 강조 표시
      row.style.backgroundColor = "#ffff99";

      // 값 복사
      const inputs = document.querySelectorAll(".form input");
      const cells = Array.from(row.cells);

      // column order 매핑 (index 기준)
      const fieldMap = [
        "status",   // 1
        "eid",      // 2
        "name",     // 3
        "ss",       // 4
        "birth",    // 5
        "email",    // 6
        "phone",    // 7
        "jcode",    // 8
        "jtitle",   // 9
        "sdate",    // 10
        "edate",    // 11
        "sick",     // 12
        "work1",    // 13
        "address",  // 14
        "city",     // 15
        "state",    // 16
        "zip",      // 17
        "remark"    // 18
      ];

      // 각 입력칸에 데이터 채우기
      fieldMap.forEach((field, i) => {
        const input = document.querySelector(`.form input[name="${field}"]`);
        if (input && cells[i + 1]) { // i+1은 ID 다음부터
          let value = cells[i + 1].innerText.trim();

          // 날짜 포맷 YYYY-MM-DD 맞춰주기
          if (input.type === "date" && value) {
            const parts = value.split("/");
            if (parts.length === 3) {
              value = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
            }
          }

          input.value = value;
        }
      });
    } else {
      // 다른 행은 색상 원상복구
      row.style.backgroundColor = "";
    }
  });

  if (!found) {
    alert("해당 EID를 가진 직원을 찾을 수 없습니다.");
  }
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
