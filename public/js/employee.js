// employee.js - 클라이언트 측 코드 분리

// 테이블 정렬 함수
function sortTable(n) {
    const table = document.getElementById("employeeTable");
    const rows = Array.from(table.rows).slice(1);
    let asc = true;
  
    rows.sort((a, b) => {
      let x = a.cells[n].innerText.toLowerCase();
      let y = b.cells[n].innerText.toLowerCase();
      return asc ? x.localeCompare(y) : y.localeCompare(x);
    });
  
    rows.forEach(row => table.tBodies[0].appendChild(row));
  }
  
  // 프린트 버튼 기능
  function handlePrint() {
    window.print();
  }
  
  // 페이지 로딩 후 이벤트 바인딩
  document.addEventListener("DOMContentLoaded", () => {
    const printBtn = document.querySelector(".table-header button");
    if (printBtn) {
      printBtn.addEventListener("click", handlePrint);
    }
  
    const sortableHeaders = document.querySelectorAll("#employeeTable thead th");
    sortableHeaders.forEach((th, index) => {
      th.addEventListener("click", () => sortTable(index));
    });
  });
  