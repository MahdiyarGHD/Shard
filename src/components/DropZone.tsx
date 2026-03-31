import React, { useRef, useState } from "react";
import { useTranslation } from "../utils/i18n/i18nProvider";

interface DropZoneProps {
    multiple?: boolean;
    onFiles: (files: File[]) => void;
    children?: React.ReactNode;
    className?: string;
}

export default function DropZone({
    multiple = false,
    onFiles,
    children,
    className = "",
}: DropZoneProps) {
    const { t } = useTranslation();
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onFiles(files);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) onFiles(files);
        e.target.value = "";
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={multiple ? t("drop_chunks_here") : t("drop_or_click")}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`
        cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center
        transition-all duration-200 select-none outline-none
        ${
            dragging
                ? "border-indigo-400 bg-indigo-400/10 scale-[1.01]"
                : "border-slate-600 bg-slate-800/50 hover:border-indigo-400/60 hover:bg-slate-800"
        }
        ${className}
      `}
        >
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                className="hidden"
                onChange={handleChange}
            />
            {children ?? (
                <p className="text-slate-400 text-sm">
                    {dragging ? t("drop_file_here") : t("drop_or_click")}
                </p>
            )}
        </div>
    );
}
