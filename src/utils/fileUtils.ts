// ─── Encryption helpers (AES-256-GCM + PBKDF2) ───────────────────────────────

const SALT_BYTES = 16;
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 200_000;

// Magic header prepended to every encrypted chunk: ASCII "SHRD"
const MAGIC = new Uint8Array([0x53, 0x48, 0x52, 0x44]);
const MAGIC_BYTES = MAGIC.length;

/** Thrown by joinChunks when chunks are encrypted but no password was provided. */
export const NEEDS_PASSWORD_ERROR = 'NEEDS_PASSWORD';

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt a Blob with AES-256-GCM.
 * Output layout: [magic (4 B) | salt (16 B) | IV (12 B) | ciphertext]
 */
export async function encryptBlob(blob: Blob, password: string, salt: Uint8Array<ArrayBuffer>): Promise<Blob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const data = await blob.arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const out = new Uint8Array(MAGIC_BYTES + SALT_BYTES + IV_BYTES + ciphertext.byteLength);
  out.set(MAGIC, 0);
  out.set(salt, MAGIC_BYTES);
  out.set(iv, MAGIC_BYTES + SALT_BYTES);
  out.set(new Uint8Array(ciphertext), MAGIC_BYTES + SALT_BYTES + IV_BYTES);
  return new Blob([out]);
}

/**
 * Decrypt a Blob that was produced by `encryptBlob`.
 * Supports both the new format (magic + salt + IV + ciphertext) and the
 * legacy format (salt + IV + ciphertext) for backward compatibility.
 * Throws if the password is wrong or the data is corrupted.
 */
export async function decryptBlob(blob: Blob, password: string): Promise<Blob> {
  const data = new Uint8Array(await blob.arrayBuffer());
  // Detect new format by checking for the magic header.
  const hasMagic =
    data.length >= MAGIC_BYTES &&
    data[0] === MAGIC[0] && data[1] === MAGIC[1] &&
    data[2] === MAGIC[2] && data[3] === MAGIC[3];
  const offset = hasMagic ? MAGIC_BYTES : 0;
  const salt = data.slice(offset, offset + SALT_BYTES) as Uint8Array<ArrayBuffer>;
  const iv = data.slice(offset + SALT_BYTES, offset + SALT_BYTES + IV_BYTES);
  const ciphertext = data.slice(offset + SALT_BYTES + IV_BYTES);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new Blob([plaintext]);
}

/** Returns true if the blob was encrypted by this app (has the SHRD magic header). */
async function isEncryptedBlob(blob: Blob): Promise<boolean> {
  const header = new Uint8Array(await blob.slice(0, MAGIC_BYTES).arrayBuffer());
  return (
    header[0] === MAGIC[0] && header[1] === MAGIC[1] &&
    header[2] === MAGIC[2] && header[3] === MAGIC[3]
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/** Format bytes into a human-readable string */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/** Compute SHA-256 hash of an ArrayBuffer */
export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Read a File as ArrayBuffer */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/** Trigger a browser file download */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ChunkInfo {
  index: number;
  blob: Blob;
  filename: string;
  size: number;
}

/**
 * Split a File into chunks of `chunkSizeBytes` each.
 * If `password` is provided, every chunk is encrypted with AES-256-GCM.
 * Calls `onProgress(percent)` during splitting.
 */
export async function splitFile(
  file: File,
  chunkSizeBytes: number,
  onProgress?: (percent: number) => void,
  password?: string,
): Promise<ChunkInfo[]> {
  const chunks: ChunkInfo[] = [];
  const totalChunks = Math.ceil(file.size / chunkSizeBytes);
  // One random salt shared by all chunks so the same password decrypts all of them.
  const salt = password
    ? (crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>)
    : undefined;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSizeBytes;
    const end = Math.min(start + chunkSizeBytes, file.size);
    let blob: Blob = file.slice(start, end);
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const basename = file.name.includes('.')
      ? file.name.slice(0, file.name.lastIndexOf('.'))
      : file.name;

    if (password && salt) {
      blob = await encryptBlob(blob, password, salt);
    }

    chunks.push({
      index: i,
      blob,
      filename: `${basename}.part${String(i + 1).padStart(4, '0')}${ext}`,
      size: end - start,
    });
    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalChunks) * 100));
    }
    // Yield to the event loop every 10 chunks to keep UI responsive
    if (i % 10 === 9) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  return chunks;
}

/**
 * Join an array of Files (chunks) into a single Blob.
 * Files should already be sorted in order.
 * If `password` is provided, every chunk is decrypted before joining.
 * Throws `Error(NEEDS_PASSWORD_ERROR)` when chunks are encrypted but no password was given.
 * Calls `onProgress(percent)` during joining.
 */
export async function joinChunks(
  files: File[],
  onProgress?: (percent: number) => void,
  password?: string,
): Promise<Blob> {
  const buffers: ArrayBuffer[] = [];
  for (let i = 0; i < files.length; i++) {
    let data: ArrayBuffer;
    if (password) {
      const decrypted = await decryptBlob(files[i], password);
      data = await decrypted.arrayBuffer();
    } else {
      // Detect encrypted chunks even when no password was supplied.
      if (await isEncryptedBlob(files[i])) {
        throw new Error(NEEDS_PASSWORD_ERROR);
      }
      data = await readFileAsArrayBuffer(files[i]);
    }
    buffers.push(data);
    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 100));
    }
  }
  return new Blob(buffers);
}

/** Sort chunk files by their part number embedded in the filename */
export function sortChunkFiles(files: File[]): File[] {
  return [...files].sort((a, b) => {
    const partA = extractPartNumber(a.name);
    const partB = extractPartNumber(b.name);
    if (partA !== null && partB !== null) return partA - partB;
    return a.name.localeCompare(b.name);
  });
}

function extractPartNumber(filename: string): number | null {
  const match = filename.match(/\.part(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}
