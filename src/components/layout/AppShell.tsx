import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Calendar,
  FileText,
  TableProperties,
  Wrench,
  Award,
  Bell,
  BarChart3,
  Settings,
  Shield,
  Search,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building,
  UserCheck,
  History,
  MessageSquareQuote,
  BookOpen,
  HelpCircle,
  FolderKanban,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { db } from '../../services/db';
import { GlobalSearchModal } from './GlobalSearchModal';

export const AppShell: React.FC = () => {
  const { currentUser, currentRole, switchRole, selectedClassId, setSelectedClassId, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const classes = db.getClasses();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const announcements = db.getAnnouncements(currentRole).slice(0, 4);

  const [teachingMenuOpen, setTeachingMenuOpen] = useState(true);

  // Role navigation items
  const teacherNav: Array<{
    label: string;
    path: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    children?: Array<{
      label: string;
      path: string;
      icon: any;
      badge?: string;
      badgeColor?: string;
    }>;
  }> = [
    { label: 'Lớp của tôi', path: '/teacher/dashboard', icon: Building },
    { label: 'Học sinh & Hồ sơ', path: '/teacher/students', icon: Users },
    { label: 'Điểm danh', path: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Thời khóa biểu', path: '/teacher/schedule', icon: Calendar },
    {
      label: 'DẠY VÀ HỌC',
      path: '/teacher/teaching',
      icon: BookOpen,
      badge: '5 mục',
      badgeColor: 'bg-blue-100 text-blue-700',
      children: [
        { label: '1. Ngân hàng câu hỏi', path: '/teacher/teaching/questions', icon: HelpCircle },
        { label: '2. Giao bài tập', path: '/teacher/teaching/assignments', icon: FileText },
        { label: '3. Chấm bài tự động', path: '/teacher/teaching/auto-grading', icon: CheckCircle2, badge: 'Auto' },
        { label: '4. Tài liệu số', path: '/teacher/teaching/materials', icon: FolderKanban },
        { label: '5. AI HỖ TRỢ', path: '/teacher/teaching/ai-assistant', icon: Sparkles, badge: 'AI', badgeColor: 'bg-purple-100 text-purple-700' },
      ]
    },
    { label: 'Sổ điểm điện tử', path: '/teacher/grades', icon: TableProperties },
    { label: 'Công cụ lớp học', path: '/teacher/tools', icon: Wrench },
    { label: 'Cảnh báo & Khen thưởng', path: '/teacher/alerts', icon: Award },
    { label: 'Thông báo', path: '/teacher/announcements', icon: Bell },
    { label: 'Báo cáo & Thống kê', path: '/teacher/reports', icon: BarChart3 },
  ];

  const studentNav = [
    { label: 'Tổng quan học tập', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Thời khóa biểu', path: '/student/schedule', icon: Calendar },
    { label: 'Bài tập của tôi', path: '/student/assignments', icon: FileText },
    { label: 'Bảng điểm cá nhân', path: '/student/grades', icon: TableProperties },
    { label: 'Chuyên cần', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Bảng vinh danh', path: '/student/badges', icon: Award },
    { label: 'Thông báo lớp', path: '/student/announcements', icon: Bell },
  ];

  const parentNav = [
    { label: 'Dashboard con cái', path: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'Hồ sơ 360° của con', path: '/parent/profile', icon: GraduationCap },
    { label: 'Kết quả học tập', path: '/parent/grades', icon: TableProperties },
    { label: 'Tình hình chuyên cần', path: '/parent/attendance', icon: CalendarCheck },
    { label: 'Bài tập & Rèn luyện', path: '/parent/assignments', icon: FileText },
    { label: 'Sổ liên lạc điện tử', path: '/parent/messages', icon: MessageSquareQuote },
    { label: 'Thông báo nhà trường', path: '/parent/announcements', icon: Bell },
  ];

  const adminNav = [
    { label: 'Tổng quan quản trị', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Quản lý lớp học', path: '/admin/classes', icon: Building },
    { label: 'Học sinh toàn trường', path: '/admin/students', icon: Users },
    { label: 'Tài khoản & Phân quyền', path: '/admin/users', icon: UserCheck },
    { label: 'Nhật ký hệ thống', path: '/admin/audit-logs', icon: History },
    { label: 'Cài đặt hệ thống', path: '/admin/settings', icon: Settings },
  ];

  const currentNav = 
    currentRole === 'teacher' ? teacherNav :
    currentRole === 'student' ? studentNav :
    currentRole === 'guardian' ? parentNav : adminNav;

  const roleName = 
    currentRole === 'teacher' ? 'Giáo viên' :
    currentRole === 'student' ? 'Học sinh' :
    currentRole === 'guardian' ? 'Phụ huynh' : 'Quản trị viên (Admin)';

  const roleBadgeColor =
    currentRole === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    currentRole === 'student' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    currentRole === 'guardian' ? 'bg-purple-50 text-purple-700 border-purple-200' :
    'bg-rose-50 text-rose-700 border-rose-200';

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setUserMenuOpen(false);
    if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'student') navigate('/student/dashboard');
    else if (role === 'guardian') navigate('/parent/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* GLOBAL TOP BAR */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand + Mobile Trigger + Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-xs">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold leading-none tracking-tight text-blue-900">EduSmart</span>
              <span className="text-[10px] text-slate-400 font-normal">Quản lý lớp học</span>
            </div>
          </Link>

          {/* Quick Context Bar for Teacher */}
          {currentRole === 'teacher' && (
            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Lớp:</span>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="text-xs font-semibold bg-slate-100 text-slate-800 border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.room})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Middle: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Tìm kiếm học sinh, lớp, bài tập, thông báo...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-500 shadow-2xs font-mono">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Role Switcher + Notifications + User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher Bar for Seamless Evaluation */}
          <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl gap-1">
            <span className="text-[11px] font-semibold text-slate-500 px-2">Role:</span>
            {(['teacher', 'student', 'guardian', 'admin'] as UserRole[]).map(r => {
              const label = r === 'teacher' ? 'GV' : r === 'student' ? 'HS' : r === 'guardian' ? 'PH' : 'Admin';
              const active = currentRole === r;
              return (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {announcements.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Thông báo mới ({announcements.length})</h4>
                  <span className="text-[11px] text-blue-600 cursor-pointer" onClick={() => setNotificationsOpen(false)}>
                    Đóng
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {announcements.map(a => (
                    <div key={a.id} className="p-2 rounded-lg hover:bg-slate-50 text-xs">
                      <div className="font-semibold text-slate-800 truncate">{a.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{a.content}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Profile & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                {currentUser.fullName.split(' ').pop()?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 truncate max-w-28 leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {roleName}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className={`mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                    {roleName}
                  </div>
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-semibold text-slate-400 px-3 py-1">CHUYỂN ĐỔI VAI TRÒ TEST</div>
                  <button
                    onClick={() => handleRoleChange('teacher')}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${currentRole === 'teacher' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>Giáo viên (Thầy Hùng)</span>
                    {currentRole === 'teacher' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${currentRole === 'student' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>Học sinh (Minh Khôi)</span>
                    {currentRole === 'student' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('guardian')}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${currentRole === 'guardian' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>Phụ huynh (Bác Đức)</span>
                    {currentRole === 'guardian' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${currentRole === 'admin' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>Quản trị viên (Admin)</span>
                    {currentRole === 'admin' && <span className="text-[10px]">✓</span>}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); navigate('/login'); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY CANVAS: SIDEBAR + MAIN */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 select-none">
          {/* Active Context Banner */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CỔNG TRUY CẬP</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${roleBadgeColor}`}>
                {roleName}
              </span>
              {currentRole === 'teacher' && (
                <span className="text-xs text-slate-600 font-medium truncate">
                  Lớp {currentClass.name}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {currentNav.map(item => {
              const Icon = item.icon;
              const hasChildren = 'children' in item && Boolean(item.children && item.children.length > 0);
              const isChildActive = hasChildren && (item.children as any[])!.some((c: any) => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));
              const isDirectActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
              const isActive = isDirectActive || isChildActive;

              if (hasChildren) {
                return (
                  <div key={item.path} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTeachingMenuOpen(!teachingMenuOpen);
                        if (!location.pathname.startsWith(item.path)) {
                          navigate(item.path);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                        <span className="truncate tracking-wide font-extrabold">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${teachingMenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {teachingMenuOpen && (
                      <div className="space-y-1 ml-3.5 pl-2.5 border-l-2 border-blue-200 pt-0.5">
                        {(item.children as any[])!.map((child: any) => {
                          const ChildIcon = child.icon;
                          const isSubActive = location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path + '/'));
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                isSubActive
                                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="truncate">{child.label}</span>
                              </div>
                              {child.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isSubActive ? 'bg-white/20 text-white' : (child.badgeColor || 'bg-slate-100 text-slate-600')}`}>
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom School Info */}
          <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 bg-slate-50/40">
            <div className="font-semibold text-slate-700 truncate">THCS Trưng Vương</div>
            <div>Năm học 2024 - 2025 · HK1</div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm">EduSmart Menu</div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Chọn Role xem thử</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['teacher', 'student', 'guardian', 'admin'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => { handleRoleChange(r); setMobileMenuOpen(false); }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center border ${
                        currentRole === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {r === 'teacher' ? 'Giáo viên' : r === 'student' ? 'Học sinh' : r === 'guardian' ? 'Phụ huynh' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {currentNav.map(item => {
                  const Icon = item.icon;
                  const hasChildren = 'children' in item && Boolean(item.children && item.children.length > 0);
                  const isChildActive = hasChildren && (item.children as any[])!.some((c: any) => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));
                  const isDirectActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                  const isActive = isDirectActive || isChildActive;

                  if (hasChildren) {
                    return (
                      <div key={item.path} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setTeachingMenuOpen(!teachingMenuOpen)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon className="w-4 h-4 text-blue-600" />
                            <span className="font-extrabold">{item.label}</span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${teachingMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {teachingMenuOpen && (
                          <div className="space-y-1 ml-3 pl-2 border-l border-blue-200">
                            {(item.children as any[])!.map((child: any) => {
                              const ChildIcon = child.icon;
                              const isSubActive = location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path + '/'));
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                    isSubActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <ChildIcon className="w-3.5 h-3.5" />
                                    <span className="truncate">{child.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
};
