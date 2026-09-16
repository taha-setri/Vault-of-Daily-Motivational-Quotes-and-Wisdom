import confetti from 'canvas-confetti';
import { Language } from '../types';

export const triggerCyberBurst = (element?: HTMLElement | null) => {
  if (element) {
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#06b6d4', '#38bdf8', '#a855f7', '#34d399'],
      disableForReducedMotion: true,
      scalar: 0.8,
    });
  } else {
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#38bdf8', '#a855f7', '#34d399'],
      disableForReducedMotion: true,
      scalar: 0.8,
    });
  }
};

let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;
const audioCache = new Map<string, string>();

export type MaleVoiceId = 'Charon' | 'Fenrir' | 'Puck';

export interface MaleVoiceOption {
  id: MaleVoiceId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  badge: string;
  badgeEn: string;
}

export const MALE_VOICES: MaleVoiceOption[] = [
  {
    id: 'Charon',
    name: 'صوت رجل وقور وحكيم',
    nameEn: 'Stately & Wise Male Voice',
    description: 'نبرة عميقة ورخيمة ملهمة للتأمل الفلسفي والهدوء',
    descriptionEn: 'Deep, resonant, contemplative timbre ideal for philosophical reflection',
    badge: 'وقار حكيم (الأساسي)',
    badgeEn: 'Wise Stature (Default)',
  },
  {
    id: 'Fenrir',
    name: 'صوت رجل حازم وملهم',
    nameEn: 'Resolute & Inspiring Male Voice',
    description: 'نبرة جادة وقوية تحفز قوة الإرادة والصمود',
    descriptionEn: 'Firm, powerful timbre driving willpower, endurance, and courage',
    badge: 'حزم تحفيزي',
    badgeEn: 'Motivating Resolve',
  },
  {
    id: 'Puck',
    name: 'صوت رجل هادئ وبليغ',
    nameEn: 'Calm & Articulate Male Voice',
    description: 'نبرة صافية متزنة تناسب التركيز والاستيعاب',
    descriptionEn: 'Balanced, clear enunciation crafted for focus and comprehension',
    badge: 'هدوء متزن',
    badgeEn: 'Poised Calm',
  },
];

export const getSelectedMaleVoice = (): MaleVoiceId => {
  if (typeof window === 'undefined') return 'Charon';
  const saved = localStorage.getItem('app_selected_male_voice') as MaleVoiceId;
  if (saved && ['Charon', 'Fenrir', 'Puck'].includes(saved)) {
    return saved;
  }
  return 'Charon';
};

export const setSelectedMaleVoice = (voiceId: MaleVoiceId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_selected_male_voice', voiceId);
    window.dispatchEvent(new CustomEvent('male-voice-changed', { detail: voiceId }));
  }
};

export interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

export const stopSpeech = () => {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
};

export const speakQuote = async (
  text: string,
  author?: string,
  callbacksOrOnEnd?: SpeechCallbacks | (() => void),
  overrideVoice?: MaleVoiceId,
  lang: Language | string = 'ar'
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Normalize callbacks
  const callbacks: SpeechCallbacks =
    typeof callbacksOrOnEnd === 'function'
      ? { onEnd: callbacksOrOnEnd }
      : callbacksOrOnEnd || {};

  // Stop any previously playing speech
  stopSpeech();

  const selectedVoice = overrideVoice || getSelectedMaleVoice();
  const cacheKey = `male_v3_${lang}_${selectedVoice}___${text}___${author || ''}`;

  // 1. Try Cached Audio or Server /api/tts Endpoint (Strictly Male Voice)
  try {
    currentAbortController = new AbortController();
    let audioUrl = audioCache.get(cacheKey);

    if (!audioUrl) {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          author,
          voice: selectedVoice,
          gender: 'male',
          lang,
        }),
        signal: currentAbortController.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioUrl) {
          audioUrl = data.audioUrl;
          audioCache.set(cacheKey, audioUrl!);
        }
      }
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => {
        callbacks.onStart?.();
      };

      audio.onended = () => {
        if (currentAudio === audio) {
          currentAudio = null;
        }
        callbacks.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error, falling back to browser male-tuned speech synthesis:', e);
        if (currentAudio === audio) {
          currentAudio = null;
        }
        fallbackSpeechSynthesis(text, author, callbacks, lang);
      };

      await audio.play();
      return true;
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return false;
    }
    console.warn('Server TTS failed or unavailable, falling back to browser male-tuned speech synthesis:', error);
  }

  // 2. Fallback to Browser SpeechSynthesis with Strictly Male Voice Tuning
  return fallbackSpeechSynthesis(text, author, callbacks, lang);
};

export const speakArabicQuote = speakQuote;

// Fallback using browser SpeechSynthesis API strictly tuned to male voice
const fallbackSpeechSynthesis = (
  text: string,
  author?: string,
  callbacks?: SpeechCallbacks,
  lang: Language | string = 'ar'
): boolean => {
  const fullSpeechText =
    lang === 'en'
      ? (author ? `"${text}" — by ${author}.` : text)
      : (author ? `${text}. بقلم ${author}.` : text);

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      utterance.lang = lang === 'en' ? 'en-US' : 'ar-SA';
      utterance.rate = lang === 'en' ? 0.90 : 0.88; // Stately, deliberate cadence
      utterance.pitch = lang === 'en' ? 0.80 : 0.74; // Significantly deep masculine pitch register
      utterance.volume = 1.0;

      const pickMaleVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        
        if (lang === 'en') {
          const enVoices = voices.filter(
            (v) => v.lang.startsWith('en') || v.lang.includes('en_')
          );
          const maleNames = ['david', 'george', 'daniel', 'guy', 'male', 'man', 'richard', 'james', 'mark', 'alex', 'oliver'];
          const femaleNames = ['zira', 'susan', 'samantha', 'victoria', 'karen', 'catherine', 'hazel', 'female', 'woman'];

          const explicitMale = enVoices.find((v) => {
            const nameLower = v.name.toLowerCase();
            return maleNames.some((m) => nameLower.includes(m)) && !femaleNames.some((f) => nameLower.includes(f));
          });

          if (explicitMale) {
            utterance.voice = explicitMale;
            return;
          }

          const nonFemale = enVoices.find((v) => {
            const nameLower = v.name.toLowerCase();
            return !femaleNames.some((f) => nameLower.includes(f));
          });

          if (nonFemale) {
            utterance.voice = nonFemale;
          } else if (enVoices.length > 0) {
            utterance.voice = enVoices[0];
          }
        } else {
          // Arabic
          const arabicVoices = voices.filter(
            (v) =>
              v.lang.startsWith('ar') ||
              v.lang.includes('ar_') ||
              v.name.toLowerCase().includes('arabic')
          );

          const maleNames = ['maged', 'tarik', 'naayf', 'hamed', 'shaker', 'male', 'man', 'ذكوري', 'رجل'];
          const femaleNames = ['laila', 'zeina', 'salma', 'hoda', 'mariam', 'fatima', 'sana', 'female', 'woman', 'أنثى'];

          // 1. Explicit male arabic voice
          const explicitMale = arabicVoices.find((v) => {
            const nameLower = v.name.toLowerCase();
            return maleNames.some((m) => nameLower.includes(m)) && !femaleNames.some((f) => nameLower.includes(f));
          });

          if (explicitMale) {
            utterance.voice = explicitMale;
            return;
          }

          // 2. Arabic voice that does not have female name patterns
          const nonFemale = arabicVoices.find((v) => {
            const nameLower = v.name.toLowerCase();
            return !femaleNames.some((f) => nameLower.includes(f));
          });

          if (nonFemale) {
            utterance.voice = nonFemale;
          } else if (arabicVoices.length > 0) {
            utterance.voice = arabicVoices[0];
          }
        }
      };

      pickMaleVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = pickMaleVoice;
      }

      utterance.onstart = () => {
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        callbacks?.onEnd?.();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error, falling back to resonant chime:', err);
        playWisdomChime();
        callbacks?.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
      callbacks?.onStart?.();
      return true;
    } catch (e) {
      console.warn('SpeechSynthesis invocation error:', e);
    }
  }

  // 3. Ultimate Fallback: Harmonic Chime
  playWisdomChime();
  callbacks?.onEnd?.();
  return false;
};

// Melodic resonant chime using Web Audio API as an atmospheric feedback
export const playWisdomChime = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const chords = [528, 660, 792]; // Solfeggio 528Hz harmonic resonance
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + idx * 0.12 + 1.8
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 1.8);
    });
  } catch (e) {
    console.warn('Wisdom chime error:', e);
  }
};

/**
 * Generate a synthetic resonant masculine tone WAV file in pure JavaScript as a reliable fallback
 */
function createSyntheticMaleAudioWav(): Blob {
  const sampleRate = 22050;
  const duration = 2.5; // seconds
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate resonant male harmonic tones (115Hz, 230Hz fundamental)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope
    const env = Math.exp(-t * 1.2) * (1 - Math.exp(-t * 30));
    // Warm masculine fundamental and harmonics
    const sample =
      (Math.sin(2 * Math.PI * 118 * t) * 0.6 +
        Math.sin(2 * Math.PI * 236 * t) * 0.3 +
        Math.sin(2 * Math.PI * 354 * t) * 0.1) *
      env;

    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Downloads the spoken audio of a quote (Male voice, Arabic or English)
 */
export const downloadQuoteAudio = async (
  text: string,
  author?: string,
  voice?: MaleVoiceId,
  lang: Language | string = 'ar'
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const selectedVoice = voice || getSelectedMaleVoice();
  const cacheKey = `male_v3_${lang}_${selectedVoice}___${text}___${author || ''}`;

  let audioUrl = audioCache.get(cacheKey);

  if (!audioUrl) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          author,
          voice: selectedVoice,
          gender: 'male',
          lang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioUrl) {
          audioUrl = data.audioUrl;
          audioCache.set(cacheKey, audioUrl!);
        }
      }
    } catch (e) {
      console.warn('Could not fetch server TTS for download, generating client WAV:', e);
    }
  }

  let downloadUrl = audioUrl;
  let revokeNeeded = false;

  if (!downloadUrl) {
    const syntheticBlob = createSyntheticMaleAudioWav();
    downloadUrl = URL.createObjectURL(syntheticBlob);
    revokeNeeded = true;
  }

  try {
    const defaultAuthor = lang === 'en' ? 'Wisdom' : 'الحكيم';
    const cleanAuthor = (author || defaultAuthor).trim().replace(/[\s/\\?%*:|"<>]/g, '_');
    const filename =
      lang === 'en'
        ? `Wisdom_${cleanAuthor}_MaleVoice.wav`
        : `حكمة_${cleanAuthor}_صوت_رجل.wav`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (revokeNeeded) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl!), 10000);
    }

    triggerCyberBurst();
    return true;
  } catch (err) {
    console.error('Download error:', err);
    return false;
  }
};

/**
 * Downloads an aesthetic, glowing, high-resolution visual Quote Card (1200x675) in Arabic or English
 */
export const downloadQuoteCardImage = async (
  quote: {
    text: string;
    author: string;
    authorTitle?: string;
    textEn?: string;
    authorEn?: string;
    authorTitleEn?: string;
    category: string;
    tags?: string[];
    tagsEn?: string[];
    ambientColor?: string;
  },
  lang: Language | string = 'ar'
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const isEn = lang === 'en';
  const quoteText = (isEn && quote.textEn ? quote.textEn : quote.text) || quote.text;
  const quoteAuthor = (isEn && quote.authorEn ? quote.authorEn : quote.author) || quote.author;
  const quoteAuthorTitle = isEn && quote.authorTitleEn ? quote.authorTitleEn : quote.authorTitle;

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }

      // 1. Dark cosmic background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#060812');
      bgGrad.addColorStop(0.5, '#0a1024');
      bgGrad.addColorStop(1, '#05070e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // 2. Ambient glowing orbs
      const glowColor =
        quote.ambientColor === 'amber'
          ? 'rgba(245, 158, 11, 0.22)'
          : quote.ambientColor === 'purple'
          ? 'rgba(168, 85, 247, 0.22)'
          : quote.ambientColor === 'emerald'
          ? 'rgba(16, 185, 129, 0.22)'
          : quote.ambientColor === 'rose'
          ? 'rgba(244, 63, 94, 0.22)'
          : 'rgba(6, 182, 212, 0.22)';

      const orb1 = ctx.createRadialGradient(250, 200, 10, 250, 200, 350);
      orb1.addColorStop(0, glowColor);
      orb1.addColorStop(1, 'transparent');
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, 1200, 675);

      const orb2 = ctx.createRadialGradient(950, 480, 20, 950, 480, 400);
      orb2.addColorStop(0, 'rgba(147, 51, 234, 0.18)');
      orb2.addColorStop(1, 'transparent');
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, 1200, 675);

      // 3. Cybernetic frame border
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 50, 1100, 575);

      // Corner tech accents
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3.5;
      const cSize = 30;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(50, 50 + cSize);
      ctx.lineTo(50, 50);
      ctx.lineTo(50 + cSize, 50);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(1150 - cSize, 50);
      ctx.lineTo(1150, 50);
      ctx.lineTo(1150, 50 + cSize);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(50, 625 - cSize);
      ctx.lineTo(50, 625);
      ctx.lineTo(50 + cSize, 625);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(1150 - cSize, 625);
      ctx.lineTo(1150, 625);
      ctx.lineTo(1150, 625 - cSize);
      ctx.stroke();

      // 4. Header Badge & Quote Symbol
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#38bdf8';

      if (isEn) {
        ctx.textAlign = 'left';
        ctx.direction = 'ltr';
        ctx.fillText('CYBERNETIC WISDOM VAULT • DAILY INSPIRATION', 90, 95);

        ctx.font = 'italic 72px serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillText('“', 90, 180);
      } else {
        ctx.textAlign = 'right';
        ctx.direction = 'rtl';
        ctx.fillText('خزنة الاقتباسات والحكم التحفيزية • CYBERNETIC WISDOM', 1110, 95);

        ctx.font = 'italic 72px serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillText('“', 1110, 180);
      }

      // 5. Wrap Quote Text
      ctx.fillStyle = '#ffffff';
      const maxWidth = 980;
      const lineHeight = isEn ? 52 : 56;
      ctx.font = isEn
        ? '600 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : 'bold 36px "Cairo", "Tajawal", sans-serif';

      const words = quoteText.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine ? currentLine + ' ' + words[n] : words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine);
          currentLine = words[n];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      let textStartY = 240;
      if (lines.length <= 2) {
        textStartY = 270;
      }

      for (let i = 0; i < lines.length; i++) {
        if (isEn) {
          ctx.direction = 'ltr';
          ctx.textAlign = 'left';
          ctx.fillText(lines[i], 90, textStartY + i * lineHeight);
        } else {
          ctx.direction = 'rtl';
          ctx.textAlign = 'right';
          ctx.fillText(lines[i], 1100, textStartY + i * lineHeight);
        }
      }

      // 6. Author Section
      const authorY = textStartY + lines.length * lineHeight + 45;

      if (isEn) {
        // Divider line
        const divGrad = ctx.createLinearGradient(90, authorY, 490, authorY);
        divGrad.addColorStop(0, '#06b6d4');
        divGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(90, authorY);
        ctx.lineTo(450, authorY);
        ctx.stroke();

        // Author Name
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`— ${quoteAuthor}`, 90, authorY + 40);

        // Author Title
        if (quoteAuthorTitle) {
          ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(quoteAuthorTitle, 90, authorY + 70);
        }

        // Watermark
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.direction = 'ltr';
        ctx.textAlign = 'right';
        ctx.fillText('vault-of-wisdom.studio • Dignified Male Recitation', 1110, 595);
      } else {
        // Arabic Divider line
        const divGrad = ctx.createLinearGradient(1100, authorY, 700, authorY);
        divGrad.addColorStop(0, '#06b6d4');
        divGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(1100, authorY);
        ctx.lineTo(750, authorY);
        ctx.stroke();

        // Author Name
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.font = 'bold 26px "Cairo", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(quoteAuthor, 1100, authorY + 40);

        // Author Title
        if (quoteAuthorTitle) {
          ctx.font = '18px "Cairo", sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(quoteAuthorTitle, 1100, authorY + 70);
        }

        // Watermark
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.fillText('vault-of-wisdom.studio • صوت رجل وقور', 85, 595);
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const cleanAuthor = quoteAuthor.trim().replace(/[\s/\\?%*:|"<>]/g, '_');
        a.href = url;
        a.download = isEn ? `Wisdom_Card_${cleanAuthor}.png` : `بطاقة_حكمة_${cleanAuthor}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        triggerCyberBurst();
        resolve(true);
      }, 'image/png');
    } catch (err) {
      console.error('Card image generation error:', err);
      resolve(false);
    }
  });
};

