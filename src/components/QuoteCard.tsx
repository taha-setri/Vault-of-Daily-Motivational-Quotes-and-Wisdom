import React, { useState } from 'react';
import { Quote, Language } from '../types';
import {
  Copy,
  Volume2,
  VolumeX,
  Loader2,
  Feather,
  Bookmark,
  Check,
  Quote as QuoteIcon,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import {
  triggerCyberBurst,
  speakQuote,
  stopSpeech,
  downloadQuoteAudio,
  downloadQuoteCardImage,
  getSelectedMaleVoice,
} from '../utils/feedback';
import { AudioEqualizer } from './AudioEqualizer';
import { UI_TRANSLATIONS } from '../utils/i18n';

interface QuoteCardProps {
  quote: Quote;
  isBookmarked: boolean;
  onToggleBookmark: (quoteId: string) => void;
  onOpenReflection: (quote: Quote) => void;
  reflectionsCount: number;
  language?: Language;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  isBookmarked,
  onToggleBookmark,
  onOpenReflection,
  reflectionsCount,
  language = 'ar',
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [downloadedAudio, setDownloadedAudio] = useState(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [downloadedCard, setDownloadedCard] = useState(false);

  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'en' && quote.textEn ? quote.textEn : quote.text;
  const authorName = language === 'en' && quote.authorEn ? quote.authorEn : quote.author;
  const authorTitle = language === 'en' && quote.authorTitleEn ? quote.authorTitleEn : quote.authorTitle;
  const tags = language === 'en' && quote.tagsEn ? quote.tagsEn : quote.tags;

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(`"${quoteText}" — ${authorName}`);
    setCopied(true);
    triggerCyberBurst(e.currentTarget);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (isSpeaking || isLoadingAudio) {
      stopSpeech();
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      return;
    }

    setIsLoadingAudio(true);
    speakQuote(
      quoteText,
      authorName,
      {
        onStart: () => {
          setIsLoadingAudio(false);
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
        },
        onError: () => {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
        },
      },
      getSelectedMaleVoice(),
      language
    );
  };

  const handleDownloadAudio = async () => {
    if (isDownloadingAudio) return;
    setIsDownloadingAudio(true);
    const success = await downloadQuoteAudio(quoteText, authorName, getSelectedMaleVoice(), language);
    setIsDownloadingAudio(false);
    if (success) {
      setDownloadedAudio(true);
      setTimeout(() => setDownloadedAudio(false), 2200);
    }
  };

  const handleDownloadCard = async () => {
    if (isDownloadingCard) return;
    setIsDownloadingCard(true);
    const success = await downloadQuoteCardImage(quote, language);
    setIsDownloadingCard(false);
    if (success) {
      setDownloadedCard(true);
      setTimeout(() => setDownloadedCard(false), 2200);
    }
  };

  // Ambient border and glow styling based on color
  const getGlowStyles = (color: Quote['ambientColor']) => {
    switch (color) {
      case 'cyan':
        return 'hover:border-cyan-400/60 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)]';
      case 'purple':
        return 'hover:border-purple-400/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]';
      case 'emerald':
        return 'hover:border-emerald-400/60 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]';
      case 'rose':
        return 'hover:border-rose-400/60 hover:shadow-[0_0_35px_rgba(244,63,94,0.25)]';
      case 'amber':
        return 'hover:border-amber-400/60 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]';
      default:
        return 'hover:border-cyan-400/60 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)]';
    }
  };

  return (
    <article
      id={`quote-card-${quote.id}`}
      className={`group relative rounded-2xl p-5 sm:p-6 bg-[#0c101d]/90 backdrop-blur-md border transition-all duration-300 flex flex-col justify-between space-y-4 ${
        isSpeaking
          ? 'border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.35)] ring-1 ring-purple-500/50'
          : 'border-slate-800/80 hover:scale-[1.01]'
      } ${getGlowStyles(quote.ambientColor)}`}
    >
      {/* Background Soft Glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/15 transition-all pointer-events-none" />

      {/* Quote Top Info */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <QuoteIcon className={`w-6 h-6 text-slate-700 group-hover:text-cyan-400/60 transition-colors drop-shadow-[0_0_6px_rgba(6,182,212,0.3)] ${language === 'ar' ? 'rotate-180' : ''}`} />

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <AudioEqualizer isSpeaking={isSpeaking} color="purple" label={language === 'en' ? 'Male Voice' : 'إلقاء رجل'} />
            )}

            <button
              id={`btn-bookmark-${quote.id}`}
              onClick={() => onToggleBookmark(quote.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-amber-400 hover:border-slate-700'
              }`}
              title={isBookmarked ? t.favorited : t.favorite}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Text */}
        <p className="text-base sm:text-lg font-semibold leading-relaxed text-slate-200 group-hover:text-white transition-colors">
          "{quoteText}"
        </p>
      </div>

      {/* Author & Footer */}
      <div className="relative z-10 pt-3 border-t border-slate-800/60 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
              {authorName}
            </h4>
            {authorTitle && (
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {authorTitle}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Copy Button */}
            <button
              id={`btn-copy-${quote.id}`}
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
              }`}
              title={t.copy}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>

            {/* Audio Recitation (Strictly Male Voice) */}
            <button
              id={`btn-speak-${quote.id}`}
              onClick={handleSpeech}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-purple-500/20 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse'
                  : isLoadingAudio
                  ? 'bg-purple-950/40 text-purple-300 border-purple-500/40 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-500/40'
              }`}
              title={isSpeaking ? t.stopAudio : t.listenMale}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              ) : isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-purple-400 hover:text-purple-300" />
              )}
            </button>

            {/* Download Spoken Audio (Male Voice) */}
            <button
              id={`btn-download-audio-${quote.id}`}
              onClick={handleDownloadAudio}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                downloadedAudio
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : isDownloadingAudio
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              }`}
              title={t.downloadAudio}
            >
              {isDownloadingAudio ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : downloadedAudio ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-cyan-400 hover:text-cyan-300" />
              )}
            </button>

            {/* Download Quote Card Image */}
            <button
              id={`btn-download-card-${quote.id}`}
              onClick={handleDownloadCard}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                downloadedCard
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : isDownloadingCard
                  ? 'bg-purple-950/60 text-purple-300 border-purple-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-500/40'
              }`}
              title={t.downloadImage}
            >
              {isDownloadingCard ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              ) : downloadedCard ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-purple-400 hover:text-purple-300" />
              )}
            </button>
          </div>

          {/* Add Reflection Button */}
          <button
            id={`btn-reflect-${quote.id}`}
            onClick={() => onOpenReflection(quote)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shrink-0"
            title={t.reflect}
          >
            <Feather className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.reflect}</span>
            {reflectionsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center justify-center font-future ml-1">
                {reflectionsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

