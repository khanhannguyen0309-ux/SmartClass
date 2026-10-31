import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, BookOpen, FileText, Bell, X } from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { currentRole, setSelectedClassId } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const allStudents = db.getStudents();
  const allClasses = db.getClasses();
  const allAssignments = db.getAssignments();
  const allAnnouncements = db.getAnnouncements(currentRole);

  const matchedStudents = q ? allStudents.filter(s => s.fullName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q)).slice(0, 5) : [];
  const matchedClasses = q ? allClasses.filter(c => c.name.toLowerCase().includes(q) || c.room?.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedAssignments = q ? allAssignments.filter(a => a.title.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedAnnouncements = q ? allAnnouncements.filter(a => a.title.toLowerCase().includes(q)).slice(0, 4) : [];

  const handleSelect = (type: string, id: string, extraId?: string) => {
    onClose();
    if (type === 'class') {
      setSelectedClassId(id);
      navigate(currentRole === 'admin' ? '/admin/classes' : `/teacher/classes/${id}`);
    } else if (type === 'student') {
      if (extraId) setSelectedClassId(extraId);
      navigate(currentRole === 'teacher' ? `/teacher/students/${id}` : currentRole === 'guardian' ? `/parent/profile` : `/student/dashboard`);
    } else if (type === 'assignment') {
      navigate(currentRole === 'teacher' ? `/teacher/assignments/${id}` : `/student/assignments`);
    } else if (type === 'announcement') {
      navigate(currentRole === 'teacher' ? `/teacher/announcements` : currentRole === 'student' ? `/student/announcements` : `/parent/announcements`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh, lớp học, bài tập, thông báo... (Ctrl + K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full px-3 py-1 text-slate-900 text-sm focus:outline-none placeholder-slate-400"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!q && (
            <div className="text-center py-8 text-xs text-slate-400">
              Nhập từ khóa để tra cứu toàn hệ thống theo quyền hạn của bạn.
            </div>
          )}

          {q && matchedClasses.length === 0 && matchedStudents.length === 0 && matchedAssignments.length === 0 && matchedAnnouncements.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              Không tìm thấy kết quả phù hợp cho "{query}"
            </div>
          )}

          {matchedClasses.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Lớp học
              </div>
              <div className="space-y-1">
                {matchedClasses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect('class', c.id)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium text-slate-800">Lớp {c.name}</span>
                    <span className="text-xs text-slate-500">{c.room} · {c.studentCount} HS</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedStudents.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Học sinh
              </div>
              <div className="space-y-1">
                {matchedStudents.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect('student', s.id, s.classId)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-medium text-slate-800">{s.fullName}</span>
                      <span className="ml-2 text-xs text-slate-400">{s.studentCode}</span>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Lớp {s.className || '9A1'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedAssignments.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Bài tập
              </div>
              <div className="space-y-1">
                {matchedAssignments.map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('assignment', a.id)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-sm">{a.title}</span>
                    <span className="text-xs text-slate-500">{a.subjectName} · Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedAnnouncements.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Thông báo
              </div>
              <div className="space-y-1">
                {matchedAnnouncements.map(an => (
                  <button
                    key={an.id}
                    onClick={() => handleSelect('announcement', an.id)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-md">{an.title}</span>
                    <span className="text-xs text-slate-400">{new Date(an.createdAt).toLocaleDateString('vi-VN')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
