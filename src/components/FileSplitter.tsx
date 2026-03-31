import { useState, useCallback } from "react";

import {
    formatBytes,
    splitFile,
    downloadBlob,
    readFileAsArrayBuffer,
    sha256,
    type ChunkInfo,
} from "../utils/fileUtils";
import DropZone from "./DropZone";
import ProgressBar from "./ProgressBar";
import { useTranslation } from "../utils/i18n/i18nProvider";

const CHUNK_SIZE_STORAGE_KEY = "shard-chunk-size";
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

export default function FileSplitter() {
    const { t, language } = useTranslation();
    const isRTL = language === "fa";
    const [file, setFile] = useState<File | null>(null);
    const [chunkSizeMB, setChunkSizeMB] = useState<string>(getInitialChunkSize);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [splitting, setSplitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [chunks, setChunks] = useState<ChunkInfo[]>([]);
    const [fileHash, setFileHash] = useState("");
    const [fileHashCopied, setFileHashCopied] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = useCallback((files: File[]) => {
        setFile(files[0]);
        setChunks([]);
        setFileHash("");
        setError("");
        setProgress(0);
    }, []);

    const chunkSizeBytes = parseFloat(chunkSizeMB) * 1024 * 1024;
    const estimatedChunks =
        file && chunkSizeBytes > 0 ? Math.ceil(file.size / chunkSizeBytes) : 0;

    async function handleSplit() {
        if (!file) {
            setError(t("error.error_no_file"));
            return;
        }
        const mb = parseFloat(chunkSizeMB);
        if (!mb || mb <= 0) {
            setError(t("error.error_invalid_chunk_size"));
            return;
        }
        setError("");
        setSplitting(true);
        setProgress(0);
        setChunks([]);
        setFileHash("");
        try {
            localStorage.setItem(CHUNK_SIZE_STORAGE_KEY, chunkSizeMB);
            // Compute SHA-256 of the original file before splitting
            const buf = await readFileAsArrayBuffer(file);
            const hash = await sha256(buf);
            setFileHash(hash);
            const result = await splitFile(
                file,
                mb * 1024 * 1024,
                setProgress,
                password || undefined,
            );
            setChunks(result);
        } catch {
            setError(t("error.error_reading_file"));
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

    async function copyFileHash() {
        if (!fileHash) return;
        try {
            await navigator.clipboard.writeText(fileHash);
            setFileHashCopied(true);
            setTimeout(() => setFileHashCopied(false), 2000);
        } catch {
            // ignore
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-slate-100">{t("split_title")}</h2>

            {/* Drop Zone */}
            <DropZone onFiles={handleFileSelect}>
                {file ? (
                    <div className="space-y-1">
                        <p className="text-indigo-400 font-medium text-sm break-all">
                            {file.name}
                        </p>
                        <p className="text-slate-400 text-xs">
                            {t("file_size")}: {formatBytes(file.size)}
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
                        <p className="text-slate-400 text-sm">{t("drop_or_click")}</p>
                    </div>
                )}
            </DropZone>

            {/* Chunk size input */}
            <div className="space-y-2">
                <label className="block text-sm text-slate-300">{t("chunk_size")}</label>
                <div className={`flex gap-2 items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                    <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={chunkSizeMB}
                        onChange={(e) => setChunkSizeMB(e.target.value)}
                        placeholder={t("chunk_size_placeholder")}
                        className="
              flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5
              text-slate-100 placeholder-slate-500 text-sm
              focus:outline-none focus:border-indigo-400 transition-colors
            "
                    />
                    <span className="text-slate-400 text-sm whitespace-nowrap">
                        {t("chunk_size_unit")}
                    </span>
                </div>
                {file && chunkSizeBytes > 0 && (
                    <p className="text-slate-400 text-xs">
                        {t("estimated_chunks")}:{" "}
                        <span className="text-indigo-400 font-medium">{estimatedChunks}</span>
                    </p>
                )}
            </div>

            {/* Password (encryption) */}
            <div className="space-y-2">
                <label className="block text-sm text-slate-300">
                    {t("encrypt_password_label")}
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("encrypt_password_placeholder")}
                        className="
              w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 pr-11
              text-slate-100 placeholder-slate-500 text-sm
              focus:outline-none focus:border-indigo-400 transition-colors
            "
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? t("hide_password") : t("show_password")}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                        {showPassword ? (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-4.364l-14 14"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && <p className="text-red-400 text-sm animate-fade-in">{error}</p>}

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
                {splitting ? t("splitting") : t("split_button")}
            </button>

            {/* Progress */}
            {splitting && <ProgressBar percent={progress} label={t("split_progress")} />}

            {/* Results */}
            {chunks.length > 0 && !splitting && (
                <div className="space-y-4 animate-fade-in">
                    <div
                        className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                        <p className="text-slate-300 text-sm">
                            <span className="text-indigo-400 font-semibold">
                                {chunks.length}
                            </span>{" "}
                            {t("chunks_created")}
                        </p>
                        <button
                            onClick={handleDownloadAll}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                        >
                            {t("download_all")}
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
                  ${isRTL ? "flex-row-reverse" : ""}
                `}
                            >
                                <div
                                    className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}
                                >
                                    <p className="text-slate-200 text-xs font-medium truncate">
                                        {chunk.filename}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {formatBytes(chunk.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDownloadChunk(chunk)}
                                    className="
                    shrink-0 text-xs text-indigo-400 hover:text-white
                    bg-indigo-500/20 hover:bg-indigo-500
                    px-3 py-1.5 rounded-lg transition-all duration-150
                  "
                                >
                                    {t("download_chunk")}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* File hash */}
                    {fileHash && (
                        <div className="space-y-1">
                            <p className="text-slate-400 text-xs">{t("file_hash_label")}</p>
                            <div
                                className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                                <code className="flex-1 text-xs text-slate-300 bg-slate-900 rounded-lg px-3 py-2 font-mono break-all select-all">
                                    {fileHash}
                                </code>
                                <button
                                    onClick={copyFileHash}
                                    title={
                                        fileHashCopied
                                            ? t("file_hash_copied")
                                            : t("file_hash_label")
                                    }
                                    className="
                    shrink-0 text-xs px-3 py-2 rounded-lg
                    bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white
                    transition-all duration-150
                  "
                                >
                                    {fileHashCopied ? (
                                        "✓"
                                    ) : (
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
