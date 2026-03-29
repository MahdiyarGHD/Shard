import { useState, useCallback } from 'react';
import type { Translations } from '../utils/i18n';
import {
  formatBytes,
  splitFile,
  downloadBlob,
  type ChunkInfo,
} from '../utils/fileUtils';
import DropZone from './DropZone';
import ProgressBar from './ProgressBar';

const CHUNK_SIZE_STORAGE_KEY = 'shard-chunk-size';
const DEFAULT_CHUNK_MB = 10;

function getInitialChunkSize(): string {
  try {
    const stored = localStorage.getItem(CHUNK_SIZE_STORAGE_KEY);
    if (stored && !isNaN(Number(stored)) && Number(stored) > 0) return stored;
  } catch {
    // ignore
  }
  return String(DEFAULT_CHUNK_MB);
}

interface FileSplitterProps {
  t: Translations;
  isRTL: boolean;
}

export default function FileSplitter({ t, isRTL }: FileSplitterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [chunkSizeMB, setChunkSizeMB] = useState<string>(getInitialChunkSize);
  const [splitting, setSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [error, setError] = useState('');

  const handleFileSelect = useCallback((files: File[]) => {
    setFile(files[0]);
    setChunks([]);
    setError('');
    setProgress(0);
  }, []);

  const chunkSizeBytes = parseFloat(chunkSizeMB) * 1024 * 1024;
  const estimatedChunks =
    file && chunkSizeBytes > 0
      ? Math.ceil(file.size / chunkSizeBytes)
      : 0;

  async function handleSplit() {
    if (!file) { setError(t.errorNoFile); return; }
    const mb = parseFloat(chunkSizeMB);
    if (!mb || mb <= 0) { setError(t.errorInvalidChunkSize); return; }
    setError('');
    setSplitting(true);
    setProgress(0);
    setChunks([]);
    try {
      localStorage.setItem(CHUNK_SIZE_STORAGE_KEY, chunkSizeMB);
      const result = await splitFile(file, mb * 1024 * 1024, setProgress);
      setChunks(result);
    } catch {
      setError(t.errorReadingFile);
    } finally {
      setSplitting(false);
    }
  }

  function handleDownloadChunk(chunk: ChunkInfo) {
    downloadBlob(chunk.blob, chunk.filename);
  }

  function handleDownloadAll() {
    chunks.forEach((chunk) => downloadBlob(chunk.blob, chunk.filename));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-slate-100">{t.splitTitle}</h2>

      {/* Drop Zone */}
      <DropZone t={t} onFiles={handleFileSelect}>
        {file ? (
          <div className="space-y-1">
            <p className="text-indigo-400 font-medium text-sm break-all">{file.name}</p>
            <p className="text-slate-400 text-xs">
              {t.fileSize}: {formatBytes(file.size)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg
                className="w-10 h-10 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">{t.dropOrClick}</p>
          </div>
        )}
      </DropZone>

      {/* Chunk size input */}
      <div className="space-y-2">
        <label className="block text-sm text-slate-300">{t.chunkSize}</label>
        <div className={`flex gap-2 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={chunkSizeMB}
            onChange={(e) => setChunkSizeMB(e.target.value)}
            placeholder={t.chunkSizePlaceholder}
            className="
              flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5
              text-slate-100 placeholder-slate-500 text-sm
              focus:outline-none focus:border-indigo-400 transition-colors
            "
          />
          <span className="text-slate-400 text-sm whitespace-nowrap">{t.chunkSizeUnit}</span>
        </div>
        {file && chunkSizeBytes > 0 && (
          <p className="text-slate-400 text-xs">
            {t.estimatedChunks}: <span className="text-indigo-400 font-medium">{estimatedChunks}</span>
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm animate-fade-in">{error}</p>
      )}

      {/* Split button */}
      <button
        onClick={handleSplit}
        disabled={splitting || !file}
        className="
          w-full py-3 rounded-xl font-medium text-sm
          bg-indigo-500 hover:bg-indigo-400 text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 active:scale-[0.98]
        "
      >
        {splitting ? t.splitting : t.splitButton}
      </button>

      {/* Progress */}
      {splitting && (
        <ProgressBar percent={progress} label={t.splitProgress} />
      )}

      {/* Results */}
      {chunks.length > 0 && !splitting && (
        <div className="space-y-4 animate-fade-in">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className="text-slate-300 text-sm">
              <span className="text-indigo-400 font-semibold">{chunks.length}</span>{' '}
              {t.chunksCreated}
            </p>
            <button
              onClick={handleDownloadAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              {t.downloadAll}
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {chunks.map((chunk) => (
              <div
                key={chunk.index}
                className={`
                  flex items-center justify-between gap-2
                  bg-slate-800 rounded-xl px-4 py-3
                  border border-slate-700/60
                  ${isRTL ? 'flex-row-reverse' : ''}
                `}
              >
                <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-slate-200 text-xs font-medium truncate">{chunk.filename}</p>
                  <p className="text-slate-500 text-xs">{formatBytes(chunk.size)}</p>
                </div>
                <button
                  onClick={() => handleDownloadChunk(chunk)}
                  className="
                    shrink-0 text-xs text-indigo-400 hover:text-white
                    bg-indigo-500/20 hover:bg-indigo-500
                    px-3 py-1.5 rounded-lg transition-all duration-150
                  "
                >
                  {t.downloadChunk}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
