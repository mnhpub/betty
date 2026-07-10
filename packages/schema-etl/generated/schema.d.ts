// Generated types from lms-domain.md
// Generated at: 2026-07-10T16:42:38.626Z
// DO NOT EDIT MANUALLY

/** LMS courses */
export interface Courses {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CoursesInsert {
  title: string;
  description?: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

/** Course sessions within a course */
export interface Sessions {
  id: string;
  course_id: string;
  sequence: number;
  title: string;
  duration_minutes?: number;
  manuscript?: Record<string, unknown>;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface SessionsInsert {
  course_id: string;
  sequence: number;
  title: string;
  duration_minutes?: number;
  manuscript?: Record<string, unknown>;
  created_at: string | Date;
  updated_at: string | Date;
}

/** Topics extracted from session content */
export interface Topics {
  id: string;
  session_id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string | Date;
}

export interface TopicsInsert {
  session_id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string | Date;
}

/** Bible verses and references */
export interface BiblicalReferences {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  text: string;
  created_at: string | Date;
}

export interface BiblicalReferencesInsert {
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  text: string;
  created_at: string | Date;
}

/** Spirit categorization (good, bad, infirmity) */
export interface Spirits {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: string | Date;
}

export interface SpiritsInsert {
  name: string;
  category: string;
  description?: string;
  created_at: string | Date;
}

/** LMS members/students */
export interface Members {
  id: string;
  name: string;
  email: string;
  enrollment_date: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface MembersInsert {
  name: string;
  email: string;
  enrollment_date: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}

/** Member progress tracking per session */
export interface MemberProgress {
  id: string;
  member_id: string;
  session_id: string;
  viewed: boolean;
  completed: boolean;
  completion_date?: string | Date;
  time_spent_minutes: number;
  last_accessed?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface MemberProgressInsert {
  member_id: string;
  session_id: string;
  viewed: boolean;
  completed: boolean;
  completion_date?: string | Date;
  time_spent_minutes: number;
  last_accessed?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}

/** Member assessment results */
export interface MemberAssessments {
  id: string;
  member_id: string;
  assessment_id: string;
  score: number;
  attempt_count: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface MemberAssessmentsInsert {
  member_id: string;
  assessment_id: string;
  score: number;
  attempt_count: number;
  created_at: string | Date;
  updated_at: string | Date;
}

/** Individual assessment attempt history */
export interface MemberAssessmentAttempts {
  id: string;
  member_assessment_id: string;
  attempt_number: number;
  score: number;
  completed_at: string | Date;
}

export interface MemberAssessmentAttemptsInsert {
  member_assessment_id: string;
  attempt_number: number;
  score: number;
  completed_at: string | Date;
}

/** Member content engagement and interactions */
export interface MemberInteractions {
  id: string;
  member_id: string;
  interaction_type: string;
  entity_id: string;
  entity_type: string;
  data: Record<string, unknown>;
  created_at: string | Date;
}

export interface MemberInteractionsInsert {
  member_id: string;
  interaction_type: string;
  entity_id: string;
  entity_type: string;
  data: Record<string, unknown>;
  created_at: string | Date;
}

/** Extensible custom data points for members */
export interface MemberCustomData {
  id: string;
  member_id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface MemberCustomDataInsert {
  member_id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string | Date;
  updated_at: string | Date;
}
