import { useState, useCallback } from 'react';
import type { Translations } from '../utils/i18n';
import {
  formatBytes,
  joinChunks,
  sortChunkFiles,
  sha256,
  downloadBlob,
  readFileAsArrayBuffer,
} from '../utils/fileUtils';
import DropZone from './DropZone';
import ProgressBar from './ProgressBar';

interface FileJoinerProps {
  t: Translations;
  isRTL: boolean;
}

export default function FileJoiner({ t, isRTL }: FileJoinerProps) {
  const [chunkFiles, setChunkFiles] = useState<File[]>([]);
  const [outputFilename, setOutputFilename] = useState('');
  const [joining, setJoining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checksum, setChecksum] = useState('');
  const [checksumCopied, setChecksumCopied] = useState(false);
  const [joinedBlob, setJoinedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const handleChunkFiles = useCallback((files: File[]) => {
    setChunkFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const toAdd = files.filter((f) => !existing.has(f.name + f.size));
      return sortChunkFiles([...prev, ...toAdd]);
    });
    setError('');
    setChecksum('');
    setJoinedBlob(null);
  }, []);

  function removeChunk(index: number) {
    setChunkFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return sortChunkFiles(next);
    });
    setChecksum('');
    setJoinedBlob(null);
  }

  function clearAll() {
    setChunkFiles([]);
    setChecksum('');
    setJoinedBlob(null);
    setError('');
    setProgress(0);
  }

  const guessOutputName = useCallback((): string => {
    if (outputFilename.trim()) return outputFilename.trim();
    if (chunkFiles.length === 0) return 'joined-file';
    // Try to reconstruct original filename from the first chunk
    const firstName = chunkFiles[0].name;
    // Strip .partNNNN suffix and keep extension
    const match = firstName.match(/^(.+)\.part\d+(\.[^.]+)?$/i);
    if (match) {
      const base = match[1];
      const ext = match[2] ?? '';
      return `${base}${ext}`;
    }
    return firstName;
  }, [chunkFiles, outputFilename]);

  async function handleJoin() {
    if (chunkFiles.length === 0) { setError(t.errorNoChunks); return; }
    setError('');
    setJoining(true);
    setProgress(0);
    setChecksum('');
    setJoinedBlob(null);
    try {
      const blob = await joinChunks(chunkFiles, setProgress);
      // Compute SHA-256
      const buf = await readFileAsArrayBuffer(new File([blob], 'joined'));
      const hash = await sha256(buf);
      setChecksum(hash);
      setJoinedBlob(blob);
    } catch {
      setError(t.errorReadingFile);
    } finally {
      setJoining(false);
    }
  }

  function handleDownload() {
    if (!joinedBlob) return;
    downloadBlob(joinedBlob, guessOutputName());
  }

  async function copyChecksum() {
    if (!checksum) return;
    try {
      await navigator.clipboard.writeText(checksum);
      setChecksumCopied(true);
      setTimeout(() => setChecksumCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const totalSize = chunkFiles.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-slate-100">{t.joinTitle}</h2>

      {/* Drop zone */}
      <DropZone t={t} multiple onFiles={handleChunkFiles}>
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">{t.dropChunksHere}</p>
        </div>
      </DropZone>

      {/* Chunk list */}
      {chunkFiles.length > 0 && (
        <div className="space-y-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-slate-300 text-sm">
              {t.selectedChunks}{' '}
              <span className="text-indigo-400 font-semibold">({chunkFiles.length})</span>
              {' — '}
              <span className="text-slate-400 text-xs">{formatBytes(totalSize)}</span>
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              {t.clearAll}
            </button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {chunkFiles.map((file, i) => (
              <div
                key={`${file.name}-${file.size}`}
                className={`
                  flex items-center justify-between gap-2
                  bg-slate-800 rounded-xl px-4 py-3
                  border border-slate-700/60
                  animate-fade-in
                  ${isRTL ? 'flex-row-reverse' : ''}
                `}
              >
                <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-slate-200 text-xs font-medium truncate">{file.name}</p>
                  <p className="text-slate-500 text-xs">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={() => removeChunk(i)}
                  className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  {t.removeChunk}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {chunkFiles.length === 0 && (
        <p className="text-slate-500 text-sm text-center">{t.noChunks}</p>
      )}

      {/* Output filename */}
      <div className="space-y-2">
        <label className="block text-sm text-slate-300">{t.outputFilename}</label>
        <input
          type="text"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          placeholder={t.outputFilenamePlaceholder}
          className="
            w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5
            text-slate-100 placeholder-slate-500 text-sm
            focus:outline-none focus:border-indigo-400 transition-colors
          "
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm animate-fade-in">{error}</p>
      )}

      {/* Join button */}
      <button
        onClick={handleJoin}
        disabled={joining || chunkFiles.length === 0}
        className="
          w-full py-3 rounded-xl font-medium text-sm
          bg-indigo-500 hover:bg-indigo-400 text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 active:scale-[0.98]
        "
      >
        {joining ? t.joining : t.joinButton}
      </button>

      {/* Progress */}
      {joining && (
        <ProgressBar percent={progress} label={t.joinProgress} />
      )}

      {/* Result */}
      {joinedBlob && !joining && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700 p-4 space-y-3">
            <p className="text-green-400 text-sm font-medium">{t.joinComplete}</p>

            {/* Checksum */}
            {checksum && (
              <div className="space-y-1">
                <p className="text-slate-400 text-xs">{t.checksumLabel}</p>
                <div
                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <code className="flex-1 text-xs text-slate-300 bg-slate-900 rounded-lg px-3 py-2 font-mono break-all select-all">
                    {checksum}
                  </code>
                  <button
                    onClick={copyChecksum}
                    title={checksumCopied ? t.checksumCopied : t.checksum}
                    className="
                      shrink-0 text-xs px-3 py-2 rounded-lg
                      bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white
                      transition-all duration-150
                    "
                  >
                    {checksumCopied ? '✓' : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Download */}
            <button
              onClick={handleDownload}
              className="
                w-full py-2.5 rounded-xl font-medium text-sm
                bg-green-600/80 hover:bg-green-600 text-white
                transition-all duration-200 active:scale-[0.98]
              "
            >
              {t.downloadJoined}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
