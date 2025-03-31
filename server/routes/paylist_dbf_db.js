const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { DBFFile } = require('dbffile');
const db = require('../db/mysql');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

router.post('/paylist/upload-dbf', upload.single('dbffile'), async (req, res) => {
  if (!req.file) return res.status(400).send('DBF 파일이 업로드되지 않았습니다.');

  const filePath = path.resolve(req.file.path);

  try {
    const dbf = await DBFFile.open(filePath);
    const records = await dbf.readRecords();

    const results = records.map(row => {
      const rtime = parseFloat(row.RTIME) || 0;
      const otime = parseFloat(row.OTIME) || 0;
      const dtime = parseFloat(row.DTIME) || 0;
      const fw = parseFloat(row.FW) || 0;
      const sse = parseFloat(row.SSE) || 0;
      const me = parseFloat(row.ME) || 0;
      const caw = parseFloat(row.CAW) || 0;
      const cade = parseFloat(row.CADE) || 0;
      const adv = parseFloat(row.ADV) || 0;
      const d1 = parseFloat(row.CSP || row.D1) || 0;
      const dd = parseFloat(row.DD) || 0;

      const gross = rtime + otime + dtime;
      const tax = fw + sse + me + caw + cade;
      const net = gross - tax;

      return [
        row.EID, row.NAME, row.JCODE, row.JTITLE, row.WORK1,
        row.PDATE, row.CKNO,
        rtime, otime, dtime,
        fw, sse, me, caw, cade,
        adv, d1, dd,
        gross.toFixed(2), tax.toFixed(2), net.toFixed(2),
        row.REMARK || ''
      ];
    });

    const insertQuery = `
      INSERT INTO paylist (
        eid, name, jcode, jtitle, work1,
        pdate, ckno,
        rtime, otime, dtime,
        fw, sse, me, caw, cade,
        adv, csp, dd,
        gross, tax, net,
        remark
      ) VALUES ?
    `;

    await db.query(insertQuery, [results]);
    fs.unlink(filePath, () => {});
    res.redirect('/payroll');
  } catch (err) {
    fs.unlink(filePath, () => {});
    console.error('DBF 처리 중 오류:', err);
    res.status(500).send('DBF 처리 중 오류 발생');
  }
});

module.exports = router;
