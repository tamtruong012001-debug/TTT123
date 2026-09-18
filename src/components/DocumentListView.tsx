import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  Lock, 
  PlusCircle, 
  AlertTriangle, 
  Clock, 
  Paperclip, 
  CheckCircle,
  FileDown,
  X,
  Calendar,
  Building,
  User as UserIcon,
  Tag,
  HardDrive,
  UploadCloud
} from 'lucide-react';
import { DocumentItem, User, DocumentType, UrgencyLevel } from '../types';
import { 
  calculateDeadlineInfo, 
  formatDateVN, 
  getUrgencyBadge, 
  getSecurityBadge, 
  getStatusBadge 
} from '../utils/documentUtils';

interface DocumentListViewProps {
  documents: DocumentItem[];
  currentUser: User;
  typeFilter: 'ALL' | 'DEN' | 'DI' | 'WARNINGS';
  onViewDocument: (doc: DocumentItem) => void;
  onEditDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (doc: DocumentItem) => void;
  onOpenCreateModal: (type?: 'DEN' | 'DI', file?: File | null) => void;
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
  documents,
  currentUser,
  typeFilter,
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  onOpenCreateModal,
}) => {
  const isCommander = currentUser.role === 'CHIHUY';
  const diskFileInputRef = useRef<HTMLInputElement>(null);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>(
    typeFilter === 'WARNINGS' ? 'ALL' : typeFilter
  );
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState<string>(
    typeFilter === 'WARNINGS' ? 'URGENT_ONLY' : 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Sync when prop typeFilter changes
  React.useEffect(() => {
    if (typeFilter === 'WARNINGS') {
      setSelectedType('ALL');
      setSelectedDeadlineFilter('URGENT_ONLY');
    } else {
      setSelectedType(typeFilter);
      setSelectedDeadlineFilter('ALL');
    }
  }, [typeFilter]);

  // Distinct categories in docs for dropdown
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [documents]);

  // Filtered list
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Type match
      if (selectedType !== 'ALL' && doc.type !== selectedType) {
        return false;
      }

      // Urgency match
      if (selectedUrgency !== 'ALL' && doc.urgency !== selectedUrgency) {
        return false;
      }

      // Category match
      if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) {
        return false;
      }

      // Status match
      if (selectedStatus !== 'ALL' && doc.status !== selectedStatus) {
        return false;
      }

      // Deadline filter match
      const deadlineInfo = calculateDeadlineInfo(doc);
      if (selectedDeadlineFilter === 'URGENT_ONLY') {
        if (!deadlineInfo.isUrgentAlert) return false;
      } else if (selectedDeadlineFilter === 'OVERDUE') {
        if (deadlineInfo.state !== 'OVERDUE') return false;
      } else if (selectedDeadlineFilter === 'DUE_SOON') {
        if (deadlineInfo.state !== 'DUE_SOON') return false;
      } else if (selectedDeadlineFilter === 'ON_TRACK') {
        if (deadlineInfo.state !== 'ON_TRACK') return false;
      } else if (selectedDeadlineFilter === 'COMPLETED') {
        if (deadlineInfo.state !== 'COMPLETED') return false;
      }

      // Search keyword match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const inCode = doc.code.toLowerCase().includes(query);
        const inTitle = doc.title.toLowerCase().includes(query);
        const inSender = doc.senderOrg?.toLowerCase().includes(query);
        const inReceiver = doc.receiverOrg?.toLowerCase().includes(query);
        const inSigner = doc.signer?.toLowerCase().includes(query);
        const inAssigned = doc.assignedTo?.toLowerCase().includes(query);
        const inIncomingNum = doc.incomingNumber?.toLowerCase().includes(query);
        const inDirective = doc.directive?.toLowerCase().includes(query);

        if (
          !inCode &&
          !inTitle &&
          !inSender &&
          !inReceiver &&
          !inSigner &&
          !inAssigned &&
          !inIncomingNum &&
          !inDirective
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    documents,
    selectedType,
    selectedUrgency,
    selectedCategory,
    selectedStatus,
    selectedDeadlineFilter,
    searchTerm,
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(typeFilter === 'WARNINGS' ? 'ALL' : typeFilter);
    setSelectedUrgency('ALL');
    setSelectedDeadlineFilter(typeFilter === 'WARNINGS' ? 'URGENT_ONLY' : 'ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
  };

  const getPageTitle = () => {
    switch (typeFilter) {
      case 'DEN':
        return {
          title: 'Văn bản Đến',
          subtitle: 'Quản lý toàn bộ công văn, chỉ thị, quyết định nhận từ cơ quan, đơn vị bên ngoài',
          defaultType: 'DEN' as const,
        };
      case 'DI':
        return {
          title: 'Văn bản Đi',
          subtitle: 'Soạn thảo, quản lý công văn, báo cáo, tờ trình ban hành gửi đi các cấp',
          defaultType: 'DI' as const,
        };
      case 'WARNINGS':
        return {
          title: 'Cảnh báo Thời hạn Xử lý',
          subtitle: 'Danh sách các văn bản đã quá hạn hoặc sắp đến hạn hoàn thành cần đôn đốc',
          defaultType: 'DEN' as const,
        };
      default:
        return {
          title: 'Tất cả Văn bản Hồ sơ',
          subtitle: 'Hệ thống lưu trữ và theo dõi công văn, văn bản đến & đi toàn đơn vị',
          defaultType: undefined,
        };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div id="document-list-container" className="space-y-5">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h1>
            <span className="text-xs px-3 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200/80 tabular-nums">
              {filteredDocuments.length} văn bản
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">{pageInfo.subtitle}</p>
        </div>

        {/* Create Buttons & Disk Upload */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hidden input for local disk import */}
          <input
            ref={diskFileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.odt"
            className="hidden"
            id="disk-file-input-list-view"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const targetType = typeFilter === 'DI' ? 'DI' : 'DEN';
                onOpenCreateModal(targetType, file);
                e.target.value = '';
              }
            }}
          />

          <button
            id="btn-list-add-from-disk"
            type="button"
            onClick={() => diskFileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            title="Chọn tệp văn bản từ ổ đĩa máy tính (PDF, Word, Excel, ảnh scan) để nhập vào hệ thống"
          >
            <HardDrive className="w-4 h-4 text-slate-950" />
            <span>Thêm từ ổ đĩa</span>
          </button>

          {typeFilter === 'DEN' && (
            <button
              id="btn-create-in-view-den"
              type="button"
              onClick={() => onOpenCreateModal('DEN')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm văn bản đến</span>
            </button>
          )}

          {typeFilter === 'DI' && (
            <button
              id="btn-create-in-view-di"
              type="button"
              onClick={() => onOpenCreateModal('DI')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm văn bản đi</span>
            </button>
          )}

          {(typeFilter === 'ALL' || typeFilter === 'WARNINGS') && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenCreateModal('DEN')}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Văn bản đến</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreateModal('DI')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Văn bản đi</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
        {/* Search input row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-document-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo số hiệu, trích yếu, cơ quan gửi/nhận, cán bộ phụ trách..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Clear Filter Button */}
          {(searchTerm ||
            selectedUrgency !== 'ALL' ||
            selectedCategory !== 'ALL' ||
            selectedStatus !== 'ALL' ||
            (typeFilter !== 'WARNINGS' && selectedDeadlineFilter !== 'ALL')) && (
            <button
              id="btn-clear-filters"
              type="button"
              onClick={clearFilters}
              className="px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 justify-center cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
          {/* Filter Type (if in ALL) */}
          {typeFilter === 'ALL' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Loại văn bản</label>
              <select
                id="filter-doc-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ALL">Tất cả loại (Đến & Đi)</option>
                <option value="DEN">📥 Văn bản đến</option>
                <option value="DI">📤 Văn bản đi</option>
              </select>
            </div>
          )}

          {/* Filter Deadline Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Cảnh báo thời hạn</label>
            <select
              id="filter-deadline-status"
              value={selectedDeadlineFilter}
              onChange={(e) => setSelectedDeadlineFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Tất cả thời hạn</option>
              <option value="URGENT_ONLY">⚠️ Cần xử lý khẩn (Quá & Sắp)</option>
              <option value="OVERDUE">🔴 Quá hạn hoàn thành</option>
              <option value="DUE_SOON">🟠 Sắp đến hạn (≤ 3 ngày)</option>
              <option value="ON_TRACK">🟢 Còn hạn bình thường</option>
              <option value="COMPLETED">⚪ Đã hoàn thành</option>
            </select>
          </div>

          {/* Filter Urgency */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Độ khẩn cấp</label>
            <select
              id="filter-urgency"
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Tất cả độ khẩn</option>
              <option value="HOA_TOC">🔥 HỎA TỐC</option>
              <option value="THUONG_KHAN">⚡ Thượng khẩn</option>
              <option value="KHAN">⚠️ Khẩn</option>
              <option value="THUONG">📄 Thường</option>
            </select>
          </div>

          {/* Filter Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Thể loại</label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Tất cả thể loại</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Trạng thái xử lý</label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CHO_XU_LY">Chờ xử lý</option>
              <option value="DANG_XU_LY">Đang xử lý</option>
              <option value="HOAN_THANH">Đã hoàn thành</option>
              <option value="LUU_TRU">Đã lưu trữ</option>
              <option value="DU_THAO">Dự thảo</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="DA_KY_BAN_HANH">Đã ký ban hành</option>
              <option value="DA_GUI">Đã gửi đi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Records List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Không tìm thấy văn bản phù hợp</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto font-normal leading-relaxed">
            Không có kết quả nào khớp với từ khóa tìm kiếm hoặc các tiêu chí bộ lọc đã chọn.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
          >
            Xóa bỏ bộ lọc để xem lại tất cả
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200/90 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-36">Loại & Số hiệu</th>
                    <th className="py-3 px-4">Trích yếu nội dung</th>
                    <th className="py-3 px-4 w-44">Cơ quan / Đơn vị</th>
                    <th className="py-3 px-4 w-32">Ngày & Hạn</th>
                    <th className="py-3 px-4 w-36">Cán bộ phụ trách</th>
                    <th className="py-3 px-4 w-32">Trạng thái</th>
                    <th className="py-3 px-4 w-28 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((doc) => {
                    const deadlineInfo = calculateDeadlineInfo(doc);
                    const urgencyBadge = getUrgencyBadge(doc.urgency);
                    const securityBadge = getSecurityBadge(doc.security);
                    const statusBadge = getStatusBadge(doc.status, doc.type);

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/90 transition-colors">
                        {/* Type & Code */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                doc.type === 'DEN'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {doc.type === 'DEN' ? 'ĐẾN' : 'ĐI'}
                            </span>
                            {doc.incomingNumber && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-mono font-semibold border border-slate-200/80">
                                #{doc.incomingNumber}
                              </span>
                            )}
                          </div>
                          <div className="font-bold font-mono text-slate-900">{doc.code}</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-1">{doc.category}</div>
                        </td>

                        {/* Title & Attachment & Directive */}
                        <td className="py-3.5 px-4 align-top">
                          <p
                            className="font-semibold text-slate-900 hover:text-blue-700 cursor-pointer leading-snug"
                            onClick={() => onViewDocument(doc)}
                          >
                            {doc.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {/* Urgency */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${urgencyBadge.class}`}>
                              {urgencyBadge.label}
                            </span>

                            {/* Security */}
                            {doc.security !== 'THUONG' && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${securityBadge.class}`}>
                                {securityBadge.label}
                              </span>
                            )}

                            {/* Attachment */}
                            {doc.attachmentName && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                                <Paperclip className="w-3 h-3 text-slate-500" />
                                <span className="truncate max-w-[150px]">{doc.attachmentName}</span>
                              </span>
                            )}
                          </div>

                          {/* Directive Note */}
                          {doc.directive && (
                            <div className="mt-2 text-xs bg-amber-50 border border-amber-200/80 text-amber-950 rounded-lg p-2 leading-relaxed">
                              <span className="font-bold text-amber-900">Chỉ đạo:</span> {doc.directive}
                            </div>
                          )}
                        </td>

                        {/* Org / Signer */}
                        <td className="py-3.5 px-4 align-top text-xs">
                          <div className="font-semibold text-slate-900 leading-snug">
                            {doc.type === 'DEN' ? doc.senderOrg : doc.receiverOrg}
                          </div>
                          {doc.signer && (
                            <div className="text-slate-500 mt-1 font-normal">Ký: <span className="font-medium text-slate-700">{doc.signer}</span></div>
                          )}
                        </td>

                        {/* Dates & Deadline Warning */}
                        <td className="py-3.5 px-4 align-top text-xs">
                          <div className="text-slate-600 font-normal">
                            Ban hành: <span className="font-medium text-slate-800 tabular-nums">{formatDateVN(doc.issueDate)}</span>
                          </div>
                          {doc.deadline && (
                            <div className="mt-1.5">
                              <span className="text-[11px] font-medium text-slate-700 block">
                                Hạn: <span className="font-semibold text-slate-900 tabular-nums">{formatDateVN(doc.deadline)}</span>
                              </span>
                              <span
                                className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${deadlineInfo.badgeClass}`}
                              >
                                {deadlineInfo.label}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Assigned To */}
                        <td className="py-3.5 px-4 align-top text-xs text-slate-800">
                          <div className="font-semibold text-slate-900">{doc.assignedTo || 'Chưa phân công'}</div>
                          {doc.drafter && doc.type === 'DI' && (
                            <div className="text-slate-500 text-[11px] mt-1 font-normal">
                              Soạn: <span className="font-medium text-slate-700">{doc.drafter}</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 align-top">
                          <span
                            className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg border ${statusBadge.class}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Actions (with Role Check for Delete) */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap space-x-1">
                          {/* View button */}
                          <button
                            type="button"
                            onClick={() => onViewDocument(doc)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEditDocument(doc)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Sửa văn bản"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete button (Chỉ huy được xóa, cán bộ bị khóa/vô hiệu hóa) */}
                          {isCommander ? (
                            <button
                              type="button"
                              onClick={() => onDeleteDocument(doc)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa văn bản (Quyền Chỉ huy)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="p-1.5 text-slate-300 rounded-lg cursor-not-allowed opacity-50 relative group"
                              title="Chỉ tài khoản Chỉ huy mới được quyền xóa văn bản"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout (visible on small screens < md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredDocuments.map((doc) => {
              const deadlineInfo = calculateDeadlineInfo(doc);
              const urgencyBadge = getUrgencyBadge(doc.urgency);
              const statusBadge = getStatusBadge(doc.status, doc.type);

              return (
                <div
                  key={doc.id}
                  className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          doc.type === 'DEN' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {doc.type === 'DEN' ? 'VĂN BẢN ĐẾN' : 'VĂN BẢN ĐI'}
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{doc.code}</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${urgencyBadge.class}`}>
                      {urgencyBadge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h4
                    onClick={() => onViewDocument(doc)}
                    className="font-bold text-slate-900 text-sm leading-snug cursor-pointer hover:text-blue-700"
                  >
                    {doc.title}
                  </h4>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Cơ quan:</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {doc.type === 'DEN' ? doc.senderOrg : doc.receiverOrg}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Phụ trách:</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {doc.assignedTo || 'Chưa gán'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Ngày ban hành:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatDateVN(doc.issueDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Trạng thái:</span>
                      <span className={`inline-block font-bold px-2 py-0.5 rounded-md text-[10px] border ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Deadline Warning Badge */}
                  {doc.deadline && (
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-slate-600 font-medium">Hạn xử lý: <strong className="text-slate-900 font-semibold tabular-nums">{formatDateVN(doc.deadline)}</strong></span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${deadlineInfo.badgeClass}`}>
                        {deadlineInfo.label}
                      </span>
                    </div>
                  )}

                  {/* Actions for mobile */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onViewDocument(doc)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Xem</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditDocument(doc)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                        <span>Sửa</span>
                      </button>

                      {isCommander ? (
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-700" />
                          <span>Xóa</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/60">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Cán bộ không được xóa</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
