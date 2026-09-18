import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  LogOut, 
  UserCheck, 
  Menu, 
  AlertTriangle, 
  User as UserIcon,
  RefreshCw,
  Edit3,
  ChevronDown,
  KeyRound
} from 'lucide-react';
import { User, DocumentItem } from '../types';
import { calculateDeadlineInfo } from '../utils/documentUtils';

interface NavbarProps {
  currentUser: User;
  users?: User[];
  onLogout: () => void;
  onSwitchUser: (newUser: User) => void;
  onOpenProfile: () => void;
  documents: DocumentItem[];
  onOpenNotifications: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users = [],
  onLogout,
  onSwitchUser,
  onOpenProfile,
  documents,
  onOpenNotifications,
  onToggleMobileSidebar,
}) => {
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const isCommander = currentUser.role === 'CHIHUY';

  // Count overdue and due-soon documents
  const alertDocs = documents.filter((doc) => {
    const deadlineInfo = calculateDeadlineInfo(doc);
    return deadlineInfo.isUrgentAlert;
  });

  const overdueDocs = alertDocs.filter((doc) => calculateDeadlineInfo(doc).state === 'OVERDUE');

  // Other accounts to switch between
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  return (
    <header id="main-navbar" className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Trigger + Brand */}
          <div className="flex items-center gap-3">
            <button
              id="btn-mobile-sidebar-toggle"
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 shrink-0 flex items-center justify-center p-0.5 rounded-xl bg-slate-900/80 border border-amber-500/40 shadow-md">
                <img
                  src="/cand-logo.png"
                  alt="Công an hiệu - Công an Nhân dân Việt Nam"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block drop-shadow-xs">
                  QUẢN LÝ VĂN BẢN
                </span>
                <span className="text-[11px] text-amber-400 font-semibold tracking-wide hidden sm:block">
                  Hệ thống Công văn Đến & Đi - Lực lượng CSCĐ
                </span>
              </div>
            </div>
          </div>

          {/* Right: Notification bell, current user profile & switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Alert Bell */}
            <button
              id="btn-navbar-notifications"
              type="button"
              onClick={onOpenNotifications}
              className={`relative p-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                alertDocs.length > 0
                  ? 'bg-red-950/70 text-red-300 border border-red-500/40 hover:bg-red-900/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Xem danh sách cảnh báo hạn"
            >
              {overdueDocs.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
              ) : (
                <Bell className="w-5 h-5 text-amber-400" />
              )}
              {alertDocs.length > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">
                  {alertDocs.length}
                </span>
              )}
            </button>

            {/* User Profile Button (Click to edit name/password) */}
            <button
              id="btn-navbar-profile"
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all text-left cursor-pointer group"
              title="Bấm để đổi họ tên, chức danh và mật khẩu"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isCommander ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {isCommander ? 'CH' : 'CB'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span className="group-hover:text-amber-300 transition-colors">{currentUser.fullName}</span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>@{currentUser.username}</span>
                  <span>•</span>
                  <span className={isCommander ? 'text-red-400 font-semibold' : 'text-blue-400'}>
                    {isCommander ? 'Chỉ huy (Được xóa)' : 'Cán bộ'}
                  </span>
                </div>
              </div>
            </button>

            {/* Quick Switch Dropdown */}
            {otherUsers.length > 0 && (
              <div className="relative">
                <button
                  id="btn-switch-account-menu"
                  type="button"
                  onClick={() => setIsSwitchMenuOpen((prev) => !prev)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Chuyển sang tài khoản khác"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Đổi TK</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isSwitchMenuOpen && (
                  <div
                    id="switch-account-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
                      Chuyển đổi người dùng:
                    </div>
                    {otherUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onSwitchUser(u);
                          setIsSwitchMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center gap-2 text-white transition-colors cursor-pointer"
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            u.role === 'CHIHUY' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        >
                          {u.role === 'CHIHUY' ? 'CH' : 'CB'}
                        </span>
                        <div className="truncate">
                          <div className="font-semibold truncate">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400 truncate">@{u.username} • {u.title}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <button
              id="btn-logout"
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đăng xuất"
              aria-label="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
