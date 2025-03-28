const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db/mysql');

const router = express.Router();

const headers = [
  "ID", "Name", "CK#", "R.Time", "O.Time", "D.Time", "FIT", "S.S", "Med",
  "CAT", "CAD", "ADV", "CSP", "PDD", "Gross", "Tax", "Net"
];

const colWidths = [
  30, 100, 40, 45, 45, 45,
  40, 40, 40,
  40, 40, 40,
  40, 40,
  45, 45, 48
];

// 숫자 포맷 함수 (쉼표 + 소수점 2자리)
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

router.get('/payroll/pdf-generate', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const pdate = req.query.pdate;
  if (!pdate) return res.status(400).send('날짜가 없습니다.');

  db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate], (err, results) => {
    if (err) return res.status(500).send('DB 오류');

    const doc = new PDFDocument({
      margin: 5,
      size: 'letter',
      layout: 'landscape'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=payroll-${pdate}.pdf`);
    doc.pipe(res);

    if (results.length === 0) {
      doc.fontSize(12).text('No payroll data found for the selected date.', 100, 150);
      doc.end();
      return;
    }

    const startX = 15;
    const startY = 100;
    const rowHeight = 14;

    doc.fontSize(14).text(`Payroll Report – ${pdate}`, {
      align: 'center'
    });

    doc.fontSize(8);
    doc.lineWidth(0.5);

    const drawRow = (rowData, y, isHeader = false) => {
      let x = startX;
      rowData.forEach((value, i) => {
        const isNameColumn = i === 1;
        const isNumberColumn = !isHeader && i > 2; // i > 2 = 숫자만
        const paddingX = isNameColumn ? 3 : 0;
        const paddingRight = isNumberColumn ? 6 : 0;

        const align = isHeader
          ? 'center'
          : (i === 0 ? 'center' : isNumberColumn ? 'right' : 'left');

        const text = isHeader
          ? value
          : (i === 0
            ? parseInt(value)
            : isNumberColumn
              ? formatNumber(value)
              : String(value));

        const textX = isNumberColumn
          ? x + colWidths[i] - paddingRight
          : x + paddingX;

        doc.text(text, textX, y + 3, {
          width: colWidths[i] - paddingX,
          height: rowHeight,
          align,
          lineBreak: false
        });

        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        x += colWidths[i];
      });
    };

    // 헤더 출력
    drawRow(headers, startY, true);

    // 데이터 출력 (remark 필드 제외)
    results.forEach((row, rowIndex) => {
      const y = startY + rowHeight * (rowIndex + 1);
      const rowData = [
        row.eid, row.name, row.ckno, row.rtime, row.otime, row.dtime,
        row.fw, row.sse, row.me, row.caw, row.cade, row.adv,
        row.csp, row.dd, row.gross, row.tax, row.net
      ];
      drawRow(rowData, y);
    });

    doc.end();
  });
});

module.exports = router;
