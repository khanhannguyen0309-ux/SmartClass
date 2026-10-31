import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Assignment, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Check,
  X
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const classes = db.getClasses();
  const subjects = db.getSubjects();

  const [assignments, setAssignments] = useState<Assignment[]>(db.getAssignments(selectedClassId));
  const [searchTerm, setSearchTerm] = useState('');

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'sub-toan');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [maxScore, setMaxScore] = useState(10);

  // Grading Modal / Drawer
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  useEffect(() => {
    setAssignments(db.getAssignments(selectedClassId));
  }, [selectedClassId]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAssignments(db.getAssignments(selectedClassId));
      if (selectedAsg) {
        setSubmissions(db.getSubmissions(selectedAsg.id));
      }
    });
    return unsub;
  }, [selectedClassId, selectedAsg]);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Vui lòng nhập tiêu đề bài tập');
      return;
    }

    const subObj = subjects.find(s => s.id === subjectId) || subjects[0];
    const newAsg = db.createAssignment({
      classId: selectedClassId,
      className: currentClass.name,
      subjectId,
      subjectName: subObj.name,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      maxScore: Number(maxScore),
      status: 'published',
      totalStudents: currentClass.studentCount || 30
    });

    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Giao bài tập mới',
      'assignments',
      newAsg.title,
      `Giao cho lớp ${currentClass.name}`
    );

    success(`Đã giao bài tập "${newAsg.title}" cho lớp ${currentClass.name}`);
    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDelete = (asg: Assignment) => {
    confirm({
      title: `Xóa bài tập "${asg.title}"?`,
      message: 'Toàn bộ bài nộp và điểm chấm của học sinh sẽ bị xóa khỏi hệ thống.',
      isDanger: true,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        db.deleteAssignment(asg.id);
        db.logAudit(
          currentUser.fullName,
          'Giáo viên',
          'Xóa bài tập',
          'assignments',
          asg.title,
          `Xóa khỏi lớp ${currentClass.name}`
        );
        success(`Đã xóa bài tập "${asg.title}"`);
        if (selectedAsg?.id === asg.id) setSelectedAsg(null);
      }
    });
  };

  const openGrading = (asg: Assignment) => {
    setSelectedAsg(asg);
    const subs = db.getSubmissions(asg.id);
    setSubmissions(subs);
    if (subs.length > 0) {
      setActiveSubmission(subs[0]);
      setGradeScore(subs[0].score || 10);
      setGradeFeedback(subs[0].feedback || 'Làm bài tốt!');
    } else {
      setActiveSubmission(null);
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    db.gradeSubmission(activeSubmission.id, Number(gradeScore), gradeFeedback.trim(), currentUser.id);
    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Chấm điểm bài tập',
      'submissions',
      activeSubmission.studentName,
      `Chấm ${gradeScore} điểm bài tập ${selectedAsg?.title}`
    );
    success(`Đã lưu điểm ${gradeScore} cho học sinh ${activeSubmission.studentName}`);
    // Refresh submissions
    if (selectedAsg) {
      setSubmissions(db.getSubmissions(selectedAsg.id));
    }
  };

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý bài tập & Chấm điểm
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Giao bài tập cho học sinh, theo dõi tiến độ nộp bài và nhận xét trực tiếp
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <span>Tạo bài tập mới</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên bài tập, môn học..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold tabular-nums">
          {filteredAssignments.length} bài tập
        </div>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có bài tập nào cho lớp này</h3>
          <p className="text-xs text-slate-400 mt-1">Bấm nút "Tạo bài tập mới" để giao bài tập cho học sinh.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map(asg => {
            const subCount = asg.submissionCount || 0;
            const totalCount = asg.totalStudents || 30;
            const percentage = Math.round((subCount / totalCount) * 100);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {asg.subjectName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>

                  {/* Submission Rate Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Tiến độ nộp bài</span>
                      <span className="text-blue-600 tabular-nums">
                        {subCount}/{totalCount} HS ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDelete(asg)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Xóa bài tập"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openGrading(asg)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Chấm bài ({subCount})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Giao bài tập mới cho lớp {currentClass?.name}</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Môn học *</label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề bài tập *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bài tập tuần 7: Phương trình bậc nhất hai ẩn"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung / Yêu cầu chi tiết</label>
                <textarea
                  rows={4}
                  placeholder="Hướng dẫn học sinh làm bài tập, yêu cầu chụp ảnh hoặc nộp file PDF..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hạn chót nộp bài *</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thang điểm tối đa</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={e => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Giao bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADING DRAWER / MODAL */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedAsg.title}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Lớp {selectedAsg.className} · {submissions.length} bài đã nộp · Hạn: {new Date(selectedAsg.dueDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <button onClick={() => setSelectedAsg(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split layout: Submissions list (left) & Grading form (right) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left: Submissions list */}
              <div className="w-full md:w-80 border-r border-slate-100 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Danh sách bài nộp ({submissions.length})
                </div>

                {submissions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Chưa có học sinh nào nộp bài tập này.
                  </div>
                ) : (
                  submissions.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setActiveSubmission(sub);
                        setGradeScore(sub.score || 10);
                        setGradeFeedback(sub.feedback || '');
                      }}
                      className={`p-3 rounded-xl cursor-pointer text-xs transition-all border ${
                        activeSubmission?.id === sub.id
                          ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs font-semibold'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{sub.studentName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status === 'graded' ? `${sub.score}đ` : 'Chờ chấm'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right: Grading Form & Submission Preview */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5">
                {activeSubmission ? (
                  <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">Bài làm của {activeSubmission.studentName}</span>
                        <span className="font-mono text-slate-400">{activeSubmission.studentCode}</span>
                      </div>
                      <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                        {activeSubmission.content || '(Học sinh không để lại lời nhắn)'}
                      </p>
                      {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
                        <div className="mt-3 text-[11px] text-blue-600 font-semibold">
                          File đính kèm: {activeSubmission.attachments.map(a => a.name).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Điểm số (Thang 10) *</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={gradeScore}
                          onChange={e => setGradeScore(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700">
                          {activeSubmission.status === 'graded' ? 'Đã chấm điểm' : 'Chưa chấm'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nhận xét của giáo viên</label>
                      <textarea
                        rows={3}
                        value={gradeFeedback}
                        onChange={e => setGradeFeedback(e.target.value)}
                        placeholder="Ghi nhận xét bài làm, động viên hoặc lưu ý lỗi sai..."
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Lưu điểm & Nhận xét
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Chọn một bài nộp ở cột bên trái để chấm điểm
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
