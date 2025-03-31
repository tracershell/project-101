
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
  
  router.post('/final', async (req, res) => {
    const { po_id, amount } = req.body;
    const paydate = req.session.paydate;
    const exrate = req.session.exrate;
  
    // 실제 결제 로직
    await connection.query(`
      INSERT INTO popayment (po_id, payamount, paydate, exrate, paytype)
      VALUES (?, ?, ?, ?, '잔금')
    `, [po_id, amount, paydate, exrate]);
  
    // 잔금 0 으로 업데이트
    await connection.query(`UPDATE purchase_order SET remain = 0 WHERE id = ?`, [po_id]);
  
    res.redirect('/import_an');
  });
  

  // router.post('/deposit', async (req, res) => {
  //   try {
  //     const { po_id, amount } = req.body;
  //     const paydate = req.session.paydate;
  //     const exrate = req.session.exrate;
  
  //     if (!paydate || !exrate) {
  //       return res.status(400).send('결제일과 환율 정보가 없습니다. 먼저 결제 정보를 입력하세요.');
  //     }
  
  //     // 1. 결제 기록 추가
  //     await connection.query(`
  //       INSERT INTO popayment (po_id, payamount, paydate, exrate, paytype)
  //       VALUES (?, ?, ?, ?, 'deposit')
  //     `, [po_id, amount, paydate, exrate]);
  
  //     // 2. 잔금 차감 + deposit_paid 설정
  //     await connection.query(`
  //       UPDATE po
  //       SET remain = remain - ?, deposit_paid = 1
  //       WHERE id = ?
  //     `, [amount, po_id]);
  
  //     res.redirect('/import_an');
  //   } catch (error) {
  //     console.error('30% 결제 처리 중 오류:', error);
  //     res.status(500).send('30% 결제 처리 중 서버 오류가 발생했습니다.');
  //   }
  // });

 

  module.exports = router;