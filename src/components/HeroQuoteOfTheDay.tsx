import React, { useState } from 'react';
import { Quote, Language } from '../types';
import {
  Copy,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  Feather,
  Bookmark,
  Check,
  RefreshCw,
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

interface HeroQuoteOfTheDayProps {
  quote: Quote;
  isBookmarked: boolean;
  onToggleBookmark: (quoteId: string) => void;
  onOpenReflection: (quote: Quote) => void;
  onGenerateNewWisdom: () => void;
  reflectionsCountForQuote: number;
  language?: Language;
}

export const HeroQuoteOfTheDay: React.FC<HeroQuoteOfTheDayProps> = ({
  quote,
  isBookmarked,
  onToggleBookmark,
  onOpenReflection,
  onGenerateNewWisdom,
  reflectionsCountForQuote,
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
      setTimeout(() => setDownloadedAudio(false), 2500);
    }
  };

  const handleDownloadCard = async () => {
    if (isDownloadingCard) return;
    setIsDownloadingCard(true);
    const success = await downloadQuoteCardImage(quote, language);
    setIsDownloadingCard(false);
    if (success) {
      setDownloadedCard(true);
      setTimeout(() => setDownloadedCard(false), 2500);
    }
  };

  const formattedDate = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <section
      className={`relative w-full rounded-3xl p-6 sm:p-10 overflow-hidden border transition-all duration-500 backdrop-blur-xl ${
        isSpeaking
          ? 'border-purple-400/80 bg-gradient-to-br from-[#120f26]/95 via-[#0c0f1e]/90 to-[#070914]/95 shadow-[0_0_80px_rgba(168,85,247,0.35)] ring-2 ring-purple-500/50'
          : 'border-cyan-500/30 bg-gradient-to-br from-[#0b1020]/90 via-[#0a0d18]/90 to-[#070912]/95 shadow-[0_0_60px_rgba(6,182,212,0.18)] hover:shadow-[0_0_80px_rgba(6,182,212,0.25)]'
      }`}
    >
      {/* Dynamic Animated Glowing Aura Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none animate-float-orb-1" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none animate-float-orb-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[110px] pointer-events-none animate-pulse" />

      {/* Cyber Grid Subtle Lines */}
      <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between space-y-6">
        
        {/* Top Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>{t.heroTitle}</span>
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Audio Equalizer indicator when speaking */}
            <AudioEqualizer isSpeaking={isSpeaking} color="purple" />

            <button
              id="btn-quick-generate"
              onClick={onGenerateNewWisdom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
              title={t.heroGenerateNew}
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:rotate-180 duration-500" />
              <span>{t.heroGenerateNew}</span>
            </button>
          </div>
        </div>

        {/* Quote Body */}
        <div className="py-3 sm:py-6 space-y-4">
          <div className="flex items-start gap-4">
            <QuoteIcon className={`w-10 h-10 sm:w-14 sm:h-14 text-cyan-400/30 shrink-0 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] ${language === 'ar' ? 'rotate-180' : ''}`} />
            <div className="space-y-4 flex-1">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed text-slate-100 tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                "{quoteText}"
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_14px_#06b6d4] animate-pulse" />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-cyan-300">
                      {authorName}
                    </h4>
                    {authorTitle && (
                      <p className="text-xs text-slate-400">
                        {authorTitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] text-cyan-200/90 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Button */}
            <button
              id="btn-hero-copy"
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              }`}
              title={t.copy}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>

            {/* Audio Recitation (Strictly Male Voice) */}
            <button
              id="btn-hero-speak"
              onClick={handleSpeech}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse'
                  : isLoadingAudio
                  ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40 animate-pulse'
                  : 'bg-slate-900/90 hover:bg-purple-950/40 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]'
              }`}
              title={isSpeaking ? t.stopAudio : t.listenMale}
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>{t.loadingAudio}</span>
                </>
              ) : isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>{t.stopAudio}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>{t.listenMale}</span>
                </>
              )}
            </button>

            {/* Download Spoken Audio (Male Voice) */}
            <button
              id="btn-hero-download-audio"
              onClick={handleDownloadAudio}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                downloadedAudio
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : isDownloadingAudio
                  ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400 animate-pulse'
                  : 'bg-slate-900/90 hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 border-slate-700 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
              title={t.downloadAudio}
            >
              {isDownloadingAudio ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{t.downloading}</span>
                </>
              ) : downloadedAudio ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.audioSaved}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>{t.downloadAudio}</span>
                </>
              )}
            </button>

            {/* Download Visual Quote Card */}
            <button
              id="btn-hero-download-card"
              onClick={handleDownloadCard}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                downloadedCard
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : isDownloadingCard
                  ? 'bg-purple-950/60 text-purple-200 border-purple-400 animate-pulse'
                  : 'bg-slate-900/90 hover:bg-purple-950/40 text-slate-300 hover:text-purple-300 border-slate-700 hover:border-purple-400/50'
              }`}
              title={t.downloadImage}
            >
              {isDownloadingCard ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>{t.renderingCard}</span>
                </>
              ) : downloadedCard ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.cardSaved}</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>{t.downloadImage}</span>
                </>
              )}
            </button>

            {/* Reflection Note Button */}
            <button
              id="btn-hero-reflect"
              onClick={() => onOpenReflection(quote)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer relative"
              title={t.reflect}
            >
              <Feather className="w-4 h-4 text-cyan-400" />
              <span>{t.reflect}</span>
              {reflectionsCountForQuote > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center font-future">
                  {reflectionsCountForQuote}
                </span>
              )}
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            id="btn-hero-bookmark"
            onClick={() => onToggleBookmark(quote.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-amber-300 hover:border-amber-500/40'
            }`}
            title={isBookmarked ? t.favorited : t.favorite}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isBookmarked ? t.favorited : t.favorite}</span>
          </button>
        </div>

      </div>
    </section>
  );
};

