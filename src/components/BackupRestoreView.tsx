import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  HardDrive,
  Info,
  ShieldCheck
} from 'lucide-react';
import { DocumentItem, User } from '../types';
import { downloadJsonFile, getTodayString } from '../utils/documentUtils';
import { INITIAL_DOCUMENTS } from '../data/initialData';

interface BackupRestoreViewProps {
  documents: DocumentItem[];
  currentUser: User;
  onRestoreDocuments: (newDocs: DocumentItem[]) => void;
  onResetToDefault: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  documents,
  currentUser,
  onRestoreDocuments,
  onResetToDefault,
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<DocumentItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCommander = currentUser.role === 'CHIHUY';

  // Handle Export Backup JSON
  const handleExportBackup = () => {
    try {
      const backupPayload = {
        app: 'HeThongQuanLyVanBan',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        exportedBy: `${currentUser.fullName} (${currentUser.username})`,
        totalDocuments: documents.length,
        documents: documents,
      };

      const filename = `sao_luu_van_ban_${getTodayString()}.json`;
      downloadJsonFile(backupPayload, filename);

      setSuccessMessage(`Đã xuất tệp sao lưu "${filename}" thành công!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Lỗi khi xuất tệp dữ liệu!');
    }
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setSuccessMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Vui lòng chọn tệp định dạng JSON (.json)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let docsToImport: DocumentItem[] = [];
        if (Array.isArray(parsed)) {
          docsToImport = parsed;
        } else if (parsed.documents && Array.isArray(parsed.documents)) {
          docsToImport = parsed.documents;
        } else {
          throw new Error('Cấu trúc file JSON không hợp lệ!');
        }

        // Validate basic fields
        if (docsToImport.length === 0) {
          throw new Error('Tệp không chứa văn bản nào!');
        }

        const isValid = docsToImport.every((d) => d.id && d.code && d.title && d.type);
        if (!isValid) {
          throw new Error('Dữ liệu văn bản thiếu các trường bắt buộc (id, code, title, type)!');
        }

        setPreviewData(docsToImport);
        setSuccessMessage(`Đã đọc tệp sao lưu chứa ${docsToImport.length} văn bản. Vui lòng xác nhận khôi phục.`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi giải mã tệp JSON!');
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  // Confirm Import
  const handleConfirmImport = (mode: 'REPLACE' | 'MERGE') => {
    if (!previewData) return;

    if (mode === 'REPLACE') {
      onRestoreDocuments(previewData);
      setSuccessMessage(`Đã khôi phục thành công ${previewData.length} văn bản (Ghi đè)!`);
    } else {
      // Merge by ID avoiding duplicates
      const existingIds = new Set(documents.map((d) => d.id));
      const newItems = previewData.filter((d) => !existingIds.has(d.id));
      const merged = [...documents, ...newItems];
      onRestoreDocuments(merged);
      setSuccessMessage(`Đã gộp thêm ${newItems.length} văn bản mới vào hệ thống!`);
    }

    setPreviewData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Reset to default sample
  const handleResetSample = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại dữ liệu mẫu gốc ban đầu không?')) {
      onResetToDefault();
      setSuccessMessage('Đã khôi phục dữ liệu mẫu ban đầu thành công!');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  return (
    <div id="backup-restore-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sao lưu & Phục hồi Dữ liệu JSON
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Đảm bảo an toàn cơ sở dữ liệu công văn. Tải về máy hoặc tải lên để đồng bộ.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-sm flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Grid: Export Card & Import Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export JSON Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Xuất dữ liệu sao lưu (JSON)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tải toàn bộ cơ sở dữ liệu ({documents.length} văn bản hiện tại) về máy tính dưới định dạng tệp tiêu chuẩn <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">.json</code> để lưu trữ định kỳ hoặc chuyển giao.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Số lượng văn bản:</span>
                <strong className="text-slate-900">{documents.length} bản ghi</strong>
              </div>
              <div className="flex justify-between">
                <span>Văn bản đến:</span>
                <strong className="text-blue-700">{documents.filter((d) => d.type === 'DEN').length} bản ghi</strong>
              </div>
              <div className="flex justify-between">
                <span>Văn bản đi:</span>
                <strong className="text-emerald-700">{documents.filter((d) => d.type === 'DI').length} bản ghi</strong>
              </div>
            </div>
          </div>

          <button
            id="btn-export-backup-json"
            type="button"
            onClick={handleExportBackup}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp sao lưu JSON về máy</span>
          </button>
        </div>

        {/* Import JSON Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Khôi phục từ tệp sao lưu (JSON)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Nhập tệp dữ liệu đã sao lưu trước đó để phục hồi lại hệ thống văn bản. Bạn có thể chọn ghi đè toàn bộ hoặc gộp các văn bản mới.
            </p>

            <div className="mt-4">
              <label className="block w-full border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/30">
                <FileJson className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-slate-700 block">
                  Bấm để chọn tệp .JSON từ máy tính
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Hỗ trợ định dạng JSON sao lưu chuẩn</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Preview Confirmation */}
          {previewData && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
              <div className="text-xs font-bold text-amber-900">
                Đã nhận diện {previewData.length} văn bản từ tệp!
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-import-replace"
                  type="button"
                  onClick={() => handleConfirmImport('REPLACE')}
                  className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Ghi đè toàn bộ
                </button>
                <button
                  id="btn-import-merge"
                  type="button"
                  onClick={() => handleConfirmImport('MERGE')}
                  className="py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Gộp thêm mới
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Option: Reset to default sample */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Khôi phục dữ liệu demo mẫu ban đầu</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Nếu bạn muốn xóa các chỉnh sửa thử nghiệm và trở về bộ dữ liệu mẫu gồm các công văn quá hạn và sắp đến hạn chuẩn.
            </p>
          </div>
        </div>

        <button
          id="btn-reset-sample-data"
          type="button"
          onClick={handleResetSample}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
        >
          Đặt lại dữ liệu mẫu
        </button>
      </div>
    </div>
  );
};
