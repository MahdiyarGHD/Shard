import { useState } from 'react';
import { useLanguage } from './hooks/useLanguage';
import FileSplitter from './components/FileSplitter';
import FileJoiner from './components/FileJoiner';

type Tab = 'split' | 'join';

export default function App() {
  const { t, isRTL, toggleLanguage } = useLanguage();
  const [tab, setTab] = useState<Tab>('split');

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col"
    >
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Shield icon */}
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-100">{t.appTitle}</h1>
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
            {t.langToggle}
          </button>
        </div>
      </header>

      {/* Subtitle */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2 w-full">
        <p className="text-slate-400 text-sm">{t.appSubtitle}</p>
      </div>

      {/* Tab bar */}
      <div className="max-w-2xl mx-auto px-4 pb-2 w-full mt-2">
        <div className="flex bg-slate-800/60 rounded-2xl p-1 gap-1">
          {(['split', 'join'] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`
                flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${tab === tabKey
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              {tabKey === 'split' ? t.splitTab : t.joinTab}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          {tab === 'split' ? (
            <FileSplitter t={t} isRTL={isRTL} />
          ) : (
            <FileJoiner t={t} isRTL={isRTL} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 pb-6 w-full">
        <div className={`flex items-center gap-2 text-slate-500 text-xs justify-center`}>
          <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{t.secureNote}</span>
        </div>
      </footer>
    </div>
  );
}
