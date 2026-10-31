import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { GraduationCap, Shield, User, Users, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchRole } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('teacher@edusmart.edu.vn');
  const [password, setPassword] = useState('teacher123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');

  const redirectAfterLogin = (role: UserRole) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && !from.includes('/login') && !from.includes('/403')) {
      navigate(from);
      return;
    }
    if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'student') navigate('/student/dashboard');
    else if (role === 'guardian') navigate('/parent/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    success(`Đã đăng nhập thành công với vai trò ${role.toUpperCase()}`);
    redirectAfterLogin(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Vui lòng nhập địa chỉ email');
      return;
    }
    const ok = login(email, selectedRole);
    if (ok) {
      success('Đăng nhập thành công!');
      redirectAfterLogin(selectedRole);
    } else {
      error('Thông tin đăng nhập không hợp lệ');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          EduSmart
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Hệ thống Quản lý Lớp học Thông minh Toàn diện
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Logins Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Truy cập nhanh tài khoản kiểm thử (1-Click)
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickLogin('teacher')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Giáo viên</div>
                <div className="text-[10px] text-blue-600/80">Thầy Hùng (9A1)</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('student')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Học sinh</div>
                <div className="text-[10px] text-emerald-600/80">Minh Khôi (9A1)</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('guardian')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-900 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Phụ huynh</div>
                <div className="text-[10px] text-purple-600/80">Bác Đức (2 con)</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-900 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Admin</div>
                <div className="text-[10px] text-rose-600/80">Quản trị trường</div>
              </div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@edusmart.edu.vn"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vai trò đăng nhập
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="teacher">Giáo viên (Teacher)</option>
                <option value="student">Học sinh (Student)</option>
                <option value="guardian">Phụ huynh (Guardian)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 mr-2" />
                Ghi nhớ đăng nhập
              </label>
              <span className="text-blue-600 hover:underline cursor-pointer">
                Quên mật khẩu?
              </span>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
