require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 설정 (환경변수로 보안 강화) : 라우팅 보다 먼저 위치해야 함
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: false
  //  cookie: {
  //    maxAge: 1000 * 60 * 60  // 1시간 (밀리초 단위)
  //  }
}));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));  // 정적파일 [현재 실행중인(server.js)디렉토리/public]

// EJS 뷰 설정
app.set('view engine', 'ejs');                      // view 엔진 : 확장자 ejs
app.set('views', path.join(__dirname, 'views'));    // views 가 있는 곳: 현재 실행중인(server.js) 디렉토리/views ==> 경로만 지정하는 역할

app.use(expressLayouts);                             // 레이아웃 사용
app.set('layout', 'layout');                         // 기본 레이아웃: layout.ejs


// 라우터 등록
const authRoutes = require('./server/routes/auth');   // ./server/routes/auth.js 속에서  route.get, route.post, route.delete 를 주고 받을 수 있게
const indexRoutes = require('./server/routes/index'); // ./server/routes/index.js 를 를 route.get, route.post, route.delete 를 주고 받을 수 있게
const paylistRoutes = require('./server/routes/paylist');
// const payroll_printRoutes = require('./server/routes/payroll_print');
const payrollPdfKitRoutes = require('./server/routes/payroll_pdfkit');
const paylistCvsRoutes = require('./server/routes/paylist_cvs'); // CVS 로 paylist 출력 라우터터
const paylistCvsDbRoutes = require('./server/routes/paylist_cvs_db'); // CVS 로 paylist 출력 라우터터
const paylistDbfDbRoutes = require('./server/routes/paylist_dbf_db'); // CVS 로 paylist 출력 라우터터
const testRoutes01 = require('./server/routes/test01');   // .server/routes/test01.js 를 등록
const testRoutes02 = require('./server/routes/test02');   // .server/routes/test02.js 를 등록
const testRoutes03 = require('./server/routes/test03');   // .server/routes/test03.js 를 등록
const testRoutes04 = require('./server/routes/test04');   // .server/routes/test04.js 를 등록
const testRoutes05 = require('./server/routes/test05');   // .server/routes/test05.js 를 등록
const import_anRoutes = require('./server/routes/import_an'); // CVS 로 paylist 출력 라우터터

// 라우터 적용
app.use('/', authRoutes);   // 인증 관련 라우트 우선
app.use('/', indexRoutes);  // 일반 페이지 라우트
app.use('/', paylistRoutes);
// app.use('/', payroll_printRoutes); // 급여명세서 관련 라우트
app.use('/', payrollPdfKitRoutes);
app.use('/', paylistCvsRoutes); // 급여명세서 CSV 다운로드 라우트
app.use('/', paylistCvsDbRoutes); // 급여명세서 CSV 다운로드 라우트
app.use('/', paylistDbfDbRoutes); // 급여명세서 CSV 다운로드 라우트
app.use('/', testRoutes01);   // test01.js 라우트 사용
app.use('/', testRoutes02);   // test02.js 라우트 사용
app.use('/', testRoutes03);   // test03.js 라우트 사용
app.use('/', testRoutes04);   // test04.js 라우트 사용
app.use('/', testRoutes05);   // test05.js 라우트 사용
app.use('/', import_anRoutes);   // test05.js 라우트 사용


// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
