require('dotenv').config();                             //.env 에 저장된 환경변수를 process 상에 띄운다 ==> 환경변수 호출: process.env.PORT
const express = require('express');                     // node.js 에서 가장 널리 사용되는 frame work : 웹서버, 라우팅처리, 미들웨어 연결결
const path = require('path');                           // node.js 내장 모듈 : 파일 경로 조작가능 모듈
const session = require('express-session');             // 사용자 세션을 관리하는 모듈 : 사용자 정보 유지 및 로그인 체크 ==> req.session.user ={id:1, name: 'Michael'}
const expressLayouts = require('express-ejs-layouts');  // ejs 의 layout 기능 제공 : <main>  <%- body %>  </main> : body 에 본문이 들어감

const app = express();                                  // app 를 서버 객체로 생성 => app.set() 뷰엔진, 포트설정, 서버 설정값 지정, app.use() 정적파일,세션,파서 등록..... 
// app.get()/app.post() 라우터 정의, app.listen() 서버시작 및 포트 요청 대기기

// 미들웨어 설정 : middleware 를 Express Server 에 등록
app.use(express.urlencoded({ extended: true }));        // frontend 와 backend 사이의 POST 전달을 req.body = {username: tshell} 로 만들어 전달하게 하는 기능
// true 는 단순한 key=value 형식만이 아니라 중첩객체를 폼함한 데이터도 파싱 가능하게 함(qs Libray)

app.use(express.json());                                // json 형식 "id":1, "name":"michael" 형식을 req.body ={id:1, name:'Michael'} 로 만들어 주는 기능능

// 세션 설정 (환경변수로 보안 강화) : 라우팅 보다 먼저 위치해야 함
app.use(session({                                       // session 변수에 express-session 모듈을 달아 app 서버 객체에서 사용
  secret: process.env.SESSION_SECRET || 'defaultSecret', // secret 값으로 환경변수 내의 SESSION_SCRET 값이 있으면 그걸 사용하고 그러지 않은면 'defaultSecret' 값 사용
  resave: false,                                         // 세션에 변경이 있을 때만 저장 : 불필요한 disk access 방지지
  saveUninitialized: false                               // 세션 저장소에 기록하지 말것 (로그인도 안했고, 세션에 아무것도 저장하지 않았다면) - 쿠키도 발금 되지 않음
  //  cookie: {
  //    maxAge: 1000 * 60 * 60  // 1시간 (밀리초 단위)
  //  }
}));

// isAuthenticated 변수가 뷰(view)에 전달, name 도 전달달
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session && req.session.user ? true : false;
  res.locals.name = req.session.user ? req.session.user.name : ''; // 사용자 이름
  next();
});

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
const import_an_paymentRoutes = require('./server/routes/import_an_payment'); // CVS 로 paylist 출력 라우터터
const import_an_depositRoutes = require('./server/routes/import_an_pdfkit'); // pdfkit deposit  출력 라우터터
const import_vendorRoutes = require('./server/routes/import_vendor'); // CVS 로 paylist 출력 라우터터
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
app.use('/', import_anRoutes);   // 
app.use('/', import_an_paymentRoutes);   // 
app.use('/', import_an_depositRoutes);   // 
app.use('/', import_vendorRoutes);   // import vendor routes

//=================================================================================
const importVendorRoutes = require('./server/routes/admin/import/import_vendor');
app.use('/admin/import', importVendorRoutes);

//=================================================================================


// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
