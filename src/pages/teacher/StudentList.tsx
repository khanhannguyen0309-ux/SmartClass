import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { Student, Guardian } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Eye,
  Edit2,
  Phone,
  PhoneCall,
  MessageSquare,
  Copy,
  Check,
  X,
  Send,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface ParentRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  relationship: string;
  address?: string;
  notes?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  classId: string;
  guardianId?: string;
}

export const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { confirm } = useConfirm();
  const { success, error, warning } = useToast();

  // Active Tab: 'students' | 'guardians'
  const [activeTab, setActiveTab] = useState<'students' | 'guardians'>('students');

  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const [classes, setClasses] = useState(db.getClasses());
  const [filterClass, setFilterClass] = useState<string>(selectedClassId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [relationFilter, setRelationFilter] = useState('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Modal States for Guardians: View, Edit, Contact
  const [viewingParent, setViewingParent] = useState<ParentRecord | null>(null);
  const [editingParent, setEditingParent] = useState<ParentRecord | null>(null);
  const [contactingParent, setContactingParent] = useState<ParentRecord | null>(null);

  // Form states for Edit Parent
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRelationship, setEditRelationship] = useState('Bố');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Form states for Quick Contact message
  const [messageTopic, setMessageTopic] = useState('Nhắc nhở tình hình học tập và chuyên cần');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Modal State for Student: View & Edit
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editStudentDob, setEditStudentDob] = useState('');
  const [editStudentGender, setEditStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [editStudentClassId, setEditStudentClassId] = useState('');
  const [editStudentGuardianName, setEditStudentGuardianName] = useState('');
  const [editStudentGuardianPhone, setEditStudentGuardianPhone] = useState('');
  const [editStudentGuardianRel, setEditStudentGuardianRel] = useState('Bố');
  const [editStudentNotes, setEditStudentNotes] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setStudents(db.getStudents());
      setClasses(db.getClasses());
    });
    return unsub;
  }, []);

  // Build Parents List derived from students and guardians
  const parentsList: ParentRecord[] = students.map((s, idx) => {
    return {
      id: s.guardianId || `parent-${s.id}`,
      fullName: s.guardianName || `Phụ huynh của ${s.fullName}`,
      phone: s.guardianPhone || (s.rollNumber ? `0913 ${String(s.rollNumber).padStart(3, '0')} 88` : '0912 345 678'),
      email: s.guardianId ? 'parent@edusmart.edu.vn' : undefined,
      relationship: s.guardianRelationship || (idx % 2 === 0 ? 'Bố' : 'Mẹ'),
      address: s.address || 'Quận Hoàn Kiếm, TP. Hà Nội',
      notes: s.notes || 'Phụ huynh thường xuyên tương tác qua sổ liên lạc điện tử',
      studentId: s.id,
      studentName: s.fullName,
      studentCode: s.studentCode,
      className: s.className || '10/1',
      classId: s.classId,
      guardianId: s.guardianId
    };
  });

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesClass = filterClass === 'all' || s.classId === filterClass;
    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.guardianPhone && s.guardianPhone.includes(searchTerm));

    return matchesClass && matchesGender && matchesSearch;
  });

  // Filter parents
  const filteredParents = parentsList.filter(p => {
    const matchesClass = filterClass === 'all' || p.classId === filterClass;
    const matchesRelation = relationFilter === 'all' || p.relationship === relationFilter;
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentCode.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesClass && matchesRelation && matchesSearch;
  });

  // Export CSV for Students
  const handleExportStudentsCSV = () => {
    const listToExport = filteredStudents;
    const headers = ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'Ngày sinh', 'Giới tính', 'Phụ huynh', 'SĐT Phụ huynh'];
    const rows = listToExport.map(s => [
      s.rollNumber,
      s.studentCode,
      `"${s.fullName}"`,
      s.className || '',
      s.dateOfBirth,
      s.gender,
      `"${s.guardianName || ''}"`,
      s.guardianPhone || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_sach_hoc_sinh_${filterClass !== 'all' ? filterClass : 'toan_truong'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Đã xuất file CSV với ${listToExport.length} học sinh`);
  };

  // Export CSV for Parents
  const handleExportParentsCSV = () => {
    const listToExport = filteredParents;
    const headers = ['STT', 'Họ và tên Phụ huynh', 'Mối quan hệ', 'Số điện thoại', 'Học sinh', 'Mã HS', 'Lớp', 'Địa chỉ'];
    const rows = listToExport.map((p, idx) => [
      idx + 1,
      `"${p.fullName}"`,
      p.relationship,
      `'${p.phone}'`,
      `"${p.studentName}"`,
      p.studentCode,
      p.className,
      `"${p.address || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_ba_phu_huynh_${filterClass !== 'all' ? filterClass : 'toan_truong'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Đã xuất danh bạ ${listToExport.length} phụ huynh thành công`);
  };

  // Copy Phone Number
  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    success(`Đã sao chép số điện thoại: ${phone}`);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Delete Student
  const handleDeleteStudent = (s: Student) => {
    confirm({
      title: `Xóa học sinh ${s.fullName}?`,
      message: `Học sinh này sẽ bị xóa khỏi hệ thống và danh sách lớp ${s.className || ''}.`,
      isDanger: true,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        db.deleteStudent(s.id);
        db.logAudit(currentUser.fullName, 'Giáo viên', 'Xóa học sinh', 'students', s.fullName, `Xóa học sinh ${s.fullName}`);
        success(`Đã xóa học sinh ${s.fullName}`);
      }
    });
  };

  // Student Action Handlers
  const handleOpenViewStudent = (st: Student) => {
    setViewingStudent(st);
  };

  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setEditStudentName(st.fullName);
    setEditStudentCode(st.studentCode);
    setEditStudentDob(st.dateOfBirth);
    setEditStudentGender(st.gender);
    setEditStudentClassId(st.classId);
    setEditStudentGuardianName(st.guardianName || '');
    setEditStudentGuardianPhone(st.guardianPhone || '');
    setEditStudentGuardianRel(st.guardianRelationship || 'Bố');
    setEditStudentNotes(st.notes || '');
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName.trim()) return;

    const targetClass = classes.find(c => c.id === editStudentClassId);

    db.updateStudent(editingStudent.id, {
      fullName: editStudentName.trim(),
      studentCode: editStudentCode.trim() || editingStudent.studentCode,
      dateOfBirth: editStudentDob || editingStudent.dateOfBirth,
      gender: editStudentGender,
      classId: editStudentClassId || editingStudent.classId,
      className: targetClass?.name || editingStudent.className,
      guardianName: editStudentGuardianName.trim() || undefined,
      guardianPhone: editStudentGuardianPhone.trim() || undefined,
      guardianRelationship: editStudentGuardianRel,
      notes: editStudentNotes.trim() || undefined
    });

    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Cập nhật học sinh',
      'students',
      editStudentName.trim(),
      `Chỉnh sửa hồ sơ học sinh ${editStudentName.trim()}`
    );

    success(`Đã cập nhật thông tin học sinh ${editStudentName.trim()} thành công!`);
    setEditingStudent(null);
  };

  const handleOpenContactFromStudent = (st: Student) => {
    const parentRec: ParentRecord = {
      id: st.guardianId || `parent-${st.id}`,
      fullName: st.guardianName || `Phụ huynh em ${st.fullName}`,
      phone: st.guardianPhone || (st.rollNumber ? `0913 ${String(st.rollNumber).padStart(3, '0')} 88` : '0912 345 678'),
      relationship: st.guardianRelationship || 'Phụ huynh',
      studentId: st.id,
      studentName: st.fullName,
      studentCode: st.studentCode,
      className: st.className || '10/1',
      classId: st.classId,
      address: st.address
    };
    handleOpenContactParent(parentRec);
  };

  // Action 1: View Parent Details
  const handleOpenViewParent = (parent: ParentRecord) => {
    setViewingParent(parent);
  };

  // Action 2: Edit Parent Details
  const handleOpenEditParent = (parent: ParentRecord) => {
    setEditingParent(parent);
    setEditFullName(parent.fullName);
    setEditPhone(parent.phone);
    setEditEmail(parent.email || '');
    setEditRelationship(parent.relationship);
    setEditAddress(parent.address || '');
    setEditNotes(parent.notes || '');
  };

  const handleSaveEditParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent || !editFullName.trim()) return;

    if (!editPhone.trim()) {
      error('Vui lòng nhập số điện thoại liên hệ của phụ huynh');
      return;
    }

    // Update in database student record
    db.updateStudent(editingParent.studentId, {
      guardianName: editFullName.trim(),
      guardianPhone: editPhone.trim(),
      guardianRelationship: editRelationship,
      address: editAddress.trim() || undefined,
      notes: editNotes.trim() || undefined
    });

    // If guardian profile exists, update guardian
    if (editingParent.guardianId) {
      db.updateGuardian(editingParent.guardianId, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || undefined,
        relationship: editRelationship
      });
    }

    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Cập nhật phụ huynh',
      'guardians',
      editFullName.trim(),
      `Cập nhật phụ huynh của học sinh ${editingParent.studentName} (SĐT: ${editPhone.trim()})`
    );

    success(`Đã cập nhật thông tin phụ huynh ${editFullName.trim()} thành công!`);
    setEditingParent(null);
  };

  // Action 3: Contact Parent
  const handleOpenContactParent = (parent: ParentRecord) => {
    setContactingParent(parent);
    setMessageTopic('Nhắc nhở tình hình học tập và chuyên cần');
    setMessageBody(`Kính gửi phụ huynh em ${parent.studentName} (Lớp ${parent.className}), giáo viên chủ nhiệm xin thông báo tình hình học tập tuần này của em...`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactingParent || !messageBody.trim()) return;

    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      db.logAudit(
        currentUser.fullName,
        'Giáo viên',
        'Gửi tin nhắn phụ huynh',
        'guardians',
        contactingParent.fullName,
        `Gửi thông báo: "${messageTopic}" đến phụ huynh ${contactingParent.fullName} (${contactingParent.phone})`
      );
      success(`Đã gửi tin nhắn thành công đến phụ huynh ${contactingParent.fullName} (${contactingParent.phone}) qua Sổ liên lạc điện tử!`);
      setContactingParent(null);
    }, 600);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Học sinh & Hồ sơ
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quản lý danh sách học sinh toàn diện và danh bạ liên hệ phụ huynh
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'students' ? (
            <>
              <button
                onClick={() => navigate('/teacher/students/import')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Nhập Excel/CSV</span>
              </button>
              <button
                onClick={handleExportStudentsCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Xuất CSV</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleExportParentsCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Xuất danh bạ phụ huynh</span>
            </button>
          )}
        </div>
      </div>

      {/* 2 TABS: "Danh sách học sinh" & "Thông tin phụ huynh" */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-6">
          {/* Tab 1 */}
          <button
            onClick={() => {
              setActiveTab('students');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Danh sách học sinh</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                activeTab === 'students'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {students.length}
            </span>
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => {
              setActiveTab('guardians');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guardians'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Thông tin phụ huynh</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                activeTab === 'guardians'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {parentsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH HỌC SINH */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, mã số, SĐT phụ huynh..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={e => {
                  setFilterClass(e.target.value);
                  if (e.target.value !== 'all') setSelectedClassId(e.target.value);
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name} ({c.studentCount} HS)
                  </option>
                ))}
              </select>

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold self-end md:self-auto tabular-nums">
              Hiển thị {filteredStudents.length} học sinh
            </div>
          </div>

          {/* Table view */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs relative">
            <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3 pl-4 whitespace-nowrap w-12">STT</th>
                  <th className="p-3 whitespace-nowrap min-w-[110px]">Mã HS</th>
                  <th className="p-3 whitespace-nowrap min-w-[200px]">Họ và tên</th>
                  <th className="p-3 whitespace-nowrap min-w-[80px]">Lớp</th>
                  <th className="p-3 whitespace-nowrap min-w-[100px]">Ngày sinh</th>
                  <th className="p-3 whitespace-nowrap min-w-[80px]">Giới tính</th>
                  <th className="p-3 whitespace-nowrap min-w-[190px]">Phụ huynh liên hệ</th>
                  <th className="p-3 whitespace-nowrap min-w-[95px]">Trạng thái</th>
                  <th className="p-3 text-center sticky right-0 bg-slate-50 z-30 border-l border-slate-200 shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.08)] min-w-[130px] w-[130px] whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400">
                      Không tìm thấy học sinh nào phù hợp bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(st => (
                    <tr key={st.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 pl-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">{st.rollNumber}</td>
                      <td className="p-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{st.studentCode}</td>

                      {/* Họ và tên trên 1 DÒNG DUY NHẤT */}
                      <td className="p-3 whitespace-nowrap min-w-[200px]">
                        <div className="font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {st.fullName.split(' ').pop()?.charAt(0) || 'H'}
                          </div>
                          <button
                            onClick={() => handleOpenViewStudent(st)}
                            className="whitespace-nowrap font-bold text-slate-900 hover:text-blue-600 hover:underline text-left cursor-pointer transition-colors"
                            title="Bấm để xem hồ sơ học sinh"
                          >
                            {st.fullName}
                          </button>
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold text-[11px] whitespace-nowrap">
                          {st.className || '10/1'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{new Date(st.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                          st.gender === 'Nam' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {st.gender}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800 whitespace-nowrap">{st.guardianName || 'Chưa cập nhật'}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5 whitespace-nowrap">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{st.guardianPhone || '0912 345 678'}</span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                          Đang học
                        </span>
                      </td>

                      {/* 3 THAO TÁC CỐ ĐỊNH BÊN PHẢI (STICKY RIGHT) - CHỈ CÓ ICON, KHÔNG CÓ CHỮ */}
                      <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/95 z-20 border-l border-slate-200 shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.08)] min-w-[130px] w-[130px] whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. View (Xem chi tiết hồ sơ - Chỉ icon) */}
                          <button
                            onClick={() => handleOpenViewStudent(st)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer hover:scale-105 shadow-2xs"
                            title="Xem chi tiết hồ sơ học sinh (View)"
                            aria-label="Xem chi tiết hồ sơ học sinh"
                          >
                            <Eye className="w-4 h-4 text-slate-700" />
                          </button>

                          {/* 2. Edit (Chỉnh sửa thông tin - Chỉ icon) */}
                          <button
                            onClick={() => handleOpenEditStudent(st)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 rounded-lg transition-all cursor-pointer hover:scale-105 shadow-2xs"
                            title="Chỉnh sửa thông tin học sinh (Edit)"
                            aria-label="Chỉnh sửa thông tin học sinh"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* 3. Liên hệ phụ huynh học sinh - Chỉ icon */}
                          <button
                            onClick={() => handleOpenContactFromStudent(st)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105"
                            title="Liên hệ phụ huynh: Gọi điện, nhắn tin, gửi thông báo"
                            aria-label="Liên hệ phụ huynh"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: THÔNG TIN PHỤ HUYNH (SỐ ĐIỆN THOẠI & 3 THAO TÁC: VIEW, EDIT, LIÊN HỆ) */}
      {/* ========================================================================= */}
      {activeTab === 'guardians' && (
        <div className="space-y-4">
          {/* Filters Toolbar for Parents */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên phụ huynh, số điện thoại, tên học sinh..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={e => {
                  setFilterClass(e.target.value);
                  if (e.target.value !== 'all') setSelectedClassId(e.target.value);
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
              </select>

              {/* Relationship Filter */}
              <select
                value={relationFilter}
                onChange={e => setRelationFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="Bố">Bố</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Người giám hộ">Người giám hộ</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold self-end md:self-auto tabular-nums">
              Hiển thị {filteredParents.length} phụ huynh
            </div>
          </div>

          {/* Table View of Parents */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs relative">
            <table className="w-full text-left text-xs border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3 pl-4 whitespace-nowrap w-12">STT</th>
                  <th className="p-3 whitespace-nowrap min-w-[190px]">Phụ huynh</th>
                  <th className="p-3 whitespace-nowrap min-w-[90px]">Quan hệ</th>
                  <th className="p-3 whitespace-nowrap min-w-[160px]">Số điện thoại liên hệ</th>
                  <th className="p-3 whitespace-nowrap min-w-[190px]">Học sinh con em</th>
                  <th className="p-3 whitespace-nowrap min-w-[80px]">Lớp</th>
                  <th className="p-3 whitespace-nowrap min-w-[120px]">Kênh kết nối</th>
                  <th className="p-3 text-center sticky right-0 bg-slate-50 z-20 border-l border-slate-200 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] min-w-[125px] w-[125px] whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400">
                      Không tìm thấy phụ huynh nào phù hợp bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((parent, idx) => (
                    <tr key={`${parent.id}-${parent.studentId}`} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 pl-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">{idx + 1}</td>

                      {/* Parent Full Name on ONE LINE */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {parent.fullName.split(' ').pop()?.charAt(0) || 'P'}
                          </div>
                          <span className="whitespace-nowrap">{parent.fullName}</span>
                        </div>
                      </td>

                      {/* Relationship badge */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                          parent.relationship === 'Bố'
                            ? 'bg-blue-50 text-blue-700'
                            : parent.relationship === 'Mẹ'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {parent.relationship}
                        </span>
                      </td>

                      {/* SỐ ĐIỆN THOẠI LIÊN HỆ */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <a
                            href={`tel:${parent.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 px-2 py-1 rounded-lg text-xs transition-colors whitespace-nowrap"
                            title="Bấm để gọi trực tiếp"
                          >
                            <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="whitespace-nowrap">{parent.phone}</span>
                          </a>

                          {/* Quick Copy Phone */}
                          <button
                            onClick={e => handleCopyPhone(e, parent.phone)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer shrink-0"
                            title="Sao chép số điện thoại"
                          >
                            {copiedPhone === parent.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Student Linked on ONE LINE */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/teacher/students/${parent.studentId}`)}
                          className="font-bold text-slate-800 hover:text-blue-600 hover:underline text-left cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span className="whitespace-nowrap">{parent.studentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">({parent.studentCode})</span>
                        </button>
                      </td>

                      {/* Class */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[11px] whitespace-nowrap">
                          Lớp {parent.className}
                        </span>
                      </td>

                      {/* Channel status */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="whitespace-nowrap">Đã liên kết App</span>
                        </span>
                      </td>

                      {/* 3 THAO TÁC CỐ ĐỊNH BÊN PHẢI (STICKY RIGHT) - CHỈ GIỮ ICON */}
                      <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/90 z-10 border-l border-slate-200 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] min-w-[125px] w-[125px] whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. THAO TÁC VIEW (Xem chi tiết - Chỉ giữ icon) */}
                          <button
                            onClick={() => handleOpenViewParent(parent)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer hover:scale-105 shadow-2xs"
                            title="Xem chi tiết hồ sơ phụ huynh (View)"
                            aria-label="Xem chi tiết hồ sơ phụ huynh"
                          >
                            <Eye className="w-4 h-4 text-slate-700" />
                          </button>

                          {/* 2. THAO TÁC EDIT (Chỉnh sửa - Chỉ giữ icon) */}
                          <button
                            onClick={() => handleOpenEditParent(parent)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 rounded-lg transition-all cursor-pointer hover:scale-105 shadow-2xs"
                            title="Chỉnh sửa thông tin phụ huynh (Edit)"
                            aria-label="Chỉnh sửa thông tin phụ huynh"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* 3. THAO TÁC LIÊN HỆ (Liên hệ - Chỉ giữ icon) */}
                          <button
                            onClick={() => handleOpenContactParent(parent)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105"
                            title="Liên hệ phụ huynh: Gọi điện, nhắn tin, gửi thông báo"
                            aria-label="Liên hệ phụ huynh"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL VIEW: XEM CHI TIẾT HỒ SƠ HỌC SINH (VIEW) */}
      {/* ========================================================================= */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0">
                  {viewingStudent.fullName.split(' ').pop()?.charAt(0) || 'H'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {viewingStudent.fullName}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {viewingStudent.studentCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Lớp: <strong>{viewingStudent.className || '10/1'}</strong></span>
                    <span>•</span>
                    <span>Giới tính: <strong>{viewingStudent.gender}</strong></span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <div className="text-[10px] font-semibold text-emerald-600">Chuyên cần</div>
                <div className="text-sm font-extrabold text-emerald-700 mt-0.5">98.5%</div>
                <div className="text-[10px] text-emerald-600 font-medium">0 vắng</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <div className="text-[10px] font-semibold text-blue-600">Điểm TB (GPA)</div>
                <div className="text-sm font-extrabold text-blue-700 mt-0.5">8.6</div>
                <div className="text-[10px] text-blue-600 font-medium">Học lực Giỏi</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center">
                <div className="text-[10px] font-semibold text-purple-600">Rèn luyện</div>
                <div className="text-sm font-extrabold text-purple-700 mt-0.5">Tốt</div>
                <div className="text-[10px] text-purple-600 font-medium">+15 sao nề nếp</div>
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Thông tin cá nhân & Lớp học:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Ngày sinh</span>
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {new Date(viewingStudent.dateOfBirth).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>Trạng thái học vụ</span>
                  </div>
                  <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Đang theo học chính thức</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin phụ huynh liên hệ */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                  <span>Phụ huynh liên hệ:</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {viewingStudent.guardianRelationship || 'Bố'}
                </span>
              </div>
              <div className="text-xs text-slate-800 font-bold">
                {viewingStudent.guardianName || 'Chưa cập nhật'}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-100/80">
                <div className="flex items-center gap-1 text-slate-600 font-mono font-bold">
                  <Phone className="w-3 h-3 text-blue-500" />
                  <span>{viewingStudent.guardianPhone || '0912 345 678'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${viewingStudent.guardianPhone || '0912345678'}`}
                    className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200 transition-colors"
                  >
                    Gọi ngay
                  </a>
                  <button
                    onClick={e => handleCopyPhone(e, viewingStudent.guardianPhone || '0912 345 678')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    Sao chép
                  </button>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {viewingStudent.notes && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700">Ghi chú của giáo viên:</div>
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs italic">
                  "{viewingStudent.notes}"
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const st = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEditStudent(st);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Chỉnh sửa</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    handleOpenContactFromStudent(st);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Liên hệ</span>
                </button>
                <button
                  onClick={() => {
                    setViewingStudent(null);
                    navigate(`/teacher/students/${viewingStudent.id}`);
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Hồ sơ 360°</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT: CHỈNH SỬA THÔNG TIN HỌC SINH (EDIT) */}
      {/* ========================================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Chỉnh sửa thông tin học sinh
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3.5 text-xs">
              {/* Họ tên & Mã học sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editStudentName}
                    onChange={e => setEditStudentName(e.target.value)}
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã học sinh
                  </label>
                  <input
                    type="text"
                    value={editStudentCode}
                    onChange={e => setEditStudentCode(e.target.value)}
                    placeholder="HS10001"
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Lớp & Giới tính */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp học
                  </label>
                  <select
                    value={editStudentClassId}
                    onChange={e => setEditStudentClassId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={editStudentGender}
                    onChange={e => setEditStudentGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={editStudentDob}
                  onChange={e => setEditStudentDob(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Phụ huynh liên hệ: Tên, SĐT, Quan hệ */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span>Thông tin phụ huynh liên hệ:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Họ tên phụ huynh
                    </label>
                    <input
                      type="text"
                      value={editStudentGuardianName}
                      onChange={e => setEditStudentGuardianName(e.target.value)}
                      placeholder="Nguyễn Văn Đức"
                      className="w-full text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Mối quan hệ
                    </label>
                    <select
                      value={editStudentGuardianRel}
                      onChange={e => setEditStudentGuardianRel(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Ông">Ông</option>
                      <option value="Bà">Bà</option>
                      <option value="Người giám hộ">Người giám hộ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Số điện thoại phụ huynh
                  </label>
                  <input
                    type="tel"
                    value={editStudentGuardianPhone}
                    onChange={e => setEditStudentGuardianPhone(e.target.value)}
                    placeholder="0913 888 999"
                    className="w-full text-xs font-mono font-bold px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú học sinh
                </label>
                <textarea
                  rows={2}
                  value={editStudentNotes}
                  onChange={e => setEditStudentNotes(e.target.value)}
                  placeholder="Ghi chú về sức khỏe, nề nếp, thói quen học tập..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW CHI TIẾT THÔNG TIN PHỤ HUYNH */}
      {/* ========================================================================= */}
      {viewingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0">
                  {viewingParent.fullName.split(' ').pop()?.charAt(0) || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {viewingParent.fullName}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {viewingParent.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phụ huynh học sinh: <strong>{viewingParent.studentName}</strong> (Lớp {viewingParent.className})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingParent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin liên lạc */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700">Thông tin liên lạc:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>Số điện thoại chính</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5 flex items-center justify-between">
                    <span>{viewingParent.phone}</span>
                    <a
                      href={`tel:${viewingParent.phone}`}
                      className="text-[11px] font-sans font-bold text-blue-600 hover:underline"
                    >
                      Gọi
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>Hộp thư điện tử</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1 truncate">
                    {viewingParent.email || 'parent@edusmart.edu.vn'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Địa chỉ gia đình</span>
                  </div>
                  <div className="font-medium text-slate-800 text-xs mt-0.5">
                    {viewingParent.address || 'Quận Hoàn Kiếm, Thành phố Hà Nội'}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin con em liên kết */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Thông tin học sinh con em:</div>
              <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{viewingParent.studentName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mã HS: <span className="font-mono font-semibold">{viewingParent.studentCode}</span> · Lớp {viewingParent.className}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewingParent(null);
                    navigate(`/teacher/students/${viewingParent.studentId}`);
                  }}
                  className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Xem hồ sơ 360°
                </button>
              </div>
            </div>

            {/* Ghi chú từ GVCN */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700">Ghi chú phối hợp của giáo viên:</div>
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs leading-relaxed italic">
                "{viewingParent.notes || 'Phụ huynh nhiệt tình, quan tâm việc học và nề nếp của con.'}"
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const p = viewingParent;
                  setViewingParent(null);
                  handleOpenEditParent(p);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Chỉnh sửa</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingParent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const p = viewingParent;
                    setViewingParent(null);
                    handleOpenContactParent(p);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Liên hệ ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT CHỈNH SỬA THÔNG TIN PHỤ HUYNH */}
      {/* ========================================================================= */}
      {editingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Chỉnh sửa thông tin phụ huynh
                </h3>
              </div>
              <button
                onClick={() => setEditingParent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditParent} className="space-y-3.5 text-xs">
              {/* Họ tên */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên phụ huynh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  required
                  placeholder="Ví dụ: Nguyễn Văn Đức"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* SĐT & Vai trò */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    required
                    placeholder="0913 999 888"
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mối quan hệ
                  </label>
                  <select
                    value={editRelationship}
                    onChange={e => setEditRelationship(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Ông">Ông</option>
                    <option value="Bà">Bà</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa chỉ cư trú
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="Ví dụ: Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú trao đổi / Phối hợp
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Ghi chú về thói quen liên lạc, thời gian tiện nghe máy..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingParent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LIÊN HỆ PHỤ HUYNH (CALL, SMS/ZALO, IN-APP MESSAGE) */}
      {/* ========================================================================= */}
      {contactingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Liên hệ Phụ huynh
                  </h3>
                  <p className="text-xs text-slate-500">
                    {contactingParent.fullName} ({contactingParent.relationship} em {contactingParent.studentName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactingParent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kênh liên lạc nhanh */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Kênh 1: Gọi điện thoại */}
              <a
                href={`tel:${contactingParent.phone}`}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold">Gọi điện thoại</div>
                <div className="text-[11px] font-mono font-bold text-emerald-700">{contactingParent.phone}</div>
              </a>

              {/* Kênh 2: Nhắn SMS / Zalo */}
              <a
                href={`sms:${contactingParent.phone}`}
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold">Nhắn tin SMS / Zalo</div>
                <div className="text-[11px] font-semibold text-blue-600">Gửi trực tiếp qua máy</div>
              </a>
            </div>

            {/* Kênh 3: Gửi tin nhắn qua Sổ liên lạc điện tử */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Gửi thông báo qua Sổ liên lạc điện tử:</span>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Chủ đề trao đổi:
                  </label>
                  <select
                    value={messageTopic}
                    onChange={e => setMessageTopic(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Nhắc nhở tình hình học tập và chuyên cần">Nhắc nhở tình hình học tập và chuyên cần</option>
                    <option value="Thông báo kết quả kiểm tra & điểm số">Thông báo kết quả kiểm tra & điểm số</option>
                    <option value="Nhắc hạn nộp bài tập về nhà">Nhắc hạn nộp bài tập về nhà</option>
                    <option value="Thư mời họp phụ huynh định kỳ">Thư mời họp phụ huynh định kỳ</option>
                    <option value="Khen thưởng ý thức nề nếp học tập">Khen thưởng ý thức nề nếp học tập</option>
                    <option value="Trao đổi riêng với phụ huynh">Trao đổi riêng với phụ huynh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Nội dung thông báo gửi phụ huynh:
                  </label>
                  <textarea
                    rows={3}
                    value={messageBody}
                    onChange={e => setMessageBody(e.target.value)}
                    required
                    placeholder="Nhập nội dung cần gửi cho phụ huynh..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Phụ huynh sẽ nhận thông báo tức thì trên ứng dụng.
                  </span>
                  <button
                    type="submit"
                    disabled={isSendingMessage || !messageBody.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingMessage ? 'Đang gửi...' : 'Gửi thông báo'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
