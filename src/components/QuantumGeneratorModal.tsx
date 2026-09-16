import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Cpu,
  RefreshCw,
  Check,
  Copy,
  Feather,
  Volume2,
  VolumeX,
  Loader2,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { Quote, Language } from '../types';
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

interface QuantumGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGeneratedQuote: (quote: Quote) => void;
  onOpenReflection: (quote: Quote) => void;
  language?: Language;
}

const WISDOM_PROMPTS_AR = [
  'توليد ومضة حول صمود الإرادة وتجاوز العقبات',
  'توليد ومضة حول آفاق المستقبل والابتكار التكنولوجي',
  'توليد ومضة حول السكون الداخلي واليقظة الذهنية',
  'توليد ومضة حول حكمة القيادة والأثر الإنساني',
];

const WISDOM_PROMPTS_EN = [
  'Synthesize wisdom on willpower and overcoming obstacles',
  'Synthesize wisdom on future horizons and technological frontiers',
  'Synthesize wisdom on inner stillness and conscious awareness',
  'Synthesize wisdom on enlightened leadership and lasting impact',
];

const SYNTHESIZED_QUOTES: Quote[] = [
  {
    id: `synth-1`,
    text: 'حين تبني أفكارك على الصدق مع ذاتك، يصبح كل تحدٍ خارجي مجرد محفز لترقية نسختك القادمة.',
    textEn: 'When you anchor your thoughts in radical honesty with yourself, every external obstacle becomes a catalyst to upgrade your next self.',
    author: 'الخوارزمية الفلسفية المعاصرة',
    authorEn: 'Contemporary Philosophical Algorithm',
    authorTitle: 'توليد الحكمة الفورية',
    authorTitleEn: 'Instant Wisdom Synthesis',
    category: 'will_power',
    tags: ['الترقية الذاتية', 'الصدق', 'التحدي'],
    tagsEn: ['Self-Upgrade', 'Honesty', 'Challenge'],
    ambientColor: 'cyan',
  },
  {
    id: `synth-2`,
    text: 'أفضل ما تقدمه للمستقبل ليس مجرد التكهن بمساراته، بل تدريب عقلك على المرونة المطلقة في التكيف.',
    textEn: 'The finest gift you can offer the future is not mere forecasting, but conditioning your intellect for absolute adaptive resilience.',
    author: 'رؤية الفكر السيبراني',
    authorEn: 'Cybernetic Thought Vision',
    authorTitle: 'توليد الحكمة الفورية',
    authorTitleEn: 'Instant Wisdom Synthesis',
    category: 'future_science',
    tags: ['التكيف', 'المرونة', 'المستقبل'],
    tagsEn: ['Adaptation', 'Resilience', 'Future'],
    ambientColor: 'purple',
  },
  {
    id: `synth-3`,
    text: 'في صمت التأمل تتوارى ضوضاء المخاوف لتفسح المجال أمام ومضات الإلهام البكر.',
    textEn: 'In meditative stillness, the static of fear dissolves to unveil radiant flashes of pure inspiration.',
    author: 'واحة السكون الرقمي',
    authorEn: 'Digital Sanctuary of Stillness',
    authorTitle: 'توليد الحكمة الفورية',
    authorTitleEn: 'Instant Wisdom Synthesis',
    category: 'inner_peace',
    tags: ['الصمت', 'الإلهام', 'السلام'],
    tagsEn: ['Silence', 'Inspiration', 'Peace'],
    ambientColor: 'emerald',
  },
  {
    id: `synth-4`,
    text: 'القائد الحقيقي لا يجمع الأتباع ليشهدوا قوته، بل يشعل مشاعل القيادة في قلوب كل من يرافقه.',
    textEn: 'A true leader gathers not followers to display dominance, but ignites torches of self-sovereignty within everyone around.',
    author: 'إشراق الريادة الوجدانية',
    authorEn: 'Empathic Leadership Luminary',
    authorTitle: 'توليد الحكمة الفورية',
    authorTitleEn: 'Instant Wisdom Synthesis',
    category: 'leadership',
    tags: ['التمكين', 'الريادة', 'الشعلة'],
    tagsEn: ['Empowerment', 'Leadership', 'Torchbearer'],
    ambientColor: 'amber',
  },
  {
    id: `synth-5`,
    text: 'المعرفة تراكم، أما الحكمة فهي القدرة على تصفية الشوائب للوصول إلى جوهر الحقيقة البسيطة.',
    textEn: 'Knowledge is accumulation; wisdom is the rare discernment that purges noise to reveal crystalline, foundational truth.',
    author: 'جوهر الفلسفة الأبدية',
    authorEn: 'Essence of Timeless Philosophy',
    authorTitle: 'توليد الحكمة الفورية',
    authorTitleEn: 'Instant Wisdom Synthesis',
    category: 'wisdom_philosophy',
    tags: ['الحقيقة', 'البساطة', 'الجوهر'],
    tagsEn: ['Truth', 'Simplicity', 'Essence'],
    ambientColor: 'rose',
  },
];

export const QuantumGeneratorModal: React.FC<QuantumGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectGeneratedQuote,
  onOpenReflection,
  language = 'ar',
}) => {
  const t = UI_TRANSLATIONS[language];
  const prompts = language === 'en' ? WISDOM_PROMPTS_EN : WISDOM_PROMPTS_AR;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<Quote | null>(null);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [downloadedAudio, setDownloadedAudio] = useState(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [downloadedCard, setDownloadedCard] = useState(false);

  if (!isOpen) return null;

  const activeQuoteText = generatedQuote
    ? language === 'en' && generatedQuote.textEn
      ? generatedQuote.textEn
      : generatedQuote.text
    : '';

  const activeAuthorName = generatedQuote
    ? language === 'en' && generatedQuote.authorEn
      ? generatedQuote.authorEn
      : generatedQuote.author
    : '';

  const handleSpeech = () => {
    if (!generatedQuote) return;
    if (isSpeaking || isLoadingAudio) {
      stopSpeech();
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      return;
    }

    setIsLoadingAudio(true);
    speakQuote(
      activeQuoteText,
      activeAuthorName,
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
    if (!generatedQuote || isDownloadingAudio) return;
    setIsDownloadingAudio(true);
    const success = await downloadQuoteAudio(activeQuoteText, activeAuthorName, getSelectedMaleVoice(), language);
    setIsDownloadingAudio(false);
    if (success) {
      setDownloadedAudio(true);
      setTimeout(() => setDownloadedAudio(false), 2200);
    }
  };

  const handleDownloadCard = async () => {
    if (!generatedQuote || isDownloadingCard) return;
    setIsDownloadingCard(true);
    const success = await downloadQuoteCardImage(generatedQuote, language);
    setIsDownloadingCard(false);
    if (success) {
      setDownloadedCard(true);
      setTimeout(() => setDownloadedCard(false), 2200);
    }
  };

  const handleGenerate = () => {
    stopSpeech();
    setIsSpeaking(false);
    setIsGenerating(true);
    setGeneratedQuote(null);

    // Simulate futuristic quantum scanning synthesis
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * SYNTHESIZED_QUOTES.length);
      const newQ = {
        ...SYNTHESIZED_QUOTES[randomIndex],
        id: `synth-${Date.now()}`,
      };
      setGeneratedQuote(newQ);
      setIsGenerating(false);
      triggerCyberBurst();
    }, 900);
  };

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!generatedQuote) return;
    navigator.clipboard.writeText(`"${activeQuoteText}" — ${activeAuthorName}`);
    setCopied(true);
    triggerCyberBurst(e.currentTarget);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-xl bg-[#0a0d18] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden text-slate-200 ${
          language === 'en' ? 'text-left' : 'text-right'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated ambient scanning line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            id="btn-close-quantum-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-cyan-300">
            <h3 className="text-base font-bold">{t.quantumTitle}</h3>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              {t.quantumSelectFrequency}
            </label>
            <div className="space-y-1.5">
              {prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTopicIdx(idx)}
                  className={`w-full p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    language === 'en' ? 'text-left' : 'text-right'
                  } ${
                    selectedTopicIdx === idx
                      ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <span>{prompt}</span>
                  <Sparkles className={`w-3.5 h-3.5 ${selectedTopicIdx === idx ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          <button
            id="btn-trigger-quantum-synthesis"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? t.quantumGenerating : t.quantumGenerateNow}</span>
          </button>

          {/* Result Box */}
          {generatedQuote && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-future">
                <div className="flex items-center gap-2">
                  <span>{t.quantumSynthesized}</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <AudioEqualizer isSpeaking={isSpeaking} color="cyan" label={language === 'en' ? 'Male Voice' : 'إلقاء رجل'} />
              </div>

              <p className="text-lg font-bold text-slate-100 leading-relaxed">
                "{activeQuoteText}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span className="font-semibold text-cyan-300">— {activeAuthorName}</span>
                
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Speech Recitation */}
                  <button
                    onClick={handleSpeech}
                    className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-purple-500/20 text-purple-200 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] animate-pulse'
                        : isLoadingAudio
                        ? 'bg-purple-950/40 text-purple-300 border-purple-500/40 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-purple-300 hover:border-purple-500/40'
                    }`}
                    title={isSpeaking ? t.stopAudio : t.listenMale}
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    ) : isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </button>

                  {/* Audio Download */}
                  <button
                    onClick={handleDownloadAudio}
                    className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      downloadedAudio
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                        : isDownloadingAudio
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-400'
                    }`}
                    title={t.downloadAudio}
                  >
                    {isDownloadingAudio ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ) : downloadedAudio ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>

                  {/* Card Image Download */}
                  <button
                    onClick={handleDownloadCard}
                    className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      downloadedCard
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                        : isDownloadingCard
                        ? 'bg-purple-950/60 text-purple-300 border-purple-400 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-purple-300 hover:border-purple-400'
                    }`}
                    title={t.downloadImage}
                  >
                    {isDownloadingCard ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    ) : downloadedCard ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 text-xs transition-colors cursor-pointer"
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

                  {/* Reflection Button */}
                  <button
                    onClick={() => {
                      onOpenReflection(generatedQuote);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs transition-colors cursor-pointer"
                    title={t.reflect}
                  >
                    <Feather className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.reflect}</span>
                  </button>

                  {/* Add to Gallery button */}
                  <button
                    onClick={() => {
                      onSelectGeneratedQuote(generatedQuote);
                      triggerCyberBurst();
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/40 to-cyan-600/40 hover:from-emerald-600/60 hover:to-cyan-600/60 text-emerald-200 border border-emerald-400/50 text-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.quantumAddToVault}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>{t.founderBadge} <strong className="text-cyan-300">{t.founderName}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
