interface ProgressBarProps {
  percent: number;
  label?: string;
}

export default function ProgressBar({ percent, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-indigo-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
