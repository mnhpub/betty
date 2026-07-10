-- ADR-001 (Option C, accepted): journey_phase lives on the person, curriculum_phase
-- lives on the group, decoupled. Group roles are scoped per group_type (Rock RMS's
-- GroupType/GroupTypeRole pattern), which also settles TPOF-4/TPOF-15 without a
-- separate global-RBAC table.

ALTER TABLE users ADD COLUMN journey_phase TEXT
  CHECK (journey_phase IS NULL OR journey_phase IN ('discipleship', 'deliverance', 'beyond', 'walking', 'sharing'));

CREATE TABLE group_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO group_types (id, name) VALUES
  ('discipleship', 'Discipleship'),
  ('recovery', 'Recovery'),
  ('walking', 'Walking'),
  ('deliverance', 'Deliverance'),
  ('sharing', 'Sharing');

CREATE TABLE group_roles (
  id TEXT PRIMARY KEY,
  group_type_id TEXT NOT NULL REFERENCES group_types(id),
  name TEXT NOT NULL,
  UNIQUE (group_type_id, name)
);

INSERT INTO group_roles (id, group_type_id, name)
SELECT id || '-leader', id, 'Leader' FROM group_types
UNION ALL
SELECT id || '-member', id, 'Member' FROM group_types;

CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  group_type_id TEXT NOT NULL REFERENCES group_types(id),
  name TEXT NOT NULL,
  curriculum_phase TEXT
    CHECK (curriculum_phase IS NULL OR curriculum_phase IN ('discipleship', 'deliverance', 'beyond', 'walking', 'sharing')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waitlist', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_groups_group_type_id ON groups(group_type_id);

-- One row per continuous membership stint: left_at IS NULL means currently a
-- member, so history (past stints, re-joins) is just older rows, never deletes.
CREATE TABLE group_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  group_id TEXT NOT NULL REFERENCES groups(id),
  role_id TEXT NOT NULL REFERENCES group_roles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'waitlist')),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  left_at TEXT
);

CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);

CREATE TABLE phase_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  phase TEXT NOT NULL CHECK (phase IN ('discipleship', 'deliverance', 'beyond', 'walking', 'sharing')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_phase_history_user_id ON phase_history(user_id);

CREATE TABLE lms_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'transcript', 'quiz', 'pdf')),
  target_phase TEXT
    CHECK (target_phase IS NULL OR target_phase IN ('discipleship', 'deliverance', 'beyond', 'walking', 'sharing')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE lms_completions (
  user_id TEXT NOT NULL REFERENCES users(id),
  module_id TEXT NOT NULL REFERENCES lms_modules(id),
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, module_id)
);
