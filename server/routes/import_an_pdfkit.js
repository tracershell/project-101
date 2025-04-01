const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../db/mysql');

router.get('/import_an/pdf-generate', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const title = req.query.title || 'Deposit Payment List';

  try {
    // 🔥 'note = full paid' 인 것만 제외, 빈 문자열과 null은 포함
    const [results] = await db.query(`
      SELECT pono, style, podate, poamount, remain, note
      FROM po
      WHERE poamount - remain > 0
        AND (note IS NULL OR note = '' OR TRIM(note) != 'full paid')
      ORDER BY podate DESC
    `);

    const doc = new PDFDocument({ margin: 40, size: 'letter' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="deposit-list.pdf"');
    doc.pipe(res);

    // 타이틀
    doc.font('Helvetica-Bold').fontSize(16).text(title, { align: 'center' });
    doc.moveDown();

    const headers = ['PO Date', 'PO No', 'Style', 'Amount(CNY)', 'Remain(CNY)', 'Deposit(CNY)', 'Note'];
    const colWidths = [70, 55, 85, 85, 85, 85, 75];
    const rowHeight = 18;
    const startX = 35;
    let y = doc.y;

    const drawRow = (row, isHeader = false, bold = false) => {
      let x = startX;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);

      row.forEach((cell, i) => {
        const text = typeof cell === 'number' ? cell.toFixed(2) : String(cell || '');
        doc.text(text, x + 2, y + 5, {
          width: colWidths[i] - 4,
          align: isHeader ? 'center'
                : (i >= 3 && i <= 5 ? 'center' : 'center'),  // ← 금액 항목 가운데 정렬
        });
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        x += colWidths[i];
      });

      y += rowHeight;
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 40;
      }
    };

    drawRow(headers, true, true);

    let totalDeposit = 0;

    results.forEach(row => {
      const poAmount = parseFloat(row.poamount || 0);
      const remain = parseFloat(row.remain || 0);
      const deposit = poAmount - remain;
      totalDeposit += deposit;

      drawRow([
        new Date(row.podate).toLocaleDateString(),
        row.pono,
        row.style,
        poAmount,
        remain,
        deposit,
        row.note || '' // note가 null 또는 빈 문자열이면 그대로 보여줌
      ]);
    });

    drawRow(['', '', 'Total', '', '', totalDeposit, ''], false, true);
   // drawTotalRow(totalDeposit);

    doc.end();

  } catch (err) {
    console.error('PDF 생성 오류:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

module.exports = router;
