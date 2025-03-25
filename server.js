require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// 라우터 등록
const authRoutes = require('./server/routes/auth');   // ./server/routes/auth.js 속에서  route.get, route.post, route.delete 를 주고 받을 수 있게
const indexRoutes = require('./server/routes/index'); // ./server/routes/index.js 를 를 route.get, route.post, route.delete 를 주고 받을 수 있게

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 설정 (환경변수로 보안 강화)
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: false
  //  cookie: {
  //    maxAge: 1000 * 60 * 60  // 1시간 (밀리초 단위)
  //  }
}));

// EJS 뷰 설정
app.set('view engine', 'ejs');                      // view 엔진 : 확장자 ejs
app.set('views', path.join(__dirname, 'views'));    // views 가 있는 곳: 현재 실행중인(server.js) 디렉토리/views ==> 경로만 지정하는 역할

app.use(expressLayouts);                             // 레이아웃 사용
app.set('layout', 'layout');                         // 기본 레이아웃: layout.ejs


// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));  // 정적파일 [현재 실행중인(server.js)디렉토리/public]

// 라우터 적용
app.use('/', authRoutes);   // 인증 관련 라우트 우선
app.use('/', indexRoutes);  // 일반 페이지 라우트

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
