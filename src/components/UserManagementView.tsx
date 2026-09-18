import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Shield, 
  UserCheck, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onCreateUser: (newUser: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, updatedData: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchUser: (user: User) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const isCommander = currentUser.role === 'CHIHUY';

  // Modal create/edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('CANBO');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Visible passwords map
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('123456');
    setFullName('');
    setRole('CANBO');
    setTitle('Cán bộ chuyên viên');
    setDepartment('Phòng Tham mưu - Kế hoạch');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password || '123456');
    setFullName(u.fullName);
    setRole(u.role);
    setTitle(u.title);
    setDepartment(u.department);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập!');
      return;
    }

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên!');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự!');
      return;
    }

    if (editingUser) {
      // Check username collision if changed
      const exists = users.find(
        (u) => u.id !== editingUser.id && u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (exists) {
        setError('Tên đăng nhập này đã được sử dụng bởi tài khoản khác!');
        return;
      }

      onUpdateUser(editingUser.id, {
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        role,
        title: title.trim(),
        department: department.trim(),
      });

      setSuccess(`Đã cập nhật thông tin tài khoản "${fullName}" thành công!`);
    } else {
      // Check username collision
      const exists = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (exists) {
        setError('Tên đăng nhập đã tồn tại!');
        return;
      }

      onCreateUser({
        username: username.trim().toLowerCase(),
        password: password.trim(),
        fullName: fullName.trim(),
        role,
        title: title.trim() || (role === 'CHIHUY' ? 'Chỉ huy phó' : 'Cán bộ'),
        department: department.trim() || 'Ban Chỉ huy',
        createdAt: new Date().toISOString().split('T')[0],
      });

      setSuccess(`Đã tạo mới tài khoản "${username}" thành công!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDelete = (u: User) => {
    if (u.id === currentUser.id) {
      alert('Bạn không thể xóa tài khoản đang đăng nhập!');
      return;
    }

    const commanderCount = users.filter((x) => x.role === 'CHIHUY').length;
    if (u.role === 'CHIHUY' && commanderCount <= 1) {
      alert('Không thể xóa! Hệ thống phải duy trì ít nhất một tài khoản Chỉ huy.');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.fullName}" (@${u.username}) không?`)) {
      onDeleteUser(u.id);
      setSuccess(`Đã xóa tài khoản "${u.username}"!`);
      setTimeout(() => setSuccess(''), 3500);
    }
  };

  return (
    <div id="user-management-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Phân quyền & Quản lý Tài khoản
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tạo nhiều tài khoản, thiết lập mật khẩu và đổi tên người dùng trong từng tài khoản
            </p>
          </div>
        </div>

        <button
          id="btn-add-new-user"
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tạo tài khoản mới</span>
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Danh sách tài khoản ({users.length} người dùng)
          </div>
          <span className="text-xs text-slate-500">
            Bấm "Đăng nhập nhanh" để chuyển đổi kiểm thử
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4 w-44">Tài khoản (Username)</th>
                <th className="py-3 px-4">Họ và tên người dùng</th>
                <th className="py-3 px-4 w-40">Vai trò & Quyền</th>
                <th className="py-3 px-4 w-48">Chức vụ & Phòng ban</th>
                <th className="py-3 px-4 w-36">Mật khẩu</th>
                <th className="py-3 px-4 w-36 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const isCmd = u.role === 'CHIHUY';
                const showPwd = !!showPasswordMap[u.id];

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Username & Avatar */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCmd ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {isCmd ? 'CH' : 'CB'}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span>@{u.username}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold font-sans">
                                Bạn
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">ID: {u.id.substring(0, 10)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Full Name */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-bold text-slate-800 text-sm">{u.fullName}</div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Đổi tên & chức danh</span>
                      </button>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 align-middle">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isCmd
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{isCmd ? 'Chỉ huy (Có quyền xóa)' : 'Cán bộ'}</span>
                      </span>
                    </td>

                    {/* Title & Department */}
                    <td className="py-3.5 px-4 align-middle text-xs">
                      <div className="font-medium text-slate-800">{u.title}</div>
                      <div className="text-slate-500 mt-0.5">{u.department}</div>
                    </td>

                    {/* Password */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[70px]">
                          {showPwd ? u.password || '123456' : '••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded"
                          title={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap space-x-1">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onSwitchUser(u)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Chuyển ngay sang đăng nhập bằng tài khoản này"
                        >
                          Đăng nhập
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {isCommander && !isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="inline-block p-1.5 text-slate-300 opacity-40">
                          <Lock className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div
          id="user-form-modal-overlay"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="user-form-modal-box"
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? `Chỉnh sửa tài khoản: @${editingUser.username}` : 'Tạo mới tài khoản người dùng'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser ? 'Cập nhật họ tên, mật khẩu và quyền hạn' : 'Cấp quyền đăng nhập mới vào phần mềm'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên đăng nhập (Username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: datqt, canbo1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (VD: 123456)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên người dùng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Trung tá Quách Tấn Đạt, Đại úy Lê Văn A..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phân quyền vai trò:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CHIHUY')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'CHIHUY'
                        ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-red-800 text-xs sm:text-sm">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>Chỉ huy</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Toàn quyền chỉ đạo, duyệt và ĐƯỢC XÓA văn bản
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('CANBO')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'CANBO'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-blue-800 text-xs sm:text-sm">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Cán bộ</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Soạn thảo, cập nhật tiến độ, KHÔNG được xóa văn bản
                    </p>
                  </button>
                </div>
              </div>

              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức vụ / Chức danh
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Chỉ huy trưởng, Cán bộ tham mưu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng ban / Đơn vị
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="VD: Ban Chỉ huy, Phòng Kế hoạch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  id="btn-submit-save-user"
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{editingUser ? 'Lưu cập nhật' : 'Tạo tài khoản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
