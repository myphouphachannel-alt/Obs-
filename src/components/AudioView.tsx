/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  Music,
  Tv,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

export const AudioView: React.FC = () => {
  const {
    status,
    audioInputs,
    toggleAudioMute,
    setAudioVolume,
    refreshAllData,
    triggerHaptic,
  } = useOBS();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleMute = async (inputName: string) => {
    triggerHaptic('medium');
    await toggleAudioMute(inputName);
  };

  const handleSliderChange = (inputName: string, value: number) => {
    setAudioVolume(inputName, value);
  };

  const setPresetVolume = (inputName: string, mul: number) => {
    triggerHaptic('light');
    setAudioVolume(inputName, mul);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
              AUDIO MIXER ({audioInputs.length} แชนแนล)
            </h2>
            <p className="text-xs text-slate-400">ควบคุมระดับเสียงและ Mute แหล่งสัญญาณเสียงจริงใน OBS</p>
          </div>
        </div>

        <button
          onClick={async () => {
            triggerHaptic('light');
            setIsRefreshing(true);
            await refreshAllData();
            setTimeout(() => setIsRefreshing(false), 500);
          }}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
          <span>รีเฟรชเสียง</span>
        </button>
      </div>

      {/* Audio Channels List */}
      {audioInputs.length === 0 ? (
        <div className="bg-[#141824] rounded-2xl border border-slate-800 p-12 text-center text-slate-400 text-xs space-y-2">
          <Volume2 className="w-8 h-8 mx-auto text-slate-600" />
          <p>
            {status === 'connected'
              ? 'ไม่พบ Audio Input ใน OBS Studio (เช่น Mic, Desktop Audio)'
              : 'กรุณาเชื่อมต่อกับ OBS Studio เพื่อใช้งาน Audio Mixer'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {audioInputs.map((audio) => {
            const percent = Math.round(audio.volumeMul * 100);
            const isMuted = audio.muted;

            return (
              <div
                key={audio.inputName}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition relative overflow-hidden flex flex-col justify-between ${
                  isMuted
                    ? 'bg-[#12141f] border-red-950/80 shadow-md'
                    : 'bg-[#141824] border-slate-800 shadow-xl hover:border-slate-700'
                }`}
              >
                {/* Header row: Name, Kind, and Mute Button */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white truncate font-mono">
                        {audio.inputName}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {audio.inputKind || 'Audio Input'}
                      </span>
                    </div>
                  </div>

                  {/* Big Touch Mute Button */}
                  <button
                    onClick={() => handleMute(audio.inputName)}
                    className={`py-2 px-3.5 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition shrink-0 ${
                      isMuted
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>MUTED</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>UNMUTED</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Level Display */}
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">ระดับเสียง:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {audio.volumeDb !== undefined ? `${audio.volumeDb.toFixed(1)} dB` : ''}
                    </span>
                    <span className={`font-bold ${isMuted ? 'text-red-400' : 'text-emerald-400'}`}>
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Large Fader Slider */}
                <div className="relative py-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audio.volumeMul}
                    onChange={(e) => handleSliderChange(audio.inputName, parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500 border border-slate-800"
                  />
                  {/* Subtle level meter gradient track background */}
                  <div
                    className="absolute top-2 left-0 h-1.5 rounded-full pointer-events-none opacity-40"
                    style={{
                      width: `${percent}%`,
                      background: percent > 85 ? 'linear-gradient(90deg, #10b981 70%, #ef4444 100%)' : '#10b981',
                    }}
                  />
                </div>

                {/* Quick Presets for Broadcast Operator */}
                <div className="flex items-center justify-between gap-1.5 pt-3 mt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPresetVolume(audio.inputName, 0)}
                      className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      0%
                    </button>
                    <button
                      onClick={() => setPresetVolume(audio.inputName, 0.5)}
                      className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setPresetVolume(audio.inputName, 0.75)}
                      className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setPresetVolume(audio.inputName, 1.0)}
                      className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
