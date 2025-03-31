// server/routes/auth.js

const express = require('express');
const router = express.Router();
const db = require('../db/mysql'); // DB pool 사용 (mysql2/promise 기반)

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Sign In',
    error: null,
    isAuthenticated: false,
    name: null,
    now: new Date().toString()
  });
});

// 로그인 처리 (mysql2/promise 기반 async/await 사용)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [results] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (results.length > 0) {
      req.session.user = { name: results[0].username };
      return res.redirect('/dashboard');
    } else {
      return res.redirect('/');
      // 또는 실패 시 로그인 페이지로:
      // return res.render('login', { error: 'Invalid credentials', isAuthenticated: false, name: null });
    }
  } catch (err) {
    console.error('로그인 중 DB 오류:', err);
    return res.status(500).send('로그인 처리 중 오류가 발생했습니다.');
  }
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
