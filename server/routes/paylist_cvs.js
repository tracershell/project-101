const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const { format } = require('@fast-csv/format');

router.get('/payroll/csv-export', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const pdate = req.query.pdate;
  if (!pdate) return res.status(400).send('날짜가 없습니다.');

  try {
    const [results] = await db.query('SELECT * FROM paylist WHERE pdate = ?', [pdate]);

    res.setHeader('Content-Disposition', `attachment; filename=paylist-${pdate}.csv`);
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    results.forEach(row => {
      csvStream.write({
        ID: row.eid,
        Name: row.name,
        CKNO: row.ckno,
        RTime: row.rtime,
        OTime: row.otime,
        DTime: row.dtime,
        FIT: row.fw,
        SS: row.sse,
        MED: row.me,
        CAT: row.caw,
        CAD: row.cade,
        ADV: row.adv,
        CSP: row.csp,
        PDD: row.dd,
        Gross: row.gross,
        Tax: row.tax,
        Net: row.net,
        Remark: row.remark
      });
    });

    csvStream.end();
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).send('DB 오류');
  }
});

module.exports = router;
