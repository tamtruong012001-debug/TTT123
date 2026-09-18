import React, { useRef } from 'react';
import { 
  Inbox, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Flame, 
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Database,
  HardDrive
} from 'lucide-react';
import { DocumentItem, User } from '../types';
import { calculateDeadlineInfo, formatDateVN, getUrgencyBadge, getStatusBadge } from '../utils/documentUtils';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  documents: DocumentItem[];
  currentUser: User;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCreateModal: (type?: 'DEN' | 'DI', file?: File | null) => void;
  onViewDocument: (doc: DocumentItem) => void;
  onEditDocument: (doc: DocumentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  currentUser,
  onNavigateTab,
  onOpenCreateModal,
  onViewDocument,
  onEditDocument,
}) => {
  const diskFileInputRef = useRef<HTMLInputElement>(null);
  const totalCount = documents.length;
  const incomingCount = documents.filter((d) => d.type === 'DEN').length;
  const outgoingCount = documents.filter((d) => d.type === 'DI').length;

  const inProgressCount = documents.filter(
    (d) => d.status === 'CHO_XU_LY' || d.status === 'DANG_XU_LY' || d.status === 'CHO_DUYET' || d.status === 'DU_THAO'
  ).length;

  const completedCount = documents.filter(
    (d) => d.status === 'HOAN_THANH' || d.status === 'LUU_TRU' || d.status === 'DA_GUI'
  ).length;

  // Overdue and Due soon calculations
  const overdueDocs = documents.filter((d) => calculateDeadlineInfo(d).state === 'OVERDUE');
  const dueSoonDocs = documents.filter((d) => calculateDeadlineInfo(d).state === 'DUE_SOON');

  // Urgency breakdown
  const hoaTocCount = documents.filter((d) => d.urgency === 'HOA_TOC').length;
  const thuongKhanCount = documents.filter((d) => d.urgency === 'THUONG_KHAN').length;
  const khanCount = documents.filter((d) => d.urgency === 'KHAN').length;
  const thuongCount = documents.filter((d) => d.urgency === 'THUONG').length;

  // Urgent docs needing attention
  const urgentDocs = [...overdueDocs, ...dueSoonDocs];

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Banner with CSCĐ Police Backdrop - Center Area Kept Clear & Visible */}
      <div className="relative overflow-hidden rounded-2xl min-h-[420px] sm:min-h-[470px] p-6 sm:p-8 text-white shadow-2xl border border-slate-700/80 flex flex-col justify-between items-center text-center">
        {/* Banner background photo - centered and vivid */}
        <div className="absolute inset-0 z-0">
          <img
            src="/cscd-background.jpg"
            alt="Cảnh sát Cơ động CSCĐ"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.76] contrast-[1.06]"
          />
          {/* Subtle gradient wash: dark at top and bottom for readability, clear in the middle so officers are completely visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/15 to-slate-950/85" />
        </div>

        {/* Top: Role, Department & Greeting with Emblem (Docked cleanly at top) */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-1">
          <div className="bg-slate-950/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700/70 shadow-lg flex flex-col items-center">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 p-1 rounded-xl bg-slate-900 border border-amber-500/40 shadow-md flex items-center justify-center">
                <img
                  src="/cand-logo.png"
                  alt="Công an hiệu - Công an Nhân dân Việt Nam"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-red-600 text-white font-bold uppercase tracking-wider shadow-xs">
                  {currentUser.role === 'CHIHUY' ? 'CHỈ HUY TRƯỞNG' : 'CÁN BỘ ĐƠN VỊ'}
                </span>
                <span className="text-xs text-slate-200 font-bold px-2 py-0.5 rounded bg-slate-900/90 border border-slate-600/70 shadow-xs">
                  {currentUser.department}
                </span>
              </div>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
              Xin chào, {currentUser.fullName}
            </h1>
          </div>
        </div>

        {/* Center: Open Focal Area - Completely Unobstructed so the CSCĐ background unit is prominently visible in the center */}
        <div className="relative z-10 flex-1 min-h-[140px] sm:min-h-[180px] w-full flex items-center justify-center pointer-events-none">
          {/* Intentionally open so background image is seen in the center without any items covering it */}
        </div>

        {/* Bottom: Quick Action Buttons & Tracking Notice (Docked cleanly at bottom) */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 w-full max-w-3xl pb-1">
          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/70 shadow-xl">
            {/* Hidden input for local disk import */}
            <input
              ref={diskFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.odt"
              className="hidden"
              id="disk-file-input-dashboard"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  onOpenCreateModal('DEN', file);
                  e.target.value = '';
                }
              }}
            />

            <button
              id="btn-quick-import-disk"
              type="button"
              onClick={() => diskFileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              title="Chọn tệp văn bản từ ổ đĩa máy tính (PDF, Word, Excel, ảnh scan)"
            >
              <HardDrive className="w-4 h-4 text-slate-950" />
              <span>Thêm từ ổ đĩa máy tính</span>
            </button>

            <button
              id="btn-quick-add-den"
              type="button"
              onClick={() => onOpenCreateModal('DEN')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Văn bản đến</span>
            </button>
            <button
              id="btn-quick-add-di"
              type="button"
              onClick={() => onOpenCreateModal('DI')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold shadow-md border border-slate-600/70 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Văn bản đi</span>
            </button>
          </div>

          {/* Document Summary & Tracking text */}
          <div className="bg-slate-950/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/60 shadow-lg text-xs sm:text-sm text-slate-200 text-center leading-relaxed">
            Hệ thống theo dõi công văn, văn bản chỉ đạo. Bạn có{' '}
            <span className="text-red-300 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-500/50 inline-block mx-0.5 shadow-2xs">
              {overdueDocs.length} văn bản quá hạn
            </span>{' '}
            và{' '}
            <span className="text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 inline-block mx-0.5 shadow-2xs">
              {dueSoonDocs.length} văn bản sắp đến hạn
            </span>{' '}
            cần theo dõi xử lý.
          </div>
        </div>
      </div>

      {/* Critical Alert Warning Bar (if any overdue or due soon) */}
      {urgentDocs.length > 0 && (
        <div
          id="critical-alert-banner"
          className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-red-50 via-amber-50/60 to-rose-50 border border-red-200/90 shadow-2xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-red-950 flex flex-wrap items-center gap-2">
                  <span>CẢNH BÁO TIẾN ĐỘ VĂN BẢN KHẨN CẤP</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold tracking-tight">
                    {urgentDocs.length} văn bản
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-red-900 mt-1 leading-relaxed">
                  Có <strong className="font-bold text-red-950">{overdueDocs.length} văn bản</strong> đã quá hạn hoàn thành và{' '}
                  <strong className="font-bold text-amber-950">{dueSoonDocs.length} văn bản</strong> có hạn trong 1-3 ngày tới. Vui lòng kiểm tra và đôn đốc cán bộ xử lý kịp thời.
                </p>
              </div>
            </div>

            <button
              id="btn-view-all-warnings"
              type="button"
              onClick={() => onNavigateTab('warnings')}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Key Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Docs */}
        <div
          id="stat-card-total"
          onClick={() => onNavigateTab('incoming')}
          className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng văn bản</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">{totalCount}</div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
            <span>Toàn bộ hồ sơ</span>
          </div>
        </div>

        {/* Incoming Docs */}
        <div
          id="stat-card-incoming"
          onClick={() => onNavigateTab('incoming')}
          className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Văn bản đến</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 tabular-nums tracking-tight">{incomingCount}</div>
          <div className="text-xs text-blue-700 mt-1.5 font-medium">Cần theo dõi xử lý</div>
        </div>

        {/* Outgoing Docs */}
        <div
          id="stat-card-outgoing"
          onClick={() => onNavigateTab('outgoing')}
          className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Văn bản đi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tabular-nums tracking-tight">{outgoingCount}</div>
          <div className="text-xs text-emerald-700 mt-1.5 font-medium">Soạn thảo & ban hành</div>
        </div>

        {/* In Progress */}
        <div
          id="stat-card-inprogress"
          className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Đang xử lý</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums tracking-tight">{inProgressCount}</div>
          <div className="text-xs text-slate-500 mt-1.5 font-medium">Chưa hoàn tất</div>
        </div>

        {/* Overdue (Quá hạn) */}
        <div
          id="stat-card-overdue"
          onClick={() => onNavigateTab('warnings')}
          className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all cursor-pointer ${
            overdueDocs.length > 0
              ? 'bg-red-50/95 backdrop-blur-md border-red-300 hover:bg-red-100/90 hover:shadow-md'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">QUÁ HẠN</span>
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-700 tabular-nums tracking-tight">{overdueDocs.length}</div>
          <div className="text-xs text-red-700 mt-1.5 font-bold">Cần xử lý gấp!</div>
        </div>

        {/* Due Soon (Sắp đến hạn) */}
        <div
          id="stat-card-due-soon"
          onClick={() => onNavigateTab('warnings')}
          className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all cursor-pointer ${
            dueSoonDocs.length > 0
              ? 'bg-amber-50/95 backdrop-blur-md border-amber-300 hover:bg-amber-100/90 hover:shadow-md'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">SẮP ĐẾN HẠN</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 tabular-nums tracking-tight">{dueSoonDocs.length}</div>
          <div className="text-xs text-amber-800 mt-1.5 font-semibold">Hạn trong ≤ 3 ngày</div>
        </div>
      </div>

      {/* Two Insight Cards: Urgency Distribution & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Urgency & Security distribution */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-red-600" />
            <span>Phân bố theo độ khẩn của văn bản</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-red-700 font-bold">Hỏa tốc</span>
                <span className="font-mono text-red-800 font-bold">{hoaTocCount} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCount ? (hoaTocCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-rose-700 font-bold">Thượng khẩn</span>
                <span className="font-mono text-rose-800 font-bold">{thuongKhanCount} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCount ? (thuongKhanCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-amber-800 font-bold">Khẩn</span>
                <span className="font-mono text-amber-900 font-bold">{khanCount} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCount ? (khanCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700 font-semibold">Thường</span>
                <span className="font-mono text-slate-800 font-bold">{thuongCount} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCount ? (thuongCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Resolution Status Progress */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Tiến độ xử lý văn bản</span>
          </h3>

          <div className="flex items-center gap-5 mb-4">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-700"
                  strokeDasharray={`${totalCount ? Math.round((completedCount / totalCount) * 100) : 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-bold text-slate-900 tabular-nums">
                {totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600 font-medium">Đã hoàn thành:</span>
                <strong className="text-slate-900 font-bold">{completedCount}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600 font-medium">Đang thực hiện:</span>
                <strong className="text-slate-900 font-bold">{inProgressCount}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-slate-600 font-medium">Quá hạn chưa xong:</span>
                <strong className="text-red-700 font-bold">{overdueDocs.length}</strong>
              </div>
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu được lưu trữ tự động trên thiết bị</span>
            <button
              id="btn-dash-to-backup"
              type="button"
              onClick={() => onNavigateTab('backup')}
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sao lưu ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Urgent Documents Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Văn bản cần xử lý khẩn cấp & theo dõi thời hạn</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Ưu tiên xử lý các văn bản quá hạn và sắp đến hạn hoàn thành
            </p>
          </div>

          <button
            id="btn-dash-view-warnings-list"
            type="button"
            onClick={() => onNavigateTab('warnings')}
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200/60 transition-colors"
          >
            <span>Xem toàn bộ danh sách cảnh báo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentDocs.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Tuyệt vời! Không có văn bản nào bị quá hạn hay sắp đến hạn.</p>
            <p className="text-xs text-slate-500 mt-1">Mọi công văn đều đang được xử lý đúng tiến độ quy định.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200/90 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Loại & Số hiệu</th>
                  <th className="py-3 px-4">Trích yếu nội dung</th>
                  <th className="py-3 px-4">Cơ quan / Người gửi</th>
                  <th className="py-3 px-4">Hạn xử lý</th>
                  <th className="py-3 px-4">Cán bộ phụ trách</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentDocs.map((doc) => {
                  const deadlineInfo = calculateDeadlineInfo(doc);
                  const urgencyBadge = getUrgencyBadge(doc.urgency);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              doc.type === 'DEN' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {doc.type === 'DEN' ? 'ĐẾN' : 'ĐI'}
                          </span>
                          <span className="font-bold text-slate-900 font-mono">{doc.code}</span>
                        </div>
                        <div className="mt-1.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${urgencyBadge.class}`}>
                            {urgencyBadge.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <p className="font-semibold text-slate-900 line-clamp-2 leading-snug">{doc.title}</p>
                        {doc.directive && (
                          <div className="text-xs text-amber-900 bg-amber-50/90 rounded-md p-1.5 mt-1.5 border border-amber-200/80 line-clamp-1">
                            <strong className="font-bold text-amber-950">Chỉ đạo:</strong> {doc.directive}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-xs text-slate-700 font-medium">
                        {doc.type === 'DEN' ? doc.senderOrg : doc.receiverOrg}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-800 tabular-nums">{formatDateVN(doc.deadline)}</div>
                        <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${deadlineInfo.badgeClass}`}>
                          {deadlineInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top text-xs text-slate-800 font-medium">
                        {doc.assignedTo || 'Chưa phân công'}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewDocument(doc)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditDocument(doc)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors cursor-pointer border border-blue-200/60"
                        >
                          Xử lý
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
