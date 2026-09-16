import React, { useState, useEffect } from 'react';
import { Mic, User, Check, ChevronDown, Sparkles, Volume2 } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../utils/i18n';
import {
  MALE_VOICES,
  MaleVoiceId,
  getSelectedMaleVoice,
  setSelectedMaleVoice,
  speakQuote,
  stopSpeech,
} from '../utils/feedback';

interface MaleVoiceSelectorProps {
  language?: Language;
}

export const MaleVoiceSelector: React.FC<MaleVoiceSelectorProps> = ({ language = 'ar' }) => {
  const [selectedVoice, setLocalSelectedVoice] = useState<MaleVoiceId>(getSelectedMaleVoice);
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const t = UI_TRANSLATIONS[language];

  useEffect(() => {
    const handleVoiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<MaleVoiceId>;
      if (customEvent.detail) {
        setLocalSelectedVoice(customEvent.detail);
      }
    };

    window.addEventListener('male-voice-changed', handleVoiceChange);
    return () => {
      window.removeEventListener('male-voice-changed', handleVoiceChange);
    };
  }, []);

  const currentOption = MALE_VOICES.find((v) => v.id === selectedVoice) || MALE_VOICES[0];
  const currentVoiceName = language === 'en' ? currentOption.nameEn : currentOption.name;

  const handleSelect = (voiceId: MaleVoiceId) => {
    setSelectedMaleVoice(voiceId);
    setLocalSelectedVoice(voiceId);
    setIsOpen(false);
  };

  const handlePreview = (e: React.MouseEvent, voiceId: MaleVoiceId) => {
    e.stopPropagation();
    stopSpeech();
    setIsPreviewing(true);

    const previewText =
      language === 'en'
        ? voiceId === 'Charon'
          ? 'Wisdom is the quiet summons of deep awareness, and the inception of every great triumph.'
          : voiceId === 'Fenrir'
          ? 'Steadfast willpower transmutes every obstacle into a staircase towards glory.'
          : 'Serene focus is the living essence of clarity, insight, and timeless innovation.'
        : voiceId === 'Charon'
        ? 'الحكمة نداء الوعي الساكن، وبداية كل إنجاز عظيم.'
        : voiceId === 'Fenrir'
        ? 'قوة الإرادة تصنع من كل عقبة سلماً نحو المجد.'
        : 'الهدوء والتركيز هما جوهر الصفاء الذهني والابتكار.';

    const speakerLabel = language === 'en' ? 'Dignified Male Voice' : 'صوت رجل وقور';

    speakQuote(
      previewText,
      speakerLabel,
      {
        onEnd: () => setIsPreviewing(false),
        onError: () => setIsPreviewing(false),
      },
      voiceId,
      language
    );
  };

  return (
    <div className={`relative inline-block ${language === 'en' ? 'text-left' : 'text-right'}`}>
      {/* Trigger Button */}
      <button
        id="btn-toggle-male-voice-selector"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
          isOpen
            ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : 'bg-slate-900/90 border-cyan-500/30 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/60'
        }`}
        title={t.voiceCustomizerTooltip}
      >
        <div className="flex items-center gap-1 text-cyan-400">
          <User className="w-3.5 h-3.5" />
          <Mic className="w-3 h-3 text-cyan-300" />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">{t.readerLabel}</span>
          <span className="text-cyan-200 font-bold">{currentVoiceName}</span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop dismiss */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`absolute ${
              language === 'en' ? 'left-0' : 'right-0'
            } mt-2 w-72 sm:w-80 rounded-2xl bg-[#0b0f1d] border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)] p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2 ${
              language === 'en' ? 'text-left' : 'text-right'
            }`}
          >
            <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 font-future">
                <Sparkles className="w-3 h-3" />
                <span>{t.voicePickerTitle}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                {t.voicePickerStrict}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {MALE_VOICES.map((voice) => {
                const isSelected = voice.id === selectedVoice;
                const voiceName = language === 'en' ? voice.nameEn : voice.name;
                const voiceDesc = language === 'en' ? voice.descriptionEn : voice.description;
                const voiceBadge = language === 'en' ? voice.badgeEn : voice.badge;

                return (
                  <div
                    key={voice.id}
                    onClick={() => handleSelect(voice.id)}
                    className={`group w-full p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      language === 'en' ? 'text-left' : 'text-right'
                    } ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 text-slate-100 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_#06b6d4]'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <User className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-slate-200">
                          {voiceName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handlePreview(e, voice.id)}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-900/60 text-slate-400 hover:text-cyan-300 text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                          title={language === 'en' ? 'Preview this male voice' : 'تجربة استماع هذه النبرة الذكورية'}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{t.voiceTry}</span>
                        </button>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </div>

                    <p className={`text-[11px] text-slate-400 leading-normal ${language === 'en' ? 'pl-7' : 'pr-7'}`}>
                      {voiceDesc}
                    </p>

                    <div className={`pt-0.5 ${language === 'en' ? 'pl-7' : 'pr-7'}`}>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-cyan-300/90 font-medium">
                        {voiceBadge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>{t.voiceFooterNote}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                {t.voiceDone}
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
