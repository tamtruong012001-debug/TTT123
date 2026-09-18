import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Edit3, 
  Trash2, 
  Lock, 
  Calendar, 
  Building, 
  UserCheck, 
  Clock, 
  Paperclip, 
  Download,
  AlertTriangle,
  FileText,
  Eye,
  HardDrive
} from 'lucide-react';
import { DocumentItem, User } from '../types';
import { 
  calculateDeadlineInfo, 
  formatDateVN, 
  getUrgencyBadge, 
  getSecurityBadge, 
  getStatusBadge 
} from '../utils/documentUtils';
import { FilePreviewModal } from './FilePreviewModal';
import { getDocumentDownloadUrl } from '../utils/fileImportUtils';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isOpen || !doc) return null;

  const isCommander = currentUser.role === 'CHIHUY';
  const deadlineInfo = calculateDeadlineInfo(doc);
  const urgencyBadge = getUrgencyBadge(doc.urgency);
  const securityBadge = getSecurityBadge(doc.security);
  const statusBadge = getStatusBadge(doc.status, doc.type);

  const downloadUrl = doc.attachmentName ? getDocumentDownloadUrl(doc) : '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="document-detail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="document-detail-box"
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                doc.type === 'DEN' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {doc.type === 'DEN' ? '📥 VĂN BẢN ĐẾN' : '📤 VĂN BẢN ĐI'}
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">{doc.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="In phiếu thông tin văn bản"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Official Document Sheet Look */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          {/* Official Document Banner */}
          <div className="text-center border-b border-slate-200 pb-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-700">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1 mb-3" />

            <div className="text-xs text-slate-500 font-medium">
              Số ký hiệu: <strong className="text-slate-900">{doc.code}</strong>
              {doc.incomingNumber && (
                <span> | Số đến: <strong className="text-slate-900">{doc.incomingNumber}</strong></span>
              )}
            </div>
          </div>

          {/* Title / Abstract */}
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
              Trích yếu nội dung
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {doc.title}
            </h3>
          </div>

          {/* Key Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${urgencyBadge.class}`}>
              Độ khẩn: {urgencyBadge.label}
            </span>

            <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${securityBadge.class}`}>
              Độ mật: {securityBadge.label}
            </span>

            <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${statusBadge.class}`}>
              {statusBadge.label}
            </span>

            {doc.deadline && (
              <span className={`text-xs px-2.5 py-1 rounded-md border ${deadlineInfo.badgeClass}`}>
                {deadlineInfo.label}
              </span>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Thể loại văn bản:</span>
              <strong className="text-slate-900 text-sm">{doc.category}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">
                {doc.type === 'DEN' ? 'Cơ quan gửi đến:' : 'Đơn vị ban hành:'}
              </span>
              <strong className="text-slate-900 text-sm">
                {doc.type === 'DEN' ? doc.senderOrg : doc.receiverOrg}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block">
                {doc.type === 'DEN' ? 'Đơn vị tiếp nhận:' : 'Nơi nhận gửi đến:'}
              </span>
              <strong className="text-slate-800">{doc.receiverOrg || 'Ban Chỉ huy'}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Người ký ban hành:</span>
              <strong className="text-slate-800">{doc.signer || 'Đang cập nhật'}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Ngày ban hành:</span>
              <strong className="text-slate-800">{formatDateVN(doc.issueDate)}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">
                {doc.type === 'DEN' ? 'Ngày nhận công văn:' : 'Ngày gửi đi:'}
              </span>
              <strong className="text-slate-800">
                {formatDateVN(doc.type === 'DEN' ? doc.receivedDate : doc.sentDate)}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block">Cán bộ phụ trách xử lý:</span>
              <strong className="text-blue-800 font-semibold">{doc.assignedTo || 'Chưa gán'}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Thời hạn xử lý:</span>
              <strong className={deadlineInfo.isUrgentAlert ? 'text-red-700 font-bold' : 'text-slate-800'}>
                {formatDateVN(doc.deadline)} ({deadlineInfo.label})
              </strong>
            </div>
          </div>

          {/* Commander Directive Section */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Ý kiến chỉ đạo của Chỉ huy
              </h4>
            </div>
            {doc.directive ? (
              <p className="text-xs sm:text-sm text-amber-900 italic font-medium leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200/60">
                "{doc.directive}"
              </p>
            ) : (
              <p className="text-xs text-amber-700/80 italic">
                Chưa có ý kiến chỉ đạo cụ thể từ Ban Chỉ huy.
              </p>
            )}
          </div>

          {/* Attachments Section */}
          {doc.attachmentName ? (
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{doc.attachmentName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{doc.attachmentSize || 'Tệp văn bản'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Đã lưu trên hệ thống</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-detail-preview-file"
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Xem trước nội dung tệp"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xem tệp</span>
                </button>
                <a
                  id="btn-detail-download-file"
                  href={downloadUrl}
                  download={doc.attachmentName}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Tải tệp này về ổ đĩa máy tính"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về máy</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span>Văn bản này chưa có tệp đính kèm từ ổ đĩa máy tính.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(doc);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                + Đính kèm tệp ngay
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {isCommander ? (
              <button
                id="btn-detail-delete"
                type="button"
                onClick={() => {
                  onDelete(doc);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa văn bản (Chỉ huy)</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Chỉ tài khoản Chỉ huy được xóa</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-detail-edit"
              type="button"
              onClick={() => {
                onClose();
                onEdit(doc);
              }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Chỉnh sửa văn bản</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Embedded File Preview Modal */}
      {doc.attachmentName && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileName={doc.attachmentName}
          fileData={doc.attachmentData}
          fileType={doc.attachmentType}
          fileSize={doc.attachmentSize}
          docTitle={doc.title}
        />
      )}
    </div>
  );
};
