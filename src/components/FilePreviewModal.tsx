import React from 'react';
import { X, Download, FileText, ExternalLink, Image, AlertCircle } from 'lucide-react';
import { getDocumentDownloadUrl } from '../utils/fileImportUtils';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileData?: string;
  fileType?: string;
  fileSize?: string;
  docTitle?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileData,
  fileType = '',
  fileSize,
  docTitle,
}) => {
  if (!isOpen) return null;

  const downloadUrl = fileData || getDocumentDownloadUrl({
    code: 'DOC',
    title: docTitle || fileName,
    attachmentName: fileName,
  });

  const isImage = fileType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);
  const isPdf = fileType === 'application/pdf' || /\.pdf$/i.test(fileName);
  const isText = fileType.startsWith('text/') || /\.(txt|json|csv|md)$/i.test(fileName);
  const isOffice = /\.(docx?|xlsx?|pptx?)$/i.test(fileName);

  return (
    <div
      id="file-preview-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div
        id="file-preview-container"
        className="bg-slate-900 text-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              {isImage ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {fileName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{fileSize || 'Tệp trên máy'}</span>
                {docTitle && <span className="truncate hidden sm:inline">• {docTitle}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              id="btn-preview-download"
              href={downloadUrl}
              download={fileName}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Tải tệp này về máy tính của bạn"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải về máy</span>
            </a>
            <button
              id="btn-close-preview"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Đóng xem trước"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/90 flex items-center justify-center min-h-[350px]">
          {isImage && fileData ? (
            <div className="max-w-full max-h-[70vh] flex items-center justify-center">
              <img
                src={fileData}
                alt={fileName}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-700"
              />
            </div>
          ) : isPdf && fileData ? (
            <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                src={`${fileData}#toolbar=1`}
                className="w-full h-full"
                title={fileName}
              />
            </div>
          ) : isOffice ? (
            <div className="text-center max-w-md p-6 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{fileName}</h4>
              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                Tệp định dạng Microsoft Office (Word / Excel) đã được lưu trữ an toàn trong hồ sơ văn bản.
                Nhấp nút dưới đây để tải về và chỉnh sửa trực tiếp bằng Microsoft Office hoặc WPS trên máy tính của bạn.
              </p>
              <a
                href={downloadUrl}
                download={fileName}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Tải về mở bằng Word/Excel</span>
              </a>
            </div>
          ) : (
            <div className="text-center max-w-md p-6 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{fileName}</h4>
              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                Tệp văn bản đã sẵn sàng. Bạn có thể tải tệp về ổ đĩa máy tính để xem và in ấn với đầy đủ định dạng chuẩn.
              </p>
              <a
                href={downloadUrl}
                download={fileName}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp về ổ đĩa máy</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tệp đính kèm văn bản hợp lệ từ ổ đĩa máy tính</span>
          </div>
          <span>Bấm phím Esc hoặc nút X để đóng</span>
        </div>
      </div>
    </div>
  );
};
