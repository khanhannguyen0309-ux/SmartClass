import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { GradeColumn, StudentGradeRow, GradeAuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  TableProperties,
  Save,
  Download,
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { success, error } = useToast();

  const classes = db.getClasses();
  const subjects = db.getSubjects();

  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-toan');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [columns, setColumns] = useState<GradeColumn[]>([]);
  const [rows, setRows] = useState<StudentGradeRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Audit history modal
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<GradeAuditLog[]>([]);

  useEffect(() => {
    const cols = db.getGradeColumns(selectedClassId, selectedSubjectId, selectedSemester);
    const r = db.getGradeRows(selectedClassId);
    setColumns(cols);
    setRows(JSON.parse(JSON.stringify(r))); // Deep clone for local editing
    setHasChanges(false);
  }, [selectedClassId, selectedSubjectId, selectedSemester]);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleScoreChange = (studentId: string, colId: string, value: string) => {
    const num = value.trim() === '' ? null : Number(value);
    if (num !== null && (isNaN(num) || num < 0 || num > 10)) {
      return; // only allow valid 0-10
    }

    setRows(prev =>
      prev.map(r => {
        if (r.studentId === studentId) {
          const newScores = { ...r.scores, [colId]: num };
          // Recalculate average
          let sumWeighted = 0;
          let sumWeights = 0;
          columns.forEach(c => {
            const val = newScores[c.id];
            if (val !== undefined && val !== null) {
              sumWeighted += val * c.weight;
              sumWeights += c.weight;
            }
          });
          const avg = sumWeights > 0 ? Number((sumWeighted / sumWeights).toFixed(1)) : undefined;

          return {
            ...r,
            scores: newScores,
            averageScore: avg,
            conductRank: avg && avg >= 8.0 ? 'Tốt' : 'Khá'
          };
        }
        return r;
      })
    );
    setHasChanges(true);
  };

  const handleBatchSave = () => {
    rows.forEach(r => {
      columns.forEach(c => {
        const val = r.scores[c.id];
        db.updateGradeScore(
          r.studentId,
          c.id,
          val ?? null,
          currentUser.id,
          currentUser.fullName,
          'Cập nhật sổ điểm định kỳ'
        );
      });
    });

    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Lưu sổ điểm điện tử',
      'grades',
      `Lớp ${currentClass.name}`,
      `Cập nhật điểm môn ${currentSubject.name}`
    );

    setHasChanges(false);
    success(`Đã lưu toàn bộ sổ điểm lớp ${currentClass.name} môn ${currentSubject.name}!`);
  };

  const openAuditLogs = () => {
    setAuditLogs(db.getGradeAudits());
    setAuditModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['STT', 'Mã HS', 'Họ và tên', ...columns.map(c => `${c.name} (x${c.weight})`), 'ĐTB'];
    const dataRows = rows.map(r => [
      r.rollNumber,
      r.studentCode,
      `"${r.fullName}"`,
      ...columns.map(c => r.scores[c.id] ?? ''),
      r.averageScore ?? ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...dataRows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `So_diem_${currentClass.name}_${currentSubject.code}_HK${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã xuất sổ điểm ra file CSV');
  };

  const filteredRows = rows.filter(r =>
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sổ điểm điện tử (Gradebook)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Nhập điểm theo định dạng bảng tính spreadsheet, tự động tính điểm trung bình môn và ghi nhật ký chỉnh sửa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAuditLogs}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Lịch sử sửa điểm</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất Excel/CSV</span>
          </button>
          <button
            onClick={handleBatchSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Lưu sổ điểm</span>
          </button>
        </div>
      </div>

      {/* Control bar: Class, Subject, Semester, Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">LỚP HỌC</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.studentCount} HS)
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">MÔN HỌC</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Toggle */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">HỌC KỲ</label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedSemester(1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSemester === 1 ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Học kỳ 1
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester(2)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSemester === 2 ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Học kỳ 2
              </button>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm học sinh theo tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SPREADSHEET TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* STICKY HEADER */}
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-2xs">
              <tr className="text-slate-600 font-bold">
                {/* STICKY FIRST COLUMN: Roll + Name */}
                <th className="p-3 pl-4 sticky left-0 z-30 bg-slate-100 min-w-48 border-r border-slate-200">
                  Học sinh ({filteredRows.length})
                </th>
                <th className="p-3 min-w-24">Mã số</th>
                {columns.map(col => (
                  <th key={col.id} className="p-3 text-center min-w-28 border-r border-slate-200/80">
                    <div>{col.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">Hệ số {col.weight}</div>
                  </th>
                ))}
                <th className="p-3 text-center min-w-24 bg-blue-50/80 text-blue-900 border-r border-slate-200">
                  ĐTB Môn
                </th>
                <th className="p-3 text-center min-w-24">Xếp loại</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRows.map((r, rowIdx) => (
                <tr key={r.studentId} className="hover:bg-blue-50/30 transition-colors">
                  {/* STICKY FIRST COLUMN: Roll Number and Name */}
                  <td className="p-2.5 pl-4 sticky left-0 z-10 bg-white font-sans font-bold text-slate-900 border-r border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs font-mono flex items-center justify-center shrink-0">
                      {r.rollNumber}
                    </span>
                    <span className="truncate">{r.fullName}</span>
                  </td>

                  <td className="p-2.5 text-slate-400 text-[11px]">{r.studentCode}</td>

                  {/* Editable score cells */}
                  {columns.map(col => {
                    const val = r.scores[col.id];
                    return (
                      <td key={col.id} className="p-1.5 text-center border-r border-slate-100">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={val !== undefined && val !== null ? val : ''}
                          onChange={e => handleScoreChange(r.studentId, col.id, e.target.value)}
                          placeholder="—"
                          className="w-16 mx-auto text-center font-bold text-xs p-1.5 rounded-lg border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                        />
                      </td>
                    );
                  })}

                  {/* Calculated Weighted Average */}
                  <td className="p-2.5 text-center font-bold text-blue-600 bg-blue-50/40 border-r border-slate-100 tabular-nums">
                    {r.averageScore !== undefined ? r.averageScore : '—'}
                  </td>

                  {/* Rank */}
                  <td className="p-2.5 text-center font-sans">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (r.averageScore || 0) >= 8.0
                        ? 'bg-emerald-50 text-emerald-700'
                        : (r.averageScore || 0) >= 6.5
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.averageScore ? (r.averageScore >= 8.0 ? 'Giỏi' : r.averageScore >= 6.5 ? 'Khá' : 'Đạt') : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIT LOG MODAL */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Nhật ký sửa điểm (Audit Log)</h3>
              </div>
              <button onClick={() => setAuditModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2.5 text-xs">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400">Chưa có lượt sửa điểm nào được ghi lại.</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">
                        {log.studentName} · Cột: {log.columnName}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Điểm cũ: <strong className="text-rose-600 font-mono">{log.oldScore ?? 'Trống'}</strong> → Điểm mới: <strong className="text-emerald-600 font-mono">{log.newScore ?? 'Trống'}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">Lý do: {log.reason}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 shrink-0">
                      <div>{log.changedByName}</div>
                      <div>{new Date(log.timestamp).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
