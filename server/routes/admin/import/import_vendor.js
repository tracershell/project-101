const express = require('express');
const router = express.Router();
const db = require('../../../db/mysql');
const PDFDocument = require('pdfkit');

// 목록 보기 + 필터
router.get('/', async (req, res) => {
  const { filter_name } = req.query;
  const [vendors] = await db.query(
    filter_name && filter_name !== ''
      ? 'SELECT * FROM import_vendor WHERE v_name = ? ORDER BY date DESC'
      : 'SELECT * FROM import_vendor ORDER BY date DESC',
    filter_name ? [filter_name] : []
  );
  const [names] = await db.query('SELECT DISTINCT v_name FROM import_vendor');
  res.render('admin/import/import_vendor', {
    title: 'Vender Management',
    vendors,
    names,
    filter_name
  });
});

// 등록
router.post('/add', async (req, res) => {
  const { date, v_name, vd_rate, v_address1, v_address2, v_phone, v_email, v_note } = req.body;
  await db.query(`
    INSERT INTO import_vendor (date, v_name, vd_rate, v_address1, v_address2, v_phone, v_email, v_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [date, v_name, vd_rate, v_address1, v_address2, v_phone, v_email, v_note]
  );
  res.redirect('/admin/import');
});

// 수정
router.get('/edit/:id', async (req, res) => {
  const [[vendor]] = await db.query('SELECT * FROM import_vendor WHERE id = ?', [req.params.id]);
  if (!vendor) return res.status(404).send('Vendor not found');
  res.render('admin/import/import_vendor_edit', { vendor });
});

// 삭제
router.post('/delete/:id', async (req, res) => {
  await db.query('DELETE FROM import_vendor WHERE id = ?', [req.params.id]);
  res.redirect('/');
});

// PDF 출력
router.get('/pdf', async (req, res) => {
  const [vendors] = await db.query('SELECT * FROM import_vendor ORDER BY date DESC');
  const doc = new PDFDocument({ margin: 30, size: 'letter' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=vendor_list.pdf');
  doc.pipe(res);

  doc.fontSize(16).text('Vendor List', { align: 'center' });
  doc.moveDown();

  vendors.forEach(v => {
    doc.fontSize(10).text(
      `${v.date.toISOString().split('T')[0]} | ${v.v_name} | ${v.vd_rate}% | ${v.v_address1} ${v.v_address2} | ${v.v_phone} | ${v.v_email} | ${v.v_note || ''}`
    );
  });

  doc.end();
});

module.exports = router;
