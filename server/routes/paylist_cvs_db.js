const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// 숫자 쉼표 제거 및 float 변환 유틸 함수
function toNumber(value) {
  return parseFloat(String(value).replace(/,/g, '')) || 0;
}

// CSV 파일 업로드 및 DB 저장
router.post('/paylist/upload-csv', upload.single('csvfile'), async (req, res) => {
  if (!req.file) return res.status(400).send('파일이 업로드되지 않았습니다.');

  const filePath = path.resolve(req.file.path);
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '')
    }))
    .on('data', (row) => {
      const rtime = toNumber(row.rtime);
      const otime = toNumber(row.otime);
      const dtime = toNumber(row.dtime);
      const fw = toNumber(row.fw);
      const sse = toNumber(row.sse);
      const me = toNumber(row.me);
      const caw = toNumber(row.caw);
      const cade = toNumber(row.cade);
      const adv = toNumber(row.adv);
      const d1 = toNumber(row.csp || row.d1);
      const dd = toNumber(row.dd);

      const gross = rtime + otime + dtime;
      const tax = fw + sse + me + caw + cade;
      const net = gross - tax;

      results.push([
        row.eid, row.name, row.jcode, row.jtitle, row.work1,
        row.pdate, row.ckno,
        rtime, otime, dtime,
        fw, sse, me, caw, cade,
        adv, d1, dd,
        gross.toFixed(2), tax.toFixed(2), net.toFixed(2),
        row.remark || ''
      ]);
    })
    .on('end', async () => {
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

      const batchSize = 100;
      let index = 0;

      try {
        while (index < results.length) {
          const batch = results.slice(index, index + batchSize);
          await db.query(insertQuery, [batch]);
          index += batchSize;
        }

        fs.unlink(filePath, () => {}); // 업로드된 임시파일 삭제
        res.redirect('/payroll');
      } catch (err) {
        fs.unlink(filePath, () => {});
        console.error('CSV 업로드 저장 오류:', err);
        res.status(500).send('CSV 저장 중 오류 발생');
      }
    });
});

module.exports = router;
