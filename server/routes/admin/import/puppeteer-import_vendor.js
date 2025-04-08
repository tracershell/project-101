const express = require('express');
const router = express.Router();
const db = require('../../../db/mysql');
const puppeteer = require('puppeteer');   // PDF 출력에 사용, pdfview에 사용
const fs = require('fs-extra');                 // PDF 출력에 사용, pdfview에 사용    
const path = require('path');             // PDF 출력에 사용, pdfview에 사용 
const ejs = require('ejs');               // pdfview에 사용

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
  res.render('admin/import/import_vendor_edit', {
    title: 'Vender Edit',
    vendor });
});

// 수정 저장 처리
router.post('/edit/:id', async (req, res) => {
  const { date, v_name, vd_rate, v_address1, v_address2, v_phone, v_email, v_note } = req.body;
  const { id } = req.params;

  await db.query(`
    UPDATE import_vendor 
    SET date = ?, v_name = ?, vd_rate = ?, v_address1 = ?, v_address2 = ?, v_phone = ?, v_email = ?, v_note = ?
    WHERE id = ?
  `, [date, v_name, vd_rate, v_address1, v_address2, v_phone, v_email, v_note, id]);

  res.redirect('/admin/import');
});

// 삭제
router.post('/delete/:id', async (req, res) => {
  await db.query('DELETE FROM import_vendor WHERE id = ?', [req.params.id]);
  res.redirect('/admin/import');
});

// PDF 출력
// PDF 출력 (puppeteer 사용)
router.get('/xxxxxxx', async (req, res) => {
  const { filter_name } = req.query;
  const [vendors] = await db.query(
    filter_name && filter_name !== ''
      ? 'SELECT * FROM import_vendor WHERE v_name = ? ORDER BY date DESC'
      : 'SELECT * FROM import_vendor ORDER BY date DESC',
    filter_name ? [filter_name] : []
  );
  const [names] = await db.query('SELECT DISTINCT v_name FROM import_vendor');

  try {
    const html = await ejs.renderFile(
      path.resolve('views/admin/import/import_vendor_pdf.ejs'),
      { vendors, names, filter_name }
    );

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'letter',
      landscape: true,
      printBackground: true
    });

    await browser.close();

    // 파일 저장 (옵션)
    const outputPath = path.join(__dirname, '../../../public/pdfs/vendor_list.pdf');
    await fs.outputFile(outputPath, pdfBuffer);

    // 응답
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=vendor_list.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    res.status(500).send('PDF 생성 오류: ' + error.message);
  }
});


// ✅ HTML 화면에서 리스트 출력용 라우트 (PDFVIEW)
router.get('/pdfview', async (req, res) => {
  const { filter_name } = req.query;
  const [vendors] = await db.query(
    filter_name && filter_name !== ''
      ? 'SELECT * FROM import_vendor WHERE v_name = ? ORDER BY date DESC'
      : 'SELECT * FROM import_vendor ORDER BY date DESC',
    filter_name ? [filter_name] : []
  );
  const [names] = await db.query('SELECT DISTINCT v_name FROM import_vendor');

  res.render('admin/import/import_vendor_pdfview', {
    title: 'Vendor List View',
    vendors,
    names,
    filter_name
  });
});


// ✅ PDF view 에서 다운로드 버튼 클릭 시 PDF 생성
router.get('/pdfdownload', async (req, res) => {
  const { filter_name } = req.query;
  const [vendors] = await db.query(
    filter_name && filter_name !== ''
      ? 'SELECT * FROM import_vendor WHERE v_name = ? ORDER BY date DESC'
      : 'SELECT * FROM import_vendor ORDER BY date DESC',
    filter_name ? [filter_name] : []
  );
  const [names] = await db.query('SELECT DISTINCT v_name FROM import_vendor');

  const html = await ejs.renderFile(path.resolve('views/admin/import/import_vendor_pdf.ejs'), {
    vendors,
    names,
    filter_name
  });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(`data:text/html;charset=utf-8,${html}`, {
    waitUntil: 'networkidle0',
  });

  const pdfBuffer = await page.pdf({
    format: 'letter',
    landscape: true,
    printBackground: true
  });

  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=vendor_list.pdf');
  res.send(pdfBuffer);
});

module.exports = router;
