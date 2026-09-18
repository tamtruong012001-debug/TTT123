import React, { useRef } from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  AlertTriangle, 
  Database, 
  PlusCircle, 
  ShieldCheck,
  FileText,
  Users,
  HardDrive
} from 'lucide-react';
import { DocumentItem, User } from '../types';
import { calculateDeadlineInfo } from '../utils/documentUtils';

export type ActiveTab = 'dashboard' | 'incoming' | 'outgoing' | 'warnings' | 'users' | 'backup';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  documents: DocumentItem[];
  currentUser: User;
  onOpenCreateModal: (type?: 'DEN' | 'DI', file?: File | null) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documents,
  currentUser,
  onOpenCreateModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const isCommander = currentUser.role === 'CHIHUY';
  const diskFileInputRef = useRef<HTMLInputElement>(null);

  const incomingCount = documents.filter((d) => d.type === 'DEN').length;
  const outgoingCount = documents.filter((d) => d.type === 'DI').length;

  const urgentCount = documents.filter((d) => {
    const info = calculateDeadlineInfo(d);
    return info.isUrgentAlert;
  }).length;

  const overdueCount = documents.filter((d) => {
    const info = calculateDeadlineInfo(d);
    return info.state === 'OVERDUE';
  }).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Trang tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'incoming' as ActiveTab,
      label: 'Văn bản đến',
      icon: Inbox,
      badge: incomingCount,
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'outgoing' as ActiveTab,
      label: 'Văn bản đi',
      icon: Send,
      badge: outgoingCount,
      badgeClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'warnings' as ActiveTab,
      label: 'Cảnh báo thời hạn',
      icon: AlertTriangle,
      badge: urgentCount > 0 ? urgentCount : null,
      badgeClass: overdueCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-white',
    },
    {
      id: 'users' as ActiveTab,
      label: 'Quản lý tài khoản',
      icon: Users,
      badge: null,
    },
    {
      id: 'backup' as ActiveTab,
      label: 'Sao lưu dữ liệu JSON',
      icon: Database,
      badge: null,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="app-sidebar"
        style={{ width: '204px' }}
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-sm transition-transform duration-200 ease-in-out flex flex-col justify-between md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div style={{ width: '203.2px' }} className="p-3 sm:p-4 flex-1 overflow-y-auto max-w-full">
          {/* Quick Create Buttons */}
          <div className="mb-5 space-y-2">
            {/* Hidden file input for quick disk import */}
            <input
              ref={diskFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.odt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  onOpenCreateModal('DEN', file);
                  onCloseMobile();
                  e.target.value = '';
                }
              }}
            />

            <button
              id="btn-sidebar-add-incoming"
              type="button"
              onClick={() => {
                onOpenCreateModal('DEN');
                onCloseMobile();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm văn bản đến</span>
            </button>

            <button
              id="btn-sidebar-add-outgoing"
              type="button"
              onClick={() => {
                onOpenCreateModal('DI');
                onCloseMobile();
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm văn bản đi</span>
            </button>

            <button
              id="btn-sidebar-add-from-disk"
              type="button"
              onClick={() => diskFileInputRef.current?.click()}
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              title="Chọn tệp PDF, Word, Excel từ ổ đĩa máy tính"
            >
              <HardDrive className="w-4 h-4 text-amber-700" />
              <span>Thêm từ ổ đĩa máy tính</span>
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Danh mục chức năng
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-red-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.badgeClass}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Role Card at Bottom with Emblem */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="rounded-xl p-3 bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 p-0.5 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-center">
              <img
                src="/cand-logo.png"
                alt="Công an hiệu - Công an Nhân dân Việt Nam"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                  {isCommander ? 'Chỉ huy trưởng' : 'Cán bộ đơn vị'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isCommander
                  ? 'Quyền duyệt, chỉ đạo & xóa văn bản'
                  : 'Soạn thảo, tiếp nhận & xử lý'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
