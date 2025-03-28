const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// 숫자 쉼표 제거 및 float 변환 유틸 함수
function toNumber(value) {
  return parseFloat(String(value).replace(/,/g, '')) || 0;
}


// GET: payroll form
router.get('/payroll', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  db.query('SELECT eid, name, jcode, jtitle, work1 FROM employees WHERE status = "active"', (err, results) => {
    if (err) return res.status(500).send('DB 오류');

    const selectedPdate = req.session.lastPayDate || '';      // post 로 넘겨 받은 paydate 세션을 get router 에서 상수화 (아래쪽 render 에 넘긴다)
    const selectedEidName = req.session.lastEidName || '';  // post 로 넘겨 받은 eid, name 세션을 get router 에서 상수화 (아래쪽 render 에 넘긴다)
    delete req.session.lastPayDate;                           // 1회성으로 사용 후 삭제 (상수로 일단 아래로, 세션은 삭제)
    delete req.session.lastEidName;                           // 1회성으로 사용 후 삭제  (상수로 일단 아래로, 세션은 삭제)      


    res.render('payroll', {
      layout: 'layout',
      title: 'Payroll Management',
      isAuthenticated: true,
      name: req.session.user.name,
      employees: results,
      selectedPdate,                                   // 🟢 이 값을 EJS에 넘겨줘야 오류가 안 납니다
      selectedEidName,                                 // ✅ 다음 page 보여주려고 session 에 추가
      now: new Date().toString()
    });
  });
});


// POST: payroll 입력 저장
router.post('/paylist/add', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const {
    name, pdate, ckno_table, rtime, otime, dtime,
    fw, sse, me, caw, cade,
    adv, d1, dd, remark,
    eid, jcode, jtitle, work1
  } = req.body;

  req.session.lastPayDate = pdate;                      // post 로 받아와서 일단 pay date 를 세션에 저장 (get 으로 넘겨주고 삭제)
  req.session.lastEidName = `eid: ${eid} / ${name}`;   // pay date 세션에 저장 : 두 세션값을 함께 받을 수 있는 이유는 pdate 는 input 요소 


  // 쉼표 제거 및 숫자 변환 처리
  const rtimeNum = toNumber(rtime);
  const otimeNum = toNumber(otime);
  const dtimeNum = toNumber(dtime);
  const fwNum = toNumber(fw);
  const sseNum = toNumber(sse);
  const meNum = toNumber(me);
  const cawNum = toNumber(caw);
  const cadeNum = toNumber(cade);
  const advNum = toNumber(adv);
  const d1Num = toNumber(d1);
  const ddNum = toNumber(dd);

  const gross = rtimeNum + otimeNum + dtimeNum;
  const tax = fwNum + sseNum + meNum + cawNum + cadeNum;
  const net = gross - tax;

  // 날짜 + eid 중복 확인
  const checkQuery = 'SELECT COUNT(*) AS count FROM paylist WHERE eid = ? AND pdate = ?';
  db.query(checkQuery, [eid, pdate], (err, results) => {
    if (err) return res.status(500).send('중복 확인 오류');

    if (results[0].count > 0) {
      return res.send(`
        <script>
          alert("이미 같은 날짜에 저장된 데이터가 있습니다 (eid: ${eid})");
          history.back();
        </script>
      `);
    }

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
      pdate, ckno_table, rtimeNum, otimeNum, dtimeNum,
      fwNum, sseNum, meNum, cawNum, cadeNum,
      advNum, d1Num, ddNum,
      gross.toFixed(2), tax.toFixed(2), net.toFixed(2),
      remark
    ];

    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error('paylist 저장 오류:', err);
        return res.status(500).send('급여 정보 저장 중 오류 발생');
      }

      res.redirect('/payroll');
    });
  });
});


// GET /paylist/latest?eid=xxx
router.get('/payroll/paylist/latest', (req, res) => {
  const eid = req.query.eid;
  if (!eid) return res.json({ success: false, message: 'eid 누락' });

  const sql = `
    SELECT rtime, otime, dtime, fw, sse, me, caw, cade, adv, csp AS d1, dd
    FROM paylist
    WHERE eid = ?
    ORDER BY pdate DESC
    LIMIT 1
  `;

  db.query(sql, [eid], (err, results) => {
    if (err) {
      console.error('paylist 최신 데이터 조회 오류:', err);
      return res.json({ success: false });
    }
    if (results.length === 0) {
      return res.json({ success: false });
    }

    res.json({ success: true, ...results[0] });
  });
});



module.exports = router;
