const express = require('express');
const router = express.Router();
const db = require('../../../db/mysql');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// 컬럼 설정
const headers = [
  '등록일', 'Vendor Name', 'Deposit Rate', 'Address', 'Phone', 'Email', 'Note'
];

const colWidths = [
  60, 100, 60, 200, 100, 150, 160
];

// 📄 PDF 출력 라우터
router.get('/pdf', async (req, res) => {
  const { filter_name } = req.query;
  const [vendors] = await db.query(
    filter_name && filter_name !== ''
      ? 'SELECT * FROM import_vendor WHERE v_name = ? ORDER BY date DESC'
      : 'SELECT * FROM import_vendor ORDER BY date DESC',
    filter_name ? [filter_name] : []
  );

  try {
    const fontPath = path.resolve('public/fonts/NotoSansKR-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
      return res.status(500).send('폰트 파일이 존재하지 않습니다.');
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    doc.registerFont('Korean', fontPath).font('Korean');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=vendor_list.pdf');
    doc.pipe(res);

    const startX = 40;
    const startY = 80;
    const rowHeight = 20;

    doc.fontSize(16).text('Vendor List', { align: 'center' });
    doc.fontSize(10);

    // 헤더
    const drawRow = (rowData, y, isHeader = false, bold = false) => {
      let x = startX;
      doc.font(bold ? 'Korean-Bold' : 'Korean');
      rowData.forEach((text, i) => {
        const colWidth = colWidths[i];
        doc.rect(x, y, colWidth, rowHeight).stroke();
        doc.text(text, x + 4, y + 6, {
          width: colWidth - 8,
          align: isHeader ? 'center' : 'left',
        });
        x += colWidth;
      });
    };

    drawRow(headers, startY, true);

    vendors.forEach((v, i) => {
      const y = startY + rowHeight * (i + 1);
      const rowData = [
        v.date.toISOString().split('T')[0],
        v.v_name,
        `${v.vd_rate}%`,
        `${v.v_address1} ${v.v_address2}`,
        v.v_phone,
        v.v_email,
        v.v_note || ''
      ];
      drawRow(rowData, y);
    });

    doc.end();
  } catch (err) {
    console.error('PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 오류: ' + err.message);
  }
});

module.exports = router;