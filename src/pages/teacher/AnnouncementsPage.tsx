import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Announcement, PriorityLevel, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  Plus,
  Send,
  Eye,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { currentRole, currentUser, selectedClassId } = useAuth();
  const { success, error } = useToast();

  const classes = db.getClasses();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const [announcements, setAnnouncements] = useState<Announcement[]>(db.getAnnouncements());
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<string>('all');
  const [targetClassId, setTargetClassId] = useState<string>(selectedClassId || 'all');
  const [priority, setPriority] = useState<PriorityLevel>('medium');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAnnouncements(db.getAnnouncements());
    });
    return unsub;
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');
      return;
    }

    const targetCls = targetClassId !== 'all' ? classes.find(c => c.id === targetClassId) : undefined;

    const created = db.createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      targetRole: targetRole === 'all' ? undefined : (targetRole as UserRole),
      targetClassId: targetClassId === 'all' ? undefined : targetClassId,
      targetClassName: targetCls?.name,
      priority
    });

    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Đăng thông báo mới',
      'announcements',
      created.title,
      `Gửi tới: ${targetRole} - Lớp: ${targetCls?.name || 'Toàn trường'}`
    );

    success('Đã gửi thông báo thành công tới các thành viên!');
    setCreateModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Thông báo & Tin nhắn hệ thống
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Gửi thông tin kịp thời tới học sinh, phụ huynh và giáo viên toàn trường
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map(anc => (
          <div key={anc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  anc.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                  anc.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  {anc.priority === 'urgent' ? 'Khẩn cấp' : anc.priority === 'high' ? 'Quan trọng' : 'Thông thường'}
                </span>

                {anc.targetClassName ? (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Dành riêng cho Lớp {anc.targetClassName}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Toàn trường
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(anc.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {anc.viewsCount} lượt xem
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{anc.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{anc.content}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div>
                Người gửi: <strong className="text-slate-700">{anc.senderName}</strong>
              </div>
              <span className="text-emerald-600 font-medium">✓ Đã chuyển phát</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Gửi thông báo mới</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kế hoạch kiểm tra định kỳ học kỳ 1"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đối tượng nhận</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Tất cả mọi người</option>
                    <option value="student">Chỉ học sinh</option>
                    <option value="guardian">Chỉ phụ huynh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phạm vi lớp</label>
                  <select
                    value={targetClassId}
                    onChange={e => setTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Toàn trường</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="medium">Thông thường</option>
                  <option value="high">Quan trọng</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={5}
                  placeholder="Nhập nội dung đầy đủ của thông báo..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Phát hành thông báo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
