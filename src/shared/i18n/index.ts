/**
 * Minimal i18n helper for Compresso.
 *
 * Language is stored in localStorage and defaults to the browser language
 * (Vietnamese when the browser is set to `vi`, English otherwise). Components
 * read strings with `t(key)` and re-render when the language changes by
 * listening for the `langchange` window event.
 */

export type Lang = 'en' | 'vi';

const STORAGE_KEY = 'compresso-lang';

const dict = {
  en: {
    'lang.label': 'Language',

    // Editor / options panel
    'opt.resize': 'Resize',
    'opt.reducePalette': 'Reduce palette',
    'opt.compress': 'Compress',
    'opt.originalImage': 'Original Image',
    'opt.loading': 'Loading…',
    'opt.percent': 'Percent:',
    'opt.method': 'Method:',
    'opt.preset': 'Preset:',
    'opt.width': 'Width:',
    'opt.height': 'Height:',
    'opt.custom': 'Custom',
    'opt.premultiply': 'Premultiply alpha channel',
    'opt.maintainAspect': 'Maintain aspect ratio',
    'opt.fitMethod': 'Fit method:',
    'opt.stretch': 'Stretch',
    'opt.contain': 'Contain',
    'opt.colors': 'Colors:',
    'opt.standard': 'Standard',
    'opt.quality': 'Quality:',
    'opt.effort': 'Effort:',
    'opt.lossless': 'Lossless',
    'opt.advanced': 'Advanced settings',
    'opt.preserveTransparent': 'Preserve transparent data',
    'opt.slightLoss': 'Slight loss:',
    'opt.discreteTone': 'Discrete tone image',
    'opt.download': 'Download',
    'tip.back': 'Back',
    'tip.reset': 'Reset bulk settings',
    'tip.copyOther': 'Copy settings to other side',
    'tip.saveBulk': 'Save bulk settings',
    'tip.saveSide': 'Save side settings',
    'tip.importSide': 'Import saved side settings',

    // Bulk workspace
    'bulk.settings': 'Settings',
    'bulk.done': 'Done',
    'bulk.saved': 'saved',
    'bulk.downloadAll': 'Download all (.zip)',
    'bulk.compressing': 'Compressing…',
    'bulk.error': 'Failed',
    'bulk.edit': 'Fine-tune',
    'bulk.empty': 'No images',

    // Advanced encoder options (keyed by the English label itself)
    'Compress alpha': 'Compress alpha',
    'Alpha quality:': 'Alpha quality:',
    'Alpha Quality:': 'Alpha Quality:',
    'Alpha filter quality:': 'Alpha filter quality:',
    'Auto adjust filter strength': 'Auto adjust filter strength',
    'Filter strength:': 'Filter strength:',
    'Strong filter': 'Strong filter',
    'Filter sharpness:': 'Filter sharpness:',
    'Sharp RGB→YUV conversion': 'Sharp RGB→YUV conversion',
    'Passes:': 'Passes:',
    'Spatial noise shaping:': 'Spatial noise shaping:',
    'Preprocess:': 'Preprocess:',
    None: 'None',
    'Segment smooth': 'Segment smooth',
    'Pseudo-random dithering': 'Pseudo-random dithering',
    'Segments:': 'Segments:',
    'Partitions:': 'Partitions:',
    'Channels:': 'Channels:',
    Grayscale: 'Grayscale',
    'Auto subsample chroma': 'Auto subsample chroma',
    'Subsample chroma by:': 'Subsample chroma by:',
    'Separate chroma quality': 'Separate chroma quality',
    'Chroma quality:': 'Chroma quality:',
    'Pointless spec compliance': 'Pointless spec compliance',
    'Progressive rendering': 'Progressive rendering',
    'Optimize Huffman table': 'Optimize Huffman table',
    'Smoothing:': 'Smoothing:',
    'Quantization:': 'Quantization:',
    Flat: 'Flat',
    'Trellis multipass': 'Trellis multipass',
    'Optimize zero block runs': 'Optimize zero block runs',
    'Optimize after trellis quantization':
      'Optimize after trellis quantization',
    'Trellis quantization passes:': 'Trellis quantization passes:',
    'Subsample chroma:': 'Subsample chroma:',
    'Sharp YUV Downsampling': 'Sharp YUV Downsampling',
    'Separate alpha quality': 'Separate alpha quality',
    'Extra chroma compression': 'Extra chroma compression',
    'Sharpness:': 'Sharpness:',
    'Noise synthesis:': 'Noise synthesis:',
    'Tuning:': 'Tuning:',
    Auto: 'Auto',
    'Log2 of tile rows:': 'Log2 of tile rows:',
    'Log2 of tile cols:': 'Log2 of tile cols:',
    'Slight loss': 'Slight loss',
    'Slight loss:': 'Slight loss:',
    'Alternative lossy mode': 'Alternative lossy mode',
    'Auto edge filter': 'Auto edge filter',
    'Edge preserving filter:': 'Edge preserving filter:',
    'Optimise for decoding speed (worse compression):':
      'Optimise for decoding speed (worse compression):',
    'Noise equivalent to ISO:': 'Noise equivalent to ISO:',
    'Error diffusion:': 'Error diffusion:',
    Vary: 'Vary',
    Half: 'Half',
    Off: 'Off',
    'Color space:': 'Color space:',
    'Random matrix': 'Random matrix',
    Interlace: 'Interlace',

    'hero.title': 'Drop images to compress',
    'hero.sub': 'One image or a whole batch — optimised locally in your browser.',
    'hero.choose': 'Choose images',
    'hero.paste': 'Paste from clipboard',
    'hero.hint': 'Nothing is uploaded · your images never leave this device',
    'feat.bulk.title': 'Bulk',
    'feat.bulk.text':
      'Compress dozens of images at once and download them all as a single zip.',
    'feat.smaller.title': 'Smaller',
    'feat.smaller.text':
      'Modern codecs cut file size dramatically while keeping images looking sharp.',
    'feat.private.title': 'Private',
    'feat.private.text':
      'Everything runs on your device. No servers, no accounts, no tracking of your images.',
    'footer.tagline': 'A tool by Phạm Lâm Tùng, M.Sc.',
  },
  vi: {
    'lang.label': 'Ngôn ngữ',

    // Editor / options panel
    'opt.resize': 'Đổi kích thước',
    'opt.reducePalette': 'Giảm bảng màu',
    'opt.compress': 'Nén',
    'opt.originalImage': 'Ảnh gốc',
    'opt.loading': 'Đang tải…',
    'opt.percent': 'Phần trăm:',
    'opt.method': 'Phương pháp:',
    'opt.preset': 'Mẫu dựng sẵn:',
    'opt.width': 'Chiều rộng:',
    'opt.height': 'Chiều cao:',
    'opt.custom': 'Tùy chỉnh',
    'opt.premultiply': 'Nhân sẵn kênh alpha',
    'opt.maintainAspect': 'Giữ tỉ lệ khung',
    'opt.fitMethod': 'Cách vừa khung:',
    'opt.stretch': 'Kéo giãn',
    'opt.contain': 'Vừa khung',
    'opt.colors': 'Số màu:',
    'opt.standard': 'Chuẩn',
    'opt.quality': 'Chất lượng:',
    'opt.effort': 'Nỗ lực:',
    'opt.lossless': 'Không mất dữ liệu (lossless)',
    'opt.advanced': 'Cài đặt nâng cao',
    'opt.preserveTransparent': 'Giữ dữ liệu trong suốt',
    'opt.slightLoss': 'Mất mát nhẹ:',
    'opt.discreteTone': 'Ảnh tông rời rạc',
    'opt.download': 'Tải về',
    'tip.back': 'Quay lại',
    'tip.reset': 'Đặt lại cấu hình hàng loạt',
    'tip.copyOther': 'Sao chép cấu hình sang bên kia',
    'tip.saveBulk': 'Lưu cấu hình hàng loạt',
    'tip.saveSide': 'Lưu cấu hình bên này',
    'tip.importSide': 'Nhập cấu hình đã lưu',

    // Bulk workspace
    'bulk.settings': 'Cài đặt',
    'bulk.done': 'Đã xong',
    'bulk.saved': 'tiết kiệm',
    'bulk.downloadAll': 'Tải tất cả (.zip)',
    'bulk.compressing': 'Đang nén…',
    'bulk.error': 'Lỗi',
    'bulk.edit': 'Tinh chỉnh',
    'bulk.empty': 'Chưa có ảnh',

    // Advanced encoder options
    'Compress alpha': 'Nén kênh alpha',
    'Alpha quality:': 'Chất lượng alpha:',
    'Alpha Quality:': 'Chất lượng alpha:',
    'Alpha filter quality:': 'Chất lượng lọc alpha:',
    'Auto adjust filter strength': 'Tự chỉnh độ mạnh bộ lọc',
    'Filter strength:': 'Độ mạnh bộ lọc:',
    'Strong filter': 'Bộ lọc mạnh',
    'Filter sharpness:': 'Độ nét bộ lọc:',
    'Sharp RGB→YUV conversion': 'Chuyển RGB→YUV sắc nét',
    'Passes:': 'Số lượt:',
    'Spatial noise shaping:': 'Định hình nhiễu không gian:',
    'Preprocess:': 'Tiền xử lý:',
    None: 'Không',
    'Segment smooth': 'Làm mượt phân đoạn',
    'Pseudo-random dithering': 'Rung màu giả ngẫu nhiên',
    'Segments:': 'Số phân đoạn:',
    'Partitions:': 'Số phân vùng:',
    'Channels:': 'Kênh màu:',
    Grayscale: 'Thang xám',
    'Auto subsample chroma': 'Tự lấy mẫu con chroma',
    'Subsample chroma by:': 'Lấy mẫu con chroma theo:',
    'Separate chroma quality': 'Tách chất lượng chroma',
    'Chroma quality:': 'Chất lượng chroma:',
    'Pointless spec compliance': 'Tuân thủ chuẩn (không cần thiết)',
    'Progressive rendering': 'Hiển thị lũy tiến',
    'Optimize Huffman table': 'Tối ưu bảng Huffman',
    'Smoothing:': 'Làm mượt:',
    'Quantization:': 'Lượng tử hóa:',
    Flat: 'Phẳng',
    'Trellis multipass': 'Trellis nhiều lượt',
    'Optimize zero block runs': 'Tối ưu chuỗi khối 0',
    'Optimize after trellis quantization': 'Tối ưu sau lượng tử trellis',
    'Trellis quantization passes:': 'Số lượt lượng tử trellis:',
    'Subsample chroma:': 'Lấy mẫu con chroma:',
    'Sharp YUV Downsampling': 'Giảm mẫu YUV sắc nét',
    'Separate alpha quality': 'Tách chất lượng alpha',
    'Extra chroma compression': 'Nén chroma thêm',
    'Sharpness:': 'Độ nét:',
    'Noise synthesis:': 'Tổng hợp nhiễu:',
    'Tuning:': 'Tinh chỉnh:',
    Auto: 'Tự động',
    'Log2 of tile rows:': 'Log2 số hàng ô:',
    'Log2 of tile cols:': 'Log2 số cột ô:',
    'Slight loss': 'Mất mát nhẹ',
    'Slight loss:': 'Mất mát nhẹ:',
    'Alternative lossy mode': 'Chế độ mất dữ liệu thay thế',
    'Auto edge filter': 'Tự động lọc biên',
    'Edge preserving filter:': 'Bộ lọc giữ biên:',
    'Optimise for decoding speed (worse compression):':
      'Tối ưu tốc độ giải mã (nén kém hơn):',
    'Noise equivalent to ISO:': 'Nhiễu tương đương ISO:',
    'Error diffusion:': 'Khuếch tán lỗi:',
    Vary: 'Thay đổi',
    Half: 'Nửa',
    Off: 'Tắt',
    'Color space:': 'Không gian màu:',
    'Random matrix': 'Ma trận ngẫu nhiên',
    Interlace: 'Xen kẽ',
    'hero.title': 'Kéo thả ảnh để nén',
    'hero.sub':
      'Một ảnh hay cả loạt ảnh — tối ưu ngay trên trình duyệt của bạn.',
    'hero.choose': 'Chọn ảnh',
    'hero.paste': 'Dán từ clipboard',
    'hero.hint':
      'Không tải lên máy chủ · ảnh không rời khỏi thiết bị của bạn',
    'feat.bulk.title': 'Hàng loạt',
    'feat.bulk.text':
      'Nén hàng chục ảnh cùng lúc và tải tất cả về trong một tệp zip.',
    'feat.smaller.title': 'Nhẹ hơn',
    'feat.smaller.text':
      'Các codec hiện đại giảm mạnh dung lượng mà vẫn giữ ảnh sắc nét.',
    'feat.private.title': 'Riêng tư',
    'feat.private.text':
      'Mọi thứ chạy trên thiết bị của bạn. Không máy chủ, không tài khoản, không theo dõi ảnh.',
    'footer.tagline': 'Công cụ được thực hiện bởi ThS. Phạm Lâm Tùng',
  },
} as const;

export type MessageKey = keyof (typeof dict)['en'];

function detectLang(): Lang {
  if (__PRERENDER__ || typeof localStorage === 'undefined') return 'en';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'vi') return saved;
  return typeof navigator !== 'undefined' &&
    navigator.language?.toLowerCase().startsWith('vi')
    ? 'vi'
    : 'en';
}

let current: Lang = detectLang();

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  if (__PRERENDER__ || typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  document.documentElement.lang = lang;
  window.dispatchEvent(new CustomEvent('langchange'));
}

export function t(key: MessageKey): string {
  return dict[current][key] ?? dict.en[key] ?? key;
}
