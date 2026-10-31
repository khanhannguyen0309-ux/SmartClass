import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Assignment, Submission } from '../../types';
import {
  HelpCircle,
  FileText,
  CheckCircle2,
  FolderKanban,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Download,
  Upload,
  Check,
  X,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Send,
  Eye,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Zap,
  MessageSquare,
  Share2,
  FileSpreadsheet
} from 'lucide-react';

// Tab types strictly matching the requested order:
// 1. Ngân hàng câu hỏi
// 2. Giao bài tập
// 3. Chấm bài tự động
// 4. Tài liệu số
// 5. AI HỖ TRỢ
export type TeachingTab = 'questions' | 'assignments' | 'auto-grading' | 'materials' | 'ai-assistant';

interface QuestionItem {
  id: string;
  code: string;
  subject: string;
  grade: string;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  type: 'Trắc nghiệm 4 lựa chọn' | 'Đúng / Sai' | 'Tự luận ngắn';
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  createdAt: string;
}

interface DigitalMaterial {
  id: string;
  title: string;
  category: 'Giáo án CV 5512' | 'Bài giảng PowerPoint' | 'Đề cương ôn tập' | 'Tài liệu nâng cao' | 'Video bài giảng';
  subject: string;
  grade: string;
  fileType: 'PDF' | 'PPTX' | 'DOCX' | 'MP4';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
}

const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-01',
    code: 'TOAN-10-01',
    subject: 'Toán học',
    grade: 'Khối 10',
    level: 'Nhận biết',
    type: 'Trắc nghiệm 4 lựa chọn',
    content: 'Tập hợp các nghiệm của phương trình x² - 5x + 6 = 0 là:',
    options: ['{1; 6}', '{2; 3}', '{-2; -3}', '{1; 5}'],
    correctAnswer: 'B. {2; 3}',
    explanation: 'Ta có x² - 5x + 6 = (x - 2)(x - 3) = 0 nên tập nghiệm là {2; 3}.',
    createdAt: '15/10/2024'
  },
  {
    id: 'q-02',
    code: 'TOAN-10-02',
    subject: 'Toán học',
    grade: 'Khối 10',
    level: 'Thông hiểu',
    type: 'Trắc nghiệm 4 lựa chọn',
    content: 'Cho tam giác ABC có a = 6, b = 8, góc C = 60°. Độ dài cạnh c bằng bao nhiêu?',
    options: ['2√13', '2√37', '10', '2√7'],
    correctAnswer: 'A. 2√13',
    explanation: 'Theo định lý cosin: c² = a² + b² - 2ab.cos(C) = 36 + 64 - 2.6.8.cos(60°) = 52 => c = 2√13.',
    createdAt: '16/10/2024'
  },
  {
    id: 'q-03',
    code: 'VAN-10-01',
    subject: 'Ngữ văn',
    grade: 'Khối 10',
    level: 'Nhận biết',
    type: 'Trắc nghiệm 4 lựa chọn',
    content: 'Tác phẩm "Bình Ngô đại cáo" được Nguyễn Trãi sáng tác vào năm nào?',
    options: ['Năm 1427', 'Năm 1428', 'Năm 1430', 'Năm 1432'],
    correctAnswer: 'B. Năm 1428',
    explanation: 'Nguyễn Trãi thừa lệnh Lê Thái Tổ soạn "Bình Ngô đại cáo" vào đầu năm 1428 sau khi dẹp tan giặc Minh.',
    createdAt: '12/10/2024'
  },
  {
    id: 'q-04',
    code: 'ANH-10-01',
    subject: 'Tiếng Anh',
    grade: 'Khối 10',
    level: 'Vận dụng',
    type: 'Trắc nghiệm 4 lựa chọn',
    content: 'If she _______ harder, she would pass the national high school examination with flying colours.',
    options: ['studied', 'had studied', 'studies', 'will study'],
    correctAnswer: 'A. studied',
    explanation: 'Câu điều kiện loại 2 diễn tả hành động không có thật ở hiện tại: If + S + V-ed/2, S + would/could + V-inf.',
    createdAt: '14/10/2024'
  },
  {
    id: 'q-05',
    code: 'LY-10-01',
    subject: 'Vật lí',
    grade: 'Khối 10',
    level: 'Thông hiểu',
    type: 'Trắc nghiệm 4 lựa chọn',
    content: 'Một vật chuyển động thẳng nhanh dần đều với gia tốc a = 2 m/s² từ trạng thái nghỉ. Vận tốc sau 5s là:',
    options: ['5 m/s', '10 m/s', '20 m/s', '25 m/s'],
    correctAnswer: 'B. 10 m/s',
    explanation: 'Công thức v = v0 + at = 0 + 2 * 5 = 10 m/s.',
    createdAt: '17/10/2024'
  },
  {
    id: 'q-06',
    code: 'HOA-10-01',
    subject: 'Hóa học',
    grade: 'Khối 10',
    level: 'Vận dụng cao',
    type: 'Trắc nghiệm 4 lựa chọn',
    content: 'Nguyên tử của nguyên tố X có tổng số hạt p, n, e là 40. Số hạt mang điện nhiều hơn số hạt không mang điện là 12. Cấu hình electron của X là:',
    options: ['1s² 2s² 2p⁶ 3s²', '1s² 2s² 2p⁶ 3s² 3p¹', '1s² 2s² 2p⁶ 3s² 3p⁵', '1s² 2s² 2p⁶ 3s¹'],
    correctAnswer: 'B. 1s² 2s² 2p⁶ 3s² 3p¹',
    explanation: '2Z + N = 40 và 2Z - N = 12 => Z = 13 (Al), cấu hình là [Ne] 3s² 3p¹.',
    createdAt: '18/10/2024'
  }
];

const INITIAL_MATERIALS: DigitalMaterial[] = [
  {
    id: 'mat-01',
    title: 'Kế hoạch bài dạy (KHBD) Bài 3: Hàm số bậc hai theo CV 5512',
    category: 'Giáo án CV 5512',
    subject: 'Toán học',
    grade: 'Khối 10',
    fileType: 'DOCX',
    size: '1.4 MB',
    uploadedBy: 'Thầy Nguyễn Văn Hùng',
    uploadedAt: '12/10/2024',
    downloads: 42
  },
  {
    id: 'mat-02',
    title: 'Slide bài giảng tương tác: Chuyển động biến đổi đều & Đồ thị',
    category: 'Bài giảng PowerPoint',
    subject: 'Vật lí',
    grade: 'Khối 10',
    fileType: 'PPTX',
    size: '14.8 MB',
    uploadedBy: 'Cô Trần Thu Thủy',
    uploadedAt: '15/10/2024',
    downloads: 89
  },
  {
    id: 'mat-03',
    title: 'Bộ đề cương ôn tập giữa Học kì 1 - Đầy đủ đáp án và ma trận',
    category: 'Đề cương ôn tập',
    subject: 'Toán học',
    grade: 'Khối 10',
    fileType: 'PDF',
    size: '3.2 MB',
    uploadedBy: 'Tổ Toán - Tin',
    uploadedAt: '10/10/2024',
    downloads: 156
  },
  {
    id: 'mat-04',
    title: 'Tài liệu bồi dưỡng học sinh giỏi: Chuyên đề Bất đẳng thức Cauchy-Schwarz',
    category: 'Tài liệu nâng cao',
    subject: 'Toán học',
    grade: 'Khối 10',
    fileType: 'PDF',
    size: '4.8 MB',
    uploadedBy: 'Thầy Nguyễn Văn Hùng',
    uploadedAt: '05/10/2024',
    downloads: 64
  },
  {
    id: 'mat-05',
    title: 'Hệ thống video mô phỏng thí nghiệm: Sự rơi tự do trong ống Newton',
    category: 'Video bài giảng',
    subject: 'Vật lí',
    grade: 'Khối 10',
    fileType: 'MP4',
    size: '85.2 MB',
    uploadedBy: 'Phòng Thiết bị THCS Trưng Vương',
    uploadedAt: '08/10/2024',
    downloads: 110
  }
];

export const TeachingHub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClassId, setSelectedClassId, currentUser } = useAuth();
  const { success, error, warning } = useToast();
  const { confirm } = useConfirm();

  const classes = db.getClasses();
  const subjects = db.getSubjects();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Determine active tab from URL path
  const getTabFromPath = (): TeachingTab => {
    const path = location.pathname;
    if (path.includes('/questions')) return 'questions';
    if (path.includes('/assignments')) return 'assignments';
    if (path.includes('/auto-grading')) return 'auto-grading';
    if (path.includes('/materials')) return 'materials';
    if (path.includes('/ai-assistant')) return 'ai-assistant';
    return 'questions'; // Default position 1: Ngân hàng câu hỏi
  };

  const [activeTab, setActiveTab] = useState<TeachingTab>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: TeachingTab) => {
    setActiveTab(tab);
    navigate(`/teacher/teaching/${tab}`);
  };

  // =========================================================================
  // TAB 1: NGÂN HÀNG CÂU HỎI STATES
  // =========================================================================
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('all');
  const [questionLevelFilter, setQuestionLevelFilter] = useState('all');

  // Modal create question
  const [createQuestionModalOpen, setCreateQuestionModalOpen] = useState(false);
  const [newQSubject, setNewQSubject] = useState('Toán học');
  const [newQGrade, setNewQGrade] = useState('Khối 10');
  const [newQLevel, setNewQLevel] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Nhận biết');
  const [newQType, setNewQType] = useState<'Trắc nghiệm 4 lựa chọn' | 'Đúng / Sai' | 'Tự luận ngắn'>('Trắc nghiệm 4 lựa chọn');
  const [newQContent, setNewQContent] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrect, setNewQCorrect] = useState('A');
  const [newQExplanation, setNewQExplanation] = useState('');

  // AI Question Generator Modal
  const [aiQuestionModalOpen, setAiQuestionModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('Định lý hàm số sin và cosin');
  const [aiSubject, setAiSubject] = useState('Toán học');
  const [aiGrade, setAiGrade] = useState('Khối 10');
  const [aiQuestionCount, setAiQuestionCount] = useState(3);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // =========================================================================
  // TAB 2: GIAO BÀI TẬP STATES
  // =========================================================================
  const [assignments, setAssignments] = useState<Assignment[]>(db.getAssignments(selectedClassId));
  const [createAsgModalOpen, setCreateAsgModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubjectId, setAsgSubjectId] = useState(subjects[0]?.id || 'sub-toan');
  const [asgDueDate, setAsgDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [asgMaxScore, setAsgMaxScore] = useState(10);
  const [asgDescription, setAsgDescription] = useState('');

  useEffect(() => {
    setAssignments(db.getAssignments(selectedClassId));
  }, [selectedClassId]);

  // =========================================================================
  // TAB 3: CHẤM BÀI TỰ ĐỘNG STATES
  // =========================================================================
  const [autoGradingProgress, setAutoGradingProgress] = useState(0);
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [autoGradedList, setAutoGradedList] = useState([
    { id: 'sub-1', studentName: 'Nguyễn Văn An', studentCode: 'HS10001', submittedAt: '14/10/2024 20:15', score: 9.5, aiNote: 'Đúng 19/20 câu trắc nghiệm. Câu 15 lập luận rất chặt chẽ.', status: 'Đã chấm tự động' },
    { id: 'sub-2', studentName: 'Trần Thị Bình', studentCode: 'HS10002', submittedAt: '14/10/2024 20:30', score: 8.5, aiNote: 'Đúng 17/20 câu. Sai câu 8 về đổi đơn vị đo, câu 12 thiếu bước điều kiện.', status: 'Đã chấm tự động' },
    { id: 'sub-3', studentName: 'Lê Hoàng Cúc', studentCode: 'HS10003', submittedAt: '14/10/2024 21:05', score: 10.0, aiNote: 'Bài làm xuất sắc! 20/20 câu chính xác tuyệt đối.', status: 'Đã chấm tự động' },
    { id: 'sub-4', studentName: 'Phạm Đức Dũng', studentCode: 'HS10004', submittedAt: '14/10/2024 21:40', score: 7.5, aiNote: 'Đúng 15/20 câu. Cần chú ý kỹ công thức tính góc giữa hai vectơ.', status: 'Đã chấm tự động' },
    { id: 'sub-5', studentName: 'Vũ Hải Đăng', studentCode: 'HS10005', submittedAt: '14/10/2024 22:10', score: 9.0, aiNote: 'Đúng 18/20 câu. Trình bày rõ ràng, tính toán chuẩn xác.', status: 'Đã chấm tự động' },
  ]);

  // =========================================================================
  // TAB 4: TÀI LIỆU SỐ STATES
  // =========================================================================
  const [materials, setMaterials] = useState<DigitalMaterial[]>(INITIAL_MATERIALS);
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState('all');
  const [materialSearch, setMaterialSearch] = useState('');
  const [uploadMaterialModalOpen, setUploadMaterialModalOpen] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<DigitalMaterial['category']>('Giáo án CV 5512');
  const [newMatSubject, setNewMatSubject] = useState('Toán học');
  const [newMatGrade, setNewMatGrade] = useState('Khối 10');
  const [newMatFileType, setNewMatFileType] = useState<'PDF' | 'PPTX' | 'DOCX' | 'MP4'>('PDF');

  // Preview modal for materials
  const [previewMaterial, setPreviewMaterial] = useState<DigitalMaterial | null>(null);

  // =========================================================================
  // TAB 5: AI HỖ TRỢ STATES
  // =========================================================================
  const [aiAssistantMode, setAiAssistantMode] = useState<'lesson-plan' | 'matrix' | 'comment' | 'chat'>('lesson-plan');
  const [aiPromptTopic, setAiPromptTopic] = useState('Bài 5: Giá trị lượng giác của một góc từ 0° đến 180°');
  const [aiPromptSubject, setAiPromptSubject] = useState('Toán học');
  const [aiPromptGrade, setAiPromptGrade] = useState('Khối 10');
  const [aiResultText, setAiResultText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Handlers for Tab 1: Questions
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQContent.trim()) {
      error('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const options = newQType === 'Trắc nghiệm 4 lựa chọn'
      ? [`A. ${newQOptA || 'Phương án A'}`, `B. ${newQOptB || 'Phương án B'}`, `C. ${newQOptC || 'Phương án C'}`, `D. ${newQOptD || 'Phương án D'}`]
      : undefined;

    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      code: `${newQSubject.slice(0, 3).toUpperCase()}-10-${String(questions.length + 1).padStart(2, '0')}`,
      subject: newQSubject,
      grade: newQGrade,
      level: newQLevel,
      type: newQType,
      content: newQContent.trim(),
      options,
      correctAnswer: newQCorrect === 'A' ? `A. ${newQOptA}` : newQCorrect === 'B' ? `B. ${newQOptB}` : newQCorrect === 'C' ? `C. ${newQOptC}` : `D. ${newQOptD}`,
      explanation: newQExplanation.trim() || 'Lời giải chuẩn theo hướng dẫn chấm thi GDPT 2018.',
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    setQuestions([newQ, ...questions]);
    success(`Đã thêm câu hỏi mã ${newQ.code} vào Ngân hàng câu hỏi!`);
    setCreateQuestionModalOpen(false);
    setNewQContent('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQExplanation('');
  };

  const handleGenerateAiQuestions = () => {
    setIsGeneratingQuestions(true);
    setTimeout(() => {
      const generated: QuestionItem[] = [
        {
          id: `q-ai-${Date.now()}-1`,
          code: `AI-${aiSubject.slice(0, 3).toUpperCase()}-01`,
          subject: aiSubject,
          grade: aiGrade,
          level: 'Thông hiểu',
          type: 'Trắc nghiệm 4 lựa chọn',
          content: `(Sinh bởi AI) Về chủ đề "${aiTopic}": Khẳng định nào sau đây là ĐÚNG với mọi góc α (0° ≤ α ≤ 180°)?`,
          options: ['sin(180° - α) = sin α', 'cos(180° - α) = cos α', 'tan(180° - α) = tan α', 'cot(180° - α) = cot α'],
          correctAnswer: 'A. sin(180° - α) = sin α',
          explanation: 'Hai góc bù nhau có sin bằng nhau, các giá trị lượng giác còn lại đối nhau.',
          createdAt: new Date().toLocaleDateString('vi-VN')
        },
        {
          id: `q-ai-${Date.now()}-2`,
          code: `AI-${aiSubject.slice(0, 3).toUpperCase()}-02`,
          subject: aiSubject,
          grade: aiGrade,
          level: 'Vận dụng',
          type: 'Trắc nghiệm 4 lựa chọn',
          content: `(Sinh bởi AI) Cho tam giác ABC có AB = 5, AC = 8, góc A = 60°. Bán kính đường tròn ngoại tiếp R xấp xỉ bằng:`,
          options: ['4.04', '7.00', '4.62', '8.08'],
          correctAnswer: 'A. 4.04',
          explanation: 'Áp dụng định lý cosin tính BC = 7, sau đó R = BC / (2.sinA) = 7 / (2.sin60°) ≈ 4.04.',
          createdAt: new Date().toLocaleDateString('vi-VN')
        }
      ];

      setQuestions([...generated, ...questions]);
      setIsGeneratingQuestions(false);
      setAiQuestionModalOpen(false);
      success(`AI đã tự động sinh ${generated.length} câu hỏi chuẩn hóa và nạp vào ngân hàng!`);
    }, 1200);
  };

  const handleDeleteQuestion = (q: QuestionItem) => {
    confirm({
      title: `Xóa câu hỏi ${q.code}?`,
      message: 'Câu hỏi này sẽ bị gỡ bỏ khỏi Ngân hàng câu hỏi của trường.',
      isDanger: true,
      onConfirm: () => {
        setQuestions(questions.filter(item => item.id !== q.id));
        success(`Đã xóa câu hỏi ${q.code}`);
      }
    });
  };

  // Handlers for Tab 2: Assignments
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) {
      error('Vui lòng nhập tiêu đề bài tập');
      return;
    }

    const subObj = subjects.find(s => s.id === asgSubjectId) || subjects[0];
    const newAsg = db.createAssignment({
      classId: selectedClassId,
      className: currentClass.name,
      subjectId: asgSubjectId,
      subjectName: subObj.name,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      title: asgTitle.trim(),
      description: asgDescription.trim(),
      dueDate: new Date(asgDueDate).toISOString(),
      maxScore: Number(asgMaxScore),
      status: 'published',
      totalStudents: currentClass.studentCount || 32
    });

    setAssignments([newAsg, ...assignments]);
    success(`Đã giao bài tập "${newAsg.title}" cho Lớp ${currentClass.name}!`);
    setCreateAsgModalOpen(false);
    setAsgTitle('');
    setAsgDescription('');
  };

  // Handlers for Tab 3: Auto Grading
  const handleRunAutoGrading = () => {
    setIsAutoGrading(true);
    setAutoGradingProgress(0);

    const interval = setInterval(() => {
      setAutoGradingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAutoGrading(false);
          success('Đã chấm tự động thành công toàn bộ 32 bài làm! Tỉ lệ chính xác AI: 99.8%');
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Handlers for Tab 4: Materials
  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) {
      error('Vui lòng nhập tên tài liệu');
      return;
    }

    const newMat: DigitalMaterial = {
      id: `mat-${Date.now()}`,
      title: newMatTitle.trim(),
      category: newMatCategory,
      subject: newMatSubject,
      grade: newMatGrade,
      fileType: newMatFileType,
      size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      uploadedBy: currentUser.fullName,
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      downloads: 1
    };

    setMaterials([newMat, ...materials]);
    success(`Đã tải lên học liệu số: "${newMat.title}"!`);
    setUploadMaterialModalOpen(false);
    setNewMatTitle('');
  };

  // Handlers for Tab 5: AI Assistant
  const handleGenerateAiPedagogy = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      if (aiAssistantMode === 'lesson-plan') {
        setAiResultText(
`# KẾ HOẠCH BÀI DẠY (GIÁO ÁN THEO CÔNG VĂN 5512/BGDĐT)
## BÀI HỌC: ${aiPromptTopic.toUpperCase()}
**Môn học:** ${aiPromptSubject} | **Lớp:** ${aiPromptGrade} | **Thời lượng:** 2 tiết

---
### I. MỤC TIÊU BÀI HỌC
1. **Về kiến thức:**
   - Học sinh nắm vững định nghĩa, khái niệm và tính chất cốt lõi của bài học.
   - Biết vận dụng công thức vào giải quyết các dạng toán thực tế và bài tập tổng hợp.
2. **Về năng lực:**
   - *Năng lực toán học:* Tư duy và lập luận logic, mô hình hóa toán học, giải quyết vấn đề sáng tạo.
   - *Năng lực chung:* Tự chủ tự học, giao tiếp hợp tác qua hoạt động thảo luận nhóm (Khăn trải bàn).
3. **Về phẩm chất:**
   - Trung thực, trách nhiệm, kiên trì và say mê tìm tòi khoa học.

---
### II. THIẾT BỊ DẠY HỌC & HỌC LIỆU
- Giáo viên: Ti vi thông minh, slide PowerPoint tương tác, phiếu học tập số 1, 2, 3.
- Học sinh: SGK, vở ghi, máy tính cầm tay, thiết bị quét mã QR nộp bài.

---
### III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN)
- **Hoạt động 1: Khởi động (7 phút):** Tình huống thực tế đo khoảng cách giữa hai ngọn hải đăng bằng phương pháp tam giác đạc.
- **Hoạt động 2: Hình thành kiến thức mới (20 phút):** Chia 4 nhóm nghiên cứu định lý, hoàn thành phiếu học tập.
- **Hoạt động 3: Luyện tập (12 phút):** Thực hành giải 4 bài tập trắc nghiệm nhanh trên hệ thống EduSmart.
- **Hoạt động 4: Vận dụng & Mở rộng (6 phút):** Ứng dụng định lý trong đo đạc bản đồ địa lý Google Maps.`
        );
      } else if (aiAssistantMode === 'matrix') {
        setAiResultText(
`# MA TRẬN & ĐỀ KIỂM TRA ĐỊNH KỲ CHUẨN GDPT 2018
**Chủ đề:** ${aiPromptTopic}
**Thời gian:** 45 phút | **Hình thức:** 70% Trắc nghiệm (28 câu) + 30% Tự luận (3 câu)

---
### 1. BẢNG MA TRẬN ĐỀ THI
- Nhận biết (40%): 16 câu trắc nghiệm (4.0 điểm)
- Thông hiểu (30%): 12 câu trắc nghiệm (3.0 điểm)
- Vận dụng (20%): 2 câu tự luận (2.0 điểm)
- Vận dụng cao (10%): 1 câu tự luận phân hóa (1.0 điểm)

---
### 2. CÂU HỎI TỰ LUẬN ĐỀ XUẤT:
- **Câu 1 (1.0 điểm):** Cho tam giác ABC có a = 13, b = 14, c = 15. Tính diện tích tam giác ABC theo công thức Heron và tìm bán kính đường tròn nội tiếp r.
- **Câu 2 (1.0 điểm):** Hai tàu thủy xuất phát từ cùng một cảng A với góc lệch 60°. Tàu 1 chạy vận tốc 30 km/h, tàu 2 chạy 40 km/h. Hỏi sau 2 giờ khoảng cách giữa hai tàu là bao nhiêu?
- **Câu 3 (1.0 điểm - Vận dụng cao):** Chứng minh rằng trong mọi tam giác ABC, ta luôn có cot(A) + cot(B) + cot(C) ≥ √3.`
        );
      } else if (aiAssistantMode === 'comment') {
        setAiResultText(
`# GỢI Ý LỜI PHÊ & NHẬN XÉT HỌC BẠ / SỔ LIÊN LẠC ĐIỆN TỬ

1. **Dành cho học sinh xuất sắc:**
   - "Em ${aiPromptTopic} có tư duy sáng tạo xuất sắc, luôn hăng hái phát biểu và giúp đỡ các bạn trong giờ học ${aiPromptSubject}. Đạt điểm số cao ổn định, tinh thần tự giác rất đáng khen ngợi!"

2. **Dành cho học sinh khá, có tiến bộ vượt bậc:**
   - "Em rất chăm chỉ, tiến bộ rõ rệt trong các bài kiểm tra ${aiPromptSubject} gần đây. Cần tiếp tục duy trì sự tự tin khi giải quyết các câu hỏi vận dụng cao."

3. **Dành cho học sinh cần động viên, kèm cặp:**
   - "Em có ý thức nề nếp tốt, ngoan ngoãn lễ phép. Trong môn ${aiPromptSubject}, em cần chú ý củng cố lại các công thức cơ bản và chủ động trao đổi với giáo viên khi gặp bài khó."`
        );
      } else {
        setAiResultText(
`🤖 **Trợ lý AI Sư Phạm EduSmart phản hồi:**
Chào thầy/cô! Để nâng cao chất lượng giờ dạy ${aiPromptSubject} bài "${aiPromptTopic}", em xin đề xuất 3 phương pháp giảng dạy tích cực hiệu quả:
1. **Kỹ thuật KWLH (Biết - Muốn biết - Đã học - Làm thế nào):** Cho học sinh ghi chú đầu giờ để kích hoạt kiến thức nền.
2. **Game hóa bài giảng (Gamification):** Sử dụng tính năng Vòng quay may mắn và Đồng hồ bấm giờ trong mục Công cụ lớp học của EduSmart.
3. **Phân hóa đối tượng học sinh:** Giao bài tập theo 2 mức độ trên hệ thống để học sinh yếu không nản lòng, học sinh giỏi được thử thách tư duy.`
        );
      }
      success('AI đã xử lý yêu cầu sư phạm thành công!');
    }, 1000);
  };

  // Filtered lists
  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content.toLowerCase().includes(questionSearch.toLowerCase()) || q.code.toLowerCase().includes(questionSearch.toLowerCase());
    const matchSubject = questionSubjectFilter === 'all' || q.subject === questionSubjectFilter;
    const matchLevel = questionLevelFilter === 'all' || q.level === questionLevelFilter;
    return matchSearch && matchSubject && matchLevel;
  });

  const filteredMaterials = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(materialSearch.toLowerCase());
    const matchCategory = materialCategoryFilter === 'all' || m.category === materialCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP HEADER: DẠY VÀ HỌC */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold shadow-md shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  DẠY VÀ HỌC
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Phân hệ số hoá giảng dạy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Quản lý toàn diện: Ngân hàng câu hỏi · Giao bài tập · Chấm bài tự động · Tài liệu số · Trợ lý AI
              </p>
            </div>
          </div>

          {/* Class Selector Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium">Lớp đang chọn:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.studentCount || 32} HS)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5 MAIN MENU TABS STRICTLY IN THE REQUESTED ORDER */}
        {/* Vị trí 1: Ngân hàng câu hỏi */}
        {/* Vị trí 2: Giao bài tập */}
        {/* Vị trí 3: Chấm bài tự động */}
        {/* Vị trí 4: Tài liệu số */}
        {/* Vị trí 5: AI HỖ TRỢ */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar">
          {/* VỊ TRÍ SỐ 1: NGÂN HÀNG CÂU HỎI */}
          <button
            onClick={() => handleTabChange('questions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>1. Ngân hàng câu hỏi</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'questions' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {questions.length}
            </span>
          </button>

          {/* VỊ TRÍ SỐ 2: GIAO BÀI TẬP */}
          <button
            onClick={() => handleTabChange('assignments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              activeTab === 'assignments'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>2. Giao bài tập</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'assignments' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {assignments.length}
            </span>
          </button>

          {/* VỊ TRÍ SỐ 3: CHẤM BÀI TỰ ĐỘNG */}
          <button
            onClick={() => handleTabChange('auto-grading')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              activeTab === 'auto-grading'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>3. Chấm bài tự động</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'auto-grading' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              Auto AI
            </span>
          </button>

          {/* VỊ TRÍ SỐ 4: TÀI LIỆU SỐ */}
          <button
            onClick={() => handleTabChange('materials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              activeTab === 'materials'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            <span>4. Tài liệu số</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'materials' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {materials.length}
            </span>
          </button>

          {/* VỊ TRÍ SỐ 5: AI HỖ TRỢ */}
          <button
            onClick={() => handleTabChange('ai-assistant')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              activeTab === 'ai-assistant'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>5. AI HỖ TRỢ</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-400 text-purple-950">
              PRO
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. NGÂN HÀNG CÂU HỎI (VỊ TRÍ SỐ 1) */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi theo nội dung, mã câu hỏi, chủ đề..."
                  value={questionSearch}
                  onChange={e => setQuestionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={questionSubjectFilter}
                onChange={e => setQuestionSubjectFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả môn học</option>
                <option value="Toán học">Toán học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Vật lí">Vật lí</option>
                <option value="Hóa học">Hóa học</option>
              </select>

              {/* Cognitive Level Filter */}
              <select
                value={questionLevelFilter}
                onChange={e => setQuestionLevelFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Mọi mức độ nhận thức</option>
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setAiQuestionModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Sinh câu hỏi bằng AI</span>
              </button>

              <button
                onClick={() => setCreateQuestionModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm câu hỏi mới</span>
              </button>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                Không tìm thấy câu hỏi phù hợp bộ lọc tìm kiếm.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q.id} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-all space-y-3">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        #{idx + 1} · {q.code}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {q.subject}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {q.grade}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        q.level === 'Nhận biết' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        q.level === 'Thông hiểu' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                        q.level === 'Vận dụng' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {q.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const copyQ = { ...q, id: `q-${Date.now()}`, code: `${q.code}-COPY` };
                          setQuestions([copyQ, ...questions]);
                          success(`Đã nhân bản câu hỏi ${q.code}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Nhân bản câu hỏi"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="text-xs md:text-sm font-semibold text-slate-900 leading-relaxed">
                    {q.content}
                  </div>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswer.startsWith(opt.slice(0, 2));
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đáp án đúng</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Note */}
                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                      <strong className="text-slate-800">Lời giải chi tiết:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GIAO BÀI TẬP (VỊ TRÍ SỐ 2) */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Danh sách bài tập Lớp {currentClass.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Giao bài tập về nhà, đề tự luyện và theo dõi tiến độ nộp bài của học sinh
              </p>
            </div>

            <button
              onClick={() => setCreateAsgModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Giao bài tập mới</span>
            </button>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {assignments.map(asg => {
              const due = new Date(asg.dueDate);
              const isOverdue = due < new Date();
              return (
                <div key={asg.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {asg.subjectName || 'Toán học'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isOverdue ? 'Đã hết hạn' : 'Đang mở nộp bài'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {asg.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {asg.description || 'Hoàn thành các câu hỏi trong phiếu bài tập trước thời hạn nộp.'}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hạn nộp: {due.toLocaleDateString('vi-VN')} {due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-700">
                      Đã nộp: <strong className="text-blue-600">28/{currentClass.studentCount || 32}</strong> HS
                    </div>

                    <button
                      onClick={() => handleTabChange('auto-grading')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Chấm bài</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHẤM BÀI TỰ ĐỘNG (VỊ TRÍ SỐ 3) */}
      {/* ========================================================================= */}
      {activeTab === 'auto-grading' && (
        <div className="space-y-4">
          {/* Hero Banner for Auto-grading */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-5 md:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-blue-100 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>EduSmart AI Grader 4.0</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Chấm bài tự động & Trợ lý chấm điểm AI
              </h2>
              <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
                Chấm tự động phiếu trắc nghiệm quang học OMR, phát hiện gian lận và chấm tự luận theo barem chuẩn xác 99.8%.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={handleRunAutoGrading}
                disabled={isAutoGrading}
                className="px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-900 rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-blue-700 ${isAutoGrading ? 'animate-spin' : ''}`} />
                <span>{isAutoGrading ? `Đang chấm (${autoGradingProgress}%)` : 'Chấm tự động toàn bộ lớp'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats of the Grading Session */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Tổng số bài nộp</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">32 / 32</div>
              <div className="text-[10px] text-emerald-600 font-bold">100% hoàn thành</div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Điểm trung bình lớp</div>
              <div className="text-xl font-extrabold text-blue-600 mt-0.5 tabular-nums">8.75</div>
              <div className="text-[10px] text-slate-500 font-medium">Học lực Giỏi</div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Điểm cao nhất</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-0.5 tabular-nums">10.0</div>
              <div className="text-[10px] text-emerald-600 font-bold">3 học sinh đạt</div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Thời gian chấm</div>
              <div className="text-xl font-extrabold text-purple-600 mt-0.5 tabular-nums">1.2s</div>
              <div className="text-[10px] text-purple-600 font-bold">Tiết kiệm 95% thời gian</div>
            </div>
          </div>

          {/* Table of graded students */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3 pl-4">Học sinh</th>
                  <th className="p-3">Thời gian nộp</th>
                  <th className="p-3">Điểm số AI chấm</th>
                  <th className="p-3">Nhận xét chi tiết của hệ thống</th>
                  <th className="p-3 text-right pr-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {autoGradedList.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 pl-4 font-bold text-slate-900">
                      <div>{st.studentName}</div>
                      <div className="text-[10px] font-mono font-normal text-slate-400">{st.studentCode}</div>
                    </td>
                    <td className="p-3 text-slate-600">{st.submittedAt}</td>
                    <td className="p-3">
                      <span className={`text-sm font-extrabold px-2.5 py-1 rounded-xl ${
                        st.score >= 9 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        st.score >= 8 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {st.score.toFixed(1)} / 10
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-xs max-w-xs">{st.aiNote}</td>
                    <td className="p-3 text-right pr-4">
                      <button
                        onClick={() => success(`Đã đồng bộ điểm ${st.score} của em ${st.studentName} vào Sổ điểm điện tử!`)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-bold text-slate-700 transition-colors cursor-pointer text-[11px]"
                      >
                        Vào sổ điểm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TÀI LIỆU SỐ (VỊ TRÍ SỐ 4) */}
      {/* ========================================================================= */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tài liệu, giáo án, slide bài giảng..."
                  value={materialSearch}
                  onChange={e => setMaterialSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <select
                value={materialCategoryFilter}
                onChange={e => setMaterialCategoryFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả danh mục học liệu</option>
                <option value="Giáo án CV 5512">Giáo án CV 5512</option>
                <option value="Bài giảng PowerPoint">Bài giảng PowerPoint</option>
                <option value="Đề cương ôn tập">Đề cương ôn tập</option>
                <option value="Tài liệu nâng cao">Tài liệu nâng cao</option>
                <option value="Video bài giảng">Video bài giảng</option>
              </select>
            </div>

            <button
              onClick={() => setUploadMaterialModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Tải lên tài liệu mới</span>
            </button>
          </div>

          {/* Material Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMaterials.map(mat => (
              <div key={mat.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-all flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${
                      mat.fileType === 'PDF' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      mat.fileType === 'PPTX' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      mat.fileType === 'DOCX' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {mat.fileType} · {mat.size}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {mat.category}
                    </span>
                  </div>

                  <h4 className="text-xs md:text-sm font-bold text-slate-900 line-clamp-2">
                    {mat.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Môn: <strong className="text-slate-600">{mat.subject} ({mat.grade})</strong></div>
                    <div>Đăng bởi: {mat.uploadedBy} · {mat.uploadedAt}</div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {mat.downloads} lượt tải
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewMaterial(mat)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem trước</span>
                    </button>
                    <button
                      onClick={() => success(`Bắt đầu tải xuống file: ${mat.title}.${mat.fileType.toLowerCase()}`)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                      title="Tải về máy"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AI HỖ TRỢ (VỊ TRÍ SỐ 5) */}
      {/* ========================================================================= */}
      {activeTab === 'ai-assistant' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            {/* Header sub-modes */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Trợ lý Sư phạm AI dành cho Giáo viên
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tự động hóa công việc hành chính, soạn giáo án chuẩn và sáng tạo hoạt động dạy học
                  </p>
                </div>
              </div>

              {/* Sub Mode Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setAiAssistantMode('lesson-plan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aiAssistantMode === 'lesson-plan' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Soạn giáo án CV 5512
                </button>
                <button
                  onClick={() => setAiAssistantMode('matrix')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aiAssistantMode === 'matrix' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ma trận & Đề thi
                </button>
                <button
                  onClick={() => setAiAssistantMode('comment')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aiAssistantMode === 'comment' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Viết nhận xét học bạ
                </button>
                <button
                  onClick={() => setAiAssistantMode('chat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aiAssistantMode === 'chat' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hỏi đáp sư phạm
                </button>
              </div>
            </div>

            {/* Inputs for AI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                <select
                  value={aiPromptSubject}
                  onChange={e => setAiPromptSubject(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Toán học">Toán học</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Vật lí">Vật lí</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Lịch sử">Lịch sử</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={aiPromptGrade}
                  onChange={e => setAiPromptGrade(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Khối 6">Khối 6</option>
                  <option value="Khối 7">Khối 7</option>
                  <option value="Khối 8">Khối 8</option>
                  <option value="Khối 9">Khối 9</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ đề bài học / Tên bài</label>
                <input
                  type="text"
                  value={aiPromptTopic}
                  onChange={e => setAiPromptTopic(e.target.value)}
                  placeholder="Ví dụ: Định lý sin và cosin..."
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateAiPedagogy}
                disabled={isAiProcessing || !aiPromptTopic.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                <span>{isAiProcessing ? 'AI đang phân tích & sinh văn bản...' : 'Tạo nội dung với AI ngay'}</span>
              </button>
            </div>

            {/* AI Result Area */}
            {aiResultText && (
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kết quả sinh bởi AI EduSmart Assistant:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResultText);
                        success('Đã sao chép nội dung vào bộ nhớ tạm!');
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </button>
                    <button
                      onClick={() => success('Đã xuất file Word (.docx) thành công!')}
                      className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Word (.docx)</span>
                    </button>
                  </div>
                </div>

                <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-200 max-h-96 overflow-y-auto">
                  {aiResultText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM CÂU HỎI MỚI */}
      {/* ========================================================================= */}
      {createQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Thêm câu hỏi mới vào Ngân hàng
                </h3>
              </div>
              <button
                onClick={() => setCreateQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={newQSubject}
                    onChange={e => setNewQSubject(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lí">Vật lí</option>
                    <option value="Hóa học">Hóa học</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={newQGrade}
                    onChange={e => setNewQGrade(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                    <option value="Khối 10">Khối 10</option>
                    <option value="Khối 11">Khối 11</option>
                    <option value="Khối 12">Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
                  <select
                    value={newQLevel}
                    onChange={e => setNewQLevel(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newQContent}
                  onChange={e => setNewQContent(e.target.value)}
                  required
                  placeholder="Nhập nội dung đề bài câu hỏi..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-700">Các phương án trả lời & Chọn đáp án đúng:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQCorrect === 'A'}
                      onChange={() => setNewQCorrect('A')}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Đáp án A"
                      value={newQOptA}
                      onChange={e => setNewQOptA(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQCorrect === 'B'}
                      onChange={() => setNewQCorrect('B')}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Đáp án B"
                      value={newQOptB}
                      onChange={e => setNewQOptB(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQCorrect === 'C'}
                      onChange={() => setNewQCorrect('C')}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Đáp án C"
                      value={newQOptC}
                      onChange={e => setNewQOptC(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQCorrect === 'D'}
                      onChange={() => setNewQCorrect('D')}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Đáp án D"
                      value={newQOptD}
                      onChange={e => setNewQOptD(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lời giải chi tiết</label>
                <textarea
                  rows={2}
                  value={newQExplanation}
                  onChange={e => setNewQExplanation(e.target.value)}
                  placeholder="Nhập lời giải hoặc hướng dẫn chấm..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateQuestionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu vào Ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINH CÂU HỎI BẰNG AI */}
      {/* ========================================================================= */}
      {aiQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Sinh câu hỏi tự động bằng AI
                </h3>
              </div>
              <button
                onClick={() => setAiQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                <select
                  value={aiSubject}
                  onChange={e => setAiSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                >
                  <option value="Toán học">Toán học</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Vật lí">Vật lí</option>
                  <option value="Hóa học">Hóa học</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={aiGrade}
                  onChange={e => setAiGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                >
                  <option value="Khối 6">Khối 6</option>
                  <option value="Khối 7">Khối 7</option>
                  <option value="Khối 8">Khối 8</option>
                  <option value="Khối 9">Khối 9</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ đề bài học</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Định lý sin và cosin trong tam giác..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lượng câu hỏi cần tạo</label>
                <select
                  value={aiQuestionCount}
                  onChange={e => setAiQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                >
                  <option value={2}>2 câu hỏi</option>
                  <option value={3}>3 câu hỏi chuẩn</option>
                  <option value={5}>5 câu hỏi phân hóa</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAiQuestionModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleGenerateAiQuestions}
                disabled={isGeneratingQuestions || !aiTopic.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer text-xs disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingQuestions ? 'animate-spin' : ''}`} />
                <span>{isGeneratingQuestions ? 'Đang tạo...' : 'Tạo và nạp vào Ngân hàng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GIAO BÀI TẬP MỚI */}
      {/* ========================================================================= */}
      {createAsgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Giao bài tập mới cho Lớp {currentClass.name}
                </h3>
              </div>
              <button
                onClick={() => setCreateAsgModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài tập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={asgTitle}
                  onChange={e => setAsgTitle(e.target.value)}
                  required
                  placeholder="Ví dụ: Bài tập rèn luyện cuối tuần số 04"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={asgSubjectId}
                    onChange={e => setAsgSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thang điểm tối đa</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={asgMaxScore}
                    onChange={e => setAsgMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hạn nộp bài</label>
                <input
                  type="datetime-local"
                  value={asgDueDate}
                  onChange={e => setAsgDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung / Yêu cầu</label>
                <textarea
                  rows={3}
                  value={asgDescription}
                  onChange={e => setAsgDescription(e.target.value)}
                  placeholder="Mô tả yêu cầu hoàn thành, đính kèm số câu hỏi hoặc bài làm..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateAsgModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TẢI LÊN HỌC LIỆU SỐ */}
      {/* ========================================================================= */}
      {uploadMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Tải lên tài liệu số mới
                </h3>
              </div>
              <button
                onClick={() => setUploadMaterialModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên tài liệu / Bài giảng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMatTitle}
                  onChange={e => setNewMatTitle(e.target.value)}
                  required
                  placeholder="Ví dụ: Giáo án điện tử Kế hoạch bài dạy Bài 4..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={newMatCategory}
                    onChange={e => setNewMatCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                  >
                    <option value="Giáo án CV 5512">Giáo án CV 5512</option>
                    <option value="Bài giảng PowerPoint">Bài giảng PowerPoint</option>
                    <option value="Đề cương ôn tập">Đề cương ôn tập</option>
                    <option value="Tài liệu nâng cao">Tài liệu nâng cao</option>
                    <option value="Video bài giảng">Video bài giảng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Định dạng file</label>
                  <select
                    value={newMatFileType}
                    onChange={e => setNewMatFileType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none"
                  >
                    <option value="PDF">Tài liệu PDF (.pdf)</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="PPTX">PowerPoint (.pptx)</option>
                    <option value="MP4">Video bài giảng (.mp4)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-blue-600">Chọn file từ máy tính</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ PDF, DOCX, PPTX, MP4 tối đa 100MB</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadMaterialModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu học liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XEM TRƯỚC TÀI LIỆU SỐ */}
      {/* ========================================================================= */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 truncate">
                <FolderKanban className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-sm font-extrabold text-slate-900 truncate">
                  {previewMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Reader Mock Area */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3 min-h-[220px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg">
                {previewMaterial.fileType}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{previewMaterial.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Định dạng: {previewMaterial.fileType} · Kích thước: {previewMaterial.size} · Danh mục: {previewMaterial.category}
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                  ✓ File đã được xác thực an toàn và sẵn sàng tải về
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Tải lên bởi: {previewMaterial.uploadedBy}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    success(`Đang tải file ${previewMaterial.title}.${previewMaterial.fileType.toLowerCase()}...`);
                    setPreviewMaterial(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải về máy tính</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
