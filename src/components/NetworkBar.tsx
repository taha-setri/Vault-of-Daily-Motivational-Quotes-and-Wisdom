import React from 'react';
import { ExternalLink, Shield, FileText, Database, UserCheck, Globe } from 'lucide-react';
import { LegalModalType, Language } from '../types';
import { UI_TRANSLATIONS } from '../utils/i18n';

interface NetworkBarProps {
  onOpenLegal: (type: LegalModalType) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const NetworkBar: React.FC<NetworkBarProps> = ({
  onOpenLegal,
  language,
  onToggleLanguage,
}) => {
  const t = UI_TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#05070d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Network Ecosystem Link & Language Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-future font-medium tracking-wide">{t.cyberNetwork}</span>
          </div>

          <a
            id="network-link-previous-site"
            href="https://cyber-brain-games.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors font-medium bg-slate-900/60 hover:bg-cyan-950/40 px-3 py-1 rounded-lg border border-slate-800 hover:border-cyan-500/40"
            title={language === 'ar' ? 'الانتقال إلى موقع ألعاب العقل السيبراني' : 'Visit Cyber Brain Games'}
          >
            <span>{t.previousSite}</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          {/* Language Toggle Button */}
          <button
            id="btn-language-switcher"
            onClick={onToggleLanguage}
            className="group flex items-center gap-1.5 text-slate-200 hover:text-cyan-300 font-medium bg-cyan-950/40 hover:bg-cyan-900/50 px-3 py-1 rounded-lg border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
            title={t.switchPrompt}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:rotate-45" />
            <span className="font-semibold text-cyan-300">{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Founder Badge */}
        <div className="flex items-center gap-2">
          <button
            id="btn-founder-profile"
            onClick={() => onOpenLegal('founder')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-400/40 text-cyan-200 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-light">{t.founderBadge}</span>
            <span className="font-semibold text-cyan-300 tracking-wide">{t.founderName}</span>
          </button>
        </div>

        {/* Policies and Governance Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 text-slate-400 flex-wrap">
          <button
            id="btn-nav-privacy-policy"
            onClick={() => onOpenLegal('privacy')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <Shield className="w-3 h-3 text-cyan-400/80" />
            <span>{t.privacyPolicy}</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            id="btn-nav-disclaimer"
            onClick={() => onOpenLegal('disclaimer')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3 text-purple-400/80" />
            <span>{t.disclaimer}</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            id="btn-nav-cookies"
            onClick={() => onOpenLegal('cookies')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <Database className="w-3 h-3 text-emerald-400/80" />
            <span>{t.cookiesPolicy}</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
