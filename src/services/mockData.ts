import {
  UserProfile,
  School,
  AcademicYear,
  GradeLevel,
  Subject,
  ClassItem,
  Student,
  Guardian,
  ScheduleItem,
  Assignment,
  Submission,
  GradeColumn,
  StudentGradeRow,
  GradeAuditLog,
  BehaviorRecord,
  RewardBadge,
  SmartAlert,
  Announcement,
  AuditLogItem,
  AttendanceRecord
} from '../types';

export const INITIAL_SCHOOL: School = {
  id: 'sch-001',
  name: 'Trường THCS Trưng Vương',
  code: 'THCS-TV-2024',
  address: '26 Hàng Bài, Hoàn Kiếm, Hà Nội',
  phone: '024 3825 2142',
  email: 'thcstrungvuong@edu.hanoi.gov.vn',
};

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-2024', schoolId: 'sch-001', name: '2024 - 2025', isCurrent: true, startDate: '2024-09-05', endDate: '2025-05-31' },
  { id: 'ay-2023', schoolId: 'sch-001', name: '2023 - 2024', isCurrent: false, startDate: '2023-09-05', endDate: '2024-05-31' }
];

export const INITIAL_GRADE_LEVELS: GradeLevel[] = [
  { id: 'gl-1', schoolId: 'sch-001', name: 'Khối 1', levelOrder: 1 },
  { id: 'gl-2', schoolId: 'sch-001', name: 'Khối 2', levelOrder: 2 },
  { id: 'gl-3', schoolId: 'sch-001', name: 'Khối 3', levelOrder: 3 },
  { id: 'gl-4', schoolId: 'sch-001', name: 'Khối 4', levelOrder: 4 },
  { id: 'gl-5', schoolId: 'sch-001', name: 'Khối 5', levelOrder: 5 },
  { id: 'gl-6', schoolId: 'sch-001', name: 'Khối 6', levelOrder: 6 },
  { id: 'gl-7', schoolId: 'sch-001', name: 'Khối 7', levelOrder: 7 },
  { id: 'gl-8', schoolId: 'sch-001', name: 'Khối 8', levelOrder: 8 },
  { id: 'gl-9', schoolId: 'sch-001', name: 'Khối 9', levelOrder: 9 },
  { id: 'gl-10', schoolId: 'sch-001', name: 'Khối 10', levelOrder: 10 },
  { id: 'gl-11', schoolId: 'sch-001', name: 'Khối 11', levelOrder: 11 },
  { id: 'gl-12', schoolId: 'sch-001', name: 'Khối 12', levelOrder: 12 }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-toan', schoolId: 'sch-001', name: 'Toán học', code: 'TOAN', color: '#2563EB' },
  { id: 'sub-van', schoolId: 'sch-001', name: 'Ngữ văn', code: 'VAN', color: '#7C3AED' },
  { id: 'sub-anh', schoolId: 'sch-001', name: 'Tiếng Anh', code: 'ANH', color: '#059669' },
  { id: 'sub-ly', schoolId: 'sch-001', name: 'Vật lý', code: 'LY', color: '#D97706' },
  { id: 'sub-hoa', schoolId: 'sch-001', name: 'Hóa học', code: 'HOA', color: '#DC2626' },
  { id: 'sub-sinh', schoolId: 'sch-001', name: 'Sinh học', code: 'SINH', color: '#16A34A' },
  { id: 'sub-tin', schoolId: 'sch-001', name: 'Tin học', code: 'TIN', color: '#0891B2' },
  { id: 'sub-su', schoolId: 'sch-001', name: 'Lịch sử', code: 'SU', color: '#9333EA' }
];

// Test Accounts for all 4 roles
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@edusmart.edu.vn',
    fullName: 'ThS. Nguyễn Hoàng Nam',
    role: 'admin',
    status: 'active',
    phone: '0912 345 678',
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'usr-teacher-1',
    email: 'teacher@edusmart.edu.vn',
    fullName: 'Thầy Nguyễn Văn Hùng',
    role: 'teacher',
    status: 'active',
    phone: '0988 123 456',
    metadata: { homeroomClassId: 'cls-9a1', mainSubject: 'Toán học' },
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'usr-student-1',
    email: 'student@edusmart.edu.vn',
    fullName: 'Nguyễn Minh Khôi',
    role: 'student',
    status: 'active',
    phone: '0905 111 222',
    metadata: { studentId: 'stu-9a1-01', classId: 'cls-9a1' },
    createdAt: '2024-08-15T08:00:00Z'
  },
  {
    id: 'usr-guardian-1',
    email: 'parent@edusmart.edu.vn',
    fullName: 'Nguyễn Văn Đức',
    role: 'guardian',
    status: 'active',
    phone: '0913 999 888',
    metadata: { childrenStudentIds: ['stu-9a1-01', 'stu-8b1-05'] },
    createdAt: '2024-08-15T08:00:00Z'
  }
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls-9a1',
    schoolId: 'sch-001',
    academicYearId: 'ay-2024',
    gradeLevelId: 'gl-10',
    name: '10/1',
    room: 'A.302',
    joinCode: 'CLS-10A1-982',
    homeroomTeacherId: 'usr-teacher-2',
    homeroomTeacherName: 'Cô Nguyễn Thị Mai',
    studentCount: 32,
    status: 'active',
    createdAt: '2024-08-10T08:00:00Z'
  },
  {
    id: 'cls-9a2',
    schoolId: 'sch-001',
    academicYearId: 'ay-2024',
    gradeLevelId: 'gl-10',
    name: '10A2',
    room: 'A.304',
    joinCode: 'CLS-10A2-341',
    homeroomTeacherId: 'usr-teacher-1',
    homeroomTeacherName: 'Thầy Lê Hoàng Long',
    studentCount: 34,
    status: 'active',
    createdAt: '2024-08-10T08:00:00Z'
  },
  {
    id: 'cls-8b1',
    schoolId: 'sch-001',
    academicYearId: 'ay-2024',
    gradeLevelId: 'gl-11',
    name: '11B1',
    room: 'B.201',
    joinCode: 'CLS-11B1-762',
    homeroomTeacherId: 'usr-teacher-3',
    homeroomTeacherName: 'Cô Phạm Thị Thu',
    studentCount: 30,
    status: 'active',
    createdAt: '2024-08-10T08:00:00Z'
  },
  {
    id: 'cls-12a3',
    schoolId: 'sch-001',
    academicYearId: 'ay-2024',
    gradeLevelId: 'gl-12',
    name: '12A3',
    room: 'C.105',
    joinCode: 'CLS-12A3-889',
    homeroomTeacherId: 'usr-teacher-4',
    homeroomTeacherName: 'Thầy Vũ Đình Trọng',
    studentCount: 28,
    status: 'active',
    createdAt: '2024-08-10T08:00:00Z'
  }
];

// Generate 30 realistic Vietnamese students for class 9A1
const studentNames9A1: Array<{ name: string; gender: 'Nam' | 'Nữ'; dob: string }> = [
  { name: 'Nguyễn Minh Khôi', gender: 'Nam', dob: '2010-03-15' },
  { name: 'Trần Gia Bảo', gender: 'Nam', dob: '2010-01-22' },
  { name: 'Phạm Bảo Châu', gender: 'Nữ', dob: '2010-06-18' },
  { name: 'Lê Hoàng Long', gender: 'Nam', dob: '2010-04-05' },
  { name: 'Vũ Thảo Vy', gender: 'Nữ', dob: '2010-09-12' },
  { name: 'Đặng Quốc Anh', gender: 'Nam', dob: '2010-02-28' },
  { name: 'Hoàng Mai Phương', gender: 'Nữ', dob: '2010-11-04' },
  { name: 'Bùi Đức Trọng', gender: 'Nam', dob: '2010-07-20' },
  { name: 'Ngô Khánh Linh', gender: 'Nữ', dob: '2010-05-14' },
  { name: 'Dương Tuấn Kiệt', gender: 'Nam', dob: '2010-08-09' },
  { name: 'Đinh Phương Anh', gender: 'Nữ', dob: '2010-10-30' },
  { name: 'Trịnh Hữu Thắng', gender: 'Nam', dob: '2010-12-11' },
  { name: 'Phan Thùy Trang', gender: 'Nữ', dob: '2010-03-25' },
  { name: 'Mai Văn Tùng', gender: 'Nam', dob: '2010-02-14' },
  { name: 'Lý Kim Ngân', gender: 'Nữ', dob: '2010-07-07' },
  { name: 'Hồ Quang Huy', gender: 'Nam', dob: '2010-04-19' },
  { name: 'Cao Ngọc Diệp', gender: 'Nữ', dob: '2010-08-22' },
  { name: 'Tạ Minh Đức', gender: 'Nam', dob: '2010-01-08' },
  { name: 'Đoàn Yến Nhi', gender: 'Nữ', dob: '2010-06-30' },
  { name: 'Võ Thành Nam', gender: 'Nam', dob: '2010-09-17' },
  { name: 'Nguyễn Thanh Hằng', gender: 'Nữ', dob: '2010-11-25' },
  { name: 'Trần Đình Trọng', gender: 'Nam', dob: '2010-05-02' },
  { name: 'Lê Thùy Dương', gender: 'Nữ', dob: '2010-10-15' },
  { name: 'Phạm Anh Quân', gender: 'Nam', dob: '2010-12-03' },
  { name: 'Chu Quỳnh Nga', gender: 'Nữ', dob: '2010-02-18' },
  { name: 'Vũ Đức Thịnh', gender: 'Nam', dob: '2010-04-29' },
  { name: 'Hoàng Hải Yến', gender: 'Nữ', dob: '2010-07-16' },
  { name: 'Đặng Tuấn Anh', gender: 'Nam', dob: '2010-08-31' },
  { name: 'Bùi Lan Chi', gender: 'Nữ', dob: '2010-03-09' },
  { name: 'Nguyễn Hữu Đạt', gender: 'Nam', dob: '2010-09-24' },
];

export const INITIAL_STUDENTS: Student[] = [
  ...studentNames9A1.map((item, index) => ({
    id: index === 0 ? 'stu-9a1-01' : `stu-9a1-${String(index + 1).padStart(2, '0')}`,
    profileId: index === 0 ? 'usr-student-1' : undefined,
    studentCode: `HS-9A1-${String(index + 1).padStart(2, '0')}`,
    fullName: item.name,
    dateOfBirth: item.dob,
    gender: item.gender,
    address: 'Quận Hoàn Kiếm, TP. Hà Nội',
    status: 'enrolled' as const,
    classId: 'cls-9a1',
    className: '9A1',
    rollNumber: index + 1,
    guardianName: index === 0 ? 'Nguyễn Văn Đức' : `Phụ huynh của ${item.name}`,
    guardianPhone: index === 0 ? '0913 999 888' : `091${Math.floor(1000000 + Math.random() * 9000000)}`,
    guardianRelationship: index % 2 === 0 ? 'Bố' : 'Mẹ',
    guardianId: index === 0 ? 'usr-guardian-1' : undefined,
    notes: index === 0 ? 'Lớp trưởng, học sinh giỏi môn Toán' : ''
  })),
  // Additional student for class 8B1 connected to test parent
  {
    id: 'stu-8b1-05',
    studentCode: 'HS-8B1-05',
    fullName: 'Nguyễn Minh Thư',
    dateOfBirth: '2011-08-20',
    gender: 'Nữ',
    address: 'Quận Hoàn Kiếm, TP. Hà Nội',
    status: 'enrolled',
    classId: 'cls-8b1',
    className: '8B1',
    rollNumber: 5,
    guardianName: 'Nguyễn Văn Đức',
    guardianPhone: '0913 999 888',
    guardianRelationship: 'Bố',
    guardianId: 'usr-guardian-1',
    notes: 'Em gái của Nguyễn Minh Khôi'
  }
];

export const INITIAL_GUARDIANS: Guardian[] = [
  {
    id: 'usr-guardian-1',
    profileId: 'usr-guardian-1',
    fullName: 'Nguyễn Văn Đức',
    phone: '0913 999 888',
    email: 'parent@edusmart.edu.vn',
    relationship: 'Bố',
    children: [
      {
        studentId: 'stu-9a1-01',
        studentName: 'Nguyễn Minh Khôi',
        className: '9A1',
        relationship: 'Con trai'
      },
      {
        studentId: 'stu-8b1-05',
        studentName: 'Nguyễn Minh Thư',
        className: '8B1',
        relationship: 'Con gái'
      }
    ]
  }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  { id: 'sch-1', classId: 'cls-9a1', subjectId: 'sub-toan', subjectName: 'Toán học', subjectColor: '#2563EB', teacherId: 'usr-teacher-1', teacherName: 'Thầy Hùng', dayOfWeek: 2, period: 1, startTime: '07:30', endTime: '08:15', room: '301' },
  { id: 'sch-2', classId: 'cls-9a1', subjectId: 'sub-toan', subjectName: 'Toán học', subjectColor: '#2563EB', teacherId: 'usr-teacher-1', teacherName: 'Thầy Hùng', dayOfWeek: 2, period: 2, startTime: '08:20', endTime: '09:05', room: '301' },
  { id: 'sch-3', classId: 'cls-9a1', subjectId: 'sub-van', subjectName: 'Ngữ văn', subjectColor: '#7C3AED', teacherId: 'usr-teacher-2', teacherName: 'Cô Mai', dayOfWeek: 2, period: 3, startTime: '09:20', endTime: '10:05', room: '301' },
  { id: 'sch-4', classId: 'cls-9a1', subjectId: 'sub-anh', subjectName: 'Tiếng Anh', subjectColor: '#059669', teacherId: 'usr-teacher-3', teacherName: 'Cô Lan', dayOfWeek: 2, period: 4, startTime: '10:10', endTime: '10:55', room: '301' },
  
  { id: 'sch-5', classId: 'cls-9a1', subjectId: 'sub-ly', subjectName: 'Vật lý', subjectColor: '#D97706', teacherId: 'usr-teacher-4', teacherName: 'Thầy Quân', dayOfWeek: 3, period: 1, startTime: '07:30', endTime: '08:15', room: '301' },
  { id: 'sch-6', classId: 'cls-9a1', subjectId: 'sub-hoa', subjectName: 'Hóa học', subjectColor: '#DC2626', teacherId: 'usr-teacher-5', teacherName: 'Cô Hà', dayOfWeek: 3, period: 2, startTime: '08:20', endTime: '09:05', room: '301' },
  { id: 'sch-7', classId: 'cls-9a1', subjectId: 'sub-toan', subjectName: 'Toán học', subjectColor: '#2563EB', teacherId: 'usr-teacher-1', teacherName: 'Thầy Hùng', dayOfWeek: 3, period: 3, startTime: '09:20', endTime: '10:05', room: '301' },

  { id: 'sch-8', classId: 'cls-9a1', subjectId: 'sub-tin', subjectName: 'Tin học', subjectColor: '#0891B2', teacherId: 'usr-teacher-6', teacherName: 'Thầy Bình', dayOfWeek: 4, period: 1, startTime: '07:30', endTime: '08:15', room: 'Lab 2' },
  { id: 'sch-9', classId: 'cls-9a1', subjectId: 'sub-sinh', subjectName: 'Sinh học', subjectColor: '#16A34A', teacherId: 'usr-teacher-7', teacherName: 'Cô Loan', dayOfWeek: 4, period: 2, startTime: '08:20', endTime: '09:05', room: '301' },

  { id: 'sch-10', classId: 'cls-9a1', subjectId: 'sub-toan', subjectName: 'Toán học', subjectColor: '#2563EB', teacherId: 'usr-teacher-1', teacherName: 'Thầy Hùng', dayOfWeek: 5, period: 1, startTime: '07:30', endTime: '08:15', room: '301' },
  { id: 'sch-11', classId: 'cls-9a1', subjectId: 'sub-van', subjectName: 'Ngữ văn', subjectColor: '#7C3AED', teacherId: 'usr-teacher-2', teacherName: 'Cô Mai', dayOfWeek: 5, period: 2, startTime: '08:20', endTime: '09:05', room: '301' },

  { id: 'sch-12', classId: 'cls-9a1', subjectId: 'sub-anh', subjectName: 'Tiếng Anh', subjectColor: '#059669', teacherId: 'usr-teacher-3', teacherName: 'Cô Lan', dayOfWeek: 6, period: 1, startTime: '07:30', endTime: '08:15', room: '301' },
  { id: 'sch-13', classId: 'cls-9a1', subjectId: 'sub-su', subjectName: 'Lịch sử', subjectColor: '#9333EA', teacherId: 'usr-teacher-8', teacherName: 'Cô Thảo', dayOfWeek: 6, period: 2, startTime: '08:20', endTime: '09:05', room: '301' }
];

export const INITIAL_GRADE_COLUMNS: GradeColumn[] = [
  { id: 'col-m1', classId: 'cls-9a1', subjectId: 'sub-toan', semester: 1, name: 'Miệng L1', categoryId: 'cat-oral', weight: 1.0 },
  { id: 'col-15p1', classId: 'cls-9a1', subjectId: 'sub-toan', semester: 1, name: '15 phút L1', categoryId: 'cat-15m', weight: 1.0 },
  { id: 'col-15p2', classId: 'cls-9a1', subjectId: 'sub-toan', semester: 1, name: '15 phút L2', categoryId: 'cat-15m', weight: 1.0 },
  { id: 'col-1t1', classId: 'cls-9a1', subjectId: 'sub-toan', semester: 1, name: '1 Tiết L1', categoryId: 'cat-1period', weight: 2.0 },
  { id: 'col-mid', classId: 'cls-9a1', subjectId: 'sub-toan', semester: 1, name: 'Giữa kỳ I', categoryId: 'cat-midterm', weight: 2.0 },
  { id: 'col-fin', classId: 'cls-9a1', subjectId: 'sub-toan', semester: 1, name: 'Cuối kỳ I', categoryId: 'cat-final', weight: 3.0 }
];

// Prepopulated grade rows for Class 9A1
export const INITIAL_GRADE_ROWS: StudentGradeRow[] = studentNames9A1.map((item, idx) => {
  const sId = idx === 0 ? 'stu-9a1-01' : `stu-9a1-${String(idx + 1).padStart(2, '0')}`;
  // Scores for student 1 (Minh Khôi): Excellent
  const m1 = idx === 0 ? 9.5 : (idx % 4 === 0 ? 8.0 : idx % 3 === 0 ? 7.5 : 8.5);
  const p1 = idx === 0 ? 10.0 : (idx % 5 === 0 ? 6.5 : 8.0);
  const p2 = idx === 0 ? 9.0 : (idx % 2 === 0 ? 8.5 : 7.0);
  const t1 = idx === 0 ? 9.5 : (idx % 3 === 0 ? 7.0 : 8.0);
  const mid = idx === 0 ? 9.0 : (idx % 4 === 0 ? 7.5 : 8.5);
  const fin = idx === 0 ? 9.5 : (idx % 6 === 0 ? 6.0 : 8.0);
  
  const totalWeight = 1 + 1 + 1 + 2 + 2 + 3; // 10
  const avg = Number(((m1 * 1 + p1 * 1 + p2 * 1 + t1 * 2 + mid * 2 + fin * 3) / totalWeight).toFixed(1));

  return {
    studentId: sId,
    studentCode: `HS-9A1-${String(idx + 1).padStart(2, '0')}`,
    fullName: item.name,
    rollNumber: idx + 1,
    scores: {
      'col-m1': m1,
      'col-15p1': p1,
      'col-15p2': p2,
      'col-1t1': t1,
      'col-mid': mid,
      'col-fin': fin
    },
    averageScore: avg,
    conductRank: avg >= 8.0 ? 'Tốt' : 'Khá'
  };
});

export const INITIAL_GRADE_AUDITS: GradeAuditLog[] = [
  {
    id: 'log-1',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    columnName: '15 phút L2',
    oldScore: 8.5,
    newScore: 9.0,
    changedBy: 'usr-teacher-1',
    changedByName: 'Thầy Nguyễn Văn Hùng',
    reason: 'Chấm phúc khảo câu số 3 đề B',
    timestamp: '2024-10-08T09:15:00Z'
  },
  {
    id: 'log-2',
    studentId: 'stu-9a1-04',
    studentName: 'Lê Hoàng Long',
    columnName: 'Giữa kỳ I',
    oldScore: 7.0,
    newScore: 7.5,
    changedBy: 'usr-teacher-1',
    changedByName: 'Thầy Nguyễn Văn Hùng',
    reason: 'Cộng điểm chuyên cần và phát biểu',
    timestamp: '2024-10-09T14:30:00Z'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    classId: 'cls-9a1',
    className: '9A1',
    subjectId: 'sub-toan',
    subjectName: 'Toán học',
    teacherId: 'usr-teacher-1',
    teacherName: 'Thầy Nguyễn Văn Hùng',
    title: 'Bài tập tuần 6: Căn bậc hai và Hằng đẳng thức',
    description: 'Hoàn thành các bài tập từ Bài 1 đến Bài 5 trang 24 SGK Toán 9 Tập 1. Chụp ảnh bài làm rõ nét hoặc nộp file PDF trước thời hạn.',
    dueDate: '2024-10-15T23:59:00Z',
    maxScore: 10,
    status: 'published',
    submissionCount: 26,
    totalStudents: 30,
    attachments: [{ name: 'De_on_tap_Can_bac_hai.pdf', url: '#', size: '1.2 MB' }],
    createdAt: '2024-10-05T08:00:00Z'
  },
  {
    id: 'asg-2',
    classId: 'cls-9a1',
    className: '9A1',
    subjectId: 'sub-toan',
    subjectName: 'Toán học',
    teacherId: 'usr-teacher-1',
    teacherName: 'Thầy Nguyễn Văn Hùng',
    title: 'Chuyên đề: Rút gọn biểu thức chứa căn thức',
    description: 'Luyện tập phương pháp khử mẫu, trục căn thức ở mẫu và tìm giá trị nguyên của x để biểu thức nhận giá trị nguyên.',
    dueDate: '2024-10-20T23:59:00Z',
    maxScore: 10,
    status: 'published',
    submissionCount: 14,
    totalStudents: 30,
    attachments: [{ name: 'Phiếu_bai_tap_Rut_gon.pdf', url: '#', size: '850 KB' }],
    createdAt: '2024-10-09T08:00:00Z'
  },
  {
    id: 'asg-3',
    classId: 'cls-9a1',
    className: '9A1',
    subjectId: 'sub-van',
    subjectName: 'Ngữ văn',
    teacherId: 'usr-teacher-2',
    teacherName: 'Cô Lê Thị Mai',
    title: 'Viết đoạn văn cảm nhận vẻ đẹp người lính trong bài thơ Đồng chí',
    description: 'Viết đoạn văn từ 12-15 câu theo phương pháp diễn dịch hoặc quy nạp, có sử dụng 1 câu ghép và 1 phép nối.',
    dueDate: '2024-10-18T23:59:00Z',
    maxScore: 10,
    status: 'published',
    submissionCount: 28,
    totalStudents: 30,
    createdAt: '2024-10-07T10:00:00Z'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    studentCode: 'HS-9A1-01',
    submittedAt: '2024-10-08T19:30:00Z',
    content: 'Em đã giải xong 5 bài trong SGK và kèm theo lời giải câu phụ nâng cao ạ.',
    attachments: [{ name: 'Bai_lam_Minh_Khoi_Tuan6.pdf', url: '#' }],
    score: 10,
    feedback: 'Bài làm rất cẩn thận, trình bày mạch lạc và chính xác tuyệt đối!',
    gradedBy: 'usr-teacher-1',
    gradedAt: '2024-10-09T08:30:00Z',
    status: 'graded'
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-1',
    studentId: 'stu-9a1-02',
    studentName: 'Trần Gia Bảo',
    studentCode: 'HS-9A1-02',
    submittedAt: '2024-10-09T20:15:00Z',
    content: 'Thầy xem giúp em câu 4b em biến đổi như vậy đã tối ưu chưa ạ.',
    attachments: [{ name: 'GiaBao_Toan9.jpg', url: '#' }],
    score: 8.5,
    feedback: 'Tốt, câu 4b cần ghi chú điều kiện x >= 0 và x != 1.',
    gradedBy: 'usr-teacher-1',
    gradedAt: '2024-10-10T09:00:00Z',
    status: 'graded'
  },
  {
    id: 'sub-3',
    assignmentId: 'asg-2',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    studentCode: 'HS-9A1-01',
    submittedAt: '2024-10-10T07:45:00Z',
    content: 'Em nộp bài tập chuyên đề rút gọn biểu thức ạ.',
    attachments: [{ name: 'Khoi_Chuyende_Rutgon.pdf', url: '#' }],
    status: 'submitted'
  }
];

// Today's attendance records for class 9A1
export const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = studentNames9A1.map((item, idx) => {
  const sId = idx === 0 ? 'stu-9a1-01' : `stu-9a1-${String(idx + 1).padStart(2, '0')}`;
  // 1 excused absent, 1 late, rest present
  let st: AttendanceRecord['status'] = 'present';
  let reason: string | undefined = undefined;

  if (idx === 4) { // Vũ Thảo Vy
    st = 'excused';
    reason = 'Phụ huynh xin nghỉ phép do bị cảm cúm';
  } else if (idx === 9) { // Dương Tuấn Kiệt
    st = 'late';
    reason = 'Xe thủng lốp, vào lớp muộn 15 phút';
  }

  return {
    id: `att-rec-${sId}`,
    classId: 'cls-9a1',
    date: getTodayDateString(),
    period: 1,
    studentId: sId,
    studentName: item.name,
    studentCode: `HS-9A1-${String(idx + 1).padStart(2, '0')}`,
    rollNumber: idx + 1,
    status: st,
    reason,
    updatedBy: 'usr-teacher-1',
    updatedAt: new Date().toISOString()
  };
});

export const INITIAL_BEHAVIORS: BehaviorRecord[] = [
  {
    id: 'beh-1',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    classId: 'cls-9a1',
    className: '9A1',
    type: 'positive',
    category: 'Tích cực phát biểu',
    points: 2,
    notes: 'Giải bài tập nâng cao trên bảng rất hay',
    recordedBy: 'usr-teacher-1',
    recordedByName: 'Thầy Hùng',
    createdAt: '2024-10-09T08:10:00Z'
  },
  {
    id: 'beh-2',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    classId: 'cls-9a1',
    className: '9A1',
    type: 'positive',
    category: 'Giúp đỡ bạn bè',
    points: 3,
    notes: 'Kèm cặp và hướng dẫn bạn yếu trong giờ tự quản',
    recordedBy: 'usr-teacher-1',
    recordedByName: 'Thầy Hùng',
    createdAt: '2024-10-07T14:00:00Z'
  },
  {
    id: 'beh-3',
    studentId: 'stu-9a1-10',
    studentName: 'Dương Tuấn Kiệt',
    classId: 'cls-9a1',
    className: '9A1',
    type: 'warning',
    category: 'Đi học muộn',
    points: -1,
    notes: 'Vào lớp muộn tiết 1',
    recordedBy: 'usr-teacher-1',
    recordedByName: 'Thầy Hùng',
    createdAt: '2024-10-10T07:45:00Z'
  }
];

export const INITIAL_REWARDS: RewardBadge[] = [
  {
    id: 'rew-1',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    badgeName: 'Ngôi sao Toán học',
    badgeIcon: 'Award',
    description: 'Đạt điểm tối đa bài kiểm tra khảo sát và tích cực đóng góp bài giảng.',
    awardedBy: 'usr-teacher-1',
    awardedByName: 'Thầy Hùng',
    awardedAt: '2024-10-01T08:00:00Z'
  },
  {
    id: 'rew-2',
    studentId: 'stu-9a1-01',
    studentName: 'Nguyễn Minh Khôi',
    badgeName: 'Chuyên cần Xuất sắc',
    badgeIcon: 'CheckCircle2',
    description: 'Đầy đủ 100% các tiết học, luôn đến đúng giờ trong tháng 9.',
    awardedBy: 'usr-teacher-1',
    awardedByName: 'Thầy Hùng',
    awardedAt: '2024-09-30T10:00:00Z'
  }
];

export const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: 'alt-1',
    classId: 'cls-9a1',
    className: '9A1',
    studentId: 'stu-9a1-24',
    studentName: 'Phạm Anh Quân',
    type: 'low_grades',
    title: 'Điểm số môn Toán sụt giảm liên tiếp',
    description: 'Học sinh có 2 bài kiểm tra 15 phút đạt 4.0 và 5.0. Cần phụ đạo chuyên đề căn thức.',
    status: 'new',
    priority: 'high',
    createdAt: '2024-10-09T16:00:00Z',
    updatedAt: '2024-10-09T16:00:00Z'
  },
  {
    id: 'alt-2',
    classId: 'cls-9a1',
    className: '9A1',
    studentId: 'stu-9a1-10',
    studentName: 'Dương Tuấn Kiệt',
    type: 'absenteeism',
    title: 'Đi học muộn 3 lần trong tuần',
    description: 'Học sinh đi trễ tiết 1 vào thứ 3, thứ 5 và thứ 6. Đã liên hệ phụ huynh xác minh.',
    status: 'in_progress',
    priority: 'medium',
    resolutionNotes: 'Đã trao đổi với mẹ em Kiệt qua điện thoại ngày 10/10.',
    createdAt: '2024-10-08T09:00:00Z',
    updatedAt: '2024-10-10T08:00:00Z'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Kế hoạch tổ chức Hội thi Văn nghệ chào mừng 20/11',
    content: 'Nhà trường thông báo kế hoạch hội diễn văn nghệ chào mừng Ngày Nhà giáo Việt Nam 20/11. Mỗi lớp đăng ký ít nhất 1 tiết mục trước ngày 25/10.',
    senderName: 'Ban Giám Hiệu',
    senderRole: 'admin',
    targetRole: 'all',
    priority: 'high',
    viewsCount: 142,
    createdAt: '2024-10-08T08:00:00Z'
  },
  {
    id: 'anc-2',
    title: 'Lịch họp Phụ huynh học sinh đầu năm học 2024 - 2025',
    content: 'Kính gửi Quý Phụ huynh, cuộc họp phụ huynh đầu năm của lớp 9A1 sẽ diễn ra vào lúc 08:30 sáng Chủ Nhật ngày 13/10/2024 tại Phòng 301.',
    senderName: 'Thầy Nguyễn Văn Hùng',
    senderRole: 'teacher',
    targetRole: 'guardian',
    targetClassId: 'cls-9a1',
    targetClassName: '9A1',
    priority: 'urgent',
    viewsCount: 28,
    createdAt: '2024-10-06T14:00:00Z'
  },
  {
    id: 'anc-3',
    title: 'Nhắc nhở nộp hồ sơ đăng ký thi thử vào lớp 10 THPT đợt 1',
    content: 'Các bạn học sinh lớp 9 rà soát thông tin cá nhân và hoàn thiện phiếu đăng ký môn thi chuyên/không chuyên trước 17:00 ngày 20/10.',
    senderName: 'Thầy Nguyễn Văn Hùng',
    senderRole: 'teacher',
    targetRole: 'student',
    targetClassId: 'cls-9a1',
    targetClassName: '9A1',
    priority: 'medium',
    viewsCount: 30,
    createdAt: '2024-10-09T10:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    actorName: 'Thầy Nguyễn Văn Hùng',
    actorRole: 'Giáo viên',
    action: 'Cập nhật điểm số',
    entityTable: 'grades',
    entityName: 'HS-9A1-01 (Nguyễn Minh Khôi)',
    details: 'Cập nhật điểm 15p L2 từ 8.5 lên 9.0',
    ipAddress: '113.190.234.12',
    timestamp: '2024-10-08T09:15:00Z'
  },
  {
    id: 'aud-2',
    actorName: 'Thầy Nguyễn Văn Hùng',
    actorRole: 'Giáo viên',
    action: 'Điểm danh lớp',
    entityTable: 'attendance',
    entityName: 'Lớp 9A1 - Tiết 1',
    details: 'Đã điểm danh: 28 có mặt, 1 có phép, 1 đi trễ',
    ipAddress: '113.190.234.12',
    timestamp: '2024-10-10T07:35:00Z'
  },
  {
    id: 'aud-3',
    actorName: 'ThS. Nguyễn Hoàng Nam',
    actorRole: 'Quản trị viên',
    action: 'Tạo tài khoản giáo viên mới',
    entityTable: 'profiles',
    entityName: 'teacher2@edusmart.edu.vn',
    details: 'Cấp quyền giáo viên bộ môn Ngữ văn',
    ipAddress: '14.225.10.88',
    timestamp: '2024-10-01T10:20:00Z'
  }
];
