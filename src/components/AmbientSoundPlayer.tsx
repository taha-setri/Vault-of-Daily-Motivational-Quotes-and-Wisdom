import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../utils/i18n';

interface AmbientSoundPlayerProps {
  language?: Language;
}

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ language = 'ar' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const t = UI_TRANSLATIONS[language];

  const startAmbientSound = async () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioCtx();
        audioCtxRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 432Hz harmonic meditation frequencies (216Hz, 432Hz, 648Hz)
      const freqs = [216, 432, 648];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, i) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Soft harmonic balance
        const subVolume = i === 0 ? 0.35 : i === 1 ? 0.45 : 0.2;
        oscGain.gain.setValueAtTime(subVolume, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio Context init prevented:', e);
    }
  };

  const stopAmbientSound = () => {
    if (oscillatorsRef.current.length > 0) {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      oscillatorsRef.current = [];
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-xs shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      <button
        id="btn-toggle-ambient-sound"
        onClick={togglePlay}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer ${
          isPlaying
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title={isPlaying ? t.ambientTooltipPlaying : t.ambientTooltipStopped}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{t.ambientActive}</span>
            <span className="flex space-x-0.5 items-end h-2.5 ml-1">
              <span className="w-0.5 h-1.5 bg-cyan-400 animate-bounce"></span>
              <span className="w-0.5 h-3 bg-cyan-400 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-0.5 h-2 bg-cyan-400 animate-bounce [animation-delay:0.3s]"></span>
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span>{t.ambientWaves}</span>
          </>
        )}
      </button>

      {isPlaying && (
        <input
          type="range"
          min="0.05"
          max="0.5"
          step="0.01"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          title={t.ambientVolume}
        />
      )}
    </div>
  );
};
