import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  FileText,
  TableProperties,
  Award,
  Bell,
  CheckCircle2,
  Phone,
  MessageSquareQuote,
  ArrowRight
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { selectedStudentId, setSelectedStudentId, currentUser } = useAuth();
  const navigate = useNavigate();

  // Test guardian with 2 children
  const guardian = db.getGuardians()[0];
  const childrenList = guardian.children;

  const currentChildInfo = childrenList.find(c => c.studentId === selectedStudentId) || childrenList[0];
  const currentStudent = db.getStudentById(currentChildInfo.studentId) || db.getStudents()[0];

  const gradeRows = db.getGradeRows(currentStudent.classId);
  const studentGrade = gradeRows.find(r => r.studentId === currentStudent.id);
  const assignments = db.getAssignments(currentStudent.classId);
  const submissions = db.getStudentSubmissions(currentStudent.id);
  const rewards = db.getRewards(currentStudent.id);
  const attendanceToday = db.getAttendance(currentStudent.classId, new Date().toISOString().split('T')[0], 1);
  const childAttToday = attendanceToday.find(a => a.studentId === currentStudent.id);

  const avg = studentGrade?.averageScore || 8.6;

  return (
    <div className="space-y-6">
      {/* Header with CHILD SWITCHER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">
              Cổng phụ huynh học sinh
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
              Kính chào phụ huynh {currentUser.fullName}!
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi tình hình học tập và sổ liên lạc điện tử năm học 2024 - 2025
            </p>
          </div>

          {/* CHILD SWITCHER (Multi-child support) */}
          <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-500 px-2">Đang xem con:</span>
            {childrenList.map(child => {
              const active = child.studentId === currentStudent.id;
              return (
                <button
                  key={child.studentId}
                  onClick={() => setSelectedStudentId(child.studentId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{child.studentName} ({child.className})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Child Identity Pill */}
        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
              {currentStudent.fullName.split(' ').pop()?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-900">{currentStudent.fullName}</div>
              <div className="text-[11px] text-slate-500">
                Lớp {currentStudent.className} · Mã HS: <strong className="font-mono text-purple-700">{currentStudent.studentCode}</strong> · GVCN: Thầy Nguyễn Văn Hùng
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/parent/profile')}
            className="px-3 py-1.5 bg-white text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold border border-purple-200 transition-colors"
          >
            Xem toàn bộ Hồ sơ 360° của con →
          </button>
        </div>
      </div>

      {/* 4 KPIs of the child */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA */}
        <div
          onClick={() => navigate('/parent/grades')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Điểm TB học tập</span>
            <TableProperties className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 tabular-nums">{avg}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Học lực Giỏi · Hạng #1/30</div>
        </div>

        {/* Attendance */}
        <div
          onClick={() => navigate('/parent/attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tỷ lệ chuyên cần</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">100%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Hôm nay: <strong className="text-emerald-700">Có mặt đúng giờ</strong>
          </div>
        </div>

        {/* Homework */}
        <div
          onClick={() => navigate('/parent/assignments')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bài tập về nhà</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {submissions.length}/{assignments.length} bài
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đã nộp đầy đủ các bài tập</div>
        </div>

        {/* Rewards */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Khen thưởng & Thi đua</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tabular-nums">{rewards.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Được tuyên dương trước lớp</div>
        </div>
      </div>

      {/* 2-Columns: Realtime Communication & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sổ liên lạc điện tử */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Sổ liên lạc & Nhận xét của Thầy Cô</h3>
            </div>
            <button
              onClick={() => navigate('/parent/messages')}
              className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
            >
              Xem trao đổi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950">Thầy Nguyễn Văn Hùng (GVCN & Toán)</span>
                <span className="text-[10px] text-slate-400">09/10/2024</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                "Em {currentStudent.fullName} học tập rất chăm chỉ, bài kiểm tra 15 phút vừa rồi làm rất xuất sắc và thường xuyên hỗ trợ các bạn cùng bàn giải bài tập khó."
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Cô Lê Thị Mai (Ngữ văn)</span>
                <span className="text-[10px] text-slate-400">05/10/2024</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                "Bài viết cảm nhận văn học của em có lời văn mạch lạc, chữ viết cẩn thận, phát huy tốt!"
              </p>
            </div>
          </div>
        </div>

        {/* Thông báo từ nhà trường */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Thông báo gửi tới Phụ huynh</h3>
            </div>
            <button
              onClick={() => navigate('/parent/announcements')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Tất cả →
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Lịch họp Phụ huynh học sinh đầu năm</span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Khẩn</span>
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-2">
                Kính gửi Quý Phụ huynh, cuộc họp phụ huynh đầu năm của lớp {currentStudent.className} sẽ diễn ra vào lúc 08:30 sáng Chủ Nhật ngày 13/10/2024 tại Phòng 301.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Kế hoạch khám sức khỏe định kỳ học sinh</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Toàn trường</span>
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-2">
                Trạm Y tế nhà trường phối hợp Trung tâm Y tế Quận tổ chức khám sức khỏe chuyên khoa mắt, nha học đường cho các con từ ngày 15/10.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
