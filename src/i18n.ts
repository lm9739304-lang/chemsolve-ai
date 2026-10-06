export type Lang = 'vi' | 'en'

export const T: Record<string, Record<Lang, string>> = {
  brand: { vi: 'ChemSolve AI', en: 'ChemSolve AI' },
  home: { vi: 'Trang chủ', en: 'Home' },
  solver: { vi: 'Giải bài tập AI', en: 'AI Solver' },
  tools: { vi: 'Công cụ', en: 'Tools' },
  table: { vi: 'Bảng tuần hoàn', en: 'Periodic Table' },
  history: { vi: 'Lịch sử', en: 'History' },
  settings: { vi: 'Cài đặt', en: 'Settings' },
  heroTitle: { vi: 'Trợ lý Hóa học AI của bạn', en: 'Your AI Chemistry Solver' },
  heroSub: { vi: 'Giải, cân bằng, tính toán và hiểu hóa học.', en: 'Solve, balance, calculate, and understand chemistry.' },
  askPlaceholder: { vi: 'Hỏi bất kỳ câu hỏi hóa học nào...', en: 'Ask any chemistry question...' },
  solve: { vi: 'Giải', en: 'Solve' },
  upload: { vi: 'Tải ảnh lên', en: 'Upload Image' },
  balancer: { vi: 'Cân bằng phương trình', en: 'Equation Balancer' },
  examples: { vi: 'Câu hỏi ví dụ', en: 'Example questions' },
  dark: { vi: 'Tối', en: 'Dark' },
  light: { vi: 'Sáng', en: 'Light' },
  theme: { vi: 'Giao diện', en: 'Theme' },
  language: { vi: 'Ngôn ngữ', en: 'Language' },
  copy: { vi: 'Sao chép', en: 'Copy' },
  clear: { vi: 'Xóa hội thoại', en: 'Clear conversation' },
  send: { vi: 'Gửi', en: 'Send' },
  regenerate: { vi: 'Tạo lại', en: 'Regenerate' },
  simpler: { vi: 'Giải thích đơn giản hơn', en: 'Explain simpler' },
  detailed: { vi: 'Trình bày chi tiết', en: 'Show detailed solution' },
  onlyAnswer: { vi: 'Chỉ hiện đáp án', en: 'Show only answer' },
  checkMine: { vi: 'Kiểm tra đáp án của tôi', en: 'Check my answer' },
  darkMode: { vi: 'Chế độ tối', en: 'Dark mode' },
  lightMode: { vi: 'Chế độ sáng', en: 'Light mode' },
}

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? key
}
