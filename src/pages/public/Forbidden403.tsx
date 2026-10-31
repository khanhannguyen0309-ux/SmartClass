import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

export const Forbidden403: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, switchRole } = useAuth();

  const handleSwitchToTeacher = () => {
    switchRole('teacher');
    navigate('/teacher/dashboard');
  };

  const handleSwitchToAdmin = () => {
    switchRole('admin');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Mã lỗi 403</div>
        <h1 className="text-xl font-extrabold text-slate-900 mt-1">Không có quyền truy cập</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Tài khoản hiện tại của bạn đang đăng nhập với vai trò <strong className="text-slate-800 uppercase">{currentRole}</strong>, không được cấp quyền xem hoặc chỉnh sửa trang này.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
          <div className="text-xs font-bold text-slate-700 mb-2">Chuyển sang vai trò có thẩm quyền:</div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSwitchToTeacher}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-between transition-colors"
            >
              <span>Chuyển sang Giáo viên (Teacher)</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSwitchToAdmin}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center justify-between transition-colors"
            >
              <span>Chuyển sang Quản trị viên (Admin)</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang trước
        </button>
      </div>
    </div>
  );
};
