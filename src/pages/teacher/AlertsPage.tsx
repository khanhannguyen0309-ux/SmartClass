import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { SmartAlert, AlertStatus, PriorityLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Search,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { success, error } = useToast();

  const classes = db.getClasses();
  const students = db.getStudents(selectedClassId);
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const [alerts, setAlerts] = useState<SmartAlert[]>(db.getAlerts(selectedClassId));
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [alertType, setAlertType] = useState<'low_grades' | 'absenteeism' | 'behavior'>('low_grades');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');

  // Resolve Modal
  const [resolveTarget, setResolveTarget] = useState<SmartAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    setAlerts(db.getAlerts(selectedClassId));
    if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [selectedClassId, students]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAlerts(db.getAlerts(selectedClassId));
    });
    return unsub;
  }, [selectedClassId]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      error('Vui lòng nhập đầy đủ tiêu đề và nội dung cảnh báo');
      return;
    }
    const student = students.find(s => s.id === studentId) || students[0];
    const created = db.createAlert({
      classId: selectedClassId,
      className: currentClass.name,
      studentId,
      studentName: student.fullName,
      type: alertType,
      title: title.trim(),
      description: description.trim(),
      status: 'new',
      priority
    });
    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Tạo cảnh báo học sinh',
      'alerts',
      student.fullName,
      `Tạo cảnh báo: ${created.title}`
    );
    success(`Đã tạo cảnh báo cho học sinh ${student.fullName}`);
    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleUpdateStatus = (alertId: string, status: AlertStatus) => {
    db.updateAlertStatus(alertId, status);
    success('Đã cập nhật tiến độ xử lý cảnh báo');
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;
    db.updateAlertStatus(resolveTarget.id, 'resolved', resolutionNotes.trim() || 'Đã giải quyết ổn thỏa');
    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Đã giải quyết cảnh báo',
      'alerts',
      resolveTarget.studentName,
      `Ghi chú: ${resolutionNotes}`
    );
    success(`Đã đánh dấu cảnh báo của ${resolveTarget.studentName} là ĐÃ GIẢI QUYẾT`);
    setResolveTarget(null);
    setResolutionNotes('');
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cảnh báo thông minh & Xử lý học vụ
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quy trình theo dõi 4 bước: Mới → Đã xem → Đang xử lý → Đã giải quyết
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo cảnh báo mới</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Trạng thái:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="viewed">Đã xem</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
          </select>

          <span className="font-semibold text-slate-500 ml-2">Độ ưu tiên:</span>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold tabular-nums">
          {filteredAlerts.length} cảnh báo
        </div>
      </div>

      {/* Alerts list */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Lớp học không có cảnh báo nào cần xử lý</h3>
          <p className="text-xs text-slate-400 mt-1">Học sinh lớp {currentClass?.name} đang duy trì nề nếp và học lực ổn định.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alt => (
            <div
              key={alt.id}
              className={`p-5 rounded-2xl border transition-all ${
                alt.status === 'resolved'
                  ? 'bg-white border-slate-200 opacity-80'
                  : alt.priority === 'urgent' || alt.priority === 'high'
                  ? 'bg-rose-50/30 border-rose-200 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{alt.studentName}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Lớp {alt.className}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      alt.priority === 'urgent' ? 'bg-rose-600 text-white' :
                      alt.priority === 'high' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {alt.priority === 'urgent' ? 'Khẩn cấp' : alt.priority === 'high' ? 'Ưu tiên cao' : 'Bình thường'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 mt-1">{alt.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alt.description}</p>

                  {alt.resolutionNotes && (
                    <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <strong>Kết quả xử lý:</strong> {alt.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Workflow Status Controls */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start md:self-auto">
                  <button
                    onClick={() => handleUpdateStatus(alt.id, 'viewed')}
                    disabled={alt.status !== 'new'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      alt.status === 'viewed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
                    }`}
                  >
                    Đã xem
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(alt.id, 'in_progress')}
                    disabled={alt.status === 'resolved'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      alt.status === 'in_progress' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
                    }`}
                  >
                    Đang xử lý
                  </button>

                  <button
                    onClick={() => { setResolveTarget(alt); setResolutionNotes(''); }}
                    disabled={alt.status === 'resolved'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      alt.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {alt.status === 'resolved' ? '✓ Đã giải quyết' : 'Đóng vụ việc'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ALERT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Tạo cảnh báo học sinh</h3>
            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn học sinh *</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.rollNumber} - {s.fullName} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại cảnh báo *</label>
                <select
                  value={alertType}
                  onChange={e => setAlertType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low_grades">Học lực / Điểm số sụt giảm</option>
                  <option value="absenteeism">Chuyên cần / Vắng mặt nhiều</option>
                  <option value="behavior">Kỷ luật / Hành vi rèn luyện</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên *</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="medium">Trung bình</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề cảnh báo *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chưa nộp bài tập 3 tuần liên tiếp"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả cụ thể tình trạng và đề xuất hướng xử lý..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Tạo cảnh báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Đóng cảnh báo học sinh</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ghi lại kết quả xử lý đối với trường hợp của học sinh <strong>{resolveTarget.studentName}</strong>.
            </p>
            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú kết quả xử lý *</label>
                <textarea
                  rows={4}
                  placeholder="Ví dụ: Đã liên hệ phụ huynh, gia đình cam kết nhắc nhở em bổ sung bài tập đầy đủ..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Xác nhận giải quyết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
