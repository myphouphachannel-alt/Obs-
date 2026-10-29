/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Camera,
  Layers,
  ArrowRightLeft,
  Settings,
  Tv,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

export const CameraPadsView: React.FC = () => {
  const {
    status,
    scenes,
    currentProgramScene,
    currentPreviewScene,
    studioMode,
    settings,
    updateCameraPad,
    switchProgramScene,
    switchPreviewScene,
    triggerTransition,
    toggleStudioMode,
    triggerHaptic,
  } = useOBS();

  const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePadTap = async (targetSceneName: string, label: string) => {
    triggerHaptic('medium');
    if (!targetSceneName) {
      showToast(`ปุ่ม "${label}" ยังไม่ได้ผูกกับ Scene ใดๆ (แตะปุ่มเฟืองด้านล่างเพื่อผูก Scene)`);
      return;
    }

    try {
      if (studioMode) {
        await switchPreviewScene(targetSceneName);
      } else {
        await switchProgramScene(targetSceneName);
      }
    } catch (err: any) {
      showToast(`สลับไป ${targetSceneName} ไม่สำเร็จ: ${err?.message || err}`);
    }
  };

  const assignSceneToPad = (padIndex: number, sceneName: string) => {
    triggerHaptic('light');
    const existing = settings.cameraPads[padIndex];
    updateCameraPad(padIndex, {
      ...existing,
      targetSceneName: sceneName,
    });
    setConfiguringIndex(null);
    showToast(`ผูก "${existing.label}" เข้ากับ Scene "${sceneName}" แล้ว`);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-150">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
              CAMERA & SWITCHER PADS
            </h2>
            <p className="text-xs text-slate-400">
              แป้นสลับกล้องถ่ายทอดสดขนาดใหญ่ สำหรับงานฟุตบอล งานอีเวนต์ และห้องส่ง
            </p>
          </div>
        </div>

        <button
          onClick={toggleStudioMode}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 self-start sm:self-auto ${
            studioMode
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          {studioMode ? 'โหมด STUDIO: ON' : 'โหมด STUDIO: OFF'}
        </button>
      </div>

      {/* Tally Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/60 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-red-400 font-bold flex items-center gap-1">
            <Tv className="w-3.5 h-3.5" /> PGM (ON AIR)
          </span>
          <span className="text-xs font-mono font-extrabold text-white truncate max-w-[150px]">
            {currentProgramScene || 'NONE'}
          </span>
        </div>

        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          studioMode ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> PVW (STANDBY)
          </span>
          <span className="text-xs font-mono font-extrabold text-white truncate max-w-[150px]">
            {studioMode ? (currentPreviewScene || 'NONE') : 'DIRECT CUT'}
          </span>
        </div>
      </div>

      {/* Transition Bar in Studio Mode */}
      {studioMode && (
        <div className="p-3 rounded-2xl bg-[#161b2a] border border-slate-800 flex justify-center">
          <button
            onClick={() => {
              triggerHaptic('heavy');
              triggerTransition();
            }}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 text-white font-mono font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-red-600/20 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>CUT / TRANSITION</span>
          </button>
        </div>
      )}

      {/* 6 Large Camera Switcher Touch Pads */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {settings.cameraPads.map((pad, idx) => {
          const isProgram = pad.targetSceneName && currentProgramScene === pad.targetSceneName;
          const isPreview = studioMode && pad.targetSceneName && currentPreviewScene === pad.targetSceneName;

          return (
            <div
              key={pad.id || idx}
              className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[130px] sm:min-h-[160px] border-2 transition active:scale-98 shadow-xl ${
                isProgram
                  ? 'bg-red-950/60 border-red-500 shadow-red-950/50 animate-tally'
                  : isPreview
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-emerald-950/40'
                  : 'bg-[#141824] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top row: Tally indicator and Quick Settings button */}
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-extrabold uppercase ${
                  isProgram
                    ? 'bg-red-600 text-white'
                    : isPreview
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isProgram ? 'bg-white animate-ping' : isPreview ? 'bg-white' : 'bg-slate-600'
                  }`} />
                  {isProgram ? 'ON AIR' : isPreview ? 'PREVIEW' : 'OFF'}
                </span>

                <button
                  onClick={() => setConfiguringIndex(configuringIndex === idx ? null : idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 active:scale-95 transition"
                  title="ผูกปุ่มนี้กับ Scene"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Pad Tap Area */}
              <button
                onClick={() => handlePadTap(pad.targetSceneName, pad.label)}
                className="my-3 text-left w-full focus:outline-none"
              >
                <span className="font-mono font-extrabold text-base sm:text-xl text-white block uppercase tracking-wider">
                  {pad.label}
                </span>
                <span className="text-xs text-slate-400 truncate block mt-1 font-mono">
                  {pad.targetSceneName ? `Scene: ${pad.targetSceneName}` : '(ยังไม่ผูก Scene)'}
                </span>
              </button>

              {/* Action trigger button */}
              <button
                onClick={() => handlePadTap(pad.targetSceneName, pad.label)}
                className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 ${
                  isProgram
                    ? 'bg-red-600 text-white shadow-md'
                    : isPreview
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isProgram ? 'TAKE (LIVE)' : isPreview ? 'TAKE TO LIVE' : studioMode ? 'SEND TO PVW' : 'SWITCH'}
              </button>

              {/* Quick Binding Dropdown Drawer when gear is clicked */}
              {configuringIndex === idx && (
                <div className="absolute inset-0 bg-[#121520] rounded-2xl p-4 z-20 flex flex-col justify-between border-2 border-slate-700 shadow-2xl animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white font-mono uppercase">
                        เลือก Scene สำหรับ {pad.label}
                      </span>
                      <button
                        onClick={() => setConfiguringIndex(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        ปิด
                      </button>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1 no-scrollbar pt-1">
                      {scenes.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-3 text-center">
                          ไม่มี Scene ใน OBS
                        </p>
                      ) : (
                        scenes.map((s) => (
                          <button
                            key={s.sceneName}
                            onClick={() => assignSceneToPad(idx, s.sceneName)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono truncate flex items-center justify-between transition ${
                              pad.targetSceneName === s.sceneName
                                ? 'bg-red-600 text-white font-bold'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{s.sceneName}</span>
                            {pad.targetSceneName === s.sceneName && <Check className="w-3 h-3" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setConfiguringIndex(null)}
                    className="w-full py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 font-semibold"
                  >
                    เสร็จสิ้น
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
