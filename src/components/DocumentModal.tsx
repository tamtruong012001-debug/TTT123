import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Paperclip, 
  Inbox, 
  Send, 
  AlertCircle, 
  Calendar, 
  FileText,
  Shield,
  Clock,
  UserCheck,
  HardDrive,
  UploadCloud,
  Eye,
  Download,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { DocumentItem, DocumentType, UrgencyLevel, SecurityLevel, DocumentStatus, User } from '../types';
import { getTodayString, CATEGORIES_LIST, CADRES_LIST } from '../utils/documentUtils';
import { readFileAsDataUrl, parseFileNameToDocumentData } from '../utils/fileImportUtils';
import { FilePreviewModal } from './FilePreviewModal';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Partial<DocumentItem>) => void;
  initialDocument?: DocumentItem | null;
  defaultType?: DocumentType;
  currentUser: User;
  initialFile?: File | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDocument,
  defaultType = 'DEN',
  currentUser,
  initialFile = null,
}) => {
  const isCommander = currentUser.role === 'CHIHUY';
  const isEditing = !!initialDocument;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [docType, setDocType] = useState<DocumentType>(defaultType);
  const [code, setCode] = useState('');
  const [incomingNumber, setIncomingNumber] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Công văn');
  const [issueDate, setIssueDate] = useState(getTodayString());
  const [receivedDate, setReceivedDate] = useState(getTodayString());
  const [sentDate, setSentDate] = useState(getTodayString());
  const [senderOrg, setSenderOrg] = useState('');
  const [receiverOrg, setReceiverOrg] = useState('');
  const [signer, setSigner] = useState('');
  const [drafter, setDrafter] = useState('');
  const [assignedTo, setAssignedTo] = useState(CADRES_LIST[0]);
  const [urgency, setUrgency] = useState<UrgencyLevel>('THUONG');
  const [security, setSecurity] = useState<SecurityLevel>('THUONG');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('CHO_XU_LY');
  const [directive, setDirective] = useState('');
  const [notes, setNotes] = useState('');
  
  // File attachments state
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentSize, setAttachmentSize] = useState('');
  const [attachmentData, setAttachmentData] = useState<string | undefined>(undefined);
  const [attachmentType, setAttachmentType] = useState<string | undefined>(undefined);
  
  // UI helper states
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Process a file chosen from local computer disk
  const processUploadedFile = async (file: File, autoPopulateForm = false) => {
    try {
      const fileResult = await readFileAsDataUrl(file);
      setAttachmentName(fileResult.name);
      setAttachmentSize(fileResult.size);
      setAttachmentData(fileResult.dataUrl);
      setAttachmentType(fileResult.type);

      const parsed = parseFileNameToDocumentData(file);
      
      // If requested or if fields are empty, auto populate title & code
      if (autoPopulateForm || !title.trim()) {
        setTitle(parsed.title);
      }
      if (autoPopulateForm || !code.trim()) {
        setCode(parsed.code);
      }
      if (autoPopulateForm || category === 'Công văn') {
        setCategory(parsed.category);
      }
      if (!isEditing && parsed.inferredType) {
        setDocType(parsed.inferredType);
      }

      setFileMessage(`Đã nạp tệp "${file.name}" (${fileResult.size}) từ ổ đĩa máy tính!`);
      setTimeout(() => setFileMessage(null), 5000);
    } catch (err) {
      console.error('Lỗi đọc tệp từ ổ đĩa', err);
      setError('Không thể đọc tệp từ ổ đĩa máy tính. Vui lòng kiểm tra lại!');
    }
  };

  // Reset or fill form when opening
  useEffect(() => {
    if (initialDocument) {
      setDocType(initialDocument.type);
      setCode(initialDocument.code || '');
      setIncomingNumber(initialDocument.incomingNumber || '');
      setTitle(initialDocument.title || '');
      setCategory(initialDocument.category || 'Công văn');
      setIssueDate(initialDocument.issueDate || getTodayString());
      setReceivedDate(initialDocument.receivedDate || getTodayString());
      setSentDate(initialDocument.sentDate || getTodayString());
      setSenderOrg(initialDocument.senderOrg || '');
      setReceiverOrg(initialDocument.receiverOrg || '');
      setSigner(initialDocument.signer || '');
      setDrafter(initialDocument.drafter || '');
      setAssignedTo(initialDocument.assignedTo || CADRES_LIST[0]);
      setUrgency(initialDocument.urgency || 'THUONG');
      setSecurity(initialDocument.security || 'THUONG');
      setDeadline(initialDocument.deadline || '');
      setStatus(initialDocument.status || 'CHO_XU_LY');
      setDirective(initialDocument.directive || '');
      setNotes(initialDocument.notes || '');
      setAttachmentName(initialDocument.attachmentName || '');
      setAttachmentSize(initialDocument.attachmentSize || '');
      setAttachmentData(initialDocument.attachmentData);
      setAttachmentType(initialDocument.attachmentType);
    } else {
      setDocType(defaultType);
      setCode('');
      setIncomingNumber(defaultType === 'DEN' ? `Đ-${Math.floor(100 + Math.random() * 900)}` : '');
      setTitle('');
      setCategory('Công văn');
      setIssueDate(getTodayString());
      setReceivedDate(getTodayString());
      setSentDate(getTodayString());
      setSenderOrg(defaultType === 'DEN' ? 'Ủy ban nhân dân Tỉnh' : 'Ban Chỉ huy đơn vị');
      setReceiverOrg(defaultType === 'DEN' ? 'Ban Chỉ huy đơn vị' : 'Ủy ban nhân dân Tỉnh');
      setSigner(defaultType === 'DI' ? 'Trung tá Quách Tấn Đạt' : '');
      setDrafter(currentUser.fullName);
      setAssignedTo(CADRES_LIST[0]);
      setUrgency('THUONG');
      setSecurity('THUONG');
      setDeadline('');
      setStatus(defaultType === 'DEN' ? 'CHO_XU_LY' : 'DU_THAO');
      setDirective('');
      setNotes('');
      setAttachmentName('');
      setAttachmentSize('');
      setAttachmentData(undefined);
      setAttachmentType(undefined);
    }
    setError('');
    setFileMessage(null);

    // If initialFile is passed from disk import action
    if (initialFile && isOpen) {
      processUploadedFile(initialFile, true);
    }
  }, [initialDocument, defaultType, isOpen, currentUser, initialFile]);

  // Adjust defaults on docType switch
  const handleTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    if (newType === 'DEN') {
      if (!incomingNumber) setIncomingNumber(`Đ-${Math.floor(100 + Math.random() * 900)}`);
      setSenderOrg('Ủy ban nhân dân Tỉnh');
      setReceiverOrg('Ban Chỉ huy đơn vị');
      setStatus('CHO_XU_LY');
    } else {
      setSenderOrg('Ban Chỉ huy đơn vị');
      setReceiverOrg('Ủy ban nhân dân Tỉnh');
      setStatus('DU_THAO');
      setSigner('Trung tá Quách Tấn Đạt');
    }
  };

  // Handle disk file upload via input
  const handleDiskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processUploadedFile(file, !title.trim());
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file, !title.trim());
    }
  };

  // Re-run auto extraction if user wants to refresh info from the current file name
  const handleReExtractInfo = () => {
    if (!attachmentName) return;
    const fakeFile = new File([''], attachmentName, { type: attachmentType });
    const parsed = parseFileNameToDocumentData(fakeFile);
    setTitle(parsed.title);
    setCode(parsed.code);
    setCategory(parsed.category);
    setFileMessage('Đã tự động trích xuất lại thông tin từ tên tệp trên ổ đĩa!');
    setTimeout(() => setFileMessage(null), 3000);
  };

  const handleRemoveAttachment = () => {
    setAttachmentName('');
    setAttachmentSize('');
    setAttachmentData(undefined);
    setAttachmentType(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập Số ký hiệu văn bản!');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập Trích yếu nội dung văn bản!');
      return;
    }

    const payload: Partial<DocumentItem> = {
      type: docType,
      code: code.trim(),
      incomingNumber: docType === 'DEN' ? incomingNumber.trim() : undefined,
      title: title.trim(),
      category,
      issueDate,
      receivedDate: docType === 'DEN' ? receivedDate : undefined,
      sentDate: docType === 'DI' ? sentDate : undefined,
      senderOrg: senderOrg.trim(),
      receiverOrg: receiverOrg.trim(),
      signer: signer.trim(),
      drafter: drafter.trim(),
      assignedTo,
      urgency,
      security,
      deadline: deadline || undefined,
      status,
      directive: directive.trim(),
      notes: notes.trim(),
      attachmentName: attachmentName || undefined,
      attachmentSize: attachmentSize || undefined,
      attachmentData: attachmentData || undefined,
      attachmentType: attachmentType || undefined,
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="document-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="document-modal-box"
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/90 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs ${
                docType === 'DEN' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              {docType === 'DEN' ? <Inbox className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isEditing ? 'Chỉnh sửa hồ sơ văn bản' : 'Thêm văn bản mới vào hệ thống'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Hỗ trợ đính kèm tệp trực tiếp từ ổ đĩa máy tính (PDF, Word, Excel, ảnh scan)
              </p>
            </div>
          </div>

          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4.5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {fileMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fileMessage}</span>
              </div>
              {attachmentName && (
                <button
                  type="button"
                  onClick={handleReExtractInfo}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điền lại từ tên tệp</span>
                </button>
              )}
            </div>
          )}

          {/* Type Selector (Văn bản Đến / Đi) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/60">
            <button
              id="btn-type-den"
              type="button"
              onClick={() => handleTypeChange('DEN')}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'DEN'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Văn bản Đến</span>
            </button>
            <button
              id="btn-type-di"
              type="button"
              onClick={() => handleTypeChange('DI')}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'DI'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Văn bản Đi</span>
            </button>
          </div>

          {/* Disk File Upload Zone (Kéo thả hoặc Chọn tệp từ ổ đĩa máy tính) */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-amber-600" />
                <span>Tệp văn bản từ ổ đĩa máy tính</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                PDF, DOC, DOCX, XLSX, Ảnh scan
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleDiskFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.odt"
              className="hidden"
              id="disk-file-input"
            />

            {attachmentName ? (
              /* Attached file view card */
              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    {attachmentName.endsWith('.xlsx') || attachmentName.endsWith('.xls') ? (
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    ) : attachmentName.match(/\.(png|jpe?g)$/i) ? (
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate font-mono" title={attachmentName}>
                      {attachmentName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-600">{attachmentSize}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã nạp từ ổ đĩa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleReExtractInfo}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Tự động trích xuất lại số hiệu và trích yếu từ tên tệp"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden md:inline">Trích xuất tên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1 transition-colors cursor-pointer border border-slate-200/60"
                    title="Xem trước tệp này"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xem tệp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200/60"
                    title="Chọn tệp khác từ ổ đĩa máy tính"
                  >
                    Đổi tệp
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Xóa tệp đính kèm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag and Drop Box */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDraggingOver
                    ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  Kéo thả tệp từ ổ đĩa máy tính vào đây hoặc <span className="text-amber-700 underline">Bấm để duyệt tệp</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto font-normal">
                  Hỗ trợ tải lên trực tiếp văn bản PDF, Word (.docx, .doc), Excel (.xlsx), hình ảnh công văn scan từ máy tính cá nhân
                </p>
              </div>
            )}
          </div>

          {/* Row 1: Code & Incoming Number & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số / Ký hiệu văn bản <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-input-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: 189/UBND-NC hoặc 125/BCH"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            {docType === 'DEN' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số đến nội bộ
                </label>
                <input
                  id="modal-input-incomingNumber"
                  type="text"
                  value={incomingNumber}
                  onChange={(e) => setIncomingNumber(e.target.value)}
                  placeholder="VD: Đ-452"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cán bộ soạn thảo
                </label>
                <input
                  id="modal-input-drafter"
                  type="text"
                  value={drafter}
                  onChange={(e) => setDrafter(e.target.value)}
                  placeholder="Họ tên cán bộ soạn thảo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thể loại văn bản
              </label>
              <select
                id="modal-select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Title (Trích yếu nội dung) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Trích yếu nội dung văn bản <span className="text-red-500">*</span>
              </label>
              {attachmentName && (
                <button
                  type="button"
                  onClick={handleReExtractInfo}
                  className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Điền từ tệp đính kèm</span>
                </button>
              )}
            </div>
            <textarea
              id="modal-input-title"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: V/v triển khai công tác sẵn sàng chiến đấu, trực chỉ huy..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Row 3: Organizations & Signer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {docType === 'DEN' ? 'Cơ quan gửi / Ban hành' : 'Đơn vị ban hành'}
              </label>
              <input
                id="modal-input-senderOrg"
                type="text"
                value={senderOrg}
                onChange={(e) => setSenderOrg(e.target.value)}
                placeholder="VD: UBND Tỉnh, Bộ CHQS..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {docType === 'DEN' ? 'Đơn vị tiếp nhận' : 'Cơ quan / Nơi nhận'}
              </label>
              <input
                id="modal-input-receiverOrg"
                type="text"
                value={receiverOrg}
                onChange={(e) => setReceiverOrg(e.target.value)}
                placeholder="VD: Ban Chỉ huy đơn vị"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Người ký
              </label>
              <input
                id="modal-input-signer"
                type="text"
                value={signer}
                onChange={(e) => setSigner(e.target.value)}
                placeholder="VD: Trung tá Quách Tấn Đạt"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Dates & Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Ngày ban hành</span>
              </label>
              <input
                id="modal-input-issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {docType === 'DEN' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ngày tiếp nhận</span>
                </label>
                <input
                  id="modal-input-receivedDate"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ngày gửi đi</span>
                </label>
                <input
                  id="modal-input-sentDate"
                  type="date"
                  value={sentDate}
                  onChange={(e) => setSentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>Hạn xử lý / Hoàn thành</span>
              </label>
              <input
                id="modal-input-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-red-50/60 border border-red-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-red-950 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Urgency, Security, Status, Assigned Cadre */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Độ khẩn
              </label>
              <select
                id="modal-select-urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
              >
                <option value="THUONG">Thường</option>
                <option value="KHAN">Khẩn</option>
                <option value="THUONG_KHAN">Thượng khẩn</option>
                <option value="HOA_TOC">Hỏa tốc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Độ mật
              </label>
              <select
                id="modal-select-security"
                value={security}
                onChange={(e) => setSecurity(e.target.value as SecurityLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
              >
                <option value="THUONG">Thường</option>
                <option value="MAT">Mật</option>
                <option value="TOI_MAT">Tối mật</option>
                <option value="TUYET_MAT">Tuyệt mật</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                id="modal-select-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
              >
                {docType === 'DEN' ? (
                  <>
                    <option value="CHO_XU_LY">Chờ xử lý</option>
                    <option value="DANG_XU_LY">Đang xử lý</option>
                    <option value="HOAN_THANH">Hoàn thành</option>
                    <option value="LUU_TRU">Đã lưu trữ</option>
                  </>
                ) : (
                  <>
                    <option value="DU_THAO">Dự thảo</option>
                    <option value="CHO_DUYET">Chờ duyệt</option>
                    <option value="DA_KY_BAN_HANH">Đã ký ban hành</option>
                    <option value="DA_GUI">Đã gửi đi</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cán bộ phụ trách
              </label>
              <select
                id="modal-select-assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {CADRES_LIST.map((cadre) => (
                  <option key={cadre} value={cadre}>
                    {cadre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Directive (Ý kiến chỉ đạo của Chỉ huy) */}
          <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Ý kiến chỉ đạo của Chỉ huy:</span>
              </label>
              {isCommander && (
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-bold border border-red-200">
                  Chỉ huy duyệt & giao nhiệm vụ
                </span>
              )}
            </div>
            <textarea
              id="modal-input-directive"
              rows={2}
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              placeholder="VD: Giao Đ/c An nghiên cứu, dự thảo văn bản trả lời trước ngày 20/09..."
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-modal"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            id="btn-save-document"
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{isEditing ? 'Lưu cập nhật' : 'Lưu văn bản'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Preview Modal if user clicks Preview on attached file */}
      {attachmentName && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileName={attachmentName}
          fileData={attachmentData}
          fileType={attachmentType}
          fileSize={attachmentSize}
          docTitle={title}
        />
      )}
    </div>
  );
};
