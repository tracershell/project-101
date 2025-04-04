const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db/mysql');

const router = express.Router();

const headers = [
  "ID", "Name", "CK#", "R.Time", "O.Time", "D.Time", "FIT", "S.S", "Med",
  "CAT", "CAD", "ADV", "CSP", "PDD", "Gross", "Tax", "Net"
];

const colWidths = [
  30, 100, 40,
  48, 48, 48,
  40, 40, 40,
  40, 40, 40,
  40, 40,
  48, 40, 48
];

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

router.get('/payroll/pdf-generate', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const pdate = req.query.pdate;
  if (!pdate) return res.status(400).send('날짜가 없습니다.');

  try {
    const [results] = await db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate]);

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
    const startY = 80;
    const rowHeight = 14;

    const formattedDate = new Date(results[0].pdate).toLocaleDateString('en-US');
    doc.fontSize(9).text(`Date: ${formattedDate}`, 530, startY - 15, { align: 'right' });
    doc.fontSize(14).text(`Payroll Report`, 0, startY - 35, { align: 'center' });
    doc.fontSize(8);
    doc.lineWidth(0.5);

    const drawRow = (rowData, y, isHeader = false, isBoldRow = false, skipPDD = false) => {
      let x = startX;
      doc.font(isBoldRow ? 'Helvetica-Bold' : 'Helvetica');

      rowData.forEach((value, i) => {
        const skip = (!isHeader && value === '') || (skipPDD && i === 13);
        const colWidth = colWidths[i];

        if (!skip) {
          const isNumberColumn = !isHeader && i > 2;

          const align = isHeader
            ? 'center'
            : (i === 0 || i === 2
              ? 'center'
              : isNumberColumn
                ? 'right'
                : 'left');

          const text = isHeader
            ? value
            : (i === 0
              ? parseInt(value)
              : isNumberColumn
                ? formatNumber(value)
                : String(value));

          doc.text(text, x + 2, y + 3, {
            width: colWidth - 4,
            height: rowHeight,
            align,
            lineBreak: false
          });

          doc.rect(x, y, colWidth, rowHeight).stroke();
        }

        x += colWidths[i];
      });
    };

    const drawTableBorder = (rowCount) => {
      const totalHeight = rowHeight * (rowCount + 1);
      const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
      doc.lineWidth(1.0);
      doc.rect(startX, startY, totalWidth, totalHeight).stroke();
      doc.lineWidth(0.5);
    };

    drawRow(headers, startY, true);

    results.forEach((row, rowIndex) => {
      const y = startY + rowHeight * (rowIndex + 1);
      const rowData = [
        row.eid, row.name, row.ckno, row.rtime, row.otime, row.dtime,
        row.fw, row.sse, row.me, row.caw, row.cade, row.adv,
        row.csp, row.dd, row.gross, row.tax, row.net
      ];
      drawRow(rowData, y);
    });

    let grossTotal = 0, taxTotal = 0, netTotal = 0;
    results.forEach(row => {
      grossTotal += parseFloat(row.gross || 0);
      taxTotal += parseFloat(row.tax || 0);
      netTotal += parseFloat(row.net || 0);
    });

    const totalRowY = startY + rowHeight * (results.length + 1);
    const totalRow = new Array(headers.length).fill('');
    totalRow[13] = 'Total:';
    totalRow[14] = grossTotal;
    totalRow[15] = taxTotal;
    totalRow[16] = netTotal;

    drawRow(totalRow, totalRowY, false, true, true);
    drawTableBorder(results.length + 1);

    doc.end();
  } catch (err) {
    console.error('PDF 생성 오류:', err);
    res.status(500).send('DB 오류');
  }
});

module.exports = router;
