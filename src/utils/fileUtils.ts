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
 * Calls `onProgress(percent)` during splitting.
 */
export async function splitFile(
  file: File,
  chunkSizeBytes: number,
  onProgress?: (percent: number) => void,
): Promise<ChunkInfo[]> {
  const chunks: ChunkInfo[] = [];
  const totalChunks = Math.ceil(file.size / chunkSizeBytes);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSizeBytes;
    const end = Math.min(start + chunkSizeBytes, file.size);
    const blob = file.slice(start, end);
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const basename = file.name.includes('.')
      ? file.name.slice(0, file.name.lastIndexOf('.'))
      : file.name;
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
 * Calls `onProgress(percent)` during joining.
 */
export async function joinChunks(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  const buffers: ArrayBuffer[] = [];
  for (let i = 0; i < files.length; i++) {
    const buf = await readFileAsArrayBuffer(files[i]);
    buffers.push(buf);
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
