import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { UserCheck, Plus, Shield, Search, Lock, Unlock, Mail, Phone } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [usersList, setUsersList] = useState<UserProfile[]>(allUsers);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [phone, setPhone] = useState('');

  const handleToggleStatus = (u: UserProfile) => {
    const isActivating = u.status === 'suspended';
    confirm({
      title: isActivating ? `Mở khóa tài khoản ${u.fullName}?` : `Khóa tài khoản ${u.fullName}?`,
      message: isActivating
        ? 'Người dùng sẽ có thể đăng nhập lại vào hệ thống bình thường.'
        : 'Người dùng sẽ bị chặn truy cập vào toàn bộ tính năng của hệ thống.',
      confirmText: isActivating ? 'Mở khóa' : 'Khóa tài khoản',
      isDanger: !isActivating,
      onConfirm: () => {
        setUsersList(prev =>
          prev.map(item => (item.id === u.id ? { ...item, status: isActivating ? 'active' : 'suspended' } : item))
        );
        db.logAudit(
          currentUser.fullName,
          'Quản trị viên',
          isActivating ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
          'profiles',
          u.email,
          `Đổi trạng thái tài khoản ${u.fullName}`
        );
        success(isActivating ? `Đã mở khóa tài khoản ${u.fullName}` : `Đã khóa tài khoản ${u.fullName}`);
      }
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      error('Vui lòng nhập đầy đủ họ tên và email');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      phone: phone.trim() || undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setUsersList(prev => [newUser, ...prev]);
    db.logAudit(
      currentUser.fullName,
      'Quản trị viên',
      'Tạo tài khoản người dùng',
      'profiles',
      newUser.email,
      `Tạo tài khoản vai trò ${newUser.role}`
    );
    success(`Đã tạo tài khoản ${newUser.fullName} thành công!`);
    setModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  const filtered = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tài khoản & Phân quyền hệ thống
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quản trị danh sách người dùng, cấp vai trò và kiểm soát phiên hoạt động
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên, email người dùng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học sinh</option>
            <option value="guardian">Phụ huynh</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold tabular-nums">
          {filtered.length} tài khoản
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <th className="p-3 pl-4">Họ và tên</th>
              <th className="p-3">Email đăng nhập</th>
              <th className="p-3">Vai trò RBAC</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right pr-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3 pl-4 font-bold text-slate-900">{u.fullName}</td>
                <td className="p-3 font-mono text-slate-600">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    u.role === 'admin' ? 'bg-rose-50 text-rose-700' :
                    u.role === 'teacher' ? 'bg-blue-50 text-blue-700' :
                    u.role === 'student' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    {u.role === 'admin' ? 'Quản trị viên' :
                     u.role === 'teacher' ? 'Giáo viên' :
                     u.role === 'student' ? 'Học sinh' : 'Phụ huynh'}
                  </span>
                </td>
                <td className="p-3 text-slate-500 font-mono">{u.phone || '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {u.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="p-3 text-right pr-4">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                  >
                    {u.status === 'active' ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Thêm tài khoản người dùng</h3>
            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: ThS. Lê Văn Bách"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  placeholder="name@edusmart.edu.vn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vai trò hệ thống *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="teacher">Giáo viên (Teacher)</option>
                  <option value="student">Học sinh (Student)</option>
                  <option value="guardian">Phụ huynh (Guardian)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
