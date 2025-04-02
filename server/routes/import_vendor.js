const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// 📄 Vendor PO 등록 페이지
router.get('/import_vendor', async (req, res) => {
  try {
    const [vendors] = await db.query('SELECT name FROM vendor_name ORDER BY name');
    const [povendorList] = await db.query('SELECT * FROM povendor ORDER BY podate DESC');

    const selectedVendor = req.session.selectedVendor || vendors[0]?.name || '';

    res.render('import_vendor', {
      vendorNames: vendors,        // ✅ 이 줄이 있어야 ejs에서 vendorNames 사용 가능
      title: 'Vendor Import',
      povendorList,
      selectedVendor
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 에러');
  }
});


// 📝 Vendor PO 입력 저장
router.post('/import_vendor/add', async (req, res) => {
  const { podate, pono, vendor_name, style, pcs, price, deposit_rate } = req.body;
  const pcsNum = parseInt(pcs);
  const priceNum = parseFloat(price);
  const poamount = pcsNum * priceNum;
  const remain = poamount;
  const depositNote = deposit_rate ? `${deposit_rate}% 예정` : '예정';

  try {
    await db.query(`
      INSERT INTO povendor (podate, pono, vendor_name, style, pcs, price, poamount, remain, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [podate, pono, vendor_name, style, pcsNum, priceNum, poamount, remain, depositNote]);

    res.redirect('/import_vendor');
  } catch (err) {
    console.error('Vendor PO 등록 오류:', err);
    res.status(500).send('Vendor PO 등록 중 오류 발생');
  }
});

router.get('/import_vendor', async (req, res) => {
  const [vendors] = await db.query('SELECT name FROM vendor_name');
  const [povendorList] = await db.query('SELECT * FROM your_po_table ORDER BY podate DESC');

  // 세션 또는 쿼리로 선택된 vendor 기억
  const selectedVendor = req.session.selectedVendor || vendors[0]?.name || '';

  res.render('import_vendor', {
    vendorNames: vendors,
    povendorList,
    selectedVendor
  });
});


router.post('/vendor_name/add', async (req, res) => {
  const newVendor = req.body.new_vendor;

  await db.query('INSERT INTO vendor_name (name) VALUES (?)', [newVendor]);

  // 선택된 vendor를 기억 (세션 사용)
  req.session.selectedVendor = newVendor;

  res.redirect('/import_vendor');
});



module.exports = router;