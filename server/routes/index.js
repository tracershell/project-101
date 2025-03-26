// auth.js route 는 /login, /logout, /dashboard 등의 인증관리만 처리
// index.js /, /about/ products 등 main content  만 처리

const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// '/' get 가져와 '/' 에 rendering (index.ejs 으로)

/* router.get('/', (req, res) => {
  db.query('SELECT NOW() AS now', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('DB error');
    }
    res.render('index', { now: results[0].now });     //  res.render ('index') 가 있어, views 에 있는 index.ejs 파일을 렌더링
    });
}); */

// apple2n2.theworkpc.com 을 get 요청

router.get('/', (req, res) => {
  res.render('index', {                                       // index.ejs 로 렌더링
    layout: 'layout',
    title: 'Home',
    isAuthenticated: !!req.session.user,
    name: req.session.user ? req.session.user.name : null,
    now: new Date().toString(),
  });
});


/* router.get('/dashboard', (req, res) => {
  // 세션에서 로그인된 사용자 정보 확인
  if (!req.session.user) {
    return res.redirect('/login');  // 로그인 안 된 경우 로그인 페이지로
  }

  // 로그인된 사용자 이름을 dashboard.ejs로 전달
  res.render('dashboard', { name: req.session.user.name });
}); */

router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('dashboard', {
    layout: 'layout', // (선택) 기본 layout 설정이 되어 있다면 생략 가능
    title: 'Dashboard',
    name: req.session.user.name,
    isAuthenticated: true,
    now: new Date().toString(),
  });
});

// Dashboard 에서 employee 호출로 employee.ejs 렌더링
// employee.ejs 에서는 employee 테이블의 레코드 목록을 표시

router.get('/employees', (req, res) => {
  if (!req.session.user) {                    // 로그인 안 된 경우 로그인 페이지로 리다이렉트
    return res.redirect('/login');
  }

  // MySQL Project101db 의 employees 테이블에서 모든 레코드를 가져와서 employees.ejs로 렌더링하기 위한 result 목록 배열 추출
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error('DB 오류:', err);               // DB 오류 발생시 콘솔에 오류 메시지 출력             
      return res.status(500).send('Database error');  // DB 오류 발생시 500 에러 메시지 전송
    }

    res.render('employees', {
      layout: 'layout', // (선택) 기본 layout 설정이 되어 있다면 생략 가능
      title: 'employees',
      editId: 'none',
      deleteId: '',
      employees: results,  // 직원 목록 배열 전달 employees.ejs로
      name: req.session.user.name || 'Guest',
      isAuthenticated: true,
      now: new Date().toString(),
    });

  });

});

//   res.render('employee', { layout: 'layout' });
//
//  db.query('SELECT * FROM employee', (err, results) => {
//    if (err) {
//      console.error(err);
//      return res.status(500).send('DB error');
//    }
//    res.render('employee', { employees: results });
//  });

//

/*
router.post('/add', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const { name, email, phone } = req.body;
  db.query(
    'INSERT INTO employee (name, email, phone) VALUES (?, ?, ?)',  // INSERT 쿼리 실행
    [name, email, phone],
    (err, results) => {   // 쿼리 실행 결과 처리
      if (err) {
        console.error(err);
        return res.status(500).send('DB error');
      }
      res.redirect('/employee');  // 추가 후 employee 목록으로 리다이렉트
    }
  );
});

*/
// employee modify
// router.post('/edit/:id', (req, res) => {
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   const { id } = req.params;
//   const { name, email, phone } = req.body;
//   db.query(  // UPDATE 쿼리 실행
//     'UPDATE employee SET name = ?, email = ?, phone = ? WHERE id = ?',       // employee 테이블에서 id 값이 일치하는 레코드의 name, email, phone 값을 수정
//     [name, email, phone, id],
//     (err, results) => {      // 쿼리 실행 결과 처리
//       if (err) {
//         console.error(err);
//         return res.status(500).send('DB error');
//       }
//       res.redirect('/employee');    // 수정 후 employee 목록으로 리다이렉트
//     }
//   );
// });        

// employee delete
// router.get('/delete/:id', (req, res) => {
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   const { id } = req.params;
//   db.query(
//     'DELETE FROM employee WHERE id = ?',  // DELETE 쿼리 실행
//     [id],
//     (err, results) => {   // 쿼리 실행 결과 처리
//       if (err) {
//         console.error(err);
//         return res.status(500).send('DB error');
//       }
//       res.redirect('/employee');  // 삭제 후 employee 목록으로 리다이렉트
//     }
//   );
// });    


// employee search
// router.get('/employee/search', (req, res) => {               // search.ejs 파일을 렌더링                







// 

module.exports = router;
