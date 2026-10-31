-- ==============================================================================
-- EDUSMART - QUẢN LÝ LỚP HỌC THÔNG MINH
-- Supabase / PostgreSQL Database Migration Script
-- Version: 1.0.0
-- Roles: admin, teacher, student, guardian
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'guardian');
CREATE TYPE attendance_status AS ENUM ('present', 'excused', 'unexcused', 'late', 'left_early');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded', 'late', 'missing');
CREATE TYPE grade_type AS ENUM ('oral', 'quiz_15m', 'midterm', 'final', 'homework');
CREATE TYPE behavior_type AS ENUM ('positive', 'constructive', 'warning');
CREATE TYPE alert_status AS ENUM ('new', 'viewed', 'in_progress', 'resolved');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. CORE USERS & PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'student',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SCHOOLS & TENANTS
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, profile_id)
);

-- 4. ACADEMIC STRUCTURE
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grade_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- "Khối 6", "Khối 7", "Khối 8", "Khối 9"
    level_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Toán học", "Ngữ văn", "Tiếng Anh"...
    code VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLASSES & ENROLLMENTS
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    grade_level_id UUID NOT NULL REFERENCES grade_levels(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL, -- "9A1"
    room VARCHAR(50),
    join_code VARCHAR(20) UNIQUE NOT NULL,
    homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_homeroom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(class_id, teacher_id, subject_id)
);

-- 6. STUDENTS & GUARDIANS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL, -- "Nam", "Nữ"
    address TEXT,
    notes TEXT,
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL, -- "Bố", "Mẹ", "Người giám hộ"
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    relationship_label VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, guardian_id)
);

CREATE TABLE IF NOT EXISTS class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    roll_number INT,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    UNIQUE(class_id, student_id)
);

-- 7. SCHEDULES / TIMETABLE
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    day_of_week INT NOT NULL, -- 2: Thứ 2, 3: Thứ 3... 7: Thứ 7
    period INT NOT NULL, -- 1 to 10
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    period INT DEFAULT 1,
    taken_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(class_id, session_date, period)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'present',
    reason TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- 9. ASSIGNMENTS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    due_date TIMESTAMPTZ NOT NULL,
    max_score NUMERIC(5,2) DEFAULT 10.0,
    status assignment_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content TEXT,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    score NUMERIC(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    status submission_status NOT NULL DEFAULT 'submitted',
    UNIQUE(assignment_id, student_id)
);

-- 10. GRADEBOOK & GRADES
CREATE TABLE IF NOT EXISTS grade_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Miệng/15 phút" (hệ số 1), "1 Tiết" (hệ số 2), "Học kỳ" (hệ số 3)
    type grade_type NOT NULL,
    weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grade_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES grade_categories(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL, -- e.g. "KT 15 phút Lần 1"
    semester INT NOT NULL DEFAULT 1,
    max_score NUMERIC(5,2) DEFAULT 10.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_item_id UUID NOT NULL REFERENCES grade_items(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC(4,2),
    notes TEXT,
    updated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(grade_item_id, student_id)
);

CREATE TABLE IF NOT EXISTS grade_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    old_score NUMERIC(4,2),
    new_score NUMERIC(4,2),
    changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. BEHAVIOR, REWARDS & SMART ALERTS
CREATE TABLE IF NOT EXISTS behavior_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    type behavior_type NOT NULL DEFAULT 'positive',
    category VARCHAR(100) NOT NULL, -- "Tích cực phát biểu", "Giúp đỡ bạn", "Đi học muộn"
    points INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(50) NOT NULL,
    description TEXT,
    awarded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'low_grades', 'absenteeism', 'behavior'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status alert_status NOT NULL DEFAULT 'new',
    priority priority_level NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ANNOUNCEMENTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_role user_role, -- NULL = all, or specific
    target_class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    priority priority_level NOT NULL DEFAULT 'medium',
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_table VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Sample RLS Helper Functions & Policies
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: Users can view their own profile; Admins view all; Teachers view student/parent profiles in their classes
CREATE POLICY "Admins full access profiles" ON profiles
    FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "Users read own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Classes: Teachers can view assigned classes; Students can view enrolled classes; Admins view all
CREATE POLICY "Teacher read assigned classes" ON classes
    FOR SELECT USING (
        current_user_role() = 'admin' OR 
        homeroom_teacher_id = auth.uid() OR
        EXISTS (SELECT 1 FROM class_teachers WHERE class_id = classes.id AND teacher_id = auth.uid())
    );

-- Grades: Teachers can insert/update grades for their classes; Students can only view their own grades; Parents view children's grades
CREATE POLICY "Teacher modify grades" ON grades
    FOR ALL USING (
        current_user_role() = 'admin' OR
        EXISTS (
            SELECT 1 FROM grade_items gi
            JOIN class_teachers ct ON ct.class_id = gi.class_id AND ct.subject_id = gi.subject_id
            WHERE gi.id = grades.grade_item_id AND ct.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Student read own grades" ON grades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = grades.student_id AND s.profile_id = auth.uid()
        )
    );

CREATE POLICY "Guardian read child grades" ON grades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_guardians sg
            JOIN guardians g ON g.id = sg.guardian_id
            WHERE sg.student_id = grades.student_id AND g.profile_id = auth.uid()
        )
    );
