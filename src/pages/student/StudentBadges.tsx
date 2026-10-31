import React from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Award, CheckCircle2, Sparkles, HeartHandshake } from 'lucide-react';

export const StudentBadges: React.FC = () => {
  const { selectedStudentId } = useAuth();
  const student = db.getStudentById(selectedStudentId || 'stu-9a1-01') || db.getStudents()[0];
  const rewards = db.getRewards(student?.id || 'stu-9a1-01');
  const behaviors = db.getBehaviors(student?.id || 'stu-9a1-01');

  const totalPoints = behaviors.reduce((acc, b) => acc + b.points, 0) || 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Bảng vinh danh & Huy hiệu thành tích
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Ghi nhận nỗ lực học tập và các hoạt động tích cực của {student?.fullName}
        </p>
      </div>

      {/* Points Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-amber-100">
            Điểm rèn luyện tích lũy
          </span>
          <div className="text-3xl font-extrabold mt-2 tabular-nums">+{totalPoints} điểm</div>
          <p className="text-xs text-amber-100 mt-1">Xếp loại: Xuất sắc trong phong trào thi đua của lớp</p>
        </div>
        <Award className="w-16 h-16 text-amber-200 opacity-90" />
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Huy hiệu danh dự ({rewards.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{r.badgeName}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Trao tặng bởi {r.awardedByName} · {new Date(r.awardedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavior Records */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Nhật ký điểm cộng rèn luyện
        </h3>
        <div className="space-y-2 text-xs">
          {behaviors.map(b => (
            <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">{b.category}</span>
                {b.notes && <p className="text-[11px] text-slate-500 mt-0.5">{b.notes}</p>}
              </div>
              <span className="font-bold text-emerald-600 text-sm">+{b.points}đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
