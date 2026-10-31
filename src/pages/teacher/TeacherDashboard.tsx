import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { db } from '../../services/db';
import { ClassItem } from '../../types';
import {
  Home,
  Plus,
  BookOpen,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ChevronRight,
  Maximize2,
  Copy,
  Check,
  QrCode,
  X,
  Users,
  DoorOpen,
  GraduationCap,
  Calendar,
  FileText,
  TableProperties,
  CalendarCheck,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  // Active Tab: 'my-class' | 'create-class'
  const [activeTab, setActiveTab] = useState<'my-class' | 'create-class'>('my-class');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Database reactive classes
  const [classes, setClasses] = useState<ClassItem[]>(db.getClasses());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal states: "Mở to cửa sổ" & "Chỉnh sửa lớp"
  const [expandedClass, setExpandedClass] = useState<ClassItem | null>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editStudentCount, setEditStudentCount] = useState<number>(30);
  const [editJoinCode, setEditJoinCode] = useState('');
  const [editGradeLevelId, setEditGradeLevelId] = useState('gl-10');

  // Create form state (Tab 2)
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevelId, setNewGradeLevelId] = useState('gl-10');
  const [newRoom, setNewRoom] = useState('');
  const [newExpectedStudents, setNewExpectedStudents] = useState<number>(35);
  const [newHomeroomTeacherName, setNewHomeroomTeacherName] = useState(currentUser.fullName);
  const [newJoinCode, setNewJoinCode] = useState('');
  const [newAcademicYearId, setNewAcademicYearId] = useState('ay-2024');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradeLevels = db.getGradeLevels();
  const academicYears = db.getAcademicYears();

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setClasses(db.getClasses());
    });
    return unsub;
  }, []);

  // Auto-generate join code for new class
  useEffect(() => {
    if (newClassName.trim()) {
      const cleanName = newClassName.trim().toUpperCase().replace(/[\s/]+/g, '');
      setNewJoinCode(`CLS-${cleanName}-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setNewJoinCode('');
    }
  }, [newClassName]);

  // Copy join code handler with toast
  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Đã sao chép mã tham gia lớp: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Main Workspace
  const handleOpenWorkspace = (cls: ClassItem) => {
    setSelectedClassId(cls.id);
    navigate(`/teacher/classes/${cls.id}`);
  };

  // Open Quick View Modal ("Mở to cửa sổ")
  const handleOpenModal = (cls: ClassItem) => {
    setExpandedClass(cls);
  };

  // Open Edit Modal
  const handleStartEdit = (e: React.MouseEvent, cls: ClassItem) => {
    e.stopPropagation();
    setEditingClass(cls);
    setEditName(cls.name);
    setEditRoom(cls.room);
    setEditTeacher(cls.homeroomTeacherName || currentUser.fullName);
    setEditStudentCount(cls.studentCount || 30);
    setEditJoinCode(cls.joinCode);
    setEditGradeLevelId(cls.gradeLevelId || 'gl-10');
  };

  // Save Edit Class
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editName.trim()) return;

    db.updateClass(editingClass.id, {
      name: editName.trim(),
      room: editRoom.trim() || 'Phòng học chính',
      homeroomTeacherName: editTeacher.trim() || currentUser.fullName,
      studentCount: editStudentCount,
      joinCode: editJoinCode.trim() || editingClass.joinCode,
      gradeLevelId: editGradeLevelId
    });

    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Cập nhật lớp học',
      'classes',
      editName.trim(),
      `Chỉnh sửa thông tin lớp ${editName.trim()}`
    );

    success(`Đã cập nhật thông tin lớp ${editName.trim()} thành công!`);
    setEditingClass(null);
  };

  // Delete Class with Confirm Dialog
  const handleDeleteClass = (e: React.MouseEvent, cls: ClassItem) => {
    e.stopPropagation();
    confirm({
      title: `Xóa lớp ${cls.name}?`,
      message: `Cảnh báo: Hành động này sẽ xóa lớp ${cls.name} khỏi danh sách quản lý. Dữ liệu không thể khôi phục!`,
      isDanger: true,
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy bỏ',
      onConfirm: () => {
        db.deleteClass(cls.id);
        db.logAudit(currentUser.fullName, 'Giáo viên', 'Xóa lớp học', 'classes', cls.name, `Xóa lớp ${cls.name}`);
        success(`Đã xóa lớp ${cls.name}`);
      }
    });
  };

  // Create New Class Handler (Tab 2)
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      error('Vui lòng nhập tên lớp học');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanName = newClassName.trim().toUpperCase().replace(/[\s/]+/g, '');
      const codeToUse = newJoinCode.trim() || `CLS-${cleanName}-${Math.floor(100 + Math.random() * 900)}`;

      const created = db.createClass({
        schoolId: 'sch-001',
        academicYearId: newAcademicYearId,
        gradeLevelId: newGradeLevelId,
        name: newClassName.trim(),
        room: newRoom.trim() || 'Phòng học chính',
        joinCode: codeToUse,
        homeroomTeacherId: currentUser.id,
        homeroomTeacherName: newHomeroomTeacherName.trim() || currentUser.fullName
      });

      db.logAudit(
        currentUser.fullName,
        'Giáo viên',
        'Tạo lớp học mới',
        'classes',
        created.name,
        `Tạo lớp ${created.name} (Phòng: ${created.room})`
      );

      success(`Đã thêm thành công lớp ${created.name}!`);
      setSelectedClassId(created.id);

      // Reset form
      setNewClassName('');
      setNewRoom('');
      setNewExpectedStudents(35);

      // Switch back to "Lớp của tôi" tab to view the newly created class
      setActiveTab('my-class');
    } catch (err: any) {
      error(err?.message || 'Có lỗi xảy ra khi tạo lớp');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter classes by search term and grade
  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.joinCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.homeroomTeacherName && cls.homeroomTeacherName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = selectedGrade === 'all' || cls.gradeLevelId === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  // Color dots mapping (blue, purple, green, amber/yellow, etc.)
  const getDotColor = (index: number) => {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-emerald-600',
      'bg-amber-500',
      'bg-indigo-600',
      'bg-rose-500',
      'bg-cyan-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* 1. BREADCRUMBS: 🏠 > Lớp học > Lớp của tôi */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-300">&gt;</span>
        <span className="text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setActiveTab('my-class')}>
          Lớp học
        </span>
        <span className="text-slate-300">&gt;</span>
        <span className="text-slate-800 font-semibold">Lớp của tôi</span>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE + "+ Thêm mới lớp" BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Lớp học
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toàn bộ danh sách các lớp phụ trách giảng dạy và chủ nhiệm trong năm học
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create-class')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mới lớp</span>
        </button>
      </div>

      {/* 3. TABS: [📖 Lớp của tôi 4]  [+ Thêm mới lớp] */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-6">
          {/* Tab 1: Lớp của tôi */}
          <button
            onClick={() => setActiveTab('my-class')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'my-class'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Lớp của tôi</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                activeTab === 'my-class'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {classes.length}
            </span>
          </button>

          {/* Tab 2: Thêm mới lớp */}
          <button
            onClick={() => setActiveTab('create-class')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'create-class'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới lớp</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1 CONTENT: LỚP CỦA TÔI (Matching user image) */}
      {/* ========================================================================= */}
      {activeTab === 'my-class' && (
        <div className="space-y-4">
          {/* 4. TOOLBAR: Search Input + Grade Dropdown ("Tất cả 12 khối lớp") + View Toggles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên lớp, phòng, mã tham gia..."
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-transparent border-0 outline-none focus:ring-0"
              />
            </div>

            {/* Right: Grade Filter + View Mode Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              {/* Grade Selector */}
              <div className="relative">
                <select
                  value={selectedGrade}
                  onChange={e => setSelectedGrade(e.target.value)}
                  className="appearance-none text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="all">Tất cả 12 khối lớp</option>
                  {gradeLevels.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Mode Buttons (Grid vs List) */}
              <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Chế độ xem lưới"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Chế độ xem danh sách"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. CLASS CARDS (Grid Mode - Exactly as in the screenshot) */}
          {filteredClasses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Không tìm thấy lớp học nào</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Không có lớp học nào khớp với từ khóa tìm kiếm hoặc bộ lọc khối lớp đã chọn.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGrade('all');
                }}
                className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClasses.map((cls, index) => {
                const dotColor = getDotColor(index);
                return (
                  <div
                    key={cls.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Colored Dot + Class Name + Join Code Badge + Action Icons (Edit, Delete) */}
                      <div className="flex items-center justify-between gap-2 pb-2.5">
                        {/* Left: Dot + Class Name + Join Code */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Dot */}
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}></span>

                          {/* Class Name */}
                          <span className="text-base font-extrabold text-slate-900 tracking-tight">
                            Lớp {cls.name}
                          </span>

                          {/* Join Code Badge with QR/code icon & Copy icon */}
                          <button
                            onClick={e => handleCopyCode(e, cls.joinCode)}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer"
                            title="Nhấp để sao chép mã lớp"
                          >
                            <QrCode className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{cls.joinCode}</span>
                            {copiedCode === cls.joinCode ? (
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                          </button>
                        </div>

                        {/* Right: Edit & Trash Icons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => handleStartEdit(e, cls)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa lớp học"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDeleteClass(e, cls)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa lớp học"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Row: Phòng: A.302 · Sĩ số: 32 HS · GVCN: Cô Nguyễn Thị Mai */}
                      <div className="text-xs text-slate-500 py-2 border-t border-slate-100 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>
                          Phòng: <strong className="text-slate-800 font-semibold">{cls.room}</strong>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>
                          Sĩ số: <strong className="text-slate-800 font-semibold">{cls.studentCount || 30} HS</strong>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>
                          GVCN: <strong className="text-slate-800 font-semibold">{cls.homeroomTeacherName || currentUser.fullName}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Vào không gian làm việc chính >  |  ↗️ Mở to cửa sổ */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-2">
                      {/* Left: Vào không gian làm việc chính > */}
                      <button
                        onClick={() => handleOpenWorkspace(cls)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Vào không gian làm việc chính</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Right: Mở to cửa sổ */}
                      <button
                        onClick={() => handleOpenModal(cls)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3 text-blue-600" />
                        <span>Mở to cửa sổ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table / List View */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Lớp học</th>
                    <th className="px-4 py-3">Mã tham gia</th>
                    <th className="px-4 py-3">Phòng học</th>
                    <th className="px-4 py-3">Sĩ số</th>
                    <th className="px-4 py-3">Giáo viên chủ nhiệm</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClasses.map((cls, index) => {
                    const dotColor = getDotColor(index);
                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                          <span>Lớp {cls.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-600">
                          <button
                            onClick={e => handleCopyCode(e, cls.joinCode)}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[11px]"
                          >
                            <span>{cls.joinCode}</span>
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">{cls.room}</td>
                        <td className="px-4 py-3 text-slate-700 font-bold">{cls.studentCount || 30} HS</td>
                        <td className="px-4 py-3 text-slate-700">{cls.homeroomTeacherName || currentUser.fullName}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenWorkspace(cls)}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                            >
                              <span>Vào lớp</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(cls)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              title="Mở to cửa sổ"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={e => handleStartEdit(e, cls)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={e => handleDeleteClass(e, cls)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 CONTENT: THÊM MỚI LỚP (Form & Live Preview) */}
      {/* ========================================================================= */}
      {activeTab === 'create-class' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form Create */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Thêm mới lớp học
                </h2>
                <p className="text-xs text-slate-500">
                  Nhập thông tin cơ bản để khởi tạo lớp học cho niên khóa 2024 - 2025
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên lớp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên lớp học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    placeholder="Ví dụ: 10/1, 10A2, 11B1..."
                    required
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tên định danh ngắn gọn của lớp
                  </span>
                </div>

                {/* Khối lớp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khối lớp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newGradeLevelId}
                    onChange={e => setNewGradeLevelId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    {gradeLevels.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Phân loại chương trình đào tạo
                  </span>
                </div>

                {/* Phòng học */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phòng học
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    placeholder="Ví dụ: A.302, B.201..."
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Vị trí phòng học trực tiếp trên trường
                  </span>
                </div>

                {/* Sĩ số dự kiến */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sĩ số dự kiến (Học sinh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newExpectedStudents}
                    onChange={e => setNewExpectedStudents(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sĩ số tiêu chuẩn: 30 - 45 học sinh
                  </span>
                </div>

                {/* GVCN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giáo viên chủ nhiệm (GVCN)
                  </label>
                  <input
                    type="text"
                    value={newHomeroomTeacherName}
                    onChange={e => setNewHomeroomTeacherName(e.target.value)}
                    placeholder="Họ và tên giáo viên"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Mặc định là tài khoản giáo viên đang đăng nhập
                  </span>
                </div>

                {/* Mã tham gia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã tham gia lớp (Join Code)
                  </label>
                  <input
                    type="text"
                    value={newJoinCode}
                    onChange={e => setNewJoinCode(e.target.value)}
                    placeholder="CLS-10A1-982"
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Mã tự động sinh dùng cho học sinh & phụ huynh
                  </span>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-class')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newClassName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo lớp học ngay'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs font-bold text-slate-700 pb-2 mb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Xem trước thẻ lớp học</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                  Thời gian thực
                </span>
              </div>

              {/* Exact replica of the card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
                      Lớp {newClassName.trim() || 'Mới'}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium">
                      <QrCode className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{newJoinCode || 'CLS-NEW-000'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs text-slate-500 py-2 border-t border-slate-100 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Phòng: <strong className="text-slate-800 font-semibold">{newRoom.trim() || 'A.101'}</strong></span>
                  <span className="text-slate-300">·</span>
                  <span>Sĩ số: <strong className="text-slate-800 font-semibold">{newExpectedStudents} HS</strong></span>
                  <span className="text-slate-300">·</span>
                  <span>GVCN: <strong className="text-slate-800 font-semibold">{newHomeroomTeacherName || currentUser.fullName}</strong></span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    Vào không gian làm việc chính <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl">
                    <Maximize2 className="w-3 h-3 text-blue-600" />
                    Mở to cửa sổ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: "MỞ TO CỬA SỔ" (Quick View Workspace Modal) */}
      {/* ========================================================================= */}
      {expandedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0">
                  {expandedClass.name}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Lớp {expandedClass.name}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đang hoạt động
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>Phòng: <strong>{expandedClass.room}</strong></span>
                    <span>·</span>
                    <span>GVCN: <strong>{expandedClass.homeroomTeacherName || currentUser.fullName}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setExpandedClass(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500">Sĩ số lớp</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {expandedClass.studentCount || 30} <span className="text-xs font-normal text-slate-400">HS</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500">Mã tham gia</div>
                <div className="text-sm font-mono font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                  <span>{expandedClass.joinCode}</span>
                  <button
                    onClick={e => handleCopyCode(e, expandedClass.joinCode)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500">Năm học</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  2024 - 2025
                </div>
              </div>
            </div>

            {/* Quick Access Actions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Truy cập nhanh chức năng:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setSelectedClassId(expandedClass.id);
                    navigate('/teacher/attendance');
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Điểm danh</div>
                  <div className="text-[10px] text-slate-400">Chuyên cần hôm nay</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedClassId(expandedClass.id);
                    navigate('/teacher/schedule');
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Thời khóa biểu</div>
                  <div className="text-[10px] text-slate-400">Lịch học các tiết</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedClassId(expandedClass.id);
                    navigate('/teacher/grades');
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                >
                  <TableProperties className="w-4 h-4 text-sky-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Sổ điểm</div>
                  <div className="text-[10px] text-slate-400">Nhập điểm & thống kê</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedClassId(expandedClass.id);
                    navigate('/teacher/students');
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Học sinh</div>
                  <div className="text-[10px] text-slate-400">Hồ sơ 360° học sinh</div>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setExpandedClass(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
              <button
                onClick={() => {
                  setExpandedClass(null);
                  handleOpenWorkspace(expandedClass);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Vào không gian làm việc chính</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: "CHỈNH SỬA LỚP HỌC" */}
      {/* ========================================================================= */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Chỉnh sửa lớp {editingClass.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingClass(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phòng học
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={e => setEditRoom(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sĩ số học sinh
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editStudentCount}
                    onChange={e => setEditStudentCount(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giáo viên chủ nhiệm (GVCN)
                </label>
                <input
                  type="text"
                  value={editTeacher}
                  onChange={e => setEditTeacher(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã tham gia lớp (Join Code)
                </label>
                <input
                  type="text"
                  value={editJoinCode}
                  onChange={e => setEditJoinCode(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
