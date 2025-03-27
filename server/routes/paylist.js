const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

/*
// GET /paylist
router.get('/paylist', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const query = 'SELECT * FROM paylist ORDER BY pdate DESC, eid';

  db.query(query, (err, results) => {
    if (err) {
      console.error('paylist 조회 오류:', err);
      return res.status(500).send('급여 내역 조회 중 오류 발생');
    }

    res.render('paylist', {
      layout: 'layout',
      title: 'Pay List',
      isAuthenticated: true,
      name: req.session.user.name,
      paylist: results
    });
  });
});

*/



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





router.post('/paylist/add', (req, res) => {
  // 로그인 체크
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const {
    name, pdate, ckno_table, rtime, otime, dtime,
    fw, sse, me, caw, cade,
    adv, d1, dd,
    remark
  } = req.body;

  const eid = req.body.eid || ''; // HTML에서 전달 받은 eid
  const jcode = req.body.jcode || '';
  const jtitle = req.body.jtitle || '';
  const work1 = req.body.work1 || '';

  const gross = parseFloat(rtime || 0) + parseFloat(otime || 0) + parseFloat(dtime || 0);
  const tax = gross * 0.15;
  const net = gross - tax;

  // 날짜 + eid로 중복 체크 (예: 동일 날짜에 동일 직원 중복 입력 방지)
  const checkQuery = 'SELECT COUNT(*) AS count FROM paylist WHERE eid = ? AND pdate = ?';
  db.query(checkQuery, [eid, pdate], (err, results) => {
    if (err) {
      console.error('중복 확인 오류:', err);
      return res.status(500).send('중복 확인 중 오류 발생');
    }

    if (results[0].count > 0) {
      return res.send(`
        <script>
          alert("이미 같은 날짜에 저장된 데이터가 있습니다 (eid: ${eid})");
          history.back();
        </script>
      `);
    }

    // 중복 없으면 INSERT
    const insertQuery = `
      INSERT INTO paylist (
        eid, name, jcode, jtitle, work1,
        pdate, ckno, rtime, otime, dtime,
        fw, sse, me, caw, cade,
        adv, csp, dd,
        gross, tax, net,
        remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      eid, name, jcode, jtitle, work1,
      pdate, ckno_table, rtime, otime, dtime,
      fw, sse, me, caw, cade,
      adv, d1, dd,
      gross.toFixed(2), tax.toFixed(2), net.toFixed(2),
      remark
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('paylist 저장 오류:', err);
        return res.status(500).send('급여 정보 저장 중 오류 발생');
      }

      res.redirect('/payroll'); // 목록 페이지로 이동
    });
  });
});




module.exports = router;
