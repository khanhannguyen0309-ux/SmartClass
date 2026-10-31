import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import {
  Wrench,
  Sparkles,
  Users,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
  Shuffle,
  Volume2,
  HelpCircle,
  Award
} from 'lucide-react';

export const ClassTools: React.FC = () => {
  const { selectedClassId, setSelectedClassId } = useAuth();
  const classes = db.getClasses();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const [students, setStudents] = useState<Student[]>(db.getStudents(selectedClassId));
  const [activeTool, setActiveTool] = useState<'wheel' | 'random' | 'groups' | 'timer' | 'quiz'>('wheel');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Avoid repeated picks
  const [noRepeat, setNoRepeat] = useState(true);
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<Student | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Random Picker state
  const [isPicking, setIsPicking] = useState(false);
  const [currentPickedStudent, setCurrentPickedStudent] = useState<Student | null>(null);

  // Group Generator state
  const [groupCount, setGroupCount] = useState(4);
  const [generatedGroups, setGeneratedGroups] = useState<Array<{ name: string; members: Student[] }>>([]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes default
  const [initialTimer, setInitialTimer] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Quick Quiz state
  const [buzzWinner, setBuzzWinner] = useState<Student | null>(null);

  useEffect(() => {
    setStudents(db.getStudents(selectedClassId));
    setPickedIds([]);
    setWheelWinner(null);
    setCurrentPickedStudent(null);
    setGeneratedGroups([]);
  }, [selectedClassId]);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ particleCount: 80, spread: 60 });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const availableStudents = noRepeat
    ? students.filter(s => !pickedIds.includes(s.id))
    : students;

  // WHEEL SPIN HANDLER
  const handleSpinWheel = () => {
    if (isSpinning || availableStudents.length === 0) return;
    setIsSpinning(true);
    setWheelWinner(null);

    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const chosen = availableStudents[randomIndex];

    // Calculate angle: multiple full rotations + target angle
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / availableStudents.length;
    const targetOffset = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const finalAngle = rotationAngle + extraRounds * 360 + targetOffset;

    setRotationAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWheelWinner(chosen);
      if (noRepeat) {
        setPickedIds(prev => [...prev, chosen.id]);
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 4000);
  };

  // RANDOM PICKER HANDLER
  const handleRandomPick = () => {
    if (isPicking || availableStudents.length === 0) return;
    setIsPicking(true);
    setWheelWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const tempIdx = Math.floor(Math.random() * availableStudents.length);
      setCurrentPickedStudent(availableStudents[tempIdx]);
      counter++;
      if (counter > 20) {
        clearInterval(interval);
        const finalChosen = availableStudents[Math.floor(Math.random() * availableStudents.length)];
        setCurrentPickedStudent(finalChosen);
        setIsPicking(false);
        if (noRepeat) {
          setPickedIds(prev => [...prev, finalChosen.id]);
        }
        confetti({ particleCount: 90, spread: 80 });
      }
    }, 80);
  };

  // GROUP GENERATOR
  const handleGenerateGroups = () => {
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const groups: Array<{ name: string; members: Student[] }> = [];

    for (let i = 0; i < groupCount; i++) {
      groups.push({ name: `Nhóm ${i + 1}`, members: [] });
    }

    shuffled.forEach((student, index) => {
      groups[index % groupCount].members.push(student);
    });

    setGeneratedGroups(groups);
    confetti({ particleCount: 50, spread: 50 });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className={`space-y-6 ${isFullscreen ? 'bg-slate-900 text-white p-8 min-h-screen' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className={`text-xl md:text-2xl font-extrabold tracking-tight ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>
            Công cụ lớp học thông minh (Class Tool Hub)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Bộ công cụ tương tác trực quan cho giờ học sôi động trên máy chiếu và màn hình tương tác
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình máy chiếu'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tool Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        {[
          { id: 'wheel', label: 'Vòng quay may mắn', icon: Sparkles },
          { id: 'random', label: 'Chọn học sinh ngẫu nhiên', icon: Shuffle },
          { id: 'groups', label: 'Chia nhóm ngẫu nhiên', icon: Users },
          { id: 'timer', label: 'Đồng hồ đếm giờ', icon: Timer },
          { id: 'quiz', label: 'Chuông trả lời nhanh', icon: Award },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                active
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Avoid repeat toggle */}
      <div className="flex items-center justify-between text-xs font-semibold px-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noRepeat}
            onChange={e => setNoRepeat(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className={isFullscreen ? 'text-slate-300' : 'text-slate-700'}>
            Chế độ tránh gọi lặp (Đã gọi: {pickedIds.length}/{students.length} học sinh)
          </span>
        </label>

        {pickedIds.length > 0 && (
          <button
            onClick={() => setPickedIds([])}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại danh sách</span>
          </button>
        )}
      </div>

      {/* TOOL 1: WHEEL OF FORTUNE */}
      {activeTool === 'wheel' && (
        <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center space-y-6 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Wheel Visual Canvas Container */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
            {/* Arrow Pointer */}
            <div className="absolute -top-3 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-16 border-t-rose-600 drop-shadow-md"></div>

            {/* Rotating SVG Wheel */}
            <svg
              className="w-full h-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1) rounded-full shadow-xl border-4 border-white"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
              viewBox="0 0 100 100"
            >
              {availableStudents.map((st, i) => {
                const count = availableStudents.length;
                const angle = 360 / count;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#4F46E5', '#EA580C'];
                const fill = colors[i % colors.length];

                return (
                  <path
                    key={st.id}
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>

            {/* Center Hub Button */}
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning || availableStudents.length === 0}
              className="absolute z-10 w-20 h-20 rounded-full bg-white text-slate-900 font-extrabold text-xs shadow-2xl flex flex-col items-center justify-center border-4 border-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-amber-500 mb-0.5" />
              <span>{isSpinning ? 'QUAY...' : 'QUAY'}</span>
            </button>
          </div>

          {/* Winner display banner */}
          {wheelWinner && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xl shadow-lg animate-in zoom-in-95">
              🎉 Xin chúc mừng: {wheelWinner.fullName} (#{wheelWinner.rollNumber})!
            </div>
          )}

          <div className="text-xs text-slate-400">
            Còn lại {availableStudents.length} học sinh có thể quay
          </div>
        </div>
      )}

      {/* TOOL 2: RANDOM PICKER */}
      {activeTool === 'random' && (
        <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-6 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-32 h-32 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200 shadow-inner">
            <Shuffle className={`w-14 h-14 ${isPicking ? 'animate-spin' : ''}`} />
          </div>

          <div className="min-h-24 flex flex-col items-center justify-center">
            {currentPickedStudent ? (
              <div className="animate-in fade-in">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">HỌC SINH ĐƯỢC CHỌN</div>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">
                  {currentPickedStudent.fullName}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Số thứ tự #{currentPickedStudent.rollNumber} · Mã {currentPickedStudent.studentCode}
                </div>
              </div>
            ) : (
              <div className="text-base text-slate-400 font-medium">
                Bấm nút "Chọn ngẫu nhiên" bên dưới để bắt đầu
              </div>
            )}
          </div>

          <button
            onClick={handleRandomPick}
            disabled={isPicking || availableStudents.length === 0}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            <span>{isPicking ? 'Đang chọn ngẫu nhiên...' : 'Chọn ngẫu nhiên 1 học sinh'}</span>
          </button>
        </div>
      )}

      {/* TOOL 3: GROUP GENERATOR */}
      {activeTool === 'groups' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Số lượng nhóm cần chia:</span>
              <div className="flex items-center gap-1">
                {[2, 3, 4, 5, 6, 8].map(n => (
                  <button
                    key={n}
                    onClick={() => setGroupCount(n)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      groupCount === n ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {n} nhóm
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateGroups}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Chia nhóm ngay ({students.length} HS)</span>
            </button>
          </div>

          {generatedGroups.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chọn số lượng nhóm và bấm "Chia nhóm ngay" để tạo danh sách phân bổ.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {generatedGroups.map((grp, gi) => (
                <div key={gi} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-200">
                    <span className="text-blue-600">{grp.name}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {grp.members.length} thành viên
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {grp.members.map((m, mi) => (
                      <div key={m.id} className="p-1.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{m.fullName}</span>
                        <span className="text-[10px] text-slate-400">#{m.rollNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: TIMER */}
      {activeTool === 'timer' && (
        <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-6 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            {[60, 180, 300, 600, 900].map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(sec);
                  setInitialTimer(sec);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  initialTimer === sec ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec / 60} phút
              </button>
            ))}
          </div>

          {/* Big Digital Display */}
          <div className="text-7xl md:text-8xl font-mono font-extrabold tracking-tight tabular-nums py-4 text-blue-600">
            {formatTimer(timerSeconds)}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-8 py-3.5 rounded-2xl text-sm font-extrabold text-white flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all ${
                isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isTimerRunning ? 'Tạm dừng' : 'Bắt đầu đếm giờ'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(initialTimer);
              }}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Đặt lại"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* TOOL 5: QUICK QUIZ BUZZER */}
      {activeTool === 'quiz' && (
        <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-6 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="text-sm font-bold text-slate-700">Mô phỏng chuông giành quyền trả lời câu hỏi</div>
          
          <button
            onClick={() => {
              const lucky = students[Math.floor(Math.random() * students.length)];
              setBuzzWinner(lucky);
              confetti({ particleCount: 70, spread: 60 });
            }}
            className="w-40 h-40 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <Award className="w-8 h-8 mb-1" />
            <span>BẤM CHUÔNG</span>
          </button>

          {buzzWinner && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-lg animate-in fade-in">
              🔔 Người giành quyền trả lời nhanh nhất: {buzzWinner.fullName} (Lớp {currentClass.name})
            </div>
          )}
        </div>
      )}
    </div>
  );
};
