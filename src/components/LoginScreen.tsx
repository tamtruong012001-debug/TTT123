import React, { useState } from 'react';
import { Shield, UserCheck, KeyRound, AlertCircle, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/initialData';

interface LoginScreenProps {
  users?: User[];
  onLogin: (user: User) => void;
  onCreateUser?: (newUser: Omit<User, 'id'>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  users = DEMO_USERS, 
  onLogin,
  onCreateUser,
}) => {
  const [username, setUsername] = useState('chihuy');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Quick Register State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CANBO');
  const [regTitle, setRegTitle] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regError, setRegError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!foundUser) {
      setError(`Tài khoản "${username}" không tồn tại trong hệ thống!`);
      return;
    }

    const expectedPassword = foundUser.password || '123456';
    if (password !== expectedPassword) {
      setError('Mật khẩu không chính xác! Vui lòng thử lại.');
      return;
    }

    onLogin(foundUser);
  };

  const selectDemoAccount = (u: User) => {
    setUsername(u.username);
    setPassword(u.password || '123456');
    setError('');
    onLogin(u);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUsername.trim()) {
      setRegError('Vui lòng nhập tên tài khoản!');
      return;
    }
    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên!');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Mật khẩu phải từ 4 ký tự trở lên!');
      return;
    }

    const exists = users.find((u) => u.username.toLowerCase() === regUsername.trim().toLowerCase());
    if (exists) {
      setRegError('Tên tài khoản này đã được sử dụng!');
      return;
    }

    if (onCreateUser) {
      onCreateUser({
        username: regUsername.trim().toLowerCase(),
        password: regPassword.trim(),
        fullName: regFullName.trim(),
        role: regRole,
        title: regTitle.trim() || (regRole === 'CHIHUY' ? 'Chỉ huy phó' : 'Cán bộ'),
        department: regDept.trim() || 'Ban Chỉ huy',
        createdAt: new Date().toISOString().split('T')[0],
      });

      setUsername(regUsername.trim().toLowerCase());
      setPassword(regPassword.trim());
      setIsRegisterOpen(false);
      setError('');
    }
  };

  return (
    <div id="login-container" className="min-h-screen relative flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Tactical Police Background Image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/cscd-background.jpg"
          alt="Cảnh sát Cơ động CSCĐ"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-[1.02] filter brightness-[0.65] contrast-[1.08]"
        />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/80" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 p-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/40 shadow-2xl shadow-black/80 flex items-center justify-center">
              <img
                src="/cand-logo.png"
                alt="Công an hiệu - Công an Nhân dân Việt Nam"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
            QUẢN LÝ VĂN BẢN
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-semibold tracking-wide uppercase mt-1 drop-shadow-sm">
            Hệ thống Quản lý Công văn Đến & Đi
          </p>
          <div className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs bg-red-950/90 text-amber-300 border border-amber-500/40 shadow-xs">
            Lực lượng Cảnh sát Cơ động - Quản lý điện tử
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Đăng nhập hệ thống
            </h2>

            {onCreateUser && (
              <button
                type="button"
                onClick={() => setIsRegisterOpen((prev) => !prev)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isRegisterOpen ? 'Đóng tạo tài khoản' : '+ Tạo tài khoản'}</span>
              </button>
            )}
          </div>

          {/* Quick Register Drawer */}
          {isRegisterOpen && (
            <form onSubmit={handleRegisterSubmit} className="mb-5 p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Cấp tài khoản & Mật khẩu mới</span>
              </div>

              {regError && (
                <div className="p-2 rounded bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  {regError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-0.5">Tên đăng nhập *</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="VD: user1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-0.5">Mật khẩu *</label>
                  <input
                    type="text"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-0.5">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="VD: Thiếu tá Nguyễn Văn B"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-0.5">Vai trò</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="CANBO">Cán bộ (Không được xóa)</option>
                    <option value="CHIHUY">Chỉ huy (Được quyền xóa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-0.5">Chức vụ</label>
                  <input
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="VD: Trợ lý tác chiến"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Xác nhận tạo tài khoản
              </button>
            </form>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tài khoản đăng nhập
              </label>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản"
                required
                className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-red-950/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vào hệ thống làm việc</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Accounts List Section */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Chọn nhanh tài khoản có trong hệ thống ({users.length}):
            </p>

            <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {users.map((u) => {
                const isCommander = u.role === 'CHIHUY';
                return (
                  <button
                    key={u.id}
                    id={`btn-demo-${u.username}`}
                    type="button"
                    onClick={() => selectDemoAccount(u)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCommander
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        }`}
                      >
                        {isCommander ? 'CH' : 'CB'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{u.fullName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-mono shrink-0">
                            @{u.username}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {u.title} • {isCommander ? 'Được xóa' : 'Không xóa'}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      Đăng nhập →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Hệ thống lưu trữ bảo mật cục bộ • Có thể tạo tài khoản và đổi tên tùy ý
        </div>
      </div>
    </div>
  );
};
