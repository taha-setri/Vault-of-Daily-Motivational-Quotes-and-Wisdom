import React, { useState } from 'react';
import { X, BookHeart, Trash2, Copy, Download, Calendar, Sparkles, Check, Search } from 'lucide-react';
import { Reflection, Language } from '../types';
import { triggerCyberBurst } from '../utils/feedback';
import { UI_TRANSLATIONS } from '../utils/i18n';

interface ReflectionsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflections: Reflection[];
  onDeleteReflection: (id: string) => void;
  onClearAll: () => void;
  language?: Language;
}

export const ReflectionsVaultModal: React.FC<ReflectionsVaultModalProps> = ({
  isOpen,
  onClose,
  reflections,
  onDeleteReflection,
  onClearAll,
  language = 'ar',
}) => {
  const t = UI_TRANSLATIONS[language];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleCopyNote = (reflection: Reflection) => {
    const textToCopy = language === 'en'
      ? `My Reflection: "${reflection.userNote}"\nOn Quote: "${reflection.quoteText}" — ${reflection.quoteAuthor}\n(Saved on: ${reflection.createdAt})`
      : `تأملي الشخصي: "${reflection.userNote}"\nحول حكمة: "${reflection.quoteText}" — ${reflection.quoteAuthor}\n(تاريخ الحفظ: ${reflection.createdAt})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(reflection.id);
    triggerCyberBurst();
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportJournal = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reflections, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reflections_vault_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerCyberBurst();
  };

  const filteredReflections = reflections.filter(
    (r) =>
      r.userNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quoteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quoteAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.mood && r.mood.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-3xl bg-[#0b0f19] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden text-slate-200 flex flex-col max-h-[85vh] ${
          language === 'en' ? 'text-left' : 'text-right'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ambient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500"></div>

        {/* Modal Top */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            id="btn-close-reflections-vault"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg font-bold text-cyan-300">{t.vaultTitle}</h3>
              <p className="text-xs text-slate-400">{t.vaultDesc}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookHeart className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
              language === 'en' ? 'left-3' : 'right-3'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.vaultSearchPlaceholder}
              className={`w-full py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 ${
                language === 'en' ? 'pl-9 pr-3' : 'pr-9 pl-3'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            {reflections.length > 0 && (
              <>
                <button
                  onClick={handleExportJournal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-400/40 text-cyan-300 transition-all cursor-pointer"
                  title={t.exportJournal}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportJournal}</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(language === 'en' ? 'Are you sure you want to delete all saved reflections?' : 'هل أنت متأكد من رغبتك في حذف جميع التأملات المحفوظة؟')) {
                      onClearAll();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 transition-all cursor-pointer"
                  title={t.clearAll}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearAll}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reflections List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {reflections.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <BookHeart className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-300">{t.vaultEmpty}</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.vaultEmptyDesc}
              </p>
            </div>
          ) : filteredReflections.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {t.noSearchResults} "{searchQuery}"
            </div>
          ) : (
            filteredReflections.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 relative group"
              >
                {/* Top Info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{ref.createdAt}</span>
                    {ref.mood && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px]">
                        {ref.mood}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyNote(ref)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={t.copy}
                    >
                      {copiedId === ref.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteReflection(ref.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={t.deleteReflection}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Note */}
                <div className={`p-3 rounded-lg bg-slate-950/70 border border-slate-800/60 text-slate-100 text-sm font-medium leading-relaxed ${
                  language === 'en' ? 'border-l-2 border-l-cyan-400' : 'border-r-2 border-r-cyan-400'
                }`}>
                  {ref.userNote}
                </div>

                {/* Associated Quote */}
                <div className="text-xs text-slate-400 border-t border-slate-800/60 pt-2 flex items-center justify-between">
                  <span className="truncate max-w-[80%] text-slate-500">
                    {t.inspiredBy} "{ref.quoteText}"
                  </span>
                  <span className="text-cyan-400/90 font-medium shrink-0">
                    — {ref.quoteAuthor}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>{t.totalReflections}: <strong className="text-cyan-300">{reflections.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
