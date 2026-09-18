import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Inbox, 
  Send,
  Eye,
  Calendar
} from 'lucide-react';
import { DocumentItem } from '../types';
import { calculateDeadlineInfo, formatDateVN } from '../utils/documentUtils';

interface DeadlineAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
}

export const DeadlineAlertModal: React.FC<DeadlineAlertModalProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDocument,
}) => {
  if (!isOpen) return null;

  const overdueList: { doc: DocumentItem; info: ReturnType<typeof calculateDeadlineInfo> }[] = [];
  const dueSoonList: { doc: DocumentItem; info: ReturnType<typeof calculateDeadlineInfo> }[] = [];

  documents.forEach((doc) => {
    const info = calculateDeadlineInfo(doc);
    if (info.state === 'OVERDUE') {
      overdueList.push({ doc, info });
    } else if (info.state === 'DUE_SOON') {
      dueSoonList.push({ doc, info });
    }
  });

  const totalUrgent = overdueList.length + dueSoonList.length;

  return (
    <div
      id="deadline-alert-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="deadline-alert-box"
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950">
                Cảnh báo Thời hạn Xử lý Văn bản
              </h3>
              <p className="text-xs text-red-800">
                Hệ thống tự động phát hiện {totalUrgent} văn bản cần lưu ý
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {totalUrgent === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">Không có văn bản cảnh báo</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tất cả văn bản đều đang được xử lý trong thời hạn quy định.
              </p>
            </div>
          ) : (
            <>
              {/* Overdue Section */}
              {overdueList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span>Văn bản ĐÃ QUÁ HẠN ({overdueList.length})</span>
                  </div>

                  <div className="space-y-2">
                    {overdueList.map(({ doc, info }) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onSelectDocument(doc);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-red-50/70 border border-red-200 hover:border-red-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-900">
                                {doc.type === 'DEN' ? 'ĐẾN' : 'ĐI'}
                              </span>
                              <span className="font-bold text-xs text-slate-900">{doc.code}</span>
                            </div>
                            <h5 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1 group-hover:text-red-700">
                              {doc.title}
                            </h5>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Phụ trách: <strong className="text-slate-700">{doc.assignedTo}</strong>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white block">
                              {info.label}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Hạn: {formatDateVN(doc.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due soon Section */}
              {dueSoonList.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Văn bản SẮP ĐẾN HẠN (≤ 3 ngày) ({dueSoonList.length})</span>
                  </div>

                  <div className="space-y-2">
                    {dueSoonList.map(({ doc, info }) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onSelectDocument(doc);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                                {doc.type === 'DEN' ? 'ĐẾN' : 'ĐI'}
                              </span>
                              <span className="font-bold text-xs text-slate-900">{doc.code}</span>
                            </div>
                            <h5 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1 group-hover:text-amber-800">
                              {doc.title}
                            </h5>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Phụ trách: <strong className="text-slate-700">{doc.assignedTo}</strong>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white block">
                              {info.label}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Hạn: {formatDateVN(doc.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Đóng thông báo
          </button>
        </div>
      </div>
    </div>
  );
};
