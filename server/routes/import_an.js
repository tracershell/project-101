const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// PO 목록 조회
router.get('/import_an', (req, res) => {
  const { filter } = req.query;
  let query = 'SELECT * FROM po ORDER BY podate DESC';
  if (filter === 'unpaid') query = 'SELECT * FROM po WHERE remain > 0 ORDER BY podate DESC';
  else if (filter === 'paid') query = 'SELECT * FROM po WHERE remain = 0 ORDER BY podate DESC';

  db.query(query, (err, results) => {
    if (err) return res.status(500).send('PO 조회 오류');
    res.render('import_an', {
      layout: 'layout',
      title: 'PO 관리',
      isAuthenticated: req.session.user ? true : false,
      name: req.session.user?.name || '',
      poList: results,
      now: new Date().toString()
    });
  });
});

// PO 입력 저장
router.post('/import_an/add', (req, res) => {
  const { podate, pono, style, pcs, price, note } = req.body;
  const poamount = parseFloat(pcs) * parseFloat(price);
  const remain = poamount;

  const insertQuery = `
    INSERT INTO po (podate, pono, style, pcs, price, poamount, note, remain)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [podate, pono, style, pcs, price, poamount, note, remain], (err) => {
    if (err) {
      console.error('PO 저장 오류:', err);
      return res.status(500).send('PO 저장 실패');
    }
    res.redirect('/import_an');
  });
});


// POST: 30% 선수금 지급 처리
router.post('/import_an/pay30', (req, res) => {
  const { po_id, paydate, exrate } = req.body;

  const getPO = 'SELECT * FROM po WHERE id = ?';
  db.query(getPO, [po_id], (err, results) => {
    if (err || results.length === 0) return res.status(500).send('PO 조회 실패');

    const po = results[0];
    const payamount = parseFloat(po.poamount) * 0.3;
    const remain = parseFloat(po.poamount) - payamount;

    const insertPayment = `
      INSERT INTO popayment (po_id, paydate, paytype, exrate, payamount, note)
      VALUES (?, ?, 'partial', ?, ?, '30% 선수금 지급')
    `;

    const updatePO = `
      UPDATE po SET remain = ?, note = '30% paid' WHERE id = ?
    `;

    db.query(insertPayment, [po_id, paydate, exrate, payamount], (err) => {
      if (err) return res.status(500).send('지급 정보 저장 오류');

      db.query(updatePO, [remain, po_id], (err2) => {
        if (err2) return res.status(500).send('PO 업데이트 오류');

        res.redirect('/import_an');
      });
    });
  });
});


router.post('/import_an/payfinal', (req, res) => {
  const { po_id, pcs, price, paydate, exrate } = req.body;
  const finalAmount = parseFloat(pcs) * parseFloat(price);

  const getPaidAmount = `
    SELECT SUM(payamount) as total_paid FROM popayment WHERE po_id = ?
  `;
  db.query(getPaidAmount, [po_id], (err, result) => {
    if (err) return res.status(500).send('지급 합계 조회 실패');

    const paidSoFar = result[0].total_paid || 0;
    const remainAmount = finalAmount - paidSoFar;

    const insertPayment = `
      INSERT INTO popayment (po_id, paydate, paytype, exrate, payamount, note)
      VALUES (?, ?, 'full', ?, ?, '잔금 지급 완료')
    `;

    const updatePO = `
      UPDATE po SET pcs = ?, price = ?, poamount = ?, remain = 0, note = 'full paid' WHERE id = ?
    `;

    db.query(insertPayment, [po_id, paydate, exrate, remainAmount], (err) => {
      if (err) return res.status(500).send('잔금 지급 저장 오류');

      db.query(updatePO, [pcs, price, finalAmount, po_id], (err) => {
        if (err) return res.status(500).send('PO 업데이트 오류');
        res.redirect('/import_an');
      });
    });
  });
});

const PDFDocument = require('pdfkit');

router.get('/import_an/export/pdf', (req, res) => {
  db.query('SELECT * FROM po ORDER BY podate DESC', (err, results) => {
    if (err) return res.status(500).send('PDF 조회 오류');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=po_list.pdf');
    doc.pipe(res);

    doc.fontSize(14).text('PO 리스트', { align: 'center' });
    doc.moveDown();

    results.forEach(po => {
      doc.fontSize(10).text(
        `${po.podate} | ${po.pono} | ${po.style} | ${po.pcs} pcs | $${po.price.toFixed(2)} | Amount: $${po.poamount.toFixed(2)} | Remain: $${po.remain.toFixed(2)} | ${po.note}`
      );
    });

    doc.end();
  });
});


const excel = require('exceljs');

router.get('/import_an/export/excel', async (req, res) => {
  db.query('SELECT * FROM po ORDER BY podate DESC', async (err, results) => {
    if (err) return res.status(500).send('엑셀 오류');

    const workbook = new excel.Workbook();
    const sheet = workbook.addWorksheet('PO List');

    sheet.columns = [
      { header: 'PO Date', key: 'podate', width: 15 },
      { header: 'PO No', key: 'pono', width: 15 },
      { header: 'Style', key: 'style', width: 15 },
      { header: 'PCS', key: 'pcs', width: 10 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Amount', key: 'poamount', width: 15 },
      { header: 'Remain', key: 'remain', width: 15 },
      { header: 'Note', key: 'note', width: 20 }
    ];

    sheet.addRows(results);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=po_list.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
});


module.exports = router;
