import React from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { TableProperties, Award, TrendingUp } from 'lucide-react';

export const StudentGrades: React.FC = () => {
  const { selectedStudentId } = useAuth();
  const student = db.getStudentById(selectedStudentId || 'stu-9a1-01') || db.getStudents()[0];
  const columns = db.getGradeColumns(student?.classId || 'cls-9a1');
  const gradeRows = db.getGradeRows(student?.classId || 'cls-9a1');
  const row = gradeRows.find(r => r.studentId === student?.id);

  const avg = row?.averageScore || 8.6;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Bảng điểm cá nhân (Kết quả học tập)
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Học sinh: {student?.fullName} ({student?.studentCode}) · Lớp {student?.className || '9A1'} · Học kỳ 1
        </p>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Điểm trung bình học kỳ</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1 tabular-nums">{avg}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Học lực: Xuất sắc / Giỏi</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Hạnh kiểm & Rèn luyện</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">Tốt</div>
          <div className="text-xs text-slate-400 mt-1">Đầy đủ chuyên cần và tích cực</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Xếp hạng trong lớp</div>
          <div className="text-3xl font-extrabold text-amber-500 mt-1">#1 / 30</div>
          <div className="text-xs text-slate-400 mt-1">Dẫn đầu môn Toán học</div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Chi tiết điểm thành phần môn Toán học</h3>
          <span className="text-xs text-slate-400">Học kỳ 1 - 2024-2025</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <th className="p-3.5 pl-4">Cột điểm kiểm tra</th>
              <th className="p-3.5 text-center">Hệ số</th>
              <th className="p-3.5 text-center">Điểm số đạt được</th>
              <th className="p-3.5 text-right pr-4">Đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {columns.map(col => {
              const val = row?.scores[col.id] ?? 9.5;
              return (
                <tr key={col.id} className="hover:bg-slate-50">
                  <td className="p-3.5 pl-4 font-bold text-slate-800">{col.name}</td>
                  <td className="p-3.5 text-center text-slate-500">x{col.weight}</td>
                  <td className="p-3.5 text-center font-bold text-base text-blue-600 tabular-nums">
                    {val}
                  </td>
                  <td className="p-3.5 text-right pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Đạt yêu cầu xuất sắc
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
