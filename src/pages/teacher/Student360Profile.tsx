import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { Student, StudentGradeRow } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  ArrowLeft,
  CalendarCheck,
  FileText,
  TableProperties,
  Award,
  AlertTriangle,
  HeartHandshake,
  User,
  Phone,
  Mail,
  MapPin,
  Plus
} from 'lucide-react';

export const Student360Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { currentUser } = useAuth();

  const [student, setStudent] = useState<Student | undefined>(db.getStudentById(id || 'stu-9a1-01'));
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'assignments' | 'behavior' | 'rewards' | 'alerts' | 'guardian'>('grades');

  // Related data
  const [gradeRows, setGradeRows] = useState<StudentGradeRow[]>([]);
  const [gradeColumns, setGradeColumns] = useState(db.getGradeColumns(student?.classId || 'cls-9a1'));
  const [submissions, setSubmissions] = useState(db.getStudentSubmissions(student?.id || 'stu-9a1-01'));
  const [behaviors, setBehaviors] = useState(db.getBehaviors(student?.id || 'stu-9a1-01'));
  const [rewards, setRewards] = useState(db.getRewards(student?.id || 'stu-9a1-01'));
  const [alerts, setAlerts] = useState(db.getAlerts().filter(a => a.studentId === (student?.id || 'stu-9a1-01')));

  // Quick note modal
  const [newBehaviorCategory, setNewBehaviorCategory] = useState('Tích cực phát biểu');
  const [newBehaviorPoints, setNewBehaviorPoints] = useState(1);
  const [newBehaviorNote, setNewBehaviorNote] = useState('');
  const [behaviorModalOpen, setBehaviorModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const s = db.getStudentById(id);
      setStudent(s);
      if (s) {
        setGradeColumns(db.getGradeColumns(s.classId));
        setGradeRows(db.getGradeRows(s.classId));
        setSubmissions(db.getStudentSubmissions(s.id));
        setBehaviors(db.getBehaviors(s.id));
        setRewards(db.getRewards(s.id));
        setAlerts(db.getAlerts().filter(a => a.studentId === s.id));
      }
    }
  }, [id]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      if (id) {
        const s = db.getStudentById(id);
        setStudent(s);
        if (s) {
          setGradeRows(db.getGradeRows(s.classId));
          setSubmissions(db.getStudentSubmissions(s.id));
          setBehaviors(db.getBehaviors(s.id));
          setRewards(db.getRewards(s.id));
          setAlerts(db.getAlerts().filter(a => a.studentId === s.id));
        }
      }
    });
    return unsub;
  }, [id]);

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800">Không tìm thấy hồ sơ học sinh</h3>
        <button
          onClick={() => navigate('/teacher/students')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const studentGradeRow = gradeRows.find(r => r.studentId === student.id);
  const avgScore = studentGradeRow?.averageScore || 8.6;

  const handleAddBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    db.addBehaviorRecord({
      studentId: student.id,
      studentName: student.fullName,
      classId: student.classId,
      className: student.className || '9A1',
      type: newBehaviorPoints >= 0 ? 'positive' : 'warning',
      category: newBehaviorCategory,
      points: newBehaviorPoints,
      notes: newBehaviorNote,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName
    });
    db.logAudit(currentUser.fullName, 'Giáo viên', 'Ghi nhận rèn luyện', 'behavior', student.fullName, `${newBehaviorCategory} (${newBehaviorPoints > 0 ? '+' : ''}${newBehaviorPoints} điểm)`);
    success(`Đã thêm nhận xét rèn luyện cho ${student.fullName}`);
    setBehaviorModalOpen(false);
    setNewBehaviorNote('');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/teacher/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Danh sách học sinh</span>
        </button>
      </div>

      {/* 360° Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
              {student.fullName.split(' ').pop()?.charAt(0) || 'H'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                  {student.fullName}
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-semibold">
                  {student.studentCode}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span>Lớp: <strong className="text-blue-600 font-bold">{student.className || '9A1'}</strong></span>
                <span>·</span>
                <span>Số thứ tự: <strong className="text-slate-700 font-bold">#{student.rollNumber}</strong></span>
                <span>·</span>
                <span>Giới tính: <strong className="text-slate-700">{student.gender}</strong></span>
                <span>·</span>
                <span>Ngày sinh: <strong className="text-slate-700">{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBehaviorModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận rèn luyện</span>
            </button>
          </div>
        </div>

        {/* 4 Core 360° Metric Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Điểm trung bình (ĐTB)</div>
            <div className="text-xl font-extrabold text-blue-600 mt-0.5 tabular-nums">{avgScore}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Xếp loại: Học lực Giỏi</div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Tỷ lệ chuyên cần</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5 tabular-nums">99%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Không nghỉ không phép</div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Bài tập hoàn thành</div>
            <div className="text-xl font-extrabold text-indigo-600 mt-0.5 tabular-nums">
              {submissions.length} bài
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% đúng hạn</div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Khen thưởng & Điểm tích cực</div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5 tabular-nums">
              +{behaviors.reduce((acc, b) => acc + b.points, 0) || 5} điểm
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">{rewards.length} huy hiệu danh dự</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-6 border-b border-slate-100 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'grades', label: 'Kết quả học tập', icon: TableProperties },
            { id: 'attendance', label: 'Chuyên cần', icon: CalendarCheck },
            { id: 'assignments', label: 'Bài tập đã nộp', icon: FileText },
            { id: 'behavior', label: 'Nhật ký hành vi & Rèn luyện', icon: HeartHandshake },
            { id: 'rewards', label: 'Huy hiệu thành tích', icon: Award },
            { id: 'alerts', label: 'Cảnh báo thông minh', icon: AlertTriangle },
            { id: 'guardian', label: 'Thông tin phụ huynh', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB PANELS */}
      {/* 1. GRADES TAB */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Bảng điểm chi tiết học kỳ 1 - Môn Toán học</h3>
            <span className="text-xs text-blue-600 font-bold">Điểm TB môn: {avgScore}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {gradeColumns.map(col => {
              const score = studentGradeRow?.scores[col.id];
              return (
                <div key={col.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <div className="text-[11px] text-slate-500 font-medium truncate">{col.name}</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {score !== undefined && score !== null ? score : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hệ số {col.weight}</div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => navigate('/teacher/grades')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Xem toàn bộ Sổ điểm của lớp →
            </button>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Nhật ký chuyên cần của {student.fullName}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Tỷ lệ chuyên cần tháng: 100%</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Hôm nay ({new Date().toLocaleDateString('vi-VN')})</span>
                <span className="text-slate-400 ml-2">Tiết 1</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                Có mặt đúng giờ
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">09/10/2024</span>
                <span className="text-slate-400 ml-2">Tiết 1</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                Có mặt đúng giờ
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">08/10/2024</span>
                <span className="text-slate-400 ml-2">Tiết 1</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                Có mặt đúng giờ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Bài tập và tiến độ nộp bài
          </h3>
          {submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Chưa có bài tập nào được nộp.</div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Bài tập tuần 6: Căn bậc hai và Hằng đẳng thức</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {sub.score ? `Điểm: ${sub.score}/10` : 'Đã nộp'}
                  </span>
                </div>
                {sub.content && <p className="text-slate-600 text-[11px] italic">"{sub.content}"</p>}
                {sub.feedback && (
                  <div className="p-2 rounded bg-blue-50 text-blue-900 text-[11px]">
                    <strong>Nhận xét của giáo viên:</strong> {sub.feedback}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. BEHAVIOR TAB */}
      {activeTab === 'behavior' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Nhật ký theo dõi hành vi & thi đua</h3>
            <button
              onClick={() => setBehaviorModalOpen(true)}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              + Thêm ghi nhận
            </button>
          </div>
          {behaviors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Chưa có ghi nhận hành vi nào.</div>
          ) : (
            behaviors.map(b => (
              <div key={b.id} className="p-3 rounded-xl border border-slate-100 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{b.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.points > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {b.points > 0 ? `+${b.points}` : b.points} điểm
                    </span>
                  </div>
                  {b.notes && <p className="text-slate-500 text-[11px] mt-1">{b.notes}</p>}
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. REWARDS TAB */}
      {activeTab === 'rewards' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Huy hiệu danh dự ({rewards.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rewards.map(r => (
              <div key={r.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-700 font-bold">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>{r.badgeName}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">{r.description}</p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Trao bởi {r.awardedByName} · {new Date(r.awardedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Cảnh báo thông minh của học sinh ({alerts.length})
          </h3>
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Không có cảnh báo vi phạm hoặc học lực đối với học sinh này.</div>
          ) : (
            alerts.map(a => (
              <div key={a.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">{a.title}</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {a.priority === 'high' ? 'Khẩn cấp' : 'Trung bình'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{a.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 7. GUARDIAN TAB */}
      {activeTab === 'guardian' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Thông tin liên hệ phụ huynh & Sổ liên lạc
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>{student.guardianName || 'Nguyễn Văn Đức'}</span>
              </div>
              <div className="text-slate-500">Mối quan hệ: <strong className="text-slate-800">{student.guardianRelationship || 'Bố'}</strong></div>
              <div className="text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-800 font-bold">{student.guardianPhone || '0913 999 888'}</span>
              </div>
              <div className="text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>parent@edusmart.edu.vn</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Địa chỉ gia đình</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {student.address || 'Quận Hoàn Kiếm, TP. Hà Nội'}
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  Đã liên kết tài khoản Cổng Phụ huynh (Parent Portal)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK BEHAVIOR RECORD MODAL */}
      {behaviorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Ghi nhận rèn luyện cho {student.fullName}</h3>
            <form onSubmit={handleAddBehavior} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại hành vi / Hoạt động *</label>
                <select
                  value={newBehaviorCategory}
                  onChange={e => setNewBehaviorCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                >
                  <option value="Tích cực phát biểu">Tích cực phát biểu xây dựng bài (+1)</option>
                  <option value="Giải bài tập khó">Giải bài tập xuất sắc (+2)</option>
                  <option value="Giúp đỡ bạn bè">Giúp đỡ bạn bè (+2)</option>
                  <option value="Trực nhật tốt">Vệ sinh trực nhật tốt (+1)</option>
                  <option value="Nói chuyện riêng">Nói chuyện riêng trong giờ (-1)</option>
                  <option value="Không mang sách vở">Không mang sách vở (-1)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Điểm cộng/trừ</label>
                <input
                  type="number"
                  value={newBehaviorPoints}
                  onChange={e => setNewBehaviorPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú cụ thể</label>
                <textarea
                  rows={3}
                  value={newBehaviorNote}
                  onChange={e => setNewBehaviorNote(e.target.value)}
                  placeholder="Ví dụ: Lên bảng làm đúng câu 5 bài toán khó..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBehaviorModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Lưu rèn luyện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
