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


CREATE TABLE po (
  id INT AUTO_INCREMENT PRIMARY KEY,
  podate DATE,
  pono VARCHAR(50) UNIQUE,
  style VARCHAR(100),
  pcs INT,
  price DECIMAL(10,2),
  poamount DECIMAL(10,2), -- pcs * price
  note TEXT,
  remain DECIMAL(10,2) DEFAULT 0,
  deposit_paid TINYINT(1) NOT NULL DEFAULT 0
);


CREATE TABLE popayment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT,
  paydate DATE,
  paytype ENUM('partial', 'full'),
  exrate DECIMAL(10,4),
  payamount DECIMAL(10,2),
  note TEXT,
  FOREIGN KEY (po_id) REFERENCES po(id)
);


CREATE TABLE po (
  id INT AUTO_INCREMENT PRIMARY KEY,
  podate DATE,
  pono VARCHAR(50) UNIQUE,
  style VARCHAR(100),
  pcs INT,
  price DECIMAL(10,2),
  poamount DECIMAL(10,2),
  note TEXT,
  remain DECIMAL(10,2) DEFAULT 0,
  deposit_paid TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE popayment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  paydate DATE NOT NULL,
  paytype paytype VARCHAR(20) NOT NULL DEFAULT 'deposit',
  exrate DECIMAL(10,4) NOT NULL,
  payamount DECIMAL(10,2) NOT NULL,
  note TEXT,
  FOREIGN KEY (po_id) REFERENCES po(id) ON DELETE CASCADE
);