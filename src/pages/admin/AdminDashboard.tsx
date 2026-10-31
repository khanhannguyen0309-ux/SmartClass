import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Building,
  Users,
  GraduationCap,
  History,
  Settings,
  Database,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const school = db.getSchool();
  const classes = db.getClasses();
  const students = db.getStudents();
  const users = db.getUsers();
  const auditLogs = db.getAuditLogs().slice(0, 6);

  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full">
            Quản trị viên hệ thống (Admin Portal)
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2">
            Bảng điều khiển Quản trị: {school.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mã đơn vị: <strong className="text-white font-mono">{school.code}</strong> · {school.address}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" />
            <span>Xem Audit Log</span>
          </button>
        </div>
      </div>

      {/* 4 Core Admin KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng số lớp học</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {classes.length} lớp
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Khối 6, 7, 8, 9</div>
        </div>

        <div
          onClick={() => navigate('/admin/students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng học sinh</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {students.length} HS
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đã cấp mã định danh 100%</div>
        </div>

        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đội ngũ giáo viên</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 tabular-nums">
            {teacherCount} GV
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đầy đủ các tổ bộ môn</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tình trạng hệ thống</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Ổn định</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Database RLS Active</div>
        </div>
      </div>

      {/* 2-Columns: Recent Audit Logs & System Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Nhật ký hoạt động gần đây (Audit Logs)</h3>
            </div>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                </div>
                <div className="text-slate-600 text-[11px]">{log.details}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Thực hiện bởi: <strong>{log.actorName}</strong> ({log.actorRole})</span>
                  <span className="font-mono">{log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Hub */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Lối tắt quản lý hệ thống
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div
              onClick={() => navigate('/admin/classes')}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer space-y-1"
            >
              <Building className="w-5 h-5 text-blue-600" />
              <div className="font-bold text-slate-900 pt-1">Quản lý lớp học</div>
              <p className="text-slate-500 text-[11px]">Xem, tạo mới, phân công GVCN và phòng học</p>
            </div>

            <div
              onClick={() => navigate('/admin/users')}
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer space-y-1"
            >
              <UserCheck className="w-5 h-5 text-purple-600" />
              <div className="font-bold text-slate-900 pt-1">Tài khoản & Phân quyền</div>
              <p className="text-slate-500 text-[11px]">Quản lý người dùng và cấp quyền RBAC</p>
            </div>

            <div
              onClick={() => navigate('/admin/audit-logs')}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-1"
            >
              <History className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-slate-900 pt-1">Nhật ký Audit Logs</div>
              <p className="text-slate-500 text-[11px]">Tra cứu các hành động và sửa đổi dữ liệu</p>
            </div>

            <div
              onClick={() => navigate('/admin/settings')}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer space-y-1"
            >
              <Settings className="w-5 h-5 text-slate-700" />
              <div className="font-bold text-slate-900 pt-1">Cài đặt & Sao lưu</div>
              <p className="text-slate-500 text-[11px]">Cấu hình trường học và xuất backup dữ liệu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
