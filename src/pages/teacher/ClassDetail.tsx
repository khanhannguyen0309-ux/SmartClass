import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { ClassItem, Student } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  Building,
  Users,
  CalendarCheck,
  FileText,
  TableProperties,
  Calendar,
  BarChart3,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  ExternalLink,
  Search,
  Trash2,
  Edit
} from 'lucide-react';

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setSelectedClassId, currentUser } = useAuth();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'schedule' | 'reports'>('overview');
  const [cls, setCls] = useState<ClassItem | undefined>(db.getClassById(id || 'cls-9a1'));
  const [students, setStudents] = useState<Student[]>(db.getStudents(id || 'cls-9a1'));
  const [schedules, setSchedules] = useState(db.getSchedules(id || 'cls-9a1'));
  const [copied, setCopied] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Quick add student modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStudentDob, setNewStudentDob] = useState('2010-01-01');

  useEffect(() => {
    if (id) {
      setSelectedClassId(id);
      setCls(db.getClassById(id));
      setStudents(db.getStudents(id));
      setSchedules(db.getSchedules(id));
    }
  }, [id, setSelectedClassId]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      if (id) {
        setCls(db.getClassById(id));
        setStudents(db.getStudents(id));
        setSchedules(db.getSchedules(id));
      }
    });
    return unsub;
  }, [id]);

  if (!cls) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy lớp học</h3>
        <button
          onClick={() => navigate('/teacher/classes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cls.joinCode);
    setCopied(true);
    success(`Đã sao chép mã tham gia: ${cls.joinCode}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      error('Vui lòng nhập họ tên học sinh');
      return;
    }
    const created = db.createStudent({
      studentCode: `HS-${cls.name}-${String(students.length + 1).padStart(2, '0')}`,
      fullName: newStudentName.trim(),
      dateOfBirth: newStudentDob,
      gender: newStudentGender,
      status: 'enrolled',
      classId: cls.id,
      className: cls.name
    });
    db.logAudit(currentUser.fullName, 'Giáo viên', 'Thêm học sinh vào lớp', 'students', created.fullName, `Thêm vào lớp ${cls.name}`);
    success(`Đã thêm học sinh ${created.fullName} vào lớp ${cls.name}`);
    setAddModalOpen(false);
    setNewStudentName('');
  };

  const handleDeleteStudent = (st: Student) => {
    confirm({
      title: `Xóa học sinh ${st.fullName}?`,
      message: `Học sinh sẽ bị xóa khỏi lớp ${cls.name}. Điểm số và thông tin liên quan sẽ không còn hiển thị.`,
      isDanger: true,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        db.deleteStudent(st.id);
        db.logAudit(currentUser.fullName, 'Giáo viên', 'Xóa học sinh', 'students', st.fullName, `Xóa khỏi lớp ${cls.name}`);
        success(`Đã xóa học sinh ${st.fullName}`);
      }
    });
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Lớp của tôi</span>
        </button>
      </div>

      {/* Class Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              {cls.name}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                  Lớp {cls.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {cls.status === 'active' ? 'Đang hoạt động' : 'Lưu trữ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {cls.room} · GVCN: <strong className="text-slate-700">{cls.homeroomTeacherName || 'Thầy Nguyễn Văn Hùng'}</strong>
              </p>
            </div>
          </div>

          {/* Join Code + Quick Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-400 font-medium">Mã lớp:</span>
              <span className="font-mono font-bold text-slate-800">{cls.joinCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:text-blue-600 text-slate-400"
                title="Sao chép"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => navigate('/teacher/attendance')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Điểm danh lớp
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng quan lớp
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'students' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh sách học sinh ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thời khóa biểu
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Báo cáo học tập
          </button>

          {/* Quick links to separate screens */}
          <button
            onClick={() => navigate('/teacher/grades')}
            className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors ml-auto hidden sm:flex items-center gap-1"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Mở sổ điểm</span>
          </button>
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors hidden sm:flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mở bài tập</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Tổng số học sinh</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{students.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Nam: {students.filter(s => s.gender === 'Nam').length} · Nữ: {students.filter(s => s.gender === 'Nữ').length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Điểm trung bình lớp</span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">8.2</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Xếp loại: Khá - Giỏi</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Tỷ lệ chuyên cần</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">98.5%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Duy trì mức xuất sắc</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Bài tập hoàn thành</span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1 tabular-nums">92%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">26/30 học sinh nộp đúng hạn</div>
            </div>
          </div>

          {/* Quick students preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Ban cán sự & Học sinh tiêu biểu</h3>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Xem tất cả ({students.length}) →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {students.slice(0, 6).map(s => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/teacher/students/${s.id}`)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {s.rollNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{s.fullName}</div>
                      <div className="text-[11px] text-slate-400">{s.studentCode} · {s.gender}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Hồ sơ →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh theo tên, mã..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/teacher/students/import')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Nhập từ Excel/CSV
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm học sinh</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3 pl-4">STT</th>
                  <th className="p-3">Mã HS</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Ngày sinh</th>
                  <th className="p-3">Giới tính</th>
                  <th className="p-3">Phụ huynh</th>
                  <th className="p-3 text-right pr-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 pl-4 font-mono text-slate-400 tabular-nums">{st.rollNumber}</td>
                    <td className="p-3 font-mono font-semibold text-slate-700">{st.studentCode}</td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/teacher/students/${st.id}`)}
                        className="font-bold text-blue-600 hover:underline text-left"
                      >
                        {st.fullName}
                      </button>
                    </td>
                    <td className="p-3 text-slate-600">{new Date(st.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        st.gender === 'Nam' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {st.gender}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{st.guardianName || 'Chưa cập nhật'}</div>
                      <div className="text-[10px] text-slate-400">{st.guardianPhone}</div>
                    </td>
                    <td className="p-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/teacher/students/${st.id}`)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px]"
                        >
                          Hồ sơ 360°
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thời khóa biểu tuần của lớp {cls.name}</h3>
              <span className="text-xs text-slate-400">Áp dụng từ học kỳ 1 · Nhấp để điều chỉnh</span>
            </div>
            <button
              onClick={() => { setSelectedClassId(cls.id); navigate('/teacher/schedule'); }}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Sửa & Quản lý TKB đầy đủ →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {[2, 3, 4, 5, 6].map(day => {
              const daySchedules = schedules.filter(s => s.dayOfWeek === day).sort((a, b) => a.period - b.period);
              return (
                <div key={day} className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/80">
                  <div className="font-bold text-xs text-slate-800 pb-2 mb-2 border-b border-slate-200">
                    Thứ {day}
                  </div>
                  {daySchedules.length === 0 ? (
                    <button
                      onClick={() => { setSelectedClassId(cls.id); navigate('/teacher/schedule'); }}
                      className="text-[11px] text-slate-400 hover:text-blue-600 py-4 text-center w-full block hover:bg-white rounded-lg transition-colors"
                    >
                      + Phân công môn
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {daySchedules.map(sch => (
                        <div
                          key={sch.id}
                          onClick={() => { setSelectedClassId(cls.id); navigate('/teacher/schedule'); }}
                          className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{sch.subjectName}</span>
                            <span className="text-[10px] font-semibold text-blue-600">Tiết {sch.period}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {sch.startTime} - {sch.endTime}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                            <span>GV: {sch.teacherName}</span>
                            <span>P.{sch.room}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Báo cáo & Thống kê toàn diện lớp {cls.name}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống cung cấp báo cáo chi tiết về phổ điểm học tập, tỷ lệ chuyên cần theo tháng và phân tích thi đua của từng học sinh.
          </p>
          <button
            onClick={() => navigate('/teacher/reports')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
          >
            Chuyển đến Trung tâm Báo cáo →
          </button>
        </div>
      )}

      {/* QUICK ADD STUDENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Thêm học sinh vào lớp {cls.name}</h3>
            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Gia Huy"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính *</label>
                  <select
                    value={newStudentGender}
                    onChange={e => setNewStudentGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày sinh *</label>
                  <input
                    type="date"
                    value={newStudentDob}
                    onChange={e => setNewStudentDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
