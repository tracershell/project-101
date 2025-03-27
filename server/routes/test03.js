const express = require('express');
const router = express.Router();
const db = require('../db/mysql');


router.get('/test03', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('test03', {
    layout: 'layout', // (선택) 기본 layout 설정이 되어 있다면 생략 가능
    title: 'Dashboard',
    name: req.session.user.name,
    isAuthenticated: true,
    now: new Date().toString(),
  });
});






module.exports = router;
