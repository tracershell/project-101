// auth.js route 는 /login, /logout, /dashboard 등의 인증관리만 처리
// index.js /, /about/ products 등 main content  만 처리

// server/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db/mysql'); // DB pool 사용

// 로그인 페이지 렌더링
// '/' get 가져와 '/login' 에 rendering (login.ejs 으로)
router.get('/login', (req, res) => {
  res.render('login', {
    // layout: 'layout',           // (선택) 기본 layout 설정이 되어 있다면 생략 가능
    title: 'Sign In',           // layout.ejs의 <title>에 사용 가능
    error: null,                // 에러 메시지 전달
    isAuthenticated: false,     // 로그인 상태 아님 (layout에 조건 분기할 수 있게)
    name: null,                 // 사용자 이름 없음
    now: new Date().toString()  // (선택) footer 시간 표시 등
  });
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
        req.session.user = { name: results[0].username };  // 로그인 성공 시, 세션에 사용자 정보 저장
        res.redirect('/dashboard');    // 로그인 성공시 메인 페이지로 이동 : dashboard.ejs로 이동

      } else {
        res.redirect('/');        // 로그인 실패시 처음 페이지로
        //res.redirect('/login'); // 로그인 실패시 로그인 페이지로 이동
        // res.render('login', { error: 'Invalid credentials' }); // login.ejs 에러 메시지 전달
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
