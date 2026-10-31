import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Filter
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { selectedClassId, setSelectedClassId } = useAuth();
  const { success } = useToast();

  const classes = db.getClasses();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const students = db.getStudents(selectedClassId);
  const gradeRows = db.getGradeRows(selectedClassId);
  const assignments = db.getAssignments(selectedClassId);

  const [reportType, setReportType] = useState<'academic' | 'attendance' | 'behavior'>('academic');

  // Distribution calculations
  const total = students.length || 1;
  const excellent = gradeRows.filter(r => (r.averageScore || 0) >= 8.0).length;
  const good = gradeRows.filter(r => (r.averageScore || 0) >= 6.5 && (r.averageScore || 0) < 8.0).length;
  const average = gradeRows.filter(r => (r.averageScore || 0) >= 5.0 && (r.averageScore || 0) < 6.5).length;
  const weak = gradeRows.filter(r => (r.averageScore || 0) < 5.0 && (r.averageScore !== undefined)).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['STT', 'Mã HS', 'Họ và tên', 'Điểm trung bình', 'Xếp loại học lực', 'Hạnh kiểm'];
    const rows = gradeRows.map(r => [
      r.rollNumber,
      r.studentCode,
      `"${r.fullName}"`,
      r.averageScore ?? '—',
      (r.averageScore || 0) >= 8.0 ? 'Giỏi' : (r.averageScore || 0) >= 6.5 ? 'Khá' : 'Đạt',
      r.conductRank || 'Tốt'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_hoc_tap_${currentClass.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Đã xuất báo cáo lớp ${currentClass.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Trung tâm Báo cáo & Phân tích
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tổng hợp dữ liệu kết quả học tập, tỷ lệ chuyên cần và thi đua của lớp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Type Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">CHỌN LỚP</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">CHUYÊN ĐỀ BÁO CÁO</label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setReportType('academic')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  reportType === 'academic' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Kết quả học tập
              </button>
              <button
                onClick={() => setReportType('attendance')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  reportType === 'attendance' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Chuyên cần
              </button>
              <button
                onClick={() => setReportType('behavior')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  reportType === 'behavior' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Thi đua & Kỷ luật
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold">Học sinh Giỏi (ĐTB ≥ 8.0)</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
            {excellent} HS
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Chiếm {Math.round((excellent / total) * 100)}% sĩ số
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold">Học sinh Khá (6.5 - 7.9)</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            {good} HS
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Chiếm {Math.round((good / total) * 100)}% sĩ số
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold">Trung bình (5.0 - 6.4)</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
            {average} HS
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Chiếm {Math.round((average / total) * 100)}% sĩ số
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold">Yếu / Cần phụ đạo</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 tabular-nums">
            {weak} HS
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {weak > 0 ? 'Đã lên kế hoạch phụ đạo' : 'Không có'}
          </div>
        </div>
      </div>

      {/* Visual Bar Breakdown Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Phổ điểm xếp loại học tập Lớp {currentClass?.name}
        </h3>

        {/* Multi-segment stacked bar */}
        <div className="w-full h-8 rounded-xl bg-slate-100 flex overflow-hidden shadow-inner">
          <div
            className="bg-blue-600 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all"
            style={{ width: `${(excellent / total) * 100}%` }}
            title={`Giỏi: ${excellent} HS`}
          >
            {excellent > 0 && `Giỏi (${Math.round((excellent / total) * 100)}%)`}
          </div>
          <div
            className="bg-emerald-500 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all"
            style={{ width: `${(good / total) * 100}%` }}
            title={`Khá: ${good} HS`}
          >
            {good > 0 && `Khá (${Math.round((good / total) * 100)}%)`}
          </div>
          <div
            className="bg-amber-500 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all"
            style={{ width: `${(average / total) * 100}%` }}
            title={`TB: ${average} HS`}
          >
            {average > 0 && `TB`}
          </div>
          {weak > 0 && (
            <div
              className="bg-rose-500 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all"
              style={{ width: `${(weak / total) * 100}%` }}
              title={`Yếu: ${weak} HS`}
            >
              Yếu
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span>Giỏi: {excellent} học sinh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Khá: {good} học sinh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Trung bình: {average} học sinh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Cần phụ đạo: {weak} học sinh</span>
          </div>
        </div>
      </div>

      {/* Detailed Student Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Bảng xếp loại tổng hợp học sinh</h3>
          <span className="text-xs text-slate-400">Niên khóa 2024 - 2025</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="p-3 pl-4">Hạng</th>
              <th className="p-3">Mã HS</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3 text-center">ĐTB Môn</th>
              <th className="p-3 text-center">Xếp loại</th>
              <th className="p-3 text-center">Hạnh kiểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gradeRows
              .slice()
              .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
              .map((r, idx) => (
                <tr key={r.studentId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 pl-4 font-bold font-mono text-slate-500">#{idx + 1}</td>
                  <td className="p-3 font-mono text-slate-700">{r.studentCode}</td>
                  <td className="p-3 font-bold text-slate-900">{r.fullName}</td>
                  <td className="p-3 text-center font-bold text-blue-600 tabular-nums">
                    {r.averageScore ?? '—'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      (r.averageScore || 0) >= 8.0 ? 'bg-blue-50 text-blue-700' :
                      (r.averageScore || 0) >= 6.5 ? 'bg-emerald-50 text-emerald-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {(r.averageScore || 0) >= 8.0 ? 'Giỏi' : (r.averageScore || 0) >= 6.5 ? 'Khá' : 'Đạt'}
                    </span>
                  </td>
                  <td className="p-3 text-center font-semibold text-emerald-700">
                    {r.conductRank || 'Tốt'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
