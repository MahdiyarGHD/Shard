import { useState } from "react";

import FileSplitter from "./components/FileSplitter";
import FileJoiner from "./components/FileJoiner";
import { useTranslation } from "./utils/i18n/i18nProvider";

type Tab = "split" | "join";

export default function App() {
    const { t, language, setLanguage } = useTranslation();

    const isRTL = language === "fa";
    const toggleLanguage = () => {
        setLanguage(language === "en" ? "fa" : "en");
    };
    const [tab, setTab] = useState<Tab>("split");

    return (
        <div
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-slate-900 text-slate-100 flex flex-col"
        >
            {/* Header */}
            <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div
                        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                        {/* Scissors icon */}
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.75}
                                    d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664L10.6 9.214m-2.135 3.572l2.135-1.236"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight text-slate-100">
                                {t("app_title")}
                            </h1>
                        </div>
                    </div>

                    {/* Language toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="
              text-xs font-medium px-3 py-1.5 rounded-lg
              bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100
              border border-slate-700 transition-all duration-150
            "
                    >
                        {t("lang_toggle")}
                    </button>
                </div>
            </header>

            {/* Subtitle */}
            <div className="max-w-2xl mx-auto px-4 pt-6 pb-2 w-full">
                <p className="text-slate-400 text-sm">{t("app_subtitle")}</p>
            </div>

            {/* Tab bar */}
            <div className="max-w-2xl mx-auto px-4 pb-2 w-full mt-2">
                <div className="flex bg-slate-800/60 rounded-2xl p-1 gap-1">
                    {(["split", "join"] as Tab[]).map((tabKey) => (
                        <button
                            key={tabKey}
                            onClick={() => setTab(tabKey)}
                            className={`
                flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                    tab === tabKey
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-slate-200"
                }
              `}
                        >
                            {tabKey === "split" ? t("split_tab") : t("join_tab")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                    {tab === "split" ? <FileSplitter /> : <FileJoiner />}
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-2xl mx-auto px-4 pb-6 w-full">
                <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-3.5 h-3.5 text-indigo-400 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        <span>{t("secure_note")}</span>
                    </div>
                    <div className="flex items-center gap-1.5" dir="ltr">
                        <span>Made with</span>
                        <svg
                            className="w-3 h-3 text-red-400 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>by</span>
                        <a
                            href="https://github.com/MahdiyarGHD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            MahdiyarGHD
                        </a>
                        <span>·</span>
                        <a
                            href="https://github.com/MahdiyarGHD/Shard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
