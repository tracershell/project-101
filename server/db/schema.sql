-- users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,       -- 고유 사용자 ID
  username VARCHAR(50) NOT NULL UNIQUE,    -- 사용자 이름 (중복 방지)
  password VARCHAR(50) NOT NULL,          -- 비밀번호 (암호화된 값 저장 권장)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 가입 시간
);

CREATE TABLE paylist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  jcode VARCHAR(20),
  jtitle VARCHAR(50),
  work1 VARCHAR(50),

  pdate DATE NOT NULL,
  ckno VARCHAR(20),
  rtime DECIMAL(10,2) DEFAULT 0,
  otime DECIMAL(10,2) DEFAULT 0,
  dtime DECIMAL(10,2) DEFAULT 0,

  fw DECIMAL(10,2) DEFAULT 0,
  sse DECIMAL(10,2) DEFAULT 0,
  me DECIMAL(10,2) DEFAULT 0,
  caw DECIMAL(10,2) DEFAULT 0,
  cade DECIMAL(10,2) DEFAULT 0,

  adv DECIMAL(10,2) DEFAULT 0,
  csp DECIMAL(10,2) DEFAULT 0,
  dd DECIMAL(10,2) DEFAULT 0,

  gross DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  net DECIMAL(10,2) DEFAULT 0,

  remark VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status VARCHAR(10),
  eid VARCHAR(10),
  name VARCHAR(60),
  ss VARCHAR(20),
  birth DATE,
  email VARCHAR(60),
  phone VARCHAR(20),
  jcode VARCHAR(10),
  jtitle VARCHAR(60),
  sdate DATE,
  edate DATE,
  sick INT,
  work1 VARCHAR(20),
  address VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(50),
  zip VARCHAR(20),
  remark TEXT
);



-- employee tabel

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_no VARCHAR(50),
  name VARCHAR(100),
  birthday DATE,
  ss_no VARCHAR(50),
  email VARCHAR(100),
  department VARCHAR(100),
  job VARCHAR(100),
  start_date DATE,
  end_date DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  remark TEXT
);