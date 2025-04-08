const express = require('express');
const router = express.Router();
const db = require('../../../db/mysql');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// 컬럼 설정
const headers = [
  'Date', 'Vendor Name', 'D Rate', 'Address', 'Phone', 'Email', 'Note'
];

const colWidths = [
  60,     // 등록일
  120,    // Vendor Name
  30,     // Deposit Rate
  270,    // Address
  70,    // Phone          
  100,    // Email     
  160     // Note      
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

    const startX = 20;        // 시작 X 좌표 (왼쪽 여백 조절) ++++ ===>
    const startY = 40;        // 시작 Y 좌표 (왼쪽 여백 조절) ++++  V
    const rowHeight = 20;

    doc.fontSize(11).text('Vendor List', startX, 20, { align: 'center' });   // 폰트 크기 , font 위치 
    doc.fontSize(7);

    // 헤더
    const drawRow = (rowData, y, isHeader = false, bold = false) => {
      let x = startX;
      doc.font(bold ? 'Korean-Bold' : 'Korean');
      rowData.forEach((text, i) => {
        const colWidth = colWidths[i];
        doc.lineWidth(isHeader ? 1 : 0.5);                // 모든 선 두께 0.5 기본값 (얇음) , 1 : 조금 더 굵게, 2: 꽤 굵게
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
        `${parseInt(v.vd_rate)}%`,                // 소수점 제거
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

// 📥 PDF 다운로드 라우터
router.get('/pdfdownload', async (req, res) => {
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

    const doc = new PDFDocument({ margin: 40, size: 'letter', layout: 'landscape' });
    doc.registerFont('Korean', fontPath).font('Korean');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=vendor_list.pdf');
    doc.pipe(res);

    const startX = 20;
    const startY = 40;
    const rowHeight = 20;

    doc.fontSize(11).text('Vendor List', startX, 20, { align: 'center' });
    doc.fontSize(7);

    const drawRow = (rowData, y, isHeader = false, bold = false) => {
      let x = startX;
      doc.font(bold ? 'Korean-Bold' : 'Korean');
      rowData.forEach((text, i) => {
        const colWidth = colWidths[i];
        doc.lineWidth(isHeader ? 1 : 0.5);
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
        `${parseInt(v.vd_rate)}%`,
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