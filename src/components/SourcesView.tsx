/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  Video,
  Image,
  Type,
  Globe,
  Monitor,
  Mic,
  Music,
  Box,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

export const SourcesView: React.FC = () => {
  const {
    status,
    scenes,
    currentProgramScene,
    sceneItems,
    selectedSceneForItems,
    selectSceneForItems,
    toggleSceneItem,
    triggerHaptic,
  } = useOBS();

  const [activeScene, setActiveScene] = useState<string>(
    selectedSceneForItems || currentProgramScene || ''
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentProgramScene && !activeScene) {
      setActiveScene(currentProgramScene);
      selectSceneForItems(currentProgramScene);
    }
  }, [currentProgramScene]);

  const handleSceneChange = async (sceneName: string) => {
    triggerHaptic('light');
    setActiveScene(sceneName);
    await selectSceneForItems(sceneName);
  };

  const handleToggle = async (itemId: number, currentEnabled: boolean) => {
    triggerHaptic('medium');
    await toggleSceneItem(activeScene, itemId, !currentEnabled);
  };

  const getSourceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <Image className="w-4 h-4 text-purple-400" />;
    if (t.includes('text')) return <Type className="w-4 h-4 text-amber-400" />;
    if (t.includes('browser')) return <Globe className="w-4 h-4 text-sky-400" />;
    if (t.includes('dshow') || t.includes('camera') || t.includes('video'))
      return <Video className="w-4 h-4 text-emerald-400" />;
    if (t.includes('monitor') || t.includes('screen') || t.includes('window'))
      return <Monitor className="w-4 h-4 text-blue-400" />;
    if (t.includes('audio') || t.includes('wasapi'))
      return <Mic className="w-4 h-4 text-rose-400" />;
    if (t.includes('media') || t.includes('ffmpeg'))
      return <Music className="w-4 h-4 text-orange-400" />;
    return <Box className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Header & Scene Selector */}
      <div className="bg-[#141824] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
                SOURCE CONTROL (ควบคุมแหล่งสัญญาณ)
              </h2>
              <p className="text-xs text-slate-400">
                เปิด / ปิด การมองเห็นของแต่ละเลเยอร์ใน Scene
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              triggerHaptic('light');
              setIsRefreshing(true);
              if (activeScene) await selectSceneForItems(activeScene);
              setIsRefreshing(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            <span>รีเฟรช Sources</span>
          </button>
        </div>

        {/* Scene Selection Pills */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-semibold block">เลือก Scene:</label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {scenes.map((s) => {
              const isSelected = s.sceneName === activeScene;
              const isProgram = s.sceneName === currentProgramScene;
              return (
                <button
                  key={s.sceneName}
                  onClick={() => handleSceneChange(s.sceneName)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#0e111a] hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {isProgram && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  <span>{s.sceneName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sources List for Active Scene */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            รายการใน Scene: {activeScene || 'ยังไม่ได้เลือก'} ({sceneItems.length} รายการ)
          </span>
          <span className="text-[11px] text-slate-400">แตะเพื่อเปิด/ปิด Visibility</span>
        </div>

        {sceneItems.length === 0 ? (
          <div className="bg-[#141824] rounded-2xl border border-slate-800 p-10 text-center text-slate-400 text-xs">
            {status === 'connected'
              ? 'ไม่พบ Source ใดใน Scene นี้'
              : 'เชื่อมต่อ OBS เพื่อดึงรายการ Source'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sceneItems.map((item) => (
              <div
                key={item.sceneItemId}
                className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                  item.sceneItemEnabled
                    ? 'bg-[#141824] border-slate-700/80 hover:border-slate-600'
                    : 'bg-[#0e111a]/70 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                    {getSourceIcon(item.sourceType)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate font-mono">
                      {item.sourceName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {item.sourceType}
                    </span>
                  </div>
                </div>

                {/* Eye toggle button */}
                <button
                  onClick={() => handleToggle(item.sceneItemId, item.sceneItemEnabled)}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition shrink-0 ${
                    item.sceneItemEnabled
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  {item.sceneItemEnabled ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>OFF</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
