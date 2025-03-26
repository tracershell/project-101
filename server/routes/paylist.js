const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// GET /payroll - payroll.ejs 렌더링
router.get('/payroll', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  // active 상태인 직원 목록 가져오기 (콤보박스용)
  db.query('SELECT eid, name, jcode, jtitle, work1 FROM employees WHERE status = "active"', (err, results) => {
    if (err) return res.status(500).send('DB 오류');

    res.render('payroll', {
      layout: 'layout',
      title: 'Payroll Management',
      isAuthenticated: true,
      name: req.session.user.name,
      employees: results,
      now: new Date().toString()
    });
  });
});

// POST /paylist - 입력 저장
router.post('/paylist', (req, res) => {
  const {
    eid, name, jcode, jtitle, work1,
    pdate, ckno, rtime, otime, dtime,
    fw, sse, me, caw, cade, adv, csp, dd,
    gross, tax, net, remark
  } = req.body;

  const sql = `
    INSERT INTO paylist (
      eid, name, jcode, jtitle, work1,
      pdate, ckno, rtime, otime, dtime,
      fw, sse, me, caw, cade, adv, csp, dd,
      gross, tax, net, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    eid, name, jcode, jtitle, work1,
    pdate, ckno, rtime, otime, dtime,
    fw, sse, me, caw, cade, adv, csp, dd,
    gross, tax, net, remark
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send('급여 저장 오류');
    res.redirect('/payroll');
  });
});

module.exports = router;
