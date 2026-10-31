import React, { useState } from 'react';
import { db } from '../../services/db';
import { AuditLogItem } from '../../types';
import { History, Search, Download, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AuditLogsPage: React.FC = () => {
  const { success } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>(db.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('all');

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = tableFilter === 'all' || l.entityTable === tableFilter;
    return matchesSearch && matchesTable;
  });

  const handleExportCSV = () => {
    const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Bảng dữ liệu', 'Chi tiết', 'IP'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString('vi-VN')}"`,
      `"${l.actorName}"`,
      l.actorRole,
      `"${l.action}"`,
      l.entityTable,
      `"${l.details}"`,
      l.ipAddress
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_EduSmart.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã xuất file Audit Logs CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Nhật ký kiểm toán hệ thống (Audit Logs)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Ghi nhận toàn bộ thao tác thêm, sửa, xóa điểm, điểm danh và quản trị tài khoản
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Xuất CSV Audit Logs</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo người thực hiện, hành động, chi tiết..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={tableFilter}
            onChange={e => setTableFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả bảng</option>
            <option value="grades">grades (Điểm số)</option>
            <option value="attendance">attendance (Điểm danh)</option>
            <option value="classes">classes (Lớp học)</option>
            <option value="students">students (Học sinh)</option>
            <option value="assignments">assignments (Bài tập)</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold tabular-nums">
          {filteredLogs.length} sự kiện được ghi nhận
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <th className="p-3 pl-4 min-w-36">Thời gian</th>
              <th className="p-3 min-w-36">Người thực hiện</th>
              <th className="p-3 min-w-32">Hành động</th>
              <th className="p-3 min-w-24">Bảng dữ liệu</th>
              <th className="p-3">Chi tiết thay đổi</th>
              <th className="p-3 text-right pr-4">Địa chỉ IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3 pl-4 text-slate-500 font-mono text-[11px]">
                  {new Date(l.timestamp).toLocaleString('vi-VN')}
                </td>
                <td className="p-3 font-bold text-slate-900">
                  <div>{l.actorName}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{l.actorRole}</div>
                </td>
                <td className="p-3 font-semibold text-blue-600">{l.action}</td>
                <td className="p-3">
                  <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                    {l.entityTable}
                  </span>
                </td>
                <td className="p-3 text-slate-700 leading-relaxed">{l.details}</td>
                <td className="p-3 text-right pr-4 font-mono text-slate-400 text-[11px]">{l.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
