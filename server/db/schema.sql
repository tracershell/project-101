-- users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,       -- 고유 사용자 ID
  username VARCHAR(50) NOT NULL UNIQUE,    -- 사용자 이름 (중복 방지)
  password VARCHAR(50) NOT NULL,          -- 비밀번호 (암호화된 값 저장 권장)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 가입 시간
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