-- Generated schema from lms-domain.md
-- Generated at: 2026-07-10T16:42:38.626Z
-- DO NOT EDIT MANUALLY

-- LMS courses
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Course sessions within a course
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
    course_id TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    title TEXT NOT NULL,
    duration_minutes INTEGER,
    manuscript TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Topics extracted from session content
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Bible verses and references
CREATE TABLE IF NOT EXISTS biblical_references (
  id TEXT PRIMARY KEY NOT NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    translation TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Spirit categorization (good, bad, infirmity)
CREATE TABLE IF NOT EXISTS spirits (
  id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL
);

-- LMS members/students
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    enrollment_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Member progress tracking per session
CREATE TABLE IF NOT EXISTS member_progress (
  id TEXT PRIMARY KEY NOT NULL,
    member_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    viewed INTEGER NOT NULL,
    completed INTEGER NOT NULL,
    completion_date TEXT,
    time_spent_minutes INTEGER NOT NULL,
    last_accessed TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Member assessment results
CREATE TABLE IF NOT EXISTS member_assessments (
  id TEXT PRIMARY KEY NOT NULL,
    member_id TEXT NOT NULL,
    assessment_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    attempt_count INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Individual assessment attempt history
CREATE TABLE IF NOT EXISTS member_assessment_attempts (
  id TEXT PRIMARY KEY NOT NULL,
    member_assessment_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
  FOREIGN KEY (member_assessment_id) REFERENCES member_assessments(id)
);

-- Member content engagement and interactions
CREATE TABLE IF NOT EXISTS member_interactions (
  id TEXT PRIMARY KEY NOT NULL,
    member_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Extensible custom data points for members
CREATE TABLE IF NOT EXISTS member_custom_data (
  id TEXT PRIMARY KEY NOT NULL,
    member_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
