-- ══════════════════════════════════════════════
-- WellFlow — Database Schema
-- Author: David ZHANG
-- ══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS wellflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wellflow;

-- ── TABLE: user ───────────────────────────────
CREATE TABLE IF NOT EXISTS user (
  user_id       INT           NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)   NOT NULL,
  email         VARCHAR(150)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT NOW(),
  updated_at    DATETIME      NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id),
  UNIQUE INDEX idx_user_email    (email),
  UNIQUE INDEX idx_user_username (username)
);

-- ── TABLE: category ───────────────────────────
CREATE TABLE IF NOT EXISTS category (
  category_id INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(50)  NOT NULL,
  icon        VARCHAR(10)  NULL,
  color       VARCHAR(7)   NULL,
  created_at  DATETIME     NOT NULL DEFAULT NOW(),

  PRIMARY KEY (category_id),
  UNIQUE INDEX idx_category_name (name)
);

-- ── TABLE: task ───────────────────────────────
CREATE TABLE IF NOT EXISTS task (
  task_id        INT           NOT NULL AUTO_INCREMENT,
  user_id        INT           NOT NULL,
  category_id    INT           NULL,
  title          VARCHAR(150)  NOT NULL,
  description    TEXT          NULL,
  status         VARCHAR(10)   NOT NULL DEFAULT 'todo',
  scheduled_time DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT NOW(),
  updated_at     DATETIME      NOT NULL DEFAULT NOW(),

  PRIMARY KEY (task_id),
  CONSTRAINT fk_task_user
    FOREIGN KEY (user_id)
    REFERENCES user (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_category
    FOREIGN KEY (category_id)
    REFERENCES category (category_id)
    ON DELETE SET NULL,
  CONSTRAINT chk_task_status
    CHECK (status IN ('todo', 'doing', 'done')),

  INDEX idx_task_user          (user_id),
  INDEX idx_task_user_status   (user_id, status),
  INDEX idx_task_user_category (user_id, category_id)
);

-- ── TABLE: session ────────────────────────────
CREATE TABLE IF NOT EXISTS session (
  session_id  INT           NOT NULL AUTO_INCREMENT,
  user_id     INT           NOT NULL,
  token       VARCHAR(512)  NOT NULL,
  is_revoked  BOOLEAN       NOT NULL DEFAULT FALSE,
  ip_address  VARCHAR(45)   NULL,
  user_agent  VARCHAR(255)  NULL,
  expires_at  DATETIME      NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT NOW(),

  PRIMARY KEY (session_id),
  CONSTRAINT fk_session_user
    FOREIGN KEY (user_id)
    REFERENCES user (user_id)
    ON DELETE CASCADE,
  UNIQUE INDEX idx_session_token       (token),
  INDEX        idx_session_user        (user_id),
  INDEX        idx_session_active      (user_id, is_revoked)
);