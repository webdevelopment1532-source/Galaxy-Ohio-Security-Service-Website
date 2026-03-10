CREATE TABLE
  IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM (
      'admin',
      'customer',
      'intern',
      'employee',
      'manager',
      'head_admin'
    ) DEFAULT 'customer',
    status ENUM ('active', 'suspended', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(500),
    avatar_url VARCHAR(500)
  );
