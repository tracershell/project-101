const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const PDFDocument = require('pdfkit');
const excel = require('exceljs');

// PO 목록 조회
router.get('/import_an', async (req, res) => {
  const { filter } = req.query;
  let query = 'SELECT * FROM po ORDER BY podate DESC';
  if (filter === 'unpaid') query = 'SELECT * FROM po WHERE remain > 0 ORDER BY podate DESC';
  else if (filter === 'paid') query = 'SELECT * FROM po WHERE remain = 0 ORDER BY podate DESC';

  try {
    const [results] = await db.query(query);
    res.render('import_an', {
      layout: 'layout',
      title: 'PO 관리',
      isAuthenticated: !!req.session.user,
      name: req.session.user?.name || '',
      poList: results,
      now: new Date().toString(),
      filter
    });
  } catch (err) {
    res.status(500).send('PO 조회 오류');
  }
});

// PO 입력 저장
router.post('/import_an/add', async (req, res) => {
  const { podate, pono, style, pcs, price } = req.body;
  const pcsNum = parseInt(pcs);
  const priceNum = parseFloat(price);
  const poamount = pcsNum * priceNum;
  const remain = poamount;

  try {
    await db.query(`INSERT INTO po (podate, pono, style, pcs, price, poamount, remain) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [podate, pono, style, pcsNum, priceNum, poamount, remain]);
    res.redirect('/import_an');
  } catch (err) {
    console.error('PO 등록 오류:', err);
    res.status(500).send('PO 등록 중 오류 발생');
  }
});

// 수정 페이지 열기
router.get('/import_an/edit/:id', async (req, res) => {
  try {
    const [[po]] = await db.query('SELECT * FROM po WHERE id = ?', [req.params.id]);
    if (!po) return res.status(404).send('PO를 찾을 수 없습니다');

    res.render('import_an_edit', {
      layout: 'layout',
      title: 'PO 수정',
      po
    });
  } catch (err) {
    res.status(500).send('조회 오류 발생');
  }
});

// 수정처리
router.post('/import_an/edit/:id', async (req, res) => {
  const { podate, pono, style, pcs, price } = req.body;
  const pcsNum = parseInt(pcs);
  const priceNum = parseFloat(price);
  const poamount = pcsNum * priceNum;
  try {
    const [[old]] = await db.query('SELECT * FROM po WHERE id = ?', [req.params.id]);
    const paid = old.poamount - old.remain;
    const newRemain = poamount - paid;
    await db.query(`UPDATE po SET podate = ?, pono = ?, style = ?, pcs = ?, price = ?, poamount = ?, remain = ? WHERE id = ?`,
      [podate, pono, style, pcsNum, priceNum, poamount, newRemain, req.params.id]);
    res.redirect('/import_an');
  } catch (err) {
    res.status(500).send('수정 오류');
  }
});

// 삭제 처리
router.post('/import_an/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM popayment WHERE po_id = ?', [req.params.id]);
    await db.query('DELETE FROM po WHERE id = ?', [req.params.id]);
    res.redirect('/import_an');
  } catch (err) {
    res.status(500).send('삭제 오류');
  }
});

// 30% 선수금 지급 처리
router.post('/import_an/pay30', async (req, res) => {
  const { po_id, paydate, exrate } = req.body;
  try {
    const [[po]] = await db.query('SELECT * FROM po WHERE id = ?', [po_id]);
    if (!po) return res.status(404).send('PO 조회 실패');

    const payamount = po.poamount * 0.3;
    const remain = po.poamount - payamount;

    await db.query(`INSERT INTO popayment (po_id, paydate, paytype, exrate, payamount, note) VALUES (?, ?, 'partial', ?, ?, '30% 선수금 지급')`,
      [po_id, paydate, exrate, payamount]);
    await db.query(`UPDATE po SET remain = ?, note = '30% paid' WHERE id = ?`, [remain, po_id]);
    res.redirect('/import_an');
  } catch (err) {
    res.status(500).send('30% 지급 오류');
  }
});

// 잔금 지급 처리
router.post('/import_an/payfinal', async (req, res) => {
  const { po_id, pcs, price, paydate, exrate } = req.body;
  const finalAmount = parseFloat(pcs) * parseFloat(price);
  try {
    const [[{ total_paid }]] = await db.query('SELECT SUM(payamount) as total_paid FROM popayment WHERE po_id = ?', [po_id]);
    const remainAmount = finalAmount - (total_paid || 0);
    await db.query(`INSERT INTO popayment (po_id, paydate, paytype, exrate, payamount, note) VALUES (?, ?, 'full', ?, ?, '잔금 지급 완료')`,
      [po_id, paydate, exrate, remainAmount]);
    await db.query(`UPDATE po SET pcs = ?, price = ?, poamount = ?, remain = 0, note = 'full paid' WHERE id = ?`,
      [pcs, price, finalAmount, po_id]);
    res.redirect('/import_an');
  } catch (err) {
    res.status(500).send('잔금 지급 오류');
  }
});

// PDF 내보내기
router.get('/import_an/export/pdf', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM po ORDER BY podate DESC');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=po_list.pdf');
    doc.pipe(res);
    doc.fontSize(14).text('PO 리스트', { align: 'center' });
    doc.moveDown();
    results.forEach(po => {
      doc.fontSize(10).text(`${po.podate} | ${po.pono} | ${po.style} | ${po.pcs} pcs | $${po.price.toFixed(2)} | Amount: $${po.poamount.toFixed(2)} | Remain: $${po.remain.toFixed(2)} | ${po.note}`);
    });
    doc.end();
  } catch (err) {
    res.status(500).send('PDF 오류');
  }
});

// 엑셀 내보내기
router.get('/import_an/export/excel', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM po ORDER BY podate DESC');
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
      { header: 'Note', key: 'note', width: 20 },
    ];
    sheet.addRows(results);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=po_list.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).send('엑셀 오류');
  }
});

// 수동 입금 처리
router.post('/popayment/deposit', async (req, res) => {
  try {
    const { po_id, amount } = req.body;
    const payAmount = parseFloat(amount);
    const paydate = req.session.paydate;
    const exrate = parseFloat(req.session.exrate);
    if (!paydate || !exrate) return res.send('결제일 또는 환율이 누락되었습니다. 먼저 입력해주세요.');
    const [[po]] = await db.query('SELECT * FROM po WHERE id = ?', [po_id]);
    if (!po) return res.status(404).send('해당 PO를 찾을 수 없습니다.');
    await db.query(`INSERT INTO popayment (po_id, paydate, paytype, exrate, payamount, note) VALUES (?, ?, 'partial', ?, ?, '30% paid')`,
      [po_id, paydate, exrate, payAmount]);
    const newRemain = po.remain - payAmount;
    const note = newRemain <= 0 ? 'full paid' : '30% paid';
    await db.query('UPDATE po SET remain = ?, note = ? WHERE id = ?', [newRemain, note, po_id]);
    res.redirect('/import_an');
  } catch (err) {
    console.error('30% 결제 처리 중 오류:', err);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

module.exports = router;