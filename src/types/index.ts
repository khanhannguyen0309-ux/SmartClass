// ==============================================================================
// EDUSMART TYPE DEFINITIONS
// Covers all 4 roles: admin, teacher, student, guardian (parent)
// ==============================================================================

export type UserRole = 'admin' | 'teacher' | 'student' | 'guardian';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'left_early';

export type AssignmentStatus = 'draft' | 'published' | 'archived';

export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'late' | 'missing';

export type GradeType = 'oral' | 'quiz_15m' | 'midterm' | 'final' | 'homework';

export type BehaviorType = 'positive' | 'constructive' | 'warning';

export type AlertStatus = 'new' | 'viewed' | 'in_progress' | 'resolved';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2024-2025"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface GradeLevel {
  id: string;
  schoolId: string;
  name: string; // "Khối 6", "Khối 7", "Khối 8", "Khối 9"
  levelOrder: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string; // "Toán học", "Ngữ văn", "Tiếng Anh"...
  code: string;
  color: string;
}

export interface ClassItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  gradeLevelId: string;
  name: string; // "9A1"
  room: string;
  joinCode: string;
  homeroomTeacherId: string;
  homeroomTeacherName?: string;
  studentCount: number;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Student {
  id: string;
  profileId?: string;
  studentCode: string; // "HS-2024-001"
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Nam' | 'Nữ';
  address?: string;
  notes?: string;
  avatarUrl?: string;
  status: 'enrolled' | 'transferred' | 'graduated';
  classId: string;
  className?: string;
  rollNumber: number;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  guardianId?: string;
}

export interface Guardian {
  id: string;
  profileId: string;
  fullName: string;
  phone: string;
  email?: string;
  relationship: string;
  children: {
    studentId: string;
    studentName: string;
    className: string;
    relationship: string;
  }[];
}

export interface ScheduleItem {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number; // 2 (Thứ 2) to 7 (Thứ 7)
  period: number; // 1 to 5 (sáng), 6 to 10 (chiều)
  startTime: string; // "07:30"
  endTime: string;   // "08:15"
  room: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  period: number;
  studentId: string;
  studentName: string;
  studentCode: string;
  rollNumber: number;
  status: AttendanceStatus;
  reason?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string; // ISO
  maxScore: number;
  status: AssignmentStatus;
  submissionCount?: number;
  totalStudents?: number;
  attachments?: { name: string; url: string; size?: string }[];
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  content?: string;
  attachments?: { name: string; url: string }[];
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  status: SubmissionStatus;
}

export interface GradeCategory {
  id: string;
  name: string; // "Miệng/15 phút" (x1), "1 Tiết" (x2), "Học kỳ" (x3)
  type: GradeType;
  weight: number;
}

export interface GradeColumn {
  id: string;
  classId: string;
  subjectId: string;
  semester: 1 | 2;
  name: string; // e.g. "Miệng L1", "15p L1", "15p L2", "1 Tiết", "Học kỳ"
  categoryId: string;
  weight: number;
}

export interface StudentGradeRow {
  studentId: string;
  studentCode: string;
  fullName: string;
  rollNumber: number;
  scores: Record<string, number | null>; // columnId -> score
  averageScore?: number;
  conductRank?: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
}

export interface GradeAuditLog {
  id: string;
  studentId: string;
  studentName: string;
  columnName: string;
  oldScore: number | null;
  newScore: number | null;
  changedBy: string;
  changedByName: string;
  reason: string;
  timestamp: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  type: BehaviorType;
  category: string;
  points: number;
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface RewardBadge {
  id: string;
  studentId: string;
  studentName: string;
  badgeName: string;
  badgeIcon: string;
  description: string;
  awardedBy: string;
  awardedByName: string;
  awardedAt: string;
}

export interface SmartAlert {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  type: 'low_grades' | 'absenteeism' | 'behavior';
  title: string;
  description: string;
  status: AlertStatus; // 'new' | 'viewed' | 'in_progress' | 'resolved'
  priority: PriorityLevel;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: string;
  targetRole?: UserRole | 'all';
  targetClassId?: string;
  targetClassName?: string;
  priority: PriorityLevel;
  viewsCount: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  type: 'assignment' | 'grade' | 'attendance' | 'alert' | 'system';
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityTable: string;
  entityName: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface ClassToolStudent {
  id: string;
  name: string;
  rollNumber: number;
  gender: 'Nam' | 'Nữ';
  selectedCount?: number;
}
