import React, { useState, useEffect, useMemo } from 'react';
import { NetworkBar } from './components/NetworkBar';
import { HeroQuoteOfTheDay } from './components/HeroQuoteOfTheDay';
import { CategoryFilter } from './components/CategoryFilter';
import { QuoteCard } from './components/QuoteCard';
import { ReflectionModal } from './components/ReflectionModal';
import { ReflectionsVaultModal } from './components/ReflectionsVaultModal';
import { QuantumGeneratorModal } from './components/QuantumGeneratorModal';
import { LegalModals } from './components/LegalModals';
import { MaleVoiceSelector } from './components/MaleVoiceSelector';
import { INITIAL_QUOTES } from './data/quotes';
import { Quote, CategoryType, Reflection, LegalModalType, Language } from './types';
import { Search, Sparkles, BookHeart, Bookmark, RotateCcw, Cpu, Shield, Globe, UserCheck, Heart } from 'lucide-react';
import { triggerCyberBurst } from './utils/feedback';
import { UI_TRANSLATIONS } from './utils/i18n';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'ar') ? (saved as Language) : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
    triggerCyberBurst();
  };

  const t = UI_TRANSLATIONS[language];

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const savedCustomQuotes = localStorage.getItem('custom_wisdom_quotes');
    if (savedCustomQuotes) {
      try {
        const parsed = JSON.parse(savedCustomQuotes);
        return [...parsed, ...INITIAL_QUOTES];
      } catch {
        return INITIAL_QUOTES;
      }
    }
    return INITIAL_QUOTES;
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarked_quotes_ids');
    return saved ? JSON.parse(saved) : ['q-1', 'q-3'];
  });

  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Reflections State
  const [reflections, setReflections] = useState<Reflection[]>(() => {
    const saved = localStorage.getItem('user_wisdom_reflections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Default initial inspiring reflection
    return [
      {
        id: 'ref-demo-1',
        quoteId: 'q-1',
        quoteText: 'أفضل طريقة لتوقع المستقبل هي ابتكاره وصياغته بوعيك وقراراتك اللحظية.',
        quoteAuthor: 'ألان كاي',
        userNote: 'تذكير يومي لنفسي: لا تنتظر تحسن الظروف الخارجية؛ ابدأ ببناء خطوة صغيرة اليوم في مشروعي المستقبلي.',
        mood: 'يقظة ووعي',
        createdAt: '2026-09-15',
      },
    ];
  });

  // Current Quote of the Day
  const [quoteOfTheDayIndex, setQuoteOfTheDayIndex] = useState(0);

  // Modals state
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [reflectingQuote, setReflectingQuote] = useState<Quote | null>(null);
  const [isReflectionsVaultOpen, setIsReflectionsVaultOpen] = useState(false);
  const [isQuantumModalOpen, setIsQuantumModalOpen] = useState(false);

  // Save Bookmarks
  useEffect(() => {
    localStorage.setItem('bookmarked_quotes_ids', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Save Reflections
  useEffect(() => {
    localStorage.setItem('user_wisdom_reflections', JSON.stringify(reflections));
  }, [reflections]);

  const toggleBookmark = (quoteId: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(quoteId);
      const updated = exists ? prev.filter((id) => id !== quoteId) : [...prev, quoteId];
      if (!exists) {
        triggerCyberBurst();
      }
      return updated;
    });
  };

  const handleSaveReflection = (newRef: Omit<Reflection, 'id' | 'createdAt'>) => {
    const created: Reflection = {
      ...newRef,
      id: `ref-${Date.now()}`,
      createdAt: new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    };
    setReflections((prev) => [created, ...prev]);
  };

  const handleDeleteReflection = (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllReflections = () => {
    setReflections([]);
  };

  const handleGenerateNewWisdom = () => {
    setQuoteOfTheDayIndex((prev) => (prev + 1) % quotes.length);
    triggerCyberBurst();
  };

  const handleAddSynthesizedQuote = (synthesized: Quote) => {
    setQuotes((prev) => [synthesized, ...prev]);
  };

  // Quotes count by category
  const quotesCountByCategory = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      all: quotes.length,
      will_power: 0,
      wisdom_philosophy: 0,
      future_science: 0,
      inner_peace: 0,
      leadership: 0,
    };

    quotes.forEach((q) => {
      if (counts[q.category] !== undefined) {
        counts[q.category]++;
      }
    });

    return counts;
  }, [quotes]);

  // Filtered quotes (searches Arabic, English, authors and tags)
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      const qLow = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        q.text.toLowerCase().includes(qLow) ||
        q.author.toLowerCase().includes(qLow) ||
        (q.textEn && q.textEn.toLowerCase().includes(qLow)) ||
        (q.authorEn && q.authorEn.toLowerCase().includes(qLow)) ||
        q.tags.some((t) => t.toLowerCase().includes(qLow)) ||
        (q.tagsEn && q.tagsEn.some((t) => t.toLowerCase().includes(qLow)));
      const matchesBookmark = !showOnlyBookmarks || bookmarkedIds.includes(q.id);

      return matchesCategory && matchesSearch && matchesBookmark;
    });
  }, [quotes, selectedCategory, searchQuery, showOnlyBookmarks, bookmarkedIds]);

  const currentQuoteOfTheDay = quotes[quoteOfTheDayIndex] || quotes[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#06080e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Top Network Bar */}
      <NetworkBar
        onOpenLegal={(type) => setActiveLegalModal(type)}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Ambient Background Elements with Radiant Glowing Movement */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] ambient-glow-cyan blur-[140px] animate-float-orb-1 opacity-75" />
        <div className="absolute bottom-1/3 right-1/4 w-[550px] h-[550px] ambient-glow-purple blur-[150px] animate-float-orb-2 opacity-70" />
        <div className="absolute top-2/3 left-1/2 w-[500px] h-[500px] ambient-glow-amber blur-[130px] animate-float-orb-3 opacity-50" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        
        {/* Brand Header */}
        <section className="text-center space-y-4 pt-2 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 text-xs font-bold shadow-[0_0_25px_rgba(6,182,212,0.35)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            <span className="font-future tracking-wider">{t.brandTagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Tajawal',sans-serif] drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            {t.brandTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.brandDesc}
          </p>

          {/* Quick Highlight Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{quotes.length} {t.statQuotes}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{t.statVoice}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.statDownload}</span>
            </span>
          </div>

          {/* Controls Bar: Male Voice, Generator, Reflections, Favorites */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            
            {/* Male Voice Customizer (Strictly Male Voice) */}
            <MaleVoiceSelector language={language} />

            {/* Quantum Generator Trigger */}
            <button
              id="btn-open-quantum-generator"
              onClick={() => setIsQuantumModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 border border-cyan-400/50 text-cyan-200 text-xs font-semibold shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer hover:scale-105"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{t.btnQuantum}</span>
            </button>

            {/* Reflections Vault Trigger */}
            <button
              id="btn-open-reflections-vault"
              onClick={() => setIsReflectionsVaultOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all cursor-pointer relative shadow-sm hover:scale-105"
            >
              <BookHeart className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.btnReflections}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-future border border-cyan-500/30">
                {reflections.length}
              </span>
            </button>

            {/* Bookmarks Filter */}
            <button
              id="btn-filter-bookmarks"
              onClick={() => setShowOnlyBookmarks((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer hover:scale-105 ${
                showOnlyBookmarks
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{t.btnFavorites} ({bookmarkedIds.length})</span>
            </button>

          </div>
        </section>

        {/* 2. Hero Quote of the Day */}
        <HeroQuoteOfTheDay
          quote={currentQuoteOfTheDay}
          isBookmarked={bookmarkedIds.includes(currentQuoteOfTheDay.id)}
          onToggleBookmark={toggleBookmark}
          onOpenReflection={(q) => setReflectingQuote(q)}
          onGenerateNewWisdom={handleGenerateNewWisdom}
          reflectionsCountForQuote={reflections.filter((r) => r.quoteId === currentQuoteOfTheDay.id).length}
          language={language}
        />

        {/* 3. Search & Filter Section */}
        <section className="space-y-4 pt-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                language === 'en' ? 'left-3.5' : 'right-3.5'
              }`} />
              <input
                id="input-search-quotes"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all ${
                  language === 'en' ? 'pl-10 pr-4' : 'pr-10 pl-4'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer ${
                    language === 'en' ? 'right-3' : 'left-3'
                  }`}
                >
                  {t.clearSearch}
                </button>
              )}
            </div>

            {/* Results count & reset */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{t.showingResults} <strong className="text-cyan-300">{filteredQuotes.length}</strong> {t.fromTotal} {quotes.length} {t.quotesCountUnit}</span>
              {(selectedCategory !== 'all' || searchQuery || showOnlyBookmarks) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setShowOnlyBookmarks(false);
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.resetFilters}</span>
                </button>
              )}
            </div>
          </div>

          {/* Glowing Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            quotesCountByCategory={quotesCountByCategory}
            language={language}
          />
        </section>

        {/* 4. Quotes Grid Gallery */}
        <section className="space-y-6">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-16 space-y-4 rounded-2xl bg-slate-900/30 border border-slate-800/80 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-300">{t.noQuotesFound}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {t.noQuotesDesc}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setShowOnlyBookmarks(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs transition-colors cursor-pointer"
              >
                {t.viewAllQuotes}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  isBookmarked={bookmarkedIds.includes(quote.id)}
                  onToggleBookmark={toggleBookmark}
                  onOpenReflection={(q) => setReflectingQuote(q)}
                  reflectionsCount={reflections.filter((r) => r.quoteId === quote.id).length}
                  language={language}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* 5. Futuristic Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#05070c]/90 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
            
            {/* Logo & Vision */}
            <div className={`space-y-1 ${language === 'en' ? 'text-center md:text-left' : 'text-center md:text-right'}`}>
              <div className={`flex items-center gap-2 ${language === 'en' ? 'justify-center md:justify-start' : 'justify-center md:justify-start'}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></div>
                <span className="font-bold text-white text-sm">{t.brandTitle}</span>
              </div>
              <p className="text-slate-500 text-xs max-w-md">
                {t.footerVision}
              </p>
            </div>

            {/* Founder Highlight */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveLegalModal('founder')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition-all cursor-pointer group shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div className={language === 'en' ? 'text-left' : 'text-right'}>
                  <div className="text-[10px] text-slate-400">{t.founderRole}</div>
                  <div className="text-xs font-bold text-cyan-300">{t.founderName}</div>
                </div>
              </button>
            </div>

          </div>

          {/* Bottom links and legal policies */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <a
                href="https://cyber-brain-games.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.previousSite}</span>
              </a>

              <span>•</span>

              <button
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {t.privacyPolicy}
              </button>

              <span>•</span>

              <button
                onClick={() => setActiveLegalModal('disclaimer')}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {t.disclaimer}
              </button>

              <span>•</span>

              <button
                onClick={() => setActiveLegalModal('cookies')}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {t.cookiesPolicy}
              </button>
            </div>

            <div className="text-slate-600 font-future text-[11px]">
              {t.footerCopyright}
            </div>
          </div>

        </div>
      </footer>

      {/* 6. Modals Layer */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
        language={language}
      />

      <ReflectionModal
        quote={reflectingQuote}
        isOpen={Boolean(reflectingQuote)}
        onClose={() => setReflectingQuote(null)}
        onSaveReflection={handleSaveReflection}
        language={language}
      />

      <ReflectionsVaultModal
        isOpen={isReflectionsVaultOpen}
        onClose={() => setIsReflectionsVaultOpen(false)}
        reflections={reflections}
        onDeleteReflection={handleDeleteReflection}
        onClearAll={handleClearAllReflections}
        language={language}
      />

      <QuantumGeneratorModal
        isOpen={isQuantumModalOpen}
        onClose={() => setIsQuantumModalOpen(false)}
        onSelectGeneratedQuote={handleAddSynthesizedQuote}
        onOpenReflection={(q) => setReflectingQuote(q)}
        language={language}
      />

    </div>
  );
}
