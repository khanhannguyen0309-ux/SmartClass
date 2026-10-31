import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Assignment, Submission } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const { selectedStudentId, currentUser } = useAuth();
  const { success, error } = useToast();

  const student = db.getStudentById(selectedStudentId || 'stu-9a1-01') || db.getStudents()[0];
  const assignments = db.getAssignments(student?.classId || 'cls-9a1');
  const [submissions, setSubmissions] = useState(db.getStudentSubmissions(student?.id || 'stu-9a1-01'));

  // Active submission modal
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;

    db.submitAssignment({
      assignmentId: selectedAsg.id,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      content: submissionText.trim() || 'Học sinh đã hoàn thành bài tập theo yêu cầu.',
      attachments: attachmentName ? [{ name: attachmentName, url: '#' }] : undefined
    });

    db.logAudit(
      student.fullName,
      'Học sinh',
      'Nộp bài tập',
      'submissions',
      selectedAsg.title,
      `Học sinh ${student.fullName} nộp bài tập`
    );

    setSubmissions(db.getStudentSubmissions(student.id));
    success(`Đã nộp bài tập "${selectedAsg.title}" thành công!`);
    setSelectedAsg(null);
    setSubmissionText('');
    setAttachmentName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Bài tập & Nhiệm vụ học tập
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Theo dõi hạn nộp bài, tải bài tập và nộp bài trực tuyến
        </p>
      </div>

      {/* Assignments list */}
      <div className="space-y-4">
        {assignments.map(asg => {
          const sub = submissions.find(s => s.assignmentId === asg.id);
          const isOverdue = new Date(asg.dueDate).getTime() < Date.now();

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {asg.subjectName}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN')}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                  sub?.status === 'graded' ? 'bg-emerald-100 text-emerald-800' :
                  sub ? 'bg-blue-100 text-blue-800' :
                  isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sub?.status === 'graded' ? `Đã chấm: ${sub.score} / ${asg.maxScore}đ` :
                   sub ? 'Đã nộp (Chờ giáo viên chấm)' :
                   isOverdue ? 'Quá hạn nộp' : 'Chưa nộp'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{asg.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{asg.description}</p>
              </div>

              {/* Teacher Feedback if Graded */}
              {sub && sub.feedback && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Nhận xét của giáo viên ({sub.gradedBy ? 'Thầy Hùng' : 'Giáo viên'}):</span>
                  </div>
                  <p className="text-slate-700 text-[11px] italic leading-relaxed">"{sub.feedback}"</p>
                </div>
              )}

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Thang điểm: {asg.maxScore} điểm
                </span>

                <button
                  onClick={() => setSelectedAsg(asg)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    sub
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {sub ? 'Nộp lại bài tập' : 'Nộp bài ngay'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMISSION MODAL */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Nộp bài tập</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedAsg.title}</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lời nhắn / Bài giải văn bản</label>
                <textarea
                  rows={4}
                  placeholder="Nhập lời giải hoặc ghi chú cho thầy cô..."
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên file đính kèm (Ảnh bài làm / PDF)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bai_lam_Khoi_Tuan6.pdf"
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAsg(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xác nhận nộp bài</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
