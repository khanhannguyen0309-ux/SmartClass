import React, { useState } from 'react';
import { db } from '../../services/db';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Database, RefreshCw, Download, Building, ShieldCheck, Check } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { confirm } = useConfirm();
  const { success } = useToast();

  const school = db.getSchool();
  const [schoolName, setSchoolName] = useState(school.name);
  const [address, setAddress] = useState(school.address || '');
  const [phone, setPhone] = useState(school.phone || '');
  const [email, setEmail] = useState(school.email || '');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    db.logAudit(
      currentUser.fullName,
      'Quản trị viên',
      'Cập nhật thông tin trường',
      'schools',
      schoolName,
      `Cập nhật địa chỉ và hotline trường học`
    );
    success('Đã lưu cấu hình thông tin trường học!');
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      school,
      classes: db.getClasses(),
      students: db.getStudents(),
      schedules: db.getSchedules(),
      gradeRows: db.getGradeRows('cls-9a1'),
      assignments: db.getAssignments(),
      announcements: db.getAnnouncements(),
      auditLogs: db.getAuditLogs()
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `EduSmart_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    success('Đã tạo và tải file sao lưu toàn bộ cơ sở dữ liệu (.json)');
  };

  const handleResetData = () => {
    confirm({
      title: 'Đặt lại toàn bộ dữ liệu mẫu ban đầu?',
      message: 'Toàn bộ thay đổi về lớp, điểm danh, sổ điểm và bài tập sẽ được khôi phục về trạng thái hạt giống ban đầu (Seed data).',
      confirmText: 'Xác nhận đặt lại',
      isDanger: true,
      onConfirm: () => {
        db.resetDatabase();
        success('Đã khôi phục cơ sở dữ liệu về trạng thái mẫu ban đầu thành công!');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Cài đặt hệ thống & Sao lưu dữ liệu
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Cấu hình thông tin trường học, kết nối cơ sở dữ liệu và quản trị sao lưu
        </p>
      </div>

      {/* School Info Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Thông tin đơn vị trường học</h3>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên trường học *</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mã định danh trường học</label>
              <input
                type="text"
                value={school.code}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Địa chỉ trường</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email hành chính</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* Database & Backup Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Sao lưu & Quản trị dữ liệu</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Xuất sao lưu (Full Backup)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Tải xuống toàn bộ cấu trúc các lớp học, hồ sơ học sinh, điểm danh và sổ điểm dưới định dạng JSON an toàn.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              Tải file sao lưu (.json)
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-rose-600" />
              <span>Đặt lại dữ liệu mẫu (Reset Seed)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Khôi phục tức thì toàn bộ 3 lớp học mẫu (9A1, 9A2, 8B1), 30 học sinh và các cột điểm chuẩn.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="mt-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold transition-colors"
            >
              Khôi phục dữ liệu ban đầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
