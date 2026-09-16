import React, { useState } from 'react';
import { X, Feather, Check, Sparkles, Heart, Brain, Zap, Sun } from 'lucide-react';
import { Quote, Reflection, Language } from '../types';
import { triggerCyberBurst } from '../utils/feedback';
import { UI_TRANSLATIONS } from '../utils/i18n';

interface ReflectionModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (reflection: Omit<Reflection, 'id' | 'createdAt'>) => void;
  language?: Language;
}

const MOODS_AR = [
  { id: 'يقظة ووعي', label: 'يقظة ووعي', icon: Brain, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
  { id: 'سلام وسكينة', label: 'سلام وسكينة', icon: Feather, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
  { id: 'حافز وطاقة', label: 'حافز وطاقة', icon: Zap, color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
  { id: 'امتنان ونور', label: 'امتنان ونور', icon: Sun, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
  { id: 'تأمل عميق', label: 'تأمل عميق', icon: Heart, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
];

const MOODS_EN = [
  { id: 'Mindful & Aware', label: 'Mindful & Aware', icon: Brain, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
  { id: 'Peace & Serenity', label: 'Peace & Serenity', icon: Feather, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
  { id: 'Driven & Energized', label: 'Driven & Energized', icon: Zap, color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
  { id: 'Grateful & Radiant', label: 'Grateful & Radiant', icon: Sun, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
  { id: 'Deep Reflection', label: 'Deep Reflection', icon: Heart, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  quote,
  isOpen,
  onClose,
  onSaveReflection,
  language = 'ar',
}) => {
  const t = UI_TRANSLATIONS[language];
  const moods = language === 'en' ? MOODS_EN : MOODS_AR;

  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState(moods[0].id);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !quote) return null;

  const quoteText = language === 'en' && quote.textEn ? quote.textEn : quote.text;
  const authorName = language === 'en' && quote.authorEn ? quote.authorEn : quote.author;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    onSaveReflection({
      quoteId: quote.id,
      quoteText: quoteText,
      quoteAuthor: authorName,
      userNote: noteText.trim(),
      mood: selectedMood,
    });

    triggerCyberBurst();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setNoteText('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-lg bg-[#0c101d] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden text-slate-200 ${
          language === 'en' ? 'text-left' : 'text-right'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Ambient Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400"></div>

        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            id="btn-close-reflection-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-cyan-300">
            <h3 className="text-base font-bold">{t.reflectionTitle}</h3>
            <Feather className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quote Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs leading-relaxed text-slate-300 relative">
            <p className="font-serif text-slate-200 italic mb-1.5">"{quoteText}"</p>
            <div className={`text-cyan-400/90 font-medium ${language === 'en' ? 'text-right' : 'text-left'}`}>— {authorName}</div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              {t.reflectionMoodLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => {
                const Icon = m.icon;
                const active = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      active
                        ? `${m.color} shadow-[0_0_12px_rgba(6,182,212,0.3)]`
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.reflectionPrompt}
            </label>
            <textarea
              id="input-reflection-note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t.reflectionPlaceholder}
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              id="btn-submit-reflection"
              type="submit"
              disabled={!noteText.trim() || isSaved}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.savedSuccess}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.saveReflection}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
