import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileCheck
} from 'lucide-react';

interface ParsedStudent {
  rowNumber: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  guardianName: string;
  guardianPhone: string;
  isValid: boolean;
  errors: string[];
}

export const StudentImport: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClassId, currentUser } = useAuth();
  const { success, error } = useToast();

  const classes = db.getClasses();
  const [targetClassId, setTargetClassId] = useState(selectedClassId || 'cls-9a1');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview & Validate, 3: Success
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudent[]>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; valid: number; invalid: number }>({
    total: 0,
    valid: 0,
    invalid: 0
  });

  const selectedClass = classes.find(c => c.id === targetClassId) || classes[0];

  const sampleCsv = `Mã học sinh,Họ và tên,Ngày sinh,Giới tính,Họ tên phụ huynh,SĐT phụ huynh
HS-01,Nguyễn Văn An,2010-05-12,Nam,Nguyễn Văn Bình,0912345678
HS-02,Trần Thị Mai,2010-08-24,Nữ,Trần Văn Cường,0987654321
HS-03,Lê Hoàng Nam,2010-02-18,Nam,Lê Thị Hằng,0903123456`;

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + sampleCsv;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mau_danh_sach_hoc_sinh_${selectedClass.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã tải xuống file CSV mẫu');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result as string;
        setRawText(text);
        processCsv(text);
      };
      reader.readAsText(file);
    }
  };

  const handleUseSample = () => {
    setRawText(sampleCsv);
    processCsv(sampleCsv);
  };

  const processCsv = (content: string) => {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      error('File CSV không có dữ liệu hoặc thiếu dòng tiêu đề');
      return;
    }

    // Skip header line
    const dataLines = lines.slice(1);
    const existingStudents = db.getStudents();
    const rows: ParsedStudent[] = [];

    dataLines.forEach((line, idx) => {
      const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      const rowNum = idx + 2; // Line 1 is header
      const rowErrors: string[] = [];

      const studentCode = parts[0] || '';
      const fullName = parts[1] || '';
      const dateOfBirth = parts[2] || '';
      const genderRaw = parts[3] || 'Nam';
      const guardianName = parts[4] || '';
      const guardianPhone = parts[5] || '';

      // Validation
      if (!fullName) {
        rowErrors.push('Cột [Họ và tên] không được để trống');
      }

      if (studentCode && existingStudents.some(s => s.studentCode.toLowerCase() === studentCode.toLowerCase())) {
        rowErrors.push(`Cột [Mã học sinh] "${studentCode}" đã tồn tại trong hệ thống`);
      }

      if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
        rowErrors.push('Cột [Ngày sinh] sai định dạng (Yêu cầu: YYYY-MM-DD)');
      }

      const gender = (genderRaw.toLowerCase() === 'nữ' || genderRaw.toLowerCase() === 'female') ? 'Nữ' : 'Nam';

      rows.push({
        rowNumber: rowNum,
        studentCode: studentCode || `HS-${selectedClass.name}-${String(idx + 1).padStart(2, '0')}`,
        fullName,
        dateOfBirth: dateOfBirth || '2010-01-01',
        gender,
        guardianName,
        guardianPhone,
        isValid: rowErrors.length === 0,
        errors: rowErrors
      });
    });

    const validCount = rows.filter(r => r.isValid).length;
    const invalidCount = rows.length - validCount;

    setParsedRows(rows);
    setImportSummary({ total: rows.length, valid: validCount, invalid: invalidCount });
    setStep(2);
  };

  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      error('Không có bản ghi hợp lệ nào để nhập!');
      return;
    }

    const payload = validRows.map(r => ({
      studentCode: r.studentCode,
      fullName: r.fullName,
      dateOfBirth: r.dateOfBirth,
      gender: r.gender,
      guardianName: r.guardianName,
      guardianPhone: r.guardianPhone,
      className: selectedClass.name,
      status: 'enrolled' as const
    }));

    const result = db.importStudents(targetClassId, payload);
    db.logAudit(
      currentUser.fullName,
      'Giáo viên',
      'Import học sinh từ file',
      'students',
      `Lớp ${selectedClass.name}`,
      `Nhập thành công ${result.success} học sinh`
    );

    success(`Nhập thành công ${result.success} học sinh vào lớp ${selectedClass.name}!`);
    setStep(3);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/teacher/students')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách học sinh</span>
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Nhập danh sách học sinh từ file CSV / Excel
          </h1>
        </div>
      </div>

      {/* Steps breadcrumbs */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <div className={`p-2.5 rounded-xl border ${step === 1 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-400 border-slate-200'}`}>
          1. Tải lên file dữ liệu
        </div>
        <div className={`p-2.5 rounded-xl border ${step === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-400 border-slate-200'}`}>
          2. Kiểm tra & Báo lỗi dòng
        </div>
        <div className={`p-2.5 rounded-xl border ${step === 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
          3. Hoàn tất nhập
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn lớp học tiếp nhận học sinh *
            </label>
            <select
              value={targetClassId}
              onChange={e => setTargetClassId(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.room})
                </option>
              ))}
            </select>
          </div>

          {/* Download sample box */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-blue-900">File mẫu chuẩn EduSmart (.CSV)</div>
              <div className="text-[11px] text-blue-700 mt-0.5">
                Bao gồm các cột: Mã học sinh, Họ và tên, Ngày sinh (YYYY-MM-DD), Giới tính, Phụ huynh, SĐT.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải file mẫu
              </button>
              <button
                type="button"
                onClick={handleUseSample}
                className="px-3 py-1.5 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors"
              >
                Dùng dữ liệu mẫu
              </button>
            </div>
          </div>

          {/* Upload drop zone */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">Kéo thả file CSV vào đây hoặc duyệt từ máy tính</h3>
            <p className="text-[11px] text-slate-400 mt-1">Định dạng hỗ trợ: .csv, .txt (mã hóa UTF-8)</p>
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={handleFileUpload}
              className="mt-4 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {/* Direct CSV Paste area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hoặc dán nội dung CSV trực tiếp vào đây:
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Dán nội dung CSV..."
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => processCsv(rawText)}
                disabled={!rawText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Phân tích dữ liệu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW & VALIDATE */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs text-slate-400 font-semibold">Tổng bản ghi</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">{importSummary.total}</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-xs text-emerald-700 font-semibold">Hợp lệ để lưu</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-0.5 tabular-nums">{importSummary.valid}</div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="text-xs text-rose-700 font-semibold">Bị lỗi cần sửa</div>
              <div className="text-xl font-extrabold text-rose-600 mt-0.5 tabular-nums">{importSummary.invalid}</div>
            </div>
          </div>

          {/* Validation Notice */}
          {importSummary.invalid > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo xác thực:</strong> Hệ thống đã phát hiện {importSummary.invalid} dòng có lỗi. Các dòng bị lỗi sẽ hiển thị chi tiết dòng/cột bên dưới và bị bỏ qua để bảo đảm toàn vẹn dữ liệu.
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                  <th className="p-2.5 pl-3">Dòng</th>
                  <th className="p-2.5">Mã HS</th>
                  <th className="p-2.5">Họ và tên</th>
                  <th className="p-2.5">Ngày sinh</th>
                  <th className="p-2.5">Giới tính</th>
                  <th className="p-2.5">Phụ huynh</th>
                  <th className="p-2.5 pr-3">Trạng thái xác thực</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((r, i) => (
                  <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                    <td className="p-2.5 pl-3 font-mono text-slate-400 tabular-nums">{r.rowNumber}</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-800">{r.studentCode}</td>
                    <td className="p-2.5 font-bold text-slate-900">{r.fullName || <span className="text-rose-600 italic">Trống</span>}</td>
                    <td className="p-2.5 text-slate-600">{r.dateOfBirth}</td>
                    <td className="p-2.5 text-slate-600">{r.gender}</td>
                    <td className="p-2.5 text-slate-600">{r.guardianName} ({r.guardianPhone})</td>
                    <td className="p-2.5 pr-3">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                        </span>
                      ) : (
                        <div className="text-[11px] text-rose-700 font-medium">
                          {r.errors.map((err, ei) => (
                            <div key={ei}>• {err}</div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              ← Chọn file khác
            </button>

            <button
              type="button"
              onClick={handleCommitImport}
              disabled={importSummary.valid === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Tiến hành lưu {importSummary.valid} học sinh vào lớp {selectedClass.name}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <FileCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Nhập danh sách học sinh thành công!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Dữ liệu học sinh đã được nạp đầy đủ vào lớp {selectedClass.name}. Sĩ số lớp và hồ sơ học sinh đã được đồng bộ tự động.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('/teacher/students')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Xem danh sách học sinh
            </button>
            <button
              onClick={() => { setStep(1); setRawText(''); setParsedRows([]); }}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Nhập tiếp lớp khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
