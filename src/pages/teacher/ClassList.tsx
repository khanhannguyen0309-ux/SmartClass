import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { ClassItem } from '../../types';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Edit2,
  Trash2,
  Archive,
  ArrowRight,
  Users,
  DoorOpen,
  LayoutGrid,
  List
} from 'lucide-react';

export const ClassList: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error } = useToast();
  const { setSelectedClassId, currentUser } = useAuth();

  const [classes, setClasses] = useState<ClassItem[]>(db.getClasses());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState<ClassItem | null>(null);

  // Form state
  const [className, setClassName] = useState('');
  const [room, setRoom] = useState('');
  const [gradeLevelId, setGradeLevelId] = useState('gl-9');
  const [duplicateName, setDuplicateName] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const gradeLevels = db.getGradeLevels();
  const academicYears = db.getAcademicYears();

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setClasses(db.getClasses());
    });
    return unsub;
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Đã sao chép mã tham gia lớp: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      error('Vui lòng nhập tên lớp');
      return;
    }
    const newCls = db.createClass({
      schoolId: 'sch-001',
      academicYearId: 'ay-2024',
      gradeLevelId,
      name: className.trim(),
      room: room.trim() || 'Phòng học chính',
      joinCode: `ES-${className.trim().toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      homeroomTeacherId: currentUser.id,
      homeroomTeacherName: currentUser.fullName
    });
    db.logAudit(currentUser.fullName, 'Giáo viên', 'Tạo lớp học mới', 'classes', newCls.name, `Tạo lớp ${newCls.name}`);
    success(`Đã tạo thành công lớp ${newCls.name}`);
    setCreateModalOpen(false);
    setClassName('');
    setRoom('');
  };

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClass || !duplicateName.trim()) return;
    const duplicated = db.duplicateClass(targetClass.id, duplicateName.trim());
    if (duplicated) {
      db.logAudit(currentUser.fullName, 'Giáo viên', 'Sao chép lớp học', 'classes', duplicated.name, `Sao chép từ ${targetClass.name}`);
      success(`Đã sao chép lớp thành ${duplicated.name}`);
      setDuplicateModalOpen(false);
      setDuplicateName('');
      setTargetClass(null);
    }
  };

  const handleArchive = (c: ClassItem) => {
    const isArchiving = c.status === 'active';
    confirm({
      title: isArchiving ? `Lưu trữ lớp ${c.name}?` : `Mở lại lớp ${c.name}?`,
      message: isArchiving
        ? 'Lớp học sau khi lưu trữ sẽ bị ẩn khỏi danh sách lớp đang hoạt động.'
        : 'Lớp học sẽ được kích hoạt lại cho năm học hiện tại.',
      confirmText: isArchiving ? 'Lưu trữ' : 'Kích hoạt lại',
      onConfirm: () => {
        db.archiveClass(c.id);
        db.logAudit(currentUser.fullName, 'Giáo viên', 'Đổi trạng thái lớp', 'classes', c.name, `${isArchiving ? 'Lưu trữ' : 'Mở lại'} lớp`);
        success(isArchiving ? `Đã lưu trữ lớp ${c.name}` : `Đã mở lại lớp ${c.name}`);
      }
    });
  };

  const handleDelete = (c: ClassItem) => {
    confirm({
      title: `Xóa lớp ${c.name}?`,
      message: `Cảnh báo: Hành động này sẽ xóa lớp ${c.name} và toàn bộ liên kết học sinh. Dữ liệu không thể khôi phục!`,
      isDanger: true,
      confirmText: 'Xóa vĩnh viễn',
      onConfirm: () => {
        db.deleteClass(c.id);
        db.logAudit(currentUser.fullName, 'Giáo viên', 'Xóa lớp học', 'classes', c.name, `Xóa lớp ${c.name}`);
        success(`Đã xóa lớp ${c.name}`);
      }
    });
  };

  const filteredClasses = classes.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.homeroomTeacherName && c.homeroomTeacherName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGrade = selectedGrade === 'all' || c.gradeLevelId === selectedGrade;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý danh sách lớp học
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tổng cộng {classes.length} lớp học trong niên khóa 2024 - 2025
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {/* Filter and View Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên lớp, phòng học, giáo viên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả các khối</option>
            {gradeLevels.map(gl => (
              <option key={gl.id} value={gl.id}>{gl.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="active">Đang hoạt động</option>
            <option value="archived">Đã lưu trữ</option>
            <option value="all">Tất cả trạng thái</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}
            title="Dạng lưới"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}
            title="Dạng bảng"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Classes list */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Không tìm thấy lớp học nào</h3>
          <p className="text-xs text-slate-400 mt-1">Hãy thử điều chỉnh bộ lọc tìm kiếm hoặc tạo một lớp học mới.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map(cls => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                      Khối {cls.name.charAt(0)}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">Lớp {cls.name}</h3>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    cls.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cls.status === 'active' ? 'Hoạt động' : 'Đã lưu trữ'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-slate-400" />
                    <span>{cls.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{cls.studentCount || 0} học sinh</span>
                  </div>
                  {cls.homeroomTeacherName && (
                    <div className="text-[11px] text-slate-500">
                      GVCN: <span className="font-medium text-slate-700">{cls.homeroomTeacherName}</span>
                    </div>
                  )}
                </div>

                {/* Join code box */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Mã tham gia lớp:</div>
                    <div className="font-mono font-bold text-slate-800 tracking-wider">{cls.joinCode}</div>
                  </div>
                  <button
                    onClick={() => handleCopyCode(cls.joinCode)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                    title="Sao chép mã"
                  >
                    {copiedCode === cls.joinCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setTargetClass(cls); setDuplicateName(`${cls.name} (Bản sao)`); setDuplicateModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Sao chép lớp"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchive(cls)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                    title={cls.status === 'active' ? 'Lưu trữ lớp' : 'Mở lại'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Xóa lớp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => { setSelectedClassId(cls.id); navigate(`/teacher/classes/${cls.id}`); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                >
                  <span>Chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="p-3 pl-4">Lớp</th>
                <th className="p-3">Phòng học</th>
                <th className="p-3">Sĩ số</th>
                <th className="p-3">GVCN</th>
                <th className="p-3">Mã lớp</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right pr-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.map(cls => (
                <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 pl-4 font-bold text-slate-900">{cls.name}</td>
                  <td className="p-3 text-slate-600">{cls.room}</td>
                  <td className="p-3 font-semibold tabular-nums">{cls.studentCount} HS</td>
                  <td className="p-3 text-slate-600">{cls.homeroomTeacherName || 'Chưa phân công'}</td>
                  <td className="p-3 font-mono">{cls.joinCode}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      cls.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cls.status === 'active' ? 'Hoạt động' : 'Lưu trữ'}
                    </span>
                  </td>
                  <td className="p-3 text-right pr-4">
                    <button
                      onClick={() => { setSelectedClassId(cls.id); navigate(`/teacher/classes/${cls.id}`); }}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Quản lý lớp →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Tạo lớp học mới</h3>
            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên lớp học *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 9A3, 8A2..."
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khối lớp *</label>
                <select
                  value={gradeLevelId}
                  onChange={e => setGradeLevelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                >
                  {gradeLevels.map(gl => (
                    <option key={gl.id} value={gl.id}>{gl.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phòng 303 - Tầng 3 Nhà A"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Tạo lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DUPLICATE MODAL */}
      {duplicateModalOpen && targetClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Sao chép lớp học</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tạo bản sao mới từ lớp {targetClass.name} với cấu hình phòng học và khối tương tự.
            </p>
            <form onSubmit={handleDuplicate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên lớp mới *</label>
                <input
                  type="text"
                  value={duplicateName}
                  onChange={e => setDuplicateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDuplicateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Xác nhận sao chép
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
