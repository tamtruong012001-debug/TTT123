/**
 * Utilities for importing and handling document files from the user's hard drive / computer disk
 */

export interface ParsedDocumentFromFile {
  title: string;
  code: string;
  category: string;
  attachmentName: string;
  attachmentSize: string;
  attachmentData?: string;
  attachmentType?: string;
  inferredType: 'DEN' | 'DI';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function parseFileNameToDocumentData(file: File): ParsedDocumentFromFile {
  const originalName = file.name;
  // Remove file extension
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  // Normalize delimiters (replace _ and - with spaces, keep slashes if present)
  let cleanName = baseName.replace(/[\-_]+/g, ' ').trim();
  
  // Check category
  let category = 'Công văn';
  const lowerBase = baseName.toLowerCase();
  if (lowerBase.includes('quyet-dinh') || lowerBase.includes('quyet_dinh') || lowerBase.includes('qd') || lowerBase.includes('quyết định')) {
    category = 'Quyết định';
  } else if (lowerBase.includes('ke-hoach') || lowerBase.includes('ke_hoach') || lowerBase.includes('kh') || lowerBase.includes('kế hoạch')) {
    category = 'Kế hoạch';
  } else if (lowerBase.includes('chi-thi') || lowerBase.includes('chi_thi') || lowerBase.includes('ct') || lowerBase.includes('chỉ thị')) {
    category = 'Chỉ thị';
  } else if (lowerBase.includes('bao-cao') || lowerBase.includes('bao_cao') || lowerBase.includes('bc') || lowerBase.includes('báo cáo')) {
    category = 'Báo cáo';
  } else if (lowerBase.includes('to-trinh') || lowerBase.includes('to_trinh') || lowerBase.includes('tt') || lowerBase.includes('tờ trình')) {
    category = 'Tờ trình';
  } else if (lowerBase.includes('thong-bao') || lowerBase.includes('thong_bao') || lowerBase.includes('tb') || lowerBase.includes('thông báo')) {
    category = 'Thông báo';
  } else if (lowerBase.includes('huong-dan') || lowerBase.includes('huong_dan') || lowerBase.includes('hd') || lowerBase.includes('hướng dẫn')) {
    category = 'Hướng dẫn';
  } else if (lowerBase.includes('ket-luan') || lowerBase.includes('ket_luan') || lowerBase.includes('kl') || lowerBase.includes('kết luận')) {
    category = 'Kết luận';
  }

  // Attempt to extract document number code
  // Examples: "189_UBND_NC", "CV 189 UBND", "125-BCH", "12-2026-QD-UBND"
  let code = '';
  const codeMatch = originalName.match(/(\d+[-_/][A-Za-z0-9\-_/]+)/);
  if (codeMatch) {
    code = codeMatch[1].replace(/_/g, '/');
  } else {
    // Generate an automatic standard code if not found
    const numMatch = originalName.match(/\d+/);
    const num = numMatch ? numMatch[0] : Math.floor(100 + Math.random() * 900);
    code = `${num}/BCH-${category.substring(0, 2).toUpperCase()}`;
  }

  // Generate cleaned-up title
  // If file starts with code or type, remove it from title if possible
  let title = cleanName;
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  if (!title.toLowerCase().startsWith('v/v') && !title.toLowerCase().startsWith('về')) {
    title = `V/v ${title}`;
  }

  // Inferred type: if file contains "den" -> DEN, if "di" -> DI
  let inferredType: 'DEN' | 'DI' = 'DEN';
  if (lowerBase.includes('gui-di') || lowerBase.includes('vb-di') || lowerBase.includes('di_') || lowerBase.includes('-di-')) {
    inferredType = 'DI';
  }

  return {
    title,
    code,
    category,
    attachmentName: originalName,
    attachmentSize: formatFileSize(file.size),
    attachmentType: file.type || 'application/octet-stream',
    inferredType,
  };
}

export function readFileAsDataUrl(file: File): Promise<{
  dataUrl: string;
  name: string;
  size: string;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'application/octet-stream',
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Creates or retrieves a downloadable Data URL for a document item.
 * If attachmentData is present, returns it directly.
 * Otherwise creates an official document text/html summary file so download/preview always works.
 */
export function getDocumentDownloadUrl(doc: {
  code: string;
  title: string;
  attachmentName?: string;
  attachmentData?: string;
  attachmentType?: string;
  senderOrg?: string;
  receiverOrg?: string;
  signer?: string;
  directive?: string;
  issueDate?: string;
}): string {
  if (doc.attachmentData) {
    return doc.attachmentData;
  }

  // Fallback: create an official text content file for demo documents
  const content = `===================================================================
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
===================================================================
ĐƠN VỊ: ${doc.senderOrg || 'BAN CHỈ HUY ĐƠN VỊ'}
Số ký hiệu: ${doc.code}
Ngày ban hành: ${doc.issueDate || new Date().toISOString().split('T')[0]}

TRÍCH YẾU NỘI DUNG:
${doc.title}

NƠI NHẬN: ${doc.receiverOrg || 'Các đơn vị trực thuộc'}
NGƯỜI KÝ: ${doc.signer || 'Chỉ huy đơn vị'}

Ý KIẾN CHỈ ĐẠO CỦA BAN CHỈ HUY:
${doc.directive || 'Thực hiện nghiêm túc theo quy định hiện hành.'}
===================================================================
Tệp tin được xuất từ Hệ thống Quản lý Văn bản & Hồ sơ Công văn.
`;

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}
