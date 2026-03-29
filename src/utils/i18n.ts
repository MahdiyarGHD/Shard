export type Language = 'en' | 'fa';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  splitTab: string;
  joinTab: string;
  // Splitter
  splitTitle: string;
  dropOrClick: string;
  dropFileHere: string;
  selectedFile: string;
  fileSize: string;
  chunkSize: string;
  chunkSizePlaceholder: string;
  chunkSizeUnit: string;
  estimatedChunks: string;
  splitButton: string;
  splitting: string;
  downloadAll: string;
  downloadChunk: string;
  splitProgress: string;
  splitComplete: string;
  chunksCreated: string;
  fileHashLabel: string;
  fileHashCopied: string;
  // Joiner
  joinTitle: string;
  dropChunksHere: string;
  addChunks: string;
  selectedChunks: string;
  noChunks: string;
  clearAll: string;
  removeChunk: string;
  joinButton: string;
  joining: string;
  joinProgress: string;
  joinComplete: string;
  checksum: string;
  checksumLabel: string;
  checksumCopied: string;
  downloadJoined: string;
  outputFilename: string;
  outputFilenamePlaceholder: string;
  // Encryption
  encryptPasswordLabel: string;
  encryptPasswordPlaceholder: string;
  decryptPasswordLabel: string;
  decryptPasswordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  errorWrongPassword: string;
  // Errors
  errorNoFile: string;
  errorInvalidChunkSize: string;
  errorNoChunks: string;
  errorReadingFile: string;
  // Units
  bytes: string;
  kb: string;
  mb: string;
  gb: string;
  // Misc
  secureNote: string;
  langToggle: string;
}

const en: Translations = {
  appTitle: 'Shard',
  appSubtitle: 'Client-side file splitter & joiner — your files never leave your browser.',
  splitTab: 'Split',
  joinTab: 'Join',
  splitTitle: 'Split a File',
  dropOrClick: 'Drop a file here or click to select',
  dropFileHere: 'Drop file here',
  selectedFile: 'Selected file',
  fileSize: 'File size',
  chunkSize: 'Chunk size',
  chunkSizePlaceholder: 'e.g. 10',
  chunkSizeUnit: 'MB',
  estimatedChunks: 'Estimated chunks',
  splitButton: 'Split File',
  splitting: 'Splitting…',
  downloadAll: 'Download All Chunks',
  downloadChunk: 'Download',
  splitProgress: 'Splitting progress',
  splitComplete: 'Split complete!',
  chunksCreated: 'chunks created',
  fileHashLabel: 'Original file SHA-256',
  fileHashCopied: 'Copied!',
  joinTitle: 'Join Chunks',
  dropChunksHere: 'Drop chunk files here or click to add',
  addChunks: 'Add Chunks',
  selectedChunks: 'Selected chunks',
  noChunks: 'No chunks added yet',
  clearAll: 'Clear All',
  removeChunk: 'Remove',
  joinButton: 'Join & Download',
  joining: 'Joining…',
  joinProgress: 'Joining progress',
  joinComplete: 'Join complete!',
  checksum: 'SHA-256',
  checksumLabel: 'SHA-256 Checksum',
  checksumCopied: 'Copied!',
  downloadJoined: 'Download File',
  outputFilename: 'Output filename',
  outputFilenamePlaceholder: 'Leave blank to use original name',
  encryptPasswordLabel: 'Encryption password (optional)',
  encryptPasswordPlaceholder: 'Leave blank for no encryption',
  decryptPasswordLabel: 'Decryption password',
  decryptPasswordPlaceholder: 'Enter password if chunks are encrypted',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  errorWrongPassword: 'Decryption failed — check your password.',
  errorNoFile: 'Please select a file first.',
  errorInvalidChunkSize: 'Please enter a valid chunk size (> 0).',
  errorNoChunks: 'Please add at least one chunk file.',
  errorReadingFile: 'Error reading file. Please try again.',
  bytes: 'B',
  kb: 'KB',
  mb: 'MB',
  gb: 'GB',
  secureNote: 'Fully client-side & secure',
  langToggle: 'فارسی',
};

const fa: Translations = {
  appTitle: 'شارد',
  appSubtitle: 'تقسیم و ادغام فایل — همه‌چیز در مرورگر شما انجام می‌شود.',
  splitTab: 'تقسیم',
  joinTab: 'ادغام',
  splitTitle: 'تقسیم فایل',
  dropOrClick: 'فایل را اینجا بکشید یا کلیک کنید',
  dropFileHere: 'فایل را اینجا رها کنید',
  selectedFile: 'فایل انتخاب‌شده',
  fileSize: 'حجم فایل',
  chunkSize: 'اندازه هر قطعه',
  chunkSizePlaceholder: 'مثلاً ۱۰',
  chunkSizeUnit: 'مگابایت',
  estimatedChunks: 'تعداد قطعات',
  splitButton: 'تقسیم فایل',
  splitting: 'در حال تقسیم…',
  downloadAll: 'دانلود همه قطعات',
  downloadChunk: 'دانلود',
  splitProgress: 'پیشرفت تقسیم',
  splitComplete: 'تقسیم کامل شد!',
  chunksCreated: 'قطعه ساخته شد',
  fileHashLabel: 'SHA-256 فایل اصلی',
  fileHashCopied: 'کپی شد!',
  joinTitle: 'ادغام قطعات',
  dropChunksHere: 'فایل‌های قطعه را اینجا بکشید یا کلیک کنید',
  addChunks: 'افزودن قطعات',
  selectedChunks: 'قطعات انتخاب‌شده',
  noChunks: 'هنوز قطعه‌ای اضافه نشده',
  clearAll: 'پاک‌کردن همه',
  removeChunk: 'حذف',
  joinButton: 'ادغام و دانلود',
  joining: 'در حال ادغام…',
  joinProgress: 'پیشرفت ادغام',
  joinComplete: 'ادغام کامل شد!',
  checksum: 'SHA-256',
  checksumLabel: 'چکسام SHA-256',
  checksumCopied: 'کپی شد!',
  downloadJoined: 'دانلود فایل',
  outputFilename: 'نام فایل خروجی',
  outputFilenamePlaceholder: 'خالی بگذارید تا از نام اصلی استفاده شود',
  encryptPasswordLabel: 'رمز عبور رمزنگاری (اختیاری)',
  encryptPasswordPlaceholder: 'برای عدم رمزنگاری خالی بگذارید',
  decryptPasswordLabel: 'رمز عبور رمزگشایی',
  decryptPasswordPlaceholder: 'اگر قطعات رمزنگاری شده‌اند وارد کنید',
  showPassword: 'نمایش رمز عبور',
  hidePassword: 'پنهان کردن رمز عبور',
  errorWrongPassword: 'رمزگشایی ناموفق — رمز عبور را بررسی کنید.',
  errorNoFile: 'لطفاً ابتدا یک فایل انتخاب کنید.',
  errorInvalidChunkSize: 'لطفاً یک اندازه معتبر (بیشتر از صفر) وارد کنید.',
  errorNoChunks: 'لطفاً حداقل یک فایل قطعه اضافه کنید.',
  errorReadingFile: 'خطا در خواندن فایل. لطفاً دوباره تلاش کنید.',
  bytes: 'بایت',
  kb: 'کیلوبایت',
  mb: 'مگابایت',
  gb: 'گیگابایت',
  secureNote: 'کاملاً آفلاین و ایمن',
  langToggle: 'English',
};

export const translations: Record<Language, Translations> = { en, fa };
