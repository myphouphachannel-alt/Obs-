/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  RefreshCw,
  Eye,
  Tv,
  ArrowRightLeft,
  Sliders,
  Image as ImageIcon,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';
import { obsService } from '../services/obs';

export const ScenesView: React.FC = () => {
  const {
    status,
    scenes,
    currentProgramScene,
    currentPreviewScene,
    studioMode,
    switchProgramScene,
    switchPreviewScene,
    triggerTransition,
    toggleStudioMode,
    triggerHaptic,
  } = useOBS();

  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [loadingScreenshots, setLoadingScreenshots] = useState<Record<string, boolean>>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(2000); // 0 (off), 1000, 2000, 5000
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch screenshot for a single scene
  const fetchSceneSnapshot = async (sceneName: string) => {
    if (!obsService.getIsConnected() || !sceneName) return;
    try {
      setLoadingScreenshots((prev) => ({ ...prev, [sceneName]: true }));
      const imgData = await obsService.getSourceScreenshot(sceneName, 480, 270);
      setScreenshots((prev) => ({ ...prev, [sceneName]: imgData }));
    } catch (err: any) {
      // Some scenes might not support screenshots (e.g. empty scenes)
    } finally {
      setLoadingScreenshots((prev) => ({ ...prev, [sceneName]: false }));
    }
  };

  // Fetch all scenes screenshots once
  const fetchAllScreenshots = async () => {
    if (!obsService.getIsConnected() || scenes.length === 0) return;
    setIsManualRefreshing(true);
    for (const scene of scenes) {
      await fetchSceneSnapshot(scene.sceneName);
    }
    setIsManualRefreshing(false);
  };

  // Auto-refresh interval (stops when unmounted or interval is 0)
  useEffect(() => {
    if (status !== 'connected' || refreshInterval === 0 || scenes.length === 0) return;

    // Fetch active program and preview scenes more frequently
    const timer = setInterval(() => {
      if (currentProgramScene) fetchSceneSnapshot(currentProgramScene);
      if (studioMode && currentPreviewScene) fetchSceneSnapshot(currentPreviewScene);
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [status, refreshInterval, currentProgramScene, currentPreviewScene, studioMode, scenes]);

  // Initial load of snapshots on mount
  useEffect(() => {
    if (status === 'connected' && scenes.length > 0) {
      fetchAllScreenshots();
    }
  }, [status, scenes.length]);

  const handleSceneSelect = async (sceneName: string) => {
    triggerHaptic('medium');
    setErrorMsg(null);
    try {
      if (studioMode) {
        await switchPreviewScene(sceneName);
      } else {
        await switchProgramScene(sceneName);
      }
    } catch (err: any) {
      setErrorMsg(`เปลี่ยน Scene ไม่สำเร็จ: ${err?.message || err}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
              SCENE SWITCHER ({scenes.length})
            </h2>
            <p className="text-xs text-slate-400">
              {studioMode
                ? 'โหมด Studio: กดที่การ์ดเพื่อเลือก Preview แล้วกด Transition'
                : 'โหมดปกติ: กดที่การ์ดเพื่อส่งภาพขึ้น Program ทันที'}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Refresh interval selector */}
          <div className="flex items-center gap-1.5 bg-[#0d1019] px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400">ภาพตัวอย่าง:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-slate-900">ปิด</option>
              <option value={1000} className="bg-slate-900">1 วินาที</option>
              <option value={2000} className="bg-slate-900">2 วินาที</option>
              <option value={5000} className="bg-slate-900">5 วินาที</option>
            </select>
          </div>

          {/* Manual Snapshot Refresh */}
          <button
            onClick={fetchAllScreenshots}
            disabled={isManualRefreshing || status !== 'connected'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition disabled:opacity-50"
            title="รีเฟรชภาพตัวอย่างทุก Scene"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isManualRefreshing ? 'animate-spin text-red-400' : ''}`} />
            <span className="hidden sm:inline">รีเฟรชภาพ</span>
          </button>

          {/* Studio Mode Toggle */}
          <button
            onClick={toggleStudioMode}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              studioMode
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {studioMode ? 'STUDIO MODE: ON' : 'STUDIO MODE: OFF'}
          </button>
        </div>
      </div>

      {/* Transition Floating Bar when Studio Mode is Active */}
      {studioMode && (
        <div className="sticky top-14 z-20 bg-[#161b2a]/95 backdrop-blur-md p-3 rounded-2xl border-2 border-emerald-500/50 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold uppercase truncate">
              PVW: {currentPreviewScene || 'None'}
            </div>
            <ArrowRightLeft className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono text-xs font-bold uppercase truncate">
              PGM: {currentProgramScene || 'None'}
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('heavy');
              triggerTransition();
            }}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center gap-2 shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>TRANSITION (CUT)</span>
          </button>
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Notice regarding snapshot method */}
      <div className="text-[11px] text-slate-400 px-1 flex items-center justify-between">
        <span>* ภาพตัวอย่างเป็นแบบ Snapshot ภาพนิ่งที่ดึงผ่าน GetSourceScreenshot</span>
        <span className="font-mono">{scenes.length} Scenes พร้อมสลับ</span>
      </div>

      {/* Scene Grid Cards */}
      {scenes.length === 0 ? (
        <div className="bg-[#141824] rounded-2xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm">
            {status === 'connected'
              ? 'ไม่พบ Scene ใน OBS Studio ของคุณ กรุณาสร้าง Scene ใน OBS'
              : 'กรุณาเชื่อมต่อ OBS Studio เพื่อดึง Scene'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {scenes.map((scene) => {
            const isProgram = scene.sceneName === currentProgramScene;
            const isPreview = studioMode && scene.sceneName === currentPreviewScene;
            const screenshot = screenshots[scene.sceneName];
            const isLoadingThumb = loadingScreenshots[scene.sceneName];

            return (
              <div
                key={scene.sceneName}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
                  isProgram
                    ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/40 ring-2 ring-red-500/50'
                    : isPreview
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-2 ring-emerald-500/50'
                    : 'bg-[#141824] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Tally Badge Top */}
                <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                  {isProgram && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono text-[10px] font-extrabold uppercase shadow-md flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      PROGRAM (LIVE)
                    </span>
                  )}
                  {isPreview && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[10px] font-extrabold uppercase shadow-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      PREVIEW (STANDBY)
                    </span>
                  )}
                </div>

                {/* Screenshot Thumbnail Preview */}
                <div
                  onClick={() => handleSceneSelect(scene.sceneName)}
                  className="relative aspect-video bg-[#090b10] flex items-center justify-center cursor-pointer group overflow-hidden"
                >
                  {screenshot ? (
                    <img
                      src={screenshot}
                      alt={scene.sceneName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-600 p-4 text-center">
                      <ImageIcon className="w-8 h-8 stroke-1" />
                      <span className="text-[10px]">แตะเพื่อโหลดภาพตัวอย่าง</span>
                    </div>
                  )}

                  {isLoadingThumb && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-red-400 animate-spin" />
                    </div>
                  )}

                  {/* Hover or tap overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <span className="py-2 px-4 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
                      {studioMode ? 'เลือก PREVIEW' : 'สลับขึ้น PROGRAM'}
                    </span>
                  </div>
                </div>

                {/* Scene Name & Action Footer */}
                <div className="p-3.5 flex items-center justify-between gap-2 border-t border-slate-800/80 bg-[#121622]">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-mono font-bold text-sm text-white truncate">
                      {scene.sceneName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Scene #{scene.sceneIndex + 1}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSceneSelect(scene.sceneName)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition active:scale-95 shrink-0 ${
                      isProgram
                        ? 'bg-red-600 text-white shadow-md'
                        : isPreview
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isProgram ? 'ON AIR' : isPreview ? 'READY' : studioMode ? 'SET PVW' : 'SWITCH'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
