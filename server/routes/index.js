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
  if (!req.session.user) {                    // 세션 확인후, 로그인 안 된 경우 로그인 페이지로 리다이렉트
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

// employee 추가 라우터
router.post('/add', (req, res) => {
  // 로그인 체크
  if (!req.session.user) {
    return res.redirect('/login');   // 로그인 안 되어 있으면 로그인 페이지로
  }

  console.log("받은 eid:", req.body.eid);  // 받은 eid 콘솔에 출력(테스트용)

  const {                             // 받은 form 데이터를 변수에            
    status, eid, name, ss, birth, email, phone,
    jcode, jtitle, sdate, edate, sick, work1,
    address, city, state, zip, remark
  } = req.body;

  // 먼저 eid 중복 체크
  const checkQuery = 'SELECT COUNT(*) AS count FROM employees WHERE eid = ?';
  db.query(checkQuery, [eid], (err, results) => {
    if (err) {
      console.error('eid 중복 확인 오류:', err);
      return res.status(500).send('eid 중복 확인 중 오류가 발생했습니다.');
    }

    if (results[0].count > 0) {
      return res.send(`
        <script>
          alert("이미 존재하는 직원 ID입니다: ${eid}");
          history.back(); // 이전 페이지로 되돌아가기
        </script>
      `);
    }

    // 중복 없으면 INSERT 실행
    const insertQuery = `
      INSERT INTO employees (
        status, eid, name, ss, birth, email, phone,
        jcode, jtitle, sdate, edate, sick, work1,
        address, city, state, zip, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      status || null,
      eid || null,
      name || null,
      ss || null,
      birth || null,
      email || null,
      phone || null,
      jcode || null,
      jtitle || null,
      sdate || null,
      edate || null,
      sick || 0,
      work1 || null,
      address || null,
      city || null,
      state || null,
      zip || null,
      remark || null
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('직원 추가 오류:', err);
        return res.status(500).send('직원 추가 중 오류가 발생했습니다.');
      }

      // 저장 후 다시 직원 목록 페이지로 이동
      res.redirect('/employees');
    });
  });
});

// employee 수정 라우터
router.post('/edit/:eid', (req, res) => {
  // 로그인 체크
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const eidParam = req.params.eid;  // URL 경로에서 받은 eid
  const {
    status, eid, name, ss, birth, email, phone,
    jcode, jtitle, sdate, edate, sick, work1,
    address, city, state, zip, remark
  } = req.body;

  // 업데이트 쿼리
  const updateQuery = `
    UPDATE employees SET
      status = ?, name = ?, ss = ?, birth = ?, email = ?, phone = ?,
      jcode = ?, jtitle = ?, sdate = ?, edate = ?, sick = ?, work1 = ?,
      address = ?, city = ?, state = ?, zip = ?, remark = ?
    WHERE eid = ?
  `;

  const values = [
    status || null,
    name || null,
    ss || null,
    birth || null,
    email || null,
    phone || null,
    jcode || null,
    jtitle || null,
    sdate || null,
    edate || null,
    sick || 0,
    work1 || null,
    address || null,
    city || null,
    state || null,
    zip || null,
    remark || null,
    eidParam
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error('직원 수정 오류:', err);
      return res.status(500).send('직원 수정 중 오류가 발생했습니다.');
    }

    if (result.affectedRows === 0) {
      return res.send(`
        <script>
          alert("수정할 직원 정보를 찾을 수 없습니다: ${eidParam}");
          history.back();
        </script>
      `);
    }

    // 수정 완료 후 목록 페이지로 이동
    res.redirect('/employees');
  });
});

// employee 삭제 라우터
router.post('/delete/:eid', (req, res) => {
  // 로그인 체크
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const eidParam = req.params.eid;

  // 삭제 쿼리
  const deleteQuery = 'DELETE FROM employees WHERE eid = ?';

  db.query(deleteQuery, [eidParam], (err, result) => {
    if (err) {
      console.error('직원 삭제 오류:', err);
      return res.status(500).send('직원 삭제 중 오류가 발생했습니다.');
    }

    if (result.affectedRows === 0) {
      return res.send(`
        <script>
          alert("삭제할 직원 정보를 찾을 수 없습니다: ${eidParam}");
          history.back();
        </script>
      `);
    }

    // 삭제 성공 시 알림 후 목록으로 이동
    return res.send(`
      <script>
        alert("직원 정보가 삭제되었습니다: ${eidParam}");
        window.location.href = "/employees";
      </script>
    `);
  });
});


// employee 레코드 보기 라우터
router.get('/view-one/:eid', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const eid = req.params.eid;

  const query = 'SELECT * FROM employees WHERE eid = ?';
  db.query(query, [eid], (err, results) => {
    if (err) {
      console.error('레코드 출력 중 DB 오류:', err);
      return res.status(500).send('DB 오류가 발생했습니다.');
    }

    if (results.length === 0) {
      return res.send(`
        <script>
          alert("해당 EID의 직원 정보를 찾을 수 없습니다: ${eid}");
          window.close();
        </script>
      `);
    }

    const emp = results[0];
    res.render('view-one', {              // view-one.ejs 렌더링
      layout: false,
      title: `Employee Record: ${emp.name}`,
      emp,
    });
  });
});


// employee 레코드 출력 라우터
router.get('/print/:eid', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const eid = req.params.eid;

  const query = 'SELECT * FROM employees WHERE eid = ?';
  db.query(query, [eid], (err, results) => {
    if (err) {
      console.error('레코드 출력 중 DB 오류:', err);
      return res.status(500).send('DB 오류가 발생했습니다.');
    }

    if (results.length === 0) {
      return res.send(`
        <script>
          alert("해당 EID의 직원 정보를 찾을 수 없습니다: ${eid}");
          window.close();
        </script>
      `);
    }

    const emp = results[0];
    res.render('print', {
      layout: false,
      title: `Employee Record: ${emp.name}`,
      emp,
    });
  });
});

// 모든 직원 목록 PDF용 view 출력
router.get('/employees/pdf-view', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).send('DB 오류 발생');

    res.render('pdf-employees-view', {
      layout: false,
      employees: results,
    });
  });
});

// 모든 직원 목록 PDF용 print 페이지 출력 (자동 인쇄 및 창 닫기)
router.get('/employees/pdf-print', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).send('DB 오류 발생');

    res.render('pdf-employees-print', {
      layout: false,
      employees: results,
    });
  });
});

/*
추가로 views 디렉토리에 다음 두 개의 EJS 템플릿 파일을 생성해 주세요:
  - pdf-employees-view.ejs : 가로 방향 스타일 + table 보기용
  - pdf-employees-print.ejs : 가로 방향 + 자동 print + window.close() 포함
*/


// 

module.exports = router;