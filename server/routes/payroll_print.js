const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// payroll PDF 보기
router.get('/payroll/pdf-view', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const pdate = req.query.pdate;
  if (!pdate) return res.send('날짜가 없습니다.');

  try {
    const [results] = await db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate]);
    res.render('pdf-payroll-view', {
      layout: false,
      pdate,
      list: results
    });
  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

// payroll PDF 인쇄용
router.get('/payroll/pdf-print', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const pdate = req.query.pdate;
  if (!pdate) return res.send('날짜가 없습니다.');

  try {
    const [results] = await db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate]);
    res.render('pdf-payroll-print', {
      layout: false,
      pdate,
      list: results
    });
  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

module.exports = router;
