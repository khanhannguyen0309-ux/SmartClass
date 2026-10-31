import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/db';
import {
  Edit3,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Download,
  Save,
  Plus,
  X,
  Printer,
  Upload,
  AlertTriangle
} from 'lucide-react';

const WEEKDAY_NAMES = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật'
];

interface ColumnDef {
  id: string;
  title: string;
}

interface RowDef {
  id: string;
  title: string;
}

interface TableState {
  columns: ColumnDef[];
  rows: RowDef[];
  cells: Record<string, Record<string, string>>; // [rowId][colId] = text
}

const DEFAULT_INITIAL_COLUMNS: ColumnDef[] = [
  { id: 'col-mon', title: 'Thứ Hai' },
  { id: 'col-tue', title: 'Thứ Ba' },
  { id: 'col-wed', title: 'Thứ Tư' },
  { id: 'col-thu', title: 'Thứ Năm' },
  { id: 'col-fri', title: 'Thứ Sáu' },
];

const DEFAULT_INITIAL_ROWS: RowDef[] = [
  { id: 'row-1', title: 'Tiết 1' },
  { id: 'row-2', title: 'Tiết 2' },
  { id: 'row-3', title: 'Tiết 3' },
  { id: 'row-4', title: 'Tiết 4' },
  { id: 'row-5', title: 'Tiết 5' },
];

const DEFAULT_INITIAL_CELLS: Record<string, Record<string, string>> = {
  'row-1': {
    'col-mon': 'Toán học\nThầy Hùng\nP.301',
    'col-tue': 'Vật lý\nThầy Quân\nP.301',
    'col-wed': 'Tin học\nThầy Bình\nP.Lab 2',
    'col-thu': 'Toán học\nThầy Hùng\nP.301',
    'col-fri': 'Tiếng Anh\nCô Lan\nP.301',
  },
  'row-2': {
    'col-mon': 'Toán học\nThầy Hùng\nP.301',
    'col-tue': 'Hóa học\nCô Hà\nP.301',
    'col-wed': 'Sinh học\nCô Loan\nP.301',
    'col-thu': 'Ngữ văn\nCô Mai\nP.301',
    'col-fri': 'Lịch sử\nCô Thảo\nP.301',
  },
  'row-3': {
    'col-mon': 'Ngữ văn\nCô Mai\nP.301',
    'col-tue': 'Toán học\nThầy Hùng\nP.301',
    'col-wed': '',
    'col-thu': '',
    'col-fri': '',
  },
  'row-4': {
    'col-mon': 'Tiếng Anh\nCô Lan\nP.301',
    'col-tue': '',
    'col-wed': '',
    'col-thu': '',
    'col-fri': '',
  },
  'row-5': {
    'col-mon': '',
    'col-tue': '',
    'col-wed': '',
    'col-thu': '',
    'col-fri': '',
  },
};

export const SchedulePage: React.FC = () => {
  const { selectedClassId, setSelectedClassId } = useAuth();
  const { success, warning, error } = useToast();
  const classes = db.getClasses();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const storageKey = `edusmart_schedule_matrix_${selectedClassId || 'default'}`;

  // Helper to load initial state for current class
  const loadInitialState = useCallback((): TableState => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.columns && parsed.rows && parsed.cells) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved schedule matrix', e);
    }
    return {
      columns: [...DEFAULT_INITIAL_COLUMNS],
      rows: [...DEFAULT_INITIAL_ROWS],
      cells: JSON.parse(JSON.stringify(DEFAULT_INITIAL_CELLS)),
    };
  }, [storageKey]);

  // Current table state
  const [tableState, setTableState] = useState<TableState>(loadInitialState);

  // Undo / Redo history
  const [history, setHistory] = useState<TableState[]>([loadInitialState()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modes
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Saved baseline state for cancel/revert
  const [savedBaseline, setSavedBaseline] = useState<TableState>(loadInitialState);

  // Modals
  const [showLimitPopup, setShowLimitPopup] = useState<boolean>(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importRawText, setImportRawText] = useState<string>('');

  // Editing cell inside table
  const [activeCell, setActiveCell] = useState<{ rowId: string; colId: string } | null>(null);

  // Reload state if class changes
  useEffect(() => {
    const fresh = loadInitialState();
    setTableState(fresh);
    setSavedBaseline(fresh);
    setHistory([fresh]);
    setHistoryIndex(0);
    setIsEditMode(false);
    setIsDeleteMode(false);
    setHasUnsavedChanges(false);
    setActiveCell(null);
  }, [selectedClassId, loadInitialState]);

  // Push new state to history stack
  const pushState = useCallback((newState: TableState) => {
    setTableState(newState);
    setHasUnsavedChanges(true);
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, newState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Keyboard shortcut Ctrl+Z & Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // 1. Chỉnh sửa: Bật / Tắt
  const handleToggleEdit = () => {
    if (isEditMode) {
      // Trying to turn off edit mode: if has unsaved changes, warn!
      if (hasUnsavedChanges) {
        setShowUnsavedWarning(true);
        return;
      }
      setIsEditMode(false);
      setIsDeleteMode(false);
      setActiveCell(null);
    } else {
      setIsEditMode(true);
    }
  };

  // Lưu
  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tableState));
      setSavedBaseline(tableState);
      setIsEditMode(false);
      setIsDeleteMode(false);
      setHasUnsavedChanges(false);
      setActiveCell(null);

      // Reset Undo/Redo history as per rule:
      // "Đồng thời vô hiệu hóa (disable) cả 2 nút Hoàn tác/Làm lại (vì chưa có thao tác nào mới sau khi lưu)"
      setHistory([tableState]);
      setHistoryIndex(0);

      success('Đã lưu toàn bộ thay đổi Thời khóa biểu thành công!');
    } catch (e) {
      error('Không thể lưu vào bộ nhớ');
    }
  };

  // Warning Popup Choices: Lưu hoặc Hủy
  const handleWarningSave = () => {
    setShowUnsavedWarning(false);
    handleSave();
  };

  const handleWarningCancel = () => {
    setShowUnsavedWarning(false);
    // Revert to saved baseline
    setTableState(savedBaseline);
    setIsEditMode(false);
    setIsDeleteMode(false);
    setHasUnsavedChanges(false);
    setActiveCell(null);
    setHistory([savedBaseline]);
    setHistoryIndex(0);
    warning('Đã hủy bỏ các thay đổi chưa lưu.');
  };

  // 2. Xóa: Bật / Tắt chế độ xóa
  const handleToggleDelete = () => {
    setIsDeleteMode(prev => !prev);
    if (!isDeleteMode) {
      setActiveCell(null);
    }
  };

  // 3. Hoàn tác (Undo)
  const canUndo = historyIndex > 0;
  const handleUndo = () => {
    if (canUndo) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setTableState(history[nextIndex]);
      setHasUnsavedChanges(true);
      setActiveCell(null);
    }
  };

  // 4. Làm lại (Redo)
  const canRedo = historyIndex < history.length - 1;
  const handleRedo = () => {
    if (canRedo) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setTableState(history[nextIndex]);
      setHasUnsavedChanges(true);
      setActiveCell(null);
    }
  };

  // Cell Content change
  const handleCellBlurOrChange = (rowId: string, colId: string, newText: string) => {
    const currentText = tableState.cells[rowId]?.[colId] || '';
    if (currentText === newText) return;

    const nextCells = {
      ...tableState.cells,
      [rowId]: {
        ...(tableState.cells[rowId] || {}),
        [colId]: newText,
      },
    };

    pushState({
      ...tableState,
      cells: nextCells,
    });
  };

  // Click on cell action
  const handleCellClick = (rowId: string, colId: string) => {
    if (isDeleteMode) {
      // In delete mode: click clears cell immediately without confirmation
      const currentText = tableState.cells[rowId]?.[colId] || '';
      if (currentText.trim() !== '') {
        const nextCells = {
          ...tableState.cells,
          [rowId]: {
            ...(tableState.cells[rowId] || {}),
            [colId]: '',
          },
        };
        pushState({
          ...tableState,
          cells: nextCells,
        });
      }
      return;
    }

    // Normal mode: click focuses cell for direct typing
    setActiveCell({ rowId, colId });
  };

  // --- CỘT: Thêm cột & Xóa cột ---

  // Thêm cột tại index chỉ định
  const handleInsertColumn = (index: number) => {
    if (tableState.columns.length >= 7) {
      setShowLimitPopup(true);
      return;
    }

    const newColId = `col-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newColumns = [...tableState.columns];
    newColumns.splice(index, 0, { id: newColId, title: '' });

    // Tự động gán lại tên các cột từ Thứ Hai đến Chủ Nhật
    const reorderedColumns = newColumns.map((col, idx) => ({
      ...col,
      title: WEEKDAY_NAMES[idx] || `Thứ ${idx + 2}`,
    }));

    // Tạo cells mới với ô rỗng ở cột mới chèn, giữ nguyên toàn bộ chữ ở các cột khác
    const nextCells: Record<string, Record<string, string>> = {};
    tableState.rows.forEach(r => {
      nextCells[r.id] = { ...(tableState.cells[r.id] || {}) };
      nextCells[r.id][newColId] = '';
    });

    pushState({
      ...tableState,
      columns: reorderedColumns,
      cells: nextCells,
    });
  };

  // Xóa cột tại index
  const handleDeleteColumn = (index: number) => {
    if (tableState.columns.length <= 1) {
      warning('Thời khóa biểu cần ít nhất 1 cột ngày.');
      return;
    }

    const colToDelete = tableState.columns[index];
    const newColumns = tableState.columns.filter((_, idx) => idx !== index);

    // Tự động lùi tên các cột còn lại đúng thứ tự từ Thứ Hai trở đi
    // Dữ liệu bên trong từng cột giữ nguyên!
    const reorderedColumns = newColumns.map((col, idx) => ({
      ...col,
      title: WEEKDAY_NAMES[idx] || `Thứ ${idx + 2}`,
    }));

    const nextCells: Record<string, Record<string, string>> = {};
    tableState.rows.forEach(r => {
      const rowCells = { ...(tableState.cells[r.id] || {}) };
      delete rowCells[colToDelete.id];
      nextCells[r.id] = rowCells;
    });

    pushState({
      ...tableState,
      columns: reorderedColumns,
      cells: nextCells,
    });
  };

  // --- HÀNG: Thêm hàng & Xóa hàng ---

  // Thêm hàng tại index chỉ định
  const handleInsertRow = (index: number) => {
    const newRowId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newRows = [...tableState.rows];
    newRows.splice(index, 0, { id: newRowId, title: '' });

    // Tự động đánh số lại: Tiết 1, Tiết 2, Tiết 3...
    const reorderedRows = newRows.map((r, idx) => ({
      ...r,
      title: `Tiết ${idx + 1}`,
    }));

    const nextCells: Record<string, Record<string, string>> = {
      ...tableState.cells,
      [newRowId]: {},
    };

    pushState({
      ...tableState,
      rows: reorderedRows,
      cells: nextCells,
    });
  };

  // Xóa hàng tại index
  const handleDeleteRow = (index: number) => {
    if (tableState.rows.length <= 1) {
      warning('Thời khóa biểu cần ít nhất 1 hàng tiết học.');
      return;
    }

    const rowToDelete = tableState.rows[index];
    const newRows = tableState.rows.filter((_, idx) => idx !== index);

    // Tự động đánh số lại: Tiết 1, Tiết 2... dữ liệu bên trong giữ nguyên!
    const reorderedRows = newRows.map((r, idx) => ({
      ...r,
      title: `Tiết ${idx + 1}`,
    }));

    const nextCells = { ...tableState.cells };
    delete nextCells[rowToDelete.id];

    pushState({
      ...tableState,
      rows: reorderedRows,
      cells: nextCells,
    });
  };

  // 5. Import Excel / CSV
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importRawText.trim()) return;

    const lines = importRawText.trim().split(/\r?\n/);
    if (lines.length < 1) return;

    // Detect delimiter: tab (Excel copy) or comma
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const parsedMatrix = lines.map(line =>
      line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''))
    );

    // Determine if first row is header
    const firstRow = parsedMatrix[0];
    const hasHeader = firstRow.some(item =>
      WEEKDAY_NAMES.some(w => item.toLowerCase().includes(w.toLowerCase()))
    );

    const dataRows = hasHeader ? parsedMatrix.slice(1) : parsedMatrix;
    const colCount = Math.min(Math.max(...parsedMatrix.map(r => r.length)), 7);

    const newColumns: ColumnDef[] = [];
    for (let c = 0; c < colCount; c++) {
      newColumns.push({
        id: `col-imp-${c}`,
        title: WEEKDAY_NAMES[c] || `Thứ ${c + 2}`,
      });
    }

    const newRows: RowDef[] = [];
    const newCells: Record<string, Record<string, string>> = {};

    dataRows.forEach((rowItems, rIdx) => {
      const rowId = `row-imp-${rIdx}`;
      newRows.push({
        id: rowId,
        title: `Tiết ${rIdx + 1}`,
      });
      newCells[rowId] = {};
      rowItems.forEach((val, cIdx) => {
        if (cIdx < colCount) {
          const colId = newColumns[cIdx].id;
          newCells[rowId][colId] = val;
        }
      });
    });

    pushState({
      columns: newColumns,
      rows: newRows,
      cells: newCells,
    });

    setShowImportModal(false);
    setImportRawText('');
    success('Đã nhập thành công bảng Thời khóa biểu từ Excel!');
  };

  // 6. Xuất file: CSV / In
  const handleExportCSV = () => {
    const headers = ['Tiết', ...tableState.columns.map(c => `"${c.title}"`)];
    const dataRows = tableState.rows.map(r => {
      const rowValues = tableState.columns.map(c => {
        const text = tableState.cells[r.id]?.[c.id] || '';
        return `"${text.replace(/"/g, '""')}"`;
      });
      return [`"${r.title}"`, ...rowValues].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...dataRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Thoi_khoa_bieu_${currentClass?.name || 'lop'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    success('Đã tải xuống file CSV Thời khóa biểu');
  };

  return (
    <div className="space-y-4">
      {/* 1. KHU VỰC THANH CHỨC NĂNG (TOP BAR) - ĐÚNG 6 NÚT CHÍNH NẰM TRÊN CÙNG MỘT THANH NGANG */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Nút 1: Chỉnh sửa (Bật/tắt chế độ sửa) */}
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isEditMode
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Đang sửa' : 'Chỉnh sửa'}</span>
          </button>

          {/* Nút Lưu (Chỉ xuất hiện khi bật chế độ Chỉnh sửa) */}
          {isEditMode && (
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer animate-in fade-in zoom-in-95 whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </button>
          )}

          {/* Nút Thêm mới ngày học (Xuất hiện khi bật chế độ Chỉnh sửa) */}
          {isEditMode && (
            <button
              type="button"
              onClick={() => handleInsertColumn(tableState.columns.length)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-all cursor-pointer animate-in fade-in zoom-in-95 whitespace-nowrap shrink-0"
              title="Thêm mới ngày học (Thứ Bảy, Chủ Nhật...)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mới ngày học</span>
            </button>
          )}

          {/* Nút 2: Xóa (Màu đỏ, nằm cạnh nút Chỉnh sửa) */}
          <button
            type="button"
            onClick={handleToggleDelete}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isDeleteMode
                ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-400'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleteMode ? 'Đang bật Xóa' : 'Xóa'}</span>
          </button>

          {/* Nút 3: Hoàn tác (Icon mũi tên trái, hoạt động như Ctrl+Z) */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              canUndo
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Nút 4: Làm lại (Icon mũi tên phải, hoạt động như Ctrl+Y) */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              canRedo
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Nút 5: Import Excel */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          {/* Nút 6: Xuất file */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Xuất file</span>
          </button>
        </div>

        {/* Lựa chọn lớp (giữ tính năng chọn lớp của hệ thống) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Lớp:</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thông báo trạng thái xóa nếu đang bật */}
      {isDeleteMode && (
        <div className="p-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Chế độ Xóa đang BẬT: Nhấp vào ô, hàng hoặc cột để xóa ngay lập tức (không cần xác nhận).</span>
          </div>
          <button
            onClick={() => setIsDeleteMode(false)}
            className="text-xs text-rose-700 underline font-bold"
          >
            Tắt chế độ Xóa
          </button>
        </div>
      )}

      {/* BẢNG THỜI KHÓA BIỂU WORD-STYLE */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-x-auto shadow-2xs">
        <table className="w-full border-collapse text-xs table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              {/* Cột góc: Tiết / Giờ */}
              <th className="p-3 text-center font-bold text-slate-700 border-r border-slate-300 w-24">
                Tiết / Giờ
              </th>

              {/* Các cột ngày */}
              {tableState.columns.map((col, colIdx) => (
                <th
                  key={col.id}
                  className="relative p-3 text-center font-bold text-slate-800 border-r border-slate-300 group/col"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{col.title}</span>

                    {/* Nút xóa cột (Icon thùng rác đỏ hiển thị rõ ràng khi bật Chỉnh sửa hoặc chế độ Xóa) */}
                    {(isDeleteMode || isEditMode) && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteColumn(colIdx);
                        }}
                        className="p-1 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 hover:shadow-xs transition-all cursor-pointer shrink-0"
                        title={`Xóa cột ${col.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Nút "+" chèn cột giữa 2 cột (hoặc mép phải cột cuối) */}
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      handleInsertColumn(colIdx + 1);
                    }}
                    className="absolute -right-2.5 top-0 bottom-0 w-5 flex items-center justify-center z-20 cursor-pointer group/divider"
                    title={`Chèn thêm cột vào đây`}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs opacity-0 group-hover/divider:opacity-100 hover:scale-110 transition-all">
                      <Plus className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </th>
              ))}

              {/* Cột "Thêm mới ngày học" xuất hiện ngay trên tiêu đề khi bấm vào Chỉnh sửa */}
              {isEditMode && (
                <th className="p-2 text-center border-r border-slate-300 w-44 bg-blue-50/80 hover:bg-blue-100 transition-colors">
                  <button
                    type="button"
                    onClick={() => handleInsertColumn(tableState.columns.length)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                    title="Thêm mới ngày học tiếp theo (Thứ Bảy, Chủ Nhật...)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm mới ngày học</span>
                  </button>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300">
            {tableState.rows.map((row, rowIdx) => (
              <tr key={row.id} className="relative group/row hover:bg-slate-50/50 transition-colors">
                {/* Header hàng */}
                <td className="relative p-2.5 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-300 align-middle">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{row.title}</span>

                    {/* Nút xóa hàng (Icon thùng rác đỏ hiển thị rõ ràng khi bật Chỉnh sửa hoặc chế độ Xóa) */}
                    {(isDeleteMode || isEditMode) && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteRow(rowIdx);
                        }}
                        className="p-1 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 hover:shadow-xs transition-all cursor-pointer shrink-0"
                        title={`Xóa hàng ${row.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Nút "+" chèn hàng giữa 2 hàng */}
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      handleInsertRow(rowIdx + 1);
                    }}
                    className="absolute left-0 right-0 -bottom-2.5 h-5 flex items-center justify-center z-20 cursor-pointer group/rowdivider"
                    title={`Chèn thêm hàng vào đây`}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs opacity-0 group-hover/rowdivider:opacity-100 hover:scale-110 transition-all">
                      <Plus className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </td>

                {/* Các ô dữ liệu */}
                {tableState.columns.map(col => {
                  const cellText = tableState.cells[row.id]?.[col.id] || '';
                  const isEditingThisCell =
                    activeCell?.rowId === row.id && activeCell?.colId === col.id;

                  return (
                    <td
                      key={col.id}
                      onClick={() => handleCellClick(row.id, col.id)}
                      className={`relative p-2 border-r border-slate-300 align-top transition-colors min-h-[64px] ${
                        isDeleteMode
                          ? 'hover:bg-rose-50 cursor-pointer'
                          : 'cursor-text hover:bg-blue-50/20'
                      }`}
                    >
                      {isEditingThisCell ? (
                        <textarea
                          autoFocus
                          defaultValue={cellText}
                          placeholder="Gõ môn học, giáo viên, phòng..."
                          onBlur={e => {
                            handleCellBlurOrChange(row.id, col.id, e.target.value);
                            setActiveCell(null);
                          }}
                          onKeyDown={e => {
                            // Enter creates new line inside cell (Word-style)
                            if (e.key === 'Enter') {
                              // Native textarea behavior creates new line
                              e.stopPropagation();
                            }
                          }}
                          className="w-full min-h-[60px] p-1.5 text-xs text-slate-900 bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden leading-relaxed"
                          style={{
                            height: 'auto',
                          }}
                          ref={el => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
                            }
                          }}
                          onInput={e => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.max(target.scrollHeight, 60)}px`;
                          }}
                        />
                      ) : (
                        <div className="min-h-[56px] p-1.5 whitespace-pre-wrap break-words text-slate-800 leading-relaxed font-normal">
                          {cellText ? (
                            cellText
                          ) : (
                            <span className="text-slate-300 italic select-none">
                              {isEditMode ? 'Nhấp để gõ...' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Ô tương ứng với cột Thêm mới ngày học khi ở chế độ Chỉnh sửa */}
                {isEditMode && (
                  <td className="p-2 border-r border-slate-200 bg-slate-50/30 text-center align-middle text-slate-300">
                    <span className="text-[10px] select-none">—</span>
                  </td>
                )}
              </tr>
            ))}

            {/* Hàng thêm tiết học khi bật Chỉnh sửa */}
            {isEditMode && (
              <tr className="bg-slate-50/70 border-t border-slate-300">
                <td className="p-2 text-center bg-slate-100 border-r border-slate-300">
                  <button
                    type="button"
                    onClick={() => handleInsertRow(tableState.rows.length)}
                    className="flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    title="Thêm mới tiết học tiếp theo"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm tiết</span>
                  </button>
                </td>
                <td
                  colSpan={tableState.columns.length + 1}
                  className="p-2.5 text-slate-400 text-xs italic text-center"
                >
                  Chế độ Chỉnh sửa đang bật: Nhấp vào ô để gõ nội dung · Nhấp biểu tượng thùng rác màu đỏ để xóa · Bấm "Thêm mới ngày học" để thêm thứ trong tuần.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* POPUP GIỚI HẠN SỐ CỘT (7 NGÀY) */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Giới hạn số ngày trong tuần</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Không thể thêm cột vì một tuần chỉ có 7 ngày.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLimitPopup(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* POPUP CẢNH BÁO CHƯA LƯU THAY ĐỔI */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bạn chưa lưu thay đổi</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Các thay đổi trong bảng Thời khóa biểu chưa được lưu lại. Bạn muốn lưu hay hủy bỏ các thay đổi này?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleWarningCancel}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleWarningSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL / CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Import Thời khóa biểu từ Excel / CSV</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dán nội dung bảng từ Excel hoặc file CSV:
                </label>
                <textarea
                  rows={8}
                  placeholder={`Ví dụ sao chép từ Excel và dán vào đây:\nToán học\tVật lý\tTin học\tToán học\tTiếng Anh\nNgữ văn\tHóa học\tSinh học\tNgữ văn\tLịch sử`}
                  value={importRawText}
                  onChange={e => setImportRawText(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Nhập vào bảng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
