// auth.js route 는 /login, /logout, /dashboard 등의 인증관리만 처리
// index.js /, /about/ products 등 main content  만 처리

// server/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db/mysql'); // DB pool 사용

// 로그인 페이지 렌더링
// '/' get 가져와 '/login' 에 rendering (login.ejs 으로)
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});



// post 받아와 '/login' 으로 부터 아래 내용 처리리 (<a href="/login" class="btn-signin">Sign In</a>     
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('DB Error');
      }

      if (results.length > 0) {
        req.session.user = { name: results[0].username };
        res.redirect('/dashboard');
      } else {
        res.render('login', { error: 'Invalid credentials' });
      }
    }
  );
});



// 로그아웃
// '/' get 가져와 '/logout' 에 rendering (끝냄)
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
