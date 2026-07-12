-- MySQL schema for the Automated AI Daily Assessment System.
-- Run this in your MySQL database (e.g. `mysql -u user -p db < mysql/schema.sql`).

CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(36)   NOT NULL,
  full_name    VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('teacher','student') NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classes (
  id          VARCHAR(36)  NOT NULL,
  teacher_id  VARCHAR(36)  NOT NULL,
  class_name  VARCHAR(255) NOT NULL,
  date        DATE         NOT NULL,
  PRIMARY KEY (id),
  KEY idx_classes_date (date),
  KEY idx_classes_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS topics (
  id          VARCHAR(36) NOT NULL,
  class_id    VARCHAR(36) NOT NULL,
  subject     VARCHAR(255) NOT NULL,
  topic_name  VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_topics_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance (
  id          VARCHAR(36) NOT NULL,
  class_id    VARCHAR(36) NOT NULL,
  student_id  VARCHAR(36) NOT NULL,
  status      ENUM('present','absent') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance (class_id, student_id),
  KEY idx_attendance_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assessments (
  id                VARCHAR(36) NOT NULL,
  student_id        VARCHAR(36) NOT NULL,
  date              DATE        NOT NULL,
  total_score       INT         NOT NULL DEFAULT 0,
  total_questions   INT         NOT NULL DEFAULT 0,
  summary           TEXT,
  recommended_video TEXT,
  strengths         TEXT,
  weaknesses        TEXT,
  created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_assessments_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assessment_details (
  id                  VARCHAR(36) NOT NULL,
  assessment_id       VARCHAR(36) NOT NULL,
  topic_id            VARCHAR(36) NOT NULL,
  score               INT         NOT NULL DEFAULT 0,
  recommendation_urls TEXT,
  PRIMARY KEY (id),
  KEY idx_details_assessment (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
