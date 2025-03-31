
const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const PDFDocument = require('pdfkit');
const excel = require('exceljs');


// 전체 결제 보기
router.get('/popayment/history/all', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const [results] = await db.query(`
      SELECT p.*, o.pono, o.style 
      FROM popayment p
      JOIN po o ON p.po_id = o.id
      ORDER BY p.paydate DESC
    `);

    res.render('import_an_phistory_all', {
      layout: 'layout',
      title: '전체 결제 내역',
      isAuthenticated: !!req.session.user,
      name: req.session.user?.name || '',
      payments: results
    });
  } catch (err) {
    console.error('전체 결제 조회 오류:', err);
    res.status(500).send('전체 결제 조회 오류');
  }
});
  
  // 선택 날짜 결제 보기
  router.get('/popayment/history/bydate', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { paydate } = req.query;
    if (!paydate) return res.send('날짜가 없습니다.');
  
    try {
      const [results] = await db.query(`
        SELECT p.*, o.pono, o.style 
        FROM popayment p
        JOIN po o ON p.po_id = o.id
        WHERE p.paydate = ?
        ORDER BY p.paydate DESC
      `, [paydate]);
  
      res.render('import_an_phistory_date', {
        layout: 'layout',
        title: `${paydate} 결제 내역`,
        paydate,
        isAuthenticated: !!req.session.user,
        name: req.session.user?.name || '',
        payments: results
      });
    } catch (err) {
      console.error('선택 날짜 결제 조회 오류:', err);
      res.status(500).send('선택 날짜 결제 조회 오류');
    }
  });
  
  
  module.exports = router;