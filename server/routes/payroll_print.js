const express = require('express');
const router = express.Router();   // ✅ 이 줄이 빠졌습니다!
const db = require('../db/mysql');  // ✅ MySQL 연결 모듈 경로 맞게

// payroll PDF 보기
router.get('/payroll/pdf-view', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
  
    const pdate = req.query.pdate;
    if (!pdate) return res.send('날짜가 없습니다.');
  
    db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate], (err, results) => {
      if (err) return res.status(500).send('DB 오류');
  
      res.render('pdf-payroll-view', {
        layout: false,
        pdate,
        list: results
      });
    });
  });
  
  // payroll PDF 인쇄용
  router.get('/payroll/pdf-print', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
  
    const pdate = req.query.pdate;
    if (!pdate) return res.send('날짜가 없습니다.');
  
    db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate], (err, results) => {
      if (err) return res.status(500).send('DB 오류');
  
      res.render('pdf-payroll-print', {
        layout: false,
        pdate,
        list: results
      });
    });
  });
  

  module.exports = router;