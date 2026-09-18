import { DocumentItem, DeadlineInfo, UrgencyLevel, SecurityLevel, DocumentStatus, DocumentType } from '../types';

export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function calculateDeadlineInfo(doc: DocumentItem): DeadlineInfo {
  // If completed, no urgency warning
  if (doc.status === 'HOAN_THANH' || doc.status === 'LUU_TRU' || doc.status === 'DA_GUI') {
    return {
      state: 'COMPLETED',
      daysRemaining: 0,
      label: 'Đã hoàn thành',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isUrgentAlert: false,
    };
  }

  if (!doc.deadline) {
    return {
      state: 'NO_DEADLINE',
      daysRemaining: 999,
      label: 'Không có hạn',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      isUrgentAlert: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = doc.deadline.split('-').map(Number);
  const deadlineDate = new Date(year, month - 1, day);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    const absDays = Math.abs(daysDiff);
    return {
      state: 'OVERDUE',
      daysRemaining: daysDiff,
      label: `Quá hạn ${absDays} ngày`,
      badgeClass: 'bg-red-100 text-red-700 border-red-300 font-semibold animate-pulse',
      isUrgentAlert: true,
    };
  } else if (daysDiff === 0) {
    return {
      state: 'DUE_SOON',
      daysRemaining: 0,
      label: 'Hết hạn hôm nay!',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
      isUrgentAlert: true,
    };
  } else if (daysDiff <= 3) {
    return {
      state: 'DUE_SOON',
      daysRemaining: daysDiff,
      label: `Sắp hạn: còn ${daysDiff} ngày`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
      isUrgentAlert: true,
    };
  } else {
    return {
      state: 'ON_TRACK',
      daysRemaining: daysDiff,
      label: `Còn ${daysDiff} ngày`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      isUrgentAlert: false,
    };
  }
}

export function getUrgencyBadge(urgency: UrgencyLevel) {
  switch (urgency) {
    case 'HOA_TOC':
      return { label: 'HỎA TỐC', class: 'bg-red-600 text-white font-bold tracking-wide' };
    case 'THUONG_KHAN':
      return { label: 'Thượng khẩn', class: 'bg-rose-500 text-white font-semibold' };
    case 'KHAN':
      return { label: 'Khẩn', class: 'bg-amber-500 text-white font-semibold' };
    case 'THUONG':
    default:
      return { label: 'Thường', class: 'bg-slate-100 text-slate-700' };
  }
}

export function getSecurityBadge(security: SecurityLevel) {
  switch (security) {
    case 'TUYET_MAT':
      return { label: 'TUYỆT MẬT', class: 'bg-purple-700 text-white font-bold' };
    case 'TOI_MAT':
      return { label: 'Tối mật', class: 'bg-purple-600 text-white font-semibold' };
    case 'MAT':
      return { label: 'Mật', class: 'bg-indigo-500 text-white font-medium' };
    case 'THUONG':
    default:
      return { label: 'Thường', class: 'bg-slate-100 text-slate-600' };
  }
}

export function getStatusBadge(status: DocumentStatus, type: DocumentType) {
  switch (status) {
    // Văn bản đến
    case 'CHO_XU_LY':
      return { label: 'Chờ xử lý', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'DANG_XU_LY':
      return { label: 'Đang xử lý', class: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'HOAN_THANH':
      return { label: 'Hoàn thành', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'LUU_TRU':
      return { label: 'Đã lưu trữ', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    
    // Văn bản đi
    case 'DU_THAO':
      return { label: 'Dự thảo', class: 'bg-slate-100 text-slate-700 border-slate-300' };
    case 'CHO_DUYET':
      return { label: 'Chờ duyệt', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'DA_KY_BAN_HANH':
      return { label: 'Đã ký ban hành', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'DA_GUI':
      return { label: 'Đã gửi đi', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    
    default:
      return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export const CATEGORIES_LIST = [
  'Nghị quyết',
  'Quyết định',
  'Chỉ thị',
  'Công văn',
  'Thông báo',
  'Kế hoạch',
  'Báo cáo',
  'Tờ trình',
  'Biên bản',
  'Hướng dẫn',
];

export const CADRES_LIST = [
  'Đ/c Nguyễn Văn An (Chuyên viên Tổng hợp)',
  'Đ/c Trần Thị Bích (Phó ban Kế hoạch)',
  'Đ/c Lê Văn Cường (Chuyên viên Pháp chế)',
  'Đ/c Phạm Hoàng Dũng (Cán bộ Tham mưu)',
  'Đ/c Vũ Thị Mai (Cán bộ Văn thư - Lưu trữ)',
  'Đ/c Đỗ Mạnh Hùng (Cán bộ Tác chiến)',
];

export function downloadJsonFile(data: unknown, filename: string) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
