import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';

interface AudioEqualizerProps {
  isSpeaking: boolean;
  color?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'rose';
  label?: string;
}

export const AudioEqualizer: React.FC<AudioEqualizerProps> = ({
  isSpeaking,
  color = 'purple',
  label = 'صوت رجل وقور يُلقي الحكمة الآن',
}) => {
  if (!isSpeaking) return null;

  const barColor =
    color === 'cyan'
      ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
      : color === 'amber'
      ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
      : color === 'emerald'
      ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
      : color === 'rose'
      ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
      : 'bg-purple-400 shadow-[0_0_8px_#a855f7]';

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-in fade-in duration-300">
      <div className="flex items-center gap-1">
        <Volume2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
        <span className="text-[11px] font-semibold text-purple-200">
          {label}
        </span>
      </div>

      {/* 4-bar dancing animated equalizer */}
      <div className="flex items-end gap-0.5 h-4 px-1">
        <span className={`w-1 rounded-full eq-bar-1 ${barColor}`} />
        <span className={`w-1 rounded-full eq-bar-2 ${barColor}`} />
        <span className={`w-1 rounded-full eq-bar-3 ${barColor}`} />
        <span className={`w-1 rounded-full eq-bar-4 ${barColor}`} />
      </div>

      <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
    </div>
  );
};
