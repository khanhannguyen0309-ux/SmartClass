import {
  UserProfile,
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
  AttendanceRecord,
  Subject,
  AcademicYear,
  GradeLevel,
  School,
  AlertStatus
} from '../types';

import {
  INITIAL_SCHOOL,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_GRADE_LEVELS,
  INITIAL_SUBJECTS,
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_GUARDIANS,
  INITIAL_SCHEDULES,
  INITIAL_GRADE_COLUMNS,
  INITIAL_GRADE_ROWS,
  INITIAL_GRADE_AUDITS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_BEHAVIORS,
  INITIAL_REWARDS,
  INITIAL_ALERTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  getTodayDateString
} from './mockData';

// In-Memory Database store with local session cache fallback
class DatabaseEngine {
  private school: School = { ...INITIAL_SCHOOL };
  private academicYears: AcademicYear[] = [...INITIAL_ACADEMIC_YEARS];
  private gradeLevels: GradeLevel[] = [...INITIAL_GRADE_LEVELS];
  private subjects: Subject[] = [...INITIAL_SUBJECTS];
  private users: UserProfile[] = [...INITIAL_USERS];
  private classes: ClassItem[] = [...INITIAL_CLASSES];
  private students: Student[] = [...INITIAL_STUDENTS];
  private guardians: Guardian[] = [...INITIAL_GUARDIANS];
  private schedules: ScheduleItem[] = [...INITIAL_SCHEDULES];
  private gradeColumns: GradeColumn[] = [...INITIAL_GRADE_COLUMNS];
  private gradeRows: StudentGradeRow[] = [...INITIAL_GRADE_ROWS];
  private gradeAudits: GradeAuditLog[] = [...INITIAL_GRADE_AUDITS];
  private assignments: Assignment[] = [...INITIAL_ASSIGNMENTS];
  private submissions: Submission[] = [...INITIAL_SUBMISSIONS];
  private attendance: AttendanceRecord[] = [...INITIAL_ATTENDANCE];
  private behaviors: BehaviorRecord[] = [...INITIAL_BEHAVIORS];
  private rewards: RewardBadge[] = [...INITIAL_REWARDS];
  private alerts: SmartAlert[] = [...INITIAL_ALERTS];
  private announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  private auditLogs: AuditLogItem[] = [...INITIAL_AUDIT_LOGS];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const saved = sessionStorage.getItem('edusmart_db_cache');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.classes && data.students) {
          this.classes = data.classes;
          this.students = data.students;
          this.attendance = data.attendance || this.attendance;
          this.gradeRows = data.gradeRows || this.gradeRows;
          this.gradeAudits = data.gradeAudits || this.gradeAudits;
          this.assignments = data.assignments || this.assignments;
          this.submissions = data.submissions || this.submissions;
          this.schedules = data.schedules || this.schedules;
          this.alerts = data.alerts || this.alerts;
          this.announcements = data.announcements || this.announcements;
          this.behaviors = data.behaviors || this.behaviors;
          this.rewards = data.rewards || this.rewards;
          this.auditLogs = data.auditLogs || this.auditLogs;
        }
      }
    } catch (e) {
      console.warn('Could not read session state', e);
    }
  }

  private saveState() {
    try {
      sessionStorage.setItem('edusmart_db_cache', JSON.stringify({
        classes: this.classes,
        students: this.students,
        attendance: this.attendance,
        schedules: this.schedules,
        gradeRows: this.gradeRows,
        gradeAudits: this.gradeAudits,
        assignments: this.assignments,
        submissions: this.submissions,
        alerts: this.alerts,
        announcements: this.announcements,
        behaviors: this.behaviors,
        rewards: this.rewards,
        auditLogs: this.auditLogs
      }));
    } catch (e) {
      console.warn('Could not save session state', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public resetDatabase() {
    sessionStorage.removeItem('edusmart_db_cache');
    this.classes = [...INITIAL_CLASSES];
    this.students = [...INITIAL_STUDENTS];
    this.attendance = [...INITIAL_ATTENDANCE];
    this.gradeRows = [...INITIAL_GRADE_ROWS];
    this.gradeAudits = [...INITIAL_GRADE_AUDITS];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.submissions = [...INITIAL_SUBMISSIONS];
    this.schedules = [...INITIAL_SCHEDULES];
    this.alerts = [...INITIAL_ALERTS];
    this.announcements = [...INITIAL_ANNOUNCEMENTS];
    this.behaviors = [...INITIAL_BEHAVIORS];
    this.rewards = [...INITIAL_REWARDS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.saveState();
  }

  // --- Audit Logging ---
  public logAudit(actorName: string, actorRole: string, action: string, entityTable: string, entityName: string, details: string) {
    const entry: AuditLogItem = {
      id: `aud-${Date.now()}`,
      actorName,
      actorRole,
      action,
      entityTable,
      entityName,
      details,
      ipAddress: '127.0.0.1 (Client)',
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    this.saveState();
  }

  public getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  // --- School & Metadata ---
  public getSchool(): School {
    return this.school;
  }
  public getAcademicYears(): AcademicYear[] {
    return [...this.academicYears];
  }
  public getGradeLevels(): GradeLevel[] {
    return [...this.gradeLevels];
  }
  public getSubjects(): Subject[] {
    return [...this.subjects];
  }
  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  // --- Classes ---
  public getClasses(): ClassItem[] {
    return [...this.classes];
  }

  public getClassById(id: string): ClassItem | undefined {
    return this.classes.find(c => c.id === id);
  }

  public createClass(data: Omit<ClassItem, 'id' | 'createdAt' | 'studentCount' | 'status'>): ClassItem {
    const newClass: ClassItem = {
      ...data,
      id: `cls-${Date.now()}`,
      studentCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.classes.push(newClass);
    this.saveState();
    return newClass;
  }

  public updateClass(id: string, updates: Partial<ClassItem>): ClassItem | undefined {
    const idx = this.classes.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.classes[idx] = { ...this.classes[idx], ...updates };
    this.saveState();
    return this.classes[idx];
  }

  public duplicateClass(id: string, newName: string): ClassItem | undefined {
    const orig = this.getClassById(id);
    if (!orig) return undefined;
    const duplicated = this.createClass({
      schoolId: orig.schoolId,
      academicYearId: orig.academicYearId,
      gradeLevelId: orig.gradeLevelId,
      name: newName,
      room: orig.room,
      joinCode: `ES-${newName.toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      homeroomTeacherId: orig.homeroomTeacherId,
      homeroomTeacherName: orig.homeroomTeacherName
    });
    return duplicated;
  }

  public archiveClass(id: string): boolean {
    const cls = this.getClassById(id);
    if (!cls) return false;
    cls.status = cls.status === 'active' ? 'archived' : 'active';
    this.saveState();
    return true;
  }

  public deleteClass(id: string): boolean {
    const idx = this.classes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.classes.splice(idx, 1);
    this.saveState();
    return true;
  }

  // --- Students ---
  public getStudents(classId?: string): Student[] {
    if (classId) {
      return this.students.filter(s => s.classId === classId);
    }
    return [...this.students];
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  public createStudent(studentData: Omit<Student, 'id' | 'rollNumber'>): Student {
    const classStudents = this.getStudents(studentData.classId);
    const maxRoll = classStudents.reduce((max, s) => Math.max(max, s.rollNumber || 0), 0);
    const newStudent: Student = {
      ...studentData,
      id: `stu-${Date.now()}`,
      rollNumber: maxRoll + 1
    };
    this.students.push(newStudent);
    // update student count on class
    const cls = this.getClassById(studentData.classId);
    if (cls) {
      cls.studentCount = (cls.studentCount || 0) + 1;
    }
    this.saveState();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | undefined {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.students[idx] = { ...this.students[idx], ...updates };
    this.saveState();
    return this.students[idx];
  }

  public deleteStudent(id: string): boolean {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const [deleted] = this.students.splice(idx, 1);
    const cls = this.getClassById(deleted.classId);
    if (cls && cls.studentCount > 0) {
      cls.studentCount -= 1;
    }
    this.saveState();
    return true;
  }

  public importStudents(classId: string, list: Array<Omit<Student, 'id' | 'classId' | 'rollNumber'>>): { success: number; errors: string[] } {
    const cls = this.getClassById(classId);
    if (!cls) return { success: 0, errors: ['Không tìm thấy lớp học'] };

    let added = 0;
    const errors: string[] = [];

    list.forEach((item, index) => {
      if (!item.fullName || item.fullName.trim() === '') {
        errors.push(`Dòng ${index + 1}: Họ và tên không được để trống`);
        return;
      }
      if (!item.studentCode) {
        item.studentCode = `HS-${cls.name}-${String(cls.studentCount + added + 1).padStart(2, '0')}`;
      }
      // Check duplicate code
      if (this.students.some(s => s.studentCode === item.studentCode)) {
        errors.push(`Dòng ${index + 1}: Mã học sinh ${item.studentCode} đã tồn tại`);
        return;
      }

      this.createStudent({
        ...item,
        classId,
        className: cls.name,
        gender: item.gender || 'Nam',
        dateOfBirth: item.dateOfBirth || '2010-01-01',
        status: 'enrolled'
      });
      added++;
    });

    return { success: added, errors };
  }

  // --- Guardians ---
  public getGuardians(): Guardian[] {
    return [...this.guardians];
  }

  public getGuardianByProfileId(profileId: string): Guardian | undefined {
    return this.guardians.find(g => g.profileId === profileId);
  }

  public updateGuardian(id: string, updates: Partial<Guardian>): Guardian | undefined {
    const idx = this.guardians.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.guardians[idx] = { ...this.guardians[idx], ...updates };
      this.saveState();
      return this.guardians[idx];
    }
    return undefined;
  }

  // --- Schedules ---
  public getSchedules(classId?: string): ScheduleItem[] {
    if (classId) {
      return this.schedules.filter(s => s.classId === classId);
    }
    return [...this.schedules];
  }

  public saveScheduleItem(item: Omit<ScheduleItem, 'id'> & { id?: string }): ScheduleItem {
    // If id exists, update existing
    if (item.id) {
      const idx = this.schedules.findIndex(s => s.id === item.id);
      if (idx !== -1) {
        this.schedules[idx] = { ...this.schedules[idx], ...item, id: item.id };
        this.saveState();
        return this.schedules[idx];
      }
    }

    // Check if slot (classId, dayOfWeek, period) already exists
    const existingIdx = this.schedules.findIndex(
      s => s.classId === item.classId && s.dayOfWeek === item.dayOfWeek && s.period === item.period
    );

    if (existingIdx !== -1) {
      const updated: ScheduleItem = {
        ...this.schedules[existingIdx],
        ...item,
        id: this.schedules[existingIdx].id
      };
      this.schedules[existingIdx] = updated;
      this.saveState();
      return updated;
    }

    // Otherwise create new item
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    this.schedules.push(newItem);
    this.saveState();
    return newItem;
  }

  public deleteScheduleItem(id: string): boolean {
    const idx = this.schedules.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.schedules.splice(idx, 1);
    this.saveState();
    return true;
  }

  public deleteScheduleSlot(classId: string, dayOfWeek: number, period: number): boolean {
    const idx = this.schedules.findIndex(
      s => s.classId === classId && s.dayOfWeek === dayOfWeek && s.period === period
    );
    if (idx === -1) return false;
    this.schedules.splice(idx, 1);
    this.saveState();
    return true;
  }

  // --- Attendance ---
  public getAttendance(classId: string, date: string, period: number = 1): AttendanceRecord[] {
    let records = this.attendance.filter(a => a.classId === classId && a.date === date && a.period === period);
    if (records.length === 0) {
      // Auto populate initial default attendance for all students of this class
      const classStudents = this.getStudents(classId);
      records = classStudents.map(st => ({
        id: `att-${classId}-${st.id}-${date}-${period}`,
        classId,
        date,
        period,
        studentId: st.id,
        studentName: st.fullName,
        studentCode: st.studentCode,
        rollNumber: st.rollNumber,
        status: 'present',
        updatedBy: 'system',
        updatedAt: new Date().toISOString()
      }));
      this.attendance.push(...records);
      this.saveState();
    }
    return [...records];
  }

  public updateAttendanceRecord(recordId: string, status: AttendanceRecord['status'], reason?: string): void {
    const idx = this.attendance.findIndex(a => a.id === recordId);
    if (idx !== -1) {
      this.attendance[idx].status = status;
      this.attendance[idx].reason = reason;
      this.attendance[idx].updatedAt = new Date().toISOString();
      this.saveState();
    }
  }

  public bulkSaveAttendance(records: AttendanceRecord[], teacherName: string): void {
    records.forEach(rec => {
      const idx = this.attendance.findIndex(a => a.id === rec.id);
      if (idx !== -1) {
        this.attendance[idx] = { ...rec, updatedAt: new Date().toISOString() };
      } else {
        this.attendance.push(rec);
      }
    });
    this.logAudit(teacherName, 'Giáo viên', 'Lưu điểm danh', 'attendance', `Lớp ${records[0]?.classId}`, `Điểm danh ${records.length} học sinh`);
    this.saveState();
  }

  // --- Gradebook ---
  public getGradeColumns(classId: string, subjectId?: string, semester: 1 | 2 = 1): GradeColumn[] {
    return this.gradeColumns.filter(c => c.classId === classId && (!subjectId || c.subjectId === subjectId) && c.semester === semester);
  }

  public getGradeRows(classId: string): StudentGradeRow[] {
    // Return rows for class students
    const classStudents = this.getStudents(classId);
    return classStudents.map(st => {
      const existing = this.gradeRows.find(r => r.studentId === st.id);
      if (existing) return existing;
      return {
        studentId: st.id,
        studentCode: st.studentCode,
        fullName: st.fullName,
        rollNumber: st.rollNumber,
        scores: {},
        averageScore: undefined,
        conductRank: 'Tốt'
      };
    });
  }

  public updateGradeScore(
    studentId: string,
    columnId: string,
    score: number | null,
    editorId: string,
    editorName: string,
    reason: string = 'Nhập điểm trực tiếp'
  ): void {
    let row = this.gradeRows.find(r => r.studentId === studentId);
    const student = this.getStudentById(studentId);
    const col = this.gradeColumns.find(c => c.id === columnId);

    if (!row && student) {
      row = {
        studentId,
        studentCode: student.studentCode,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        scores: {},
        conductRank: 'Tốt'
      };
      this.gradeRows.push(row);
    }

    if (row && col && student) {
      const oldScore = row.scores[columnId] ?? null;
      if (oldScore !== score) {
        row.scores[columnId] = score;

        // recalculate average
        let sumWeighted = 0;
        let sumWeights = 0;
        this.gradeColumns.forEach(c => {
          const val = row!.scores[c.id];
          if (val !== undefined && val !== null) {
            sumWeighted += val * c.weight;
            sumWeights += c.weight;
          }
        });
        row.averageScore = sumWeights > 0 ? Number((sumWeighted / sumWeights).toFixed(1)) : undefined;

        // Log audit
        this.gradeAudits.unshift({
          id: `ga-${Date.now()}`,
          studentId,
          studentName: student.fullName,
          columnName: col.name,
          oldScore,
          newScore: score,
          changedBy: editorId,
          changedByName: editorName,
          reason,
          timestamp: new Date().toISOString()
        });

        this.saveState();
      }
    }
  }

  public getGradeAudits(studentId?: string): GradeAuditLog[] {
    if (studentId) {
      return this.gradeAudits.filter(a => a.studentId === studentId);
    }
    return [...this.gradeAudits];
  }

  // --- Assignments & Submissions ---
  public getAssignments(classId?: string): Assignment[] {
    if (classId) {
      return this.assignments.filter(a => a.classId === classId);
    }
    return [...this.assignments];
  }

  public getAssignmentById(id: string): Assignment | undefined {
    return this.assignments.find(a => a.id === id);
  }

  public createAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'submissionCount'>): Assignment {
    const newAsg: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      submissionCount: 0,
      createdAt: new Date().toISOString()
    };
    this.assignments.unshift(newAsg);
    this.saveState();
    return newAsg;
  }

  public updateAssignment(id: string, updates: Partial<Assignment>): Assignment | undefined {
    const idx = this.assignments.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.assignments[idx] = { ...this.assignments[idx], ...updates };
    this.saveState();
    return this.assignments[idx];
  }

  public deleteAssignment(id: string): boolean {
    const idx = this.assignments.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.assignments.splice(idx, 1);
    this.saveState();
    return true;
  }

  public getSubmissions(assignmentId: string): Submission[] {
    return this.submissions.filter(s => s.assignmentId === assignmentId);
  }

  public getStudentSubmissions(studentId: string): Submission[] {
    return this.submissions.filter(s => s.studentId === studentId);
  }

  public submitAssignment(submissionData: Omit<Submission, 'id' | 'submittedAt' | 'status'>): Submission {
    let sub = this.submissions.find(s => s.assignmentId === submissionData.assignmentId && s.studentId === submissionData.studentId);
    if (sub) {
      sub.content = submissionData.content;
      sub.attachments = submissionData.attachments;
      sub.submittedAt = new Date().toISOString();
      sub.status = 'submitted';
    } else {
      sub = {
        ...submissionData,
        id: `sub-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      this.submissions.push(sub);
      // update assignment count
      const asg = this.getAssignmentById(submissionData.assignmentId);
      if (asg) {
        asg.submissionCount = (asg.submissionCount || 0) + 1;
      }
    }
    this.saveState();
    return sub;
  }

  public gradeSubmission(submissionId: string, score: number, feedback: string, teacherId: string): Submission | undefined {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (!sub) return undefined;
    sub.score = score;
    sub.feedback = feedback;
    sub.gradedBy = teacherId;
    sub.gradedAt = new Date().toISOString();
    sub.status = 'graded';
    this.saveState();
    return sub;
  }

  // --- Smart Alerts ---
  public getAlerts(classId?: string): SmartAlert[] {
    if (classId) {
      return this.alerts.filter(a => a.classId === classId);
    }
    return [...this.alerts];
  }

  public updateAlertStatus(alertId: string, status: AlertStatus, resolutionNotes?: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (resolutionNotes !== undefined) alert.resolutionNotes = resolutionNotes;
      alert.updatedAt = new Date().toISOString();
      this.saveState();
    }
  }

  public createAlert(data: Omit<SmartAlert, 'id' | 'createdAt' | 'updatedAt'>): SmartAlert {
    const newAlert: SmartAlert = {
      ...data,
      id: `alt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.alerts.unshift(newAlert);
    this.saveState();
    return newAlert;
  }

  // --- Announcements ---
  public getAnnouncements(role?: string, classId?: string): Announcement[] {
    return this.announcements.filter(a => {
      if (a.targetRole && a.targetRole !== 'all' && role && a.targetRole !== role) {
        return false;
      }
      if (a.targetClassId && classId && a.targetClassId !== classId) {
        return false;
      }
      return true;
    });
  }

  public createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'viewsCount'>): Announcement {
    const newAnc: Announcement = {
      ...data,
      id: `anc-${Date.now()}`,
      viewsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.announcements.unshift(newAnc);
    this.saveState();
    return newAnc;
  }

  // --- Behavior & Rewards ---
  public getBehaviors(studentId?: string, classId?: string): BehaviorRecord[] {
    return this.behaviors.filter(b => {
      if (studentId && b.studentId !== studentId) return false;
      if (classId && b.classId !== classId) return false;
      return true;
    });
  }

  public addBehaviorRecord(data: Omit<BehaviorRecord, 'id' | 'createdAt'>): BehaviorRecord {
    const newBeh: BehaviorRecord = {
      ...data,
      id: `beh-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.behaviors.unshift(newBeh);
    this.saveState();
    return newBeh;
  }

  public getRewards(studentId?: string): RewardBadge[] {
    if (studentId) {
      return this.rewards.filter(r => r.studentId === studentId);
    }
    return [...this.rewards];
  }

  public awardBadge(data: Omit<RewardBadge, 'id' | 'awardedAt'>): RewardBadge {
    const newReward: RewardBadge = {
      ...data,
      id: `rew-${Date.now()}`,
      awardedAt: new Date().toISOString()
    };
    this.rewards.unshift(newReward);
    this.saveState();
    return newReward;
  }
}

export const db = new DatabaseEngine();
