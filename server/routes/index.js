// auth.js route 는 /login, /logout, /dashboard 등의 인증관리만 처리
// index.js /, /about/ products 등 main content  만 처리

const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// '/' get 가져와 '/' 에 rendering (index.ejs 으로)

router.get('/', (req, res) => {
  db.query('SELECT NOW() AS now', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('DB error');
    }
    res.render('index', { now: results[0].now });     //  res.render ('index') 가 있어, views 에 있는 index.ejs 파일을 렌더링
    });
});


router.get('/dashboard', (req, res) => {
  // 세션에서 로그인된 사용자 정보 확인
  if (!req.session.user) {
    return res.redirect('/login');  // 로그인 안 된 경우 로그인 페이지로
  }

  // 로그인된 사용자 이름을 dashboard.ejs로 전달
  res.render('dashboard', { name: req.session.user.name });
});

// 




module.exports = router;
