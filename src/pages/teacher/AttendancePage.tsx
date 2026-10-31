import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
  HelpCircle,
  Save,
  CheckCheck,
  History,
  AlertTriangle
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { success, warning } = useToast();
  const { confirm } = useConfirm();

  const classes = db.getClasses();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load records whenever class, date, or period changes
  useEffect(() => {
    const list = db.getAttendance(selectedClassId, selectedDate, selectedPeriod);
    setRecords(JSON.parse(JSON.stringify(list))); // Deep clone for local editing
    setHasUnsavedChanges(false);
  }, [selectedClassId, selectedDate, selectedPeriod]);

  // Window beforeunload guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleStatusChange = (recordId: string, status: AttendanceStatus) => {
    setRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status } : r))
    );
    setHasUnsavedChanges(true);
  };

  const handleReasonChange = (recordId: string, reason: string) => {
    setRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, reason } : r))
    );
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = () => {
    setRecords(prev =>
      prev.map(r => ({ ...r, status: 'present' as AttendanceStatus }))
    );
    setHasUnsavedChanges(true);
    success('Đã đánh dấu tất cả học sinh CÓ MẶT');
  };

  const handleSave = () => {
    db.bulkSaveAttendance(records, currentUser.fullName);
    setHasUnsavedChanges(false);
    success(`Đã lưu bảng điểm danh Lớp ${currentClass?.name} ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')} (Tiết ${selectedPeriod})`);
  };

  // Metrics
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const excused = records.filter(r => r.status === 'excused').length;
  const unexcused = records.filter(r => r.status === 'unexcused').length;
  const late = records.filter(r => r.status === 'late').length;
  const leftEarly = records.filter(r => r.status === 'left_early').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Điểm danh lớp học
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Theo dõi chuyên cần, ghi nhận lý do vắng và đồng bộ tới phụ huynh tức thì
          </p>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Có thay đổi chưa lưu!</span>
          </div>
        )}
      </div>

      {/* CONTEXT BAR (Lớp - Ngày - Tiết) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">LỚP HỌC</label>
            <select
              value={selectedClassId}
              onChange={e => {
                if (hasUnsavedChanges) {
                  confirm({
                    title: 'Rời trang khi chưa lưu?',
                    message: 'Bạn có thay đổi điểm danh chưa được lưu. Tiếp tục chuyển lớp sẽ hủy các thay đổi này.',
                    onConfirm: () => setSelectedClassId(e.target.value)
                  });
                } else {
                  setSelectedClassId(e.target.value);
                }
              }}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.studentCount} HS)
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">NGÀY ĐIỂM DANH</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Period Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">TIẾT HỌC</label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(Number(e.target.value))}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                <option key={p} value={p}>
                  Tiết {p} ({p <= 5 ? 'Buổi sáng' : 'Buổi chiều'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick bulk action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Đánh dấu tất cả có mặt</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS BAR: TRÊN 1 DÒNG DUY NHẤT */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="grid grid-cols-6 gap-2.5 min-w-[640px]">
          {/* 1. Sĩ số */}
          <div className="py-2.5 px-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">Sĩ số</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums leading-tight">{total}</span>
          </div>

          {/* 2. Có mặt */}
          <div className="py-2.5 px-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-emerald-700 font-bold whitespace-nowrap">Có mặt</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-0.5 tabular-nums leading-tight">{present}</span>
          </div>

          {/* 3. Có phép */}
          <div className="py-2.5 px-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-blue-700 font-bold whitespace-nowrap">Có phép</span>
            <span className="text-xl font-extrabold text-blue-600 mt-0.5 tabular-nums leading-tight">{excused}</span>
          </div>

          {/* 4. Không phép */}
          <div className="py-2.5 px-3 bg-rose-50/80 border border-rose-200 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-rose-700 font-bold whitespace-nowrap">Không phép</span>
            <span className="text-xl font-extrabold text-rose-600 mt-0.5 tabular-nums leading-tight">{unexcused}</span>
          </div>

          {/* 5. Đi trễ */}
          <div className="py-2.5 px-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-amber-700 font-bold whitespace-nowrap">Đi trễ</span>
            <span className="text-xl font-extrabold text-amber-600 mt-0.5 tabular-nums leading-tight">{late}</span>
          </div>

          {/* 6. Về sớm */}
          <div className="py-2.5 px-3 bg-purple-50/80 border border-purple-200 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-purple-700 font-bold whitespace-nowrap">Về sớm</span>
            <span className="text-xl font-extrabold text-purple-600 mt-0.5 tabular-nums leading-tight">{leftEarly}</span>
          </div>
        </div>
      </div>

      {/* ATTENDANCE ROSTER */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Danh sách học sinh lớp {currentClass?.name} ({records.length})
          </h3>
          <span className="text-xs text-slate-400">Nhấp chọn trạng thái để cập nhật</span>
        </div>

        <div className="divide-y divide-slate-100">
          {records.map(r => (
            <div
              key={r.id}
              className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                r.status === 'unexcused' ? 'bg-rose-50/40' :
                r.status === 'excused' ? 'bg-blue-50/30' :
                r.status === 'late' ? 'bg-amber-50/40' :
                r.status === 'left_early' ? 'bg-purple-50/30' : 'hover:bg-slate-50/70'
              }`}
            >
              {/* Student info */}
              <div className="flex items-center gap-3 min-w-56">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                  {r.rollNumber}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{r.studentName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{r.studentCode}</div>
                </div>
              </div>

              {/* Status button group (segmented) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange(r.id, 'present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    r.status === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Có mặt
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(r.id, 'excused')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    r.status === 'excused'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Có phép
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(r.id, 'unexcused')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    r.status === 'unexcused'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Không phép
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(r.id, 'late')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    r.status === 'late'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đi trễ
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(r.id, 'left_early')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    r.status === 'left_early'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Về sớm
                </button>
              </div>

              {/* Note / Reason input */}
              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Ghi chú lý do..."
                  value={r.reason || ''}
                  onChange={e => handleReasonChange(r.id, e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3.5 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-slate-800">
            Lớp {currentClass?.name} · Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')} · Tiết {selectedPeriod}
          </span>
          {hasUnsavedChanges ? (
            <span className="text-amber-600 font-semibold">• Có thay đổi chưa lưu</span>
          ) : (
            <span className="text-emerald-600 font-semibold">• Đã đồng bộ với máy chủ</span>
          )}
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu điểm danh</span>
        </button>
      </div>
    </div>
  );
};
