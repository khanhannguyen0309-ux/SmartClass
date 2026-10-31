import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MessageSquareQuote, Send, User, Phone, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'parent' | 'teacher';
  senderName: string;
  text: string;
  timestamp: string;
}

export const ParentFeedback: React.FC = () => {
  const { selectedStudentId, currentUser } = useAuth();
  const { success } = useToast();

  const student = db.getStudentById(selectedStudentId || 'stu-9a1-01') || db.getStudents()[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'teacher',
      senderName: 'Thầy Nguyễn Văn Hùng (GVCN)',
      text: `Chào Bác Đức, tuần vừa rồi em ${student.fullName} học tập rất tốt, đạt điểm 10 kiểm tra 15 phút môn Toán. Thầy gửi lời khen tới em và gia đình ạ!`,
      timestamp: '08/10/2024 15:30'
    },
    {
      id: 'msg-2',
      sender: 'parent',
      senderName: 'Nguyễn Văn Đức (Phụ huynh)',
      text: 'Cảm ơn Thầy Hùng đã tận tình dạy dỗ và quan tâm đến cháu. Gia đình sẽ tiếp tục động viên cháu cố gắng hơn nữa!',
      timestamp: '08/10/2024 18:20'
    },
    {
      id: 'msg-3',
      sender: 'teacher',
      senderName: 'Thầy Nguyễn Văn Hùng (GVCN)',
      text: 'Chủ nhật này trường có buổi họp phụ huynh đầu năm lúc 8h30, kính mời Bác bớt chút thời gian tới tham dự ạ.',
      timestamp: '09/10/2024 09:10'
    }
  ]);

  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'parent',
      senderName: `${currentUser.fullName} (Phụ huynh)`,
      text: inputText.trim(),
      timestamp: new Date().toLocaleString('vi-VN')
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    success('Đã gửi tin nhắn tới Thầy Giáo viên Chủ nhiệm');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Sổ liên lạc điện tử & Trao đổi GVCN
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Kênh tương tác trực tiếp 2 chiều giữa gia đình học sinh {student.fullName} (Lớp {student.className}) và Giáo viên Chủ nhiệm
        </p>
      </div>

      {/* Teacher Contact Info Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base">
            H
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Thầy Nguyễn Văn Hùng</div>
            <div className="text-[11px] text-slate-500">Giáo viên Chủ nhiệm Lớp {student.className} · Bộ môn Toán</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">SĐT: 0988 123 456</div>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          ● Đang trực tuyến
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 min-h-96 flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[450px] p-2">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'parent' ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] text-slate-400 mb-1 px-1">
                {m.senderName} · {m.timestamp}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-2xs ${
                  m.sender === 'parent'
                    ? 'bg-purple-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập nội dung trao đổi với Thầy Cô..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Gửi tin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
