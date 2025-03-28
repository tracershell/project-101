
const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

// 숫자 쉼표 제거 및 float 변환 유틸 함수
function toNumber(value) {
  return parseFloat(String(value).replace(/,/g, '')) || 0;
}



/// cvs 을 DB 에 출력하는 라우터
const multer = require('multer'); 
const upload = multer({ dest: path.join(__dirname, 'uploads') });

router.post('/paylist/upload-csv', upload.single('csvfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('파일이 업로드되지 않았습니다.');
  }

  const filePath = path.resolve(req.file.path);  // 절대 경로로 안전하게 처리
  const results = [];

  fs.createReadStream(filePath)
  .pipe(csv({
    mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')  // BOM 및 공백 제거
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
    const d1 = toNumber(row.csp || row.d1);  // csp 또는 d1
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
    .on('end', () => {
      // ✅ 배치 insert 함수 정의
      function insertBatchData(data, callback) {
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
    
        function insertNextBatch() {
          const batch = data.slice(index, index + batchSize);
          if (batch.length === 0) return callback();
    
          db.query(insertQuery, [batch], (err) => {
            if (err) return callback(err);
            index += batchSize;
            insertNextBatch();
          });
        }
    
        insertNextBatch();
      }
    
      // ✅ 배치 insert 실행
      insertBatchData(results, (err) => {
        fs.unlink(filePath, () => {}); // 업로드된 임시파일 삭제
    
        if (err) {
          console.error('CSV 업로드 저장 오류:', err);
          return res.status(500).send('CSV 저장 중 오류 발생');
        }
    
        res.redirect('/payroll');
      });
    });
  });



module.exports = router;