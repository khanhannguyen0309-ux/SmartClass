import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  CalendarCheck,
  FileText,
  TableProperties,
  Award,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, selectedStudentId } = useAuth();
  const navigate = useNavigate();

  const student = db.getStudentById(selectedStudentId || 'stu-9a1-01') || db.getStudents()[0];
  const assignments = db.getAssignments(student?.classId || 'cls-9a1');
  const submissions = db.getStudentSubmissions(student?.id || 'stu-9a1-01');
  const rewards = db.getRewards(student?.id || 'stu-9a1-01');
  const schedules = db.getSchedules(student?.classId || 'cls-9a1');
  const gradeRows = db.getGradeRows(student?.classId || 'cls-9a1');
  const studentGrade = gradeRows.find(r => r.studentId === student?.id);

  const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay() + 1;
  const todaySchedules = schedules.filter(s => s.dayOfWeek === (currentDayOfWeek || 2)).sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-emerald-100">
            Cổng thông tin học sinh
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2">
            Xin chào, {student?.fullName || currentUser.fullName}!
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Lớp {student?.className || '9A1'} · Mã học sinh: <strong className="text-white font-mono">{student?.studentCode}</strong> · THCS Trưng Vương
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <div className="text-[10px] text-emerald-200 font-semibold uppercase">Điểm trung bình</div>
            <div className="text-xl font-extrabold text-white tabular-nums">{studentGrade?.averageScore || 8.6}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <div className="text-[10px] text-emerald-200 font-semibold uppercase">Chuyên cần</div>
            <div className="text-xl font-extrabold text-white tabular-nums">99%</div>
          </div>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/student/assignments')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bài tập cần nộp</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {assignments.length - submissions.length > 0 ? assignments.length - submissions.length : 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đã hoàn thành {submissions.length} bài</div>
        </div>

        <div
          onClick={() => navigate('/student/grades')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Học lực kỳ 1</span>
            <TableProperties className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">Giỏi</div>
          <div className="text-[11px] text-slate-400 mt-1">ĐTB: {studentGrade?.averageScore || 8.6}</div>
        </div>

        <div
          onClick={() => navigate('/student/badges')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Huy hiệu đạt được</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tabular-nums">{rewards.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ngôi sao Toán học</div>
        </div>

        <div
          onClick={() => navigate('/student/attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Hôm nay</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">Có mặt</div>
          <div className="text-[11px] text-slate-400 mt-1">Đi học đúng giờ</div>
        </div>
      </div>

      {/* 2-Column: Schedule & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Lịch học hôm nay (Thứ {currentDayOfWeek})</h3>
            <button
              onClick={() => navigate('/student/schedule')}
              className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
            >
              Toàn bộ TKB <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {todaySchedules.map(sch => (
              <div
                key={sch.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                    T{sch.period}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{sch.subjectName}</div>
                    <div className="text-[11px] text-slate-400">{sch.startTime} - {sch.endTime} · GV: {sch.teacherName}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  Phòng {sch.room}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Homework */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Bài tập đang giao</h3>
            <button
              onClick={() => navigate('/student/assignments')}
              className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
            >
              Nộp bài tập <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {assignments.map(asg => {
              const sub = submissions.find(s => s.assignmentId === asg.id);
              return (
                <div key={asg.id} className="p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{asg.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Môn {asg.subjectName} · Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      sub ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub ? (sub.score ? `Đã chấm: ${sub.score}đ` : 'Đã nộp bài') : 'Chưa nộp'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
