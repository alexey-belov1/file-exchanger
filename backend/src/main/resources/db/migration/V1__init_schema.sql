CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_name VARCHAR(255) NOT NULL,
    s3_key VARCHAR(512) NOT NULL,
    size BIGINT NOT NULL,
    retention_minutes INT NOT NULL DEFAULT 30,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    uploader_id UUID NOT NULL,
    CONSTRAINT fk_files_uploader FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin user (password: admin)
-- BCrypt hash for 'admin' with strength 10: $2a$10$xWk94E/uPIfj.pQ/Xo7F7uIeQ4K/f8jT.3ZgU20gSXXA/DqR/vW/O
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$xWk94E/uPIfj.pQ/Xo7F7uIeQ4K/f8jT.3ZgU20gSXXA/DqR/vW/O', 'ROLE_ADMIN');