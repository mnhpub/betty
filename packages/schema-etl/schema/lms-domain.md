# LMS Domain Model - Prayer of Freedom Course

This is the source of truth for the LMS schema. All database tables, TypeScript types, and migrations are derived from this document.

## Overview

Biblical teaching course platform with 6+ session structure, hierarchical concepts, spirit categorizations, and extensive member tracking for "The Prayer of Freedom - Master Class".

## Namespace Architecture

### /lms/courses

**Course Metadata**
- title: string (e.g., "The Prayer of Freedom - Master Class")
- description: string
- status: enum (draft | published | archived)
- created_at: timestamp
- updated_at: timestamp

### /lms/courses/{course_id}/sessions

**Session Structure** (6+ sessions)
- session_id: uuid
- sequence: integer (1-6+)
- title: string (e.g., "Sin and Discipline")
- duration_minutes: integer

#### Session Content
- manuscript: structured document sections
- key_concepts: array of concept identifiers
- biblical_references: array of verse identifiers

#### Session Topics (extracted from content)
Examples:
- sin_and_discipline
- spiritual_realm
- spirit_types
- repentance_process

#### Session Workbook
- exercises: interactive materials
- assessments: quizzes and evaluations
- worksheets: companion materials

### /lms/reference_data/spirits

**Good Spirits**
- holy_spirit
- angels
- spirit_of_skill
- spirit_of_wisdom
- spirit_of_truth
- spirit_of_gentleness

**Bad Spirits**
- spirit_of_jealousy
- spirit_of_terror
- spirit_of_lying
- spirit_of_confusion
- spirit_of_whoredom
- spirit_of_divination
- spirit_of_fear

**Additional Bad Spirits**
- spirit_of_addiction
- spirit_of_depression
- (extensible)

**Infirmity Spirits**
- spirit_of_muteness_and_seizures
- spirit_of_fever
- spirit_of_bent_spine_syndrome

### /lms/reference_data/biblical_references

**Biblical Reference**
- verse_id: uuid
- book: string
- chapter: integer
- verse: integer
- translation: string
- text: string
- related_topic_ids: array of topic identifiers
- related_concept_ids: array of concept identifiers

### /lms/members/{member_id}

**Member Profile**
- name: string
- email: string
- enrollment_date: timestamp

**Member Progress**
- courses/{course_id}/sessions/{session_id}
  - viewed: boolean
  - completed: boolean
  - completion_date: timestamp (nullable)
  - time_spent_minutes: integer
  - last_accessed: timestamp

**Member Assessments**
- assessment_id: uuid
  - score: integer
  - attempt_count: integer
  - attempt_history: array of attempts with timestamps and scores

**Member Interactions (for reporting)**
- content_engagement
  - page_id: {view_count, time_on_page, scroll_depth}
- verse_interactions
  - verse_id: {views, highlights, notes_count}
- concept_tracking
  - concept_id: {exposures, quiz_scores, workbook_attempts}

**Member Custom Data Points (extensible)**
- notes_taken_count: integer
- highlights_created: integer
- discussion_posts: integer
- peer_interactions: integer
- spirit_inventory_entries: integer
- prayer_applications_logged: integer
- freedom_breakthroughs_documented: integer

### /lms/reporting

**Member Dashboards**
- overall_progress: percentage
- session_completion_status: per-session tracking
- assessment_scores: aggregate and per-assessment
- engagement_metrics: aggregated interaction data
- custom_metrics: breakthrough timeline, concept mastery

**Course Analytics**
- completion_rates_by_session: percentage
- popular_topics: ranked by engagement
- spirit_types_most_identified: frequency analysis
- engagement_heatmap: temporal patterns
- member_cohort_comparisons: group vs. individual

**Custom Reports**
- spirit_manifestation_tracking: tracking by member and type
- breakthrough_timeline: temporal progression
- concept_mastery_progression: score progression over time
- peer_learning_networks: interaction graphs

## Design Decisions

1. **Flexible Reference Data**
   - Spirit types taxonomy is extensible
   - Spirits link to biblical verses and concepts
   - Handles Session 2-6 content as discovered

2. **Manuscript + Workbook Separation**
   - Manuscript = structured reading material
   - Workbook = interactive exercises (separate versioning)
   - Allows independent updates

3. **Tracking Layers**
   - Behavioral: view counts, time spent, scroll depth
   - Performance: assessment scores, attempt history
   - Engagement: notes, highlights, discussions
   - Transformation: custom breakpoints (breakthroughs, freedom entries)

4. **Member Data Extensibility**
   - custom_data_points[] namespace for unknowns
   - Separate from structured progress tracking
   - Supports prayer logs, spirit identification, group dynamics

5. **Reporting Prepared**
   - Granular tracking at every level
   - Individual and cohort views
   - Domain-specific metrics (spirit manifestations, spiritual breakthroughs)
