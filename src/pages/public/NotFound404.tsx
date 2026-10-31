import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound404: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Mã lỗi 404</div>
        <h1 className="text-xl font-extrabold text-slate-900 mt-1">Không tìm thấy trang</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di dời sang vị trí mới trong hệ thống EduSmart.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" /> Về trang tổng quan
        </Link>
      </div>
    </div>
  );
};
