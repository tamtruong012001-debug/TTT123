export type UserRole = 'CHIHUY' | 'CANBO';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  title: string;
  department: string;
  createdAt?: string;
}

export type DocumentType = 'DEN' | 'DI';

export type UrgencyLevel = 'THUONG' | 'KHAN' | 'THUONG_KHAN' | 'HOA_TOC';
export type SecurityLevel = 'THUONG' | 'MAT' | 'TOI_MAT' | 'TUYET_MAT';

export type DocumentStatus = 
  | 'CHO_XU_LY' 
  | 'DANG_XU_LY' 
  | 'HOAN_THANH' 
  | 'LUU_TRU'
  | 'DU_THAO'
  | 'CHO_DUYET'
  | 'DA_KY_BAN_HANH'
  | 'DA_GUI';

export interface DocumentItem {
  id: string;
  type: DocumentType;
  code: string; // Số ký hiệu (ví dụ: 125/UBND-VP)
  incomingNumber?: string; // Số đến (với văn bản đến)
  title: string; // Trích yếu nội dung
  category: string; // Thể loại: Quyết định, Công văn, Kế hoạch, Chỉ thị, Báo cáo, Tờ trình...
  issueDate: string; // Ngày ban hành (YYYY-MM-DD)
  receivedDate?: string; // Ngày đến (YYYY-MM-DD)
  sentDate?: string; // Ngày gửi đi (YYYY-MM-DD)
  senderOrg: string; // Cơ quan ban hành / Nơi gửi
  receiverOrg: string; // Cơ quan nhận / Nơi nhận
  signer: string; // Người ký
  drafter?: string; // Cán bộ soạn thảo
  assignedTo: string; // Cán bộ thụ lý / phụ trách
  urgency: UrgencyLevel;
  security: SecurityLevel;
  deadline?: string; // Hạn xử lý (YYYY-MM-DD)
  status: DocumentStatus;
  directive?: string; // Ý kiến chỉ đạo của Chỉ huy
  notes?: string; // Ghi chú
  attachmentName?: string;
  attachmentSize?: string;
  attachmentData?: string; // Base64 Data URL for real preview and download from disk
  attachmentType?: string; // MIME type e.g. application/pdf, image/jpeg, etc.
  createdAt: string;
  updatedAt: string;
}

export type DeadlineState = 'OVERDUE' | 'DUE_SOON' | 'ON_TRACK' | 'COMPLETED' | 'NO_DEADLINE';

export interface DeadlineInfo {
  state: DeadlineState;
  daysRemaining: number;
  label: string;
  badgeClass: string;
  isUrgentAlert: boolean;
}
