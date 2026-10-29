/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  HelpCircle,
  Maximize,
  Minimize,
  RefreshCw,
  Video,
  Circle,
  Sliders,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenConnection: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onOpenConnection }) => {
  const {
    status,
    currentProgramScene,
    currentPreviewScene,
    studioMode,
    streamStatus,
    recordStatus,
    refreshAllData,
    triggerHaptic,
  } = useOBS();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleFullscreen = () => {
    triggerHaptic('light');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleRefresh = async () => {
    triggerHaptic('light');
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0d1019]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5 pt-[calc(0.625rem+var(--sat))]">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Brand & Connection Badge */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenConnection}
            className="flex items-center gap-2 group text-left transition"
            title="จัดการการเชื่อมต่อ OBS"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/30 text-red-500 group-hover:scale-105 transition">
              <Radio className="w-4 h-4 animate-pulse" />
              {status === 'connected' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1019]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-xs sm:text-sm text-white font-mono uppercase">
                  OBS PRO <span className="text-red-500">REMOTE</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {status === 'connected' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    CONNECTED
                  </span>
                ) : status === 'connecting' ? (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    CONNECTING...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <WifiOff className="w-2.5 h-2.5" />
                    OFFLINE
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Live / Rec / Scene Tally Indicator (Compact on Mobile) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Current Program scene badge */}
          {status === 'connected' && currentProgramScene && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono font-bold animate-tally">
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
              <span>PGM:</span>
              <span className="text-white truncate max-w-[150px]">{currentProgramScene}</span>
            </div>
          )}

          {/* Current Preview scene badge (if studio mode) */}
          {status === 'connected' && studioMode && currentPreviewScene && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
              <span>PVW:</span>
              <span className="text-white truncate max-w-[150px]">{currentPreviewScene}</span>
            </div>
          )}
        </div>

        {/* Quick Live & Rec Tally & Control Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Stream Status Pill */}
          {streamStatus.active && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono text-[11px] font-bold shadow-lg shadow-red-600/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE</span>
              <span className="text-red-100 hidden sm:inline">{streamStatus.timecode || '00:00:00'}</span>
            </div>
          )}

          {/* Record Status Pill */}
          {recordStatus.active && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold ${
              recordStatus.paused
                ? 'bg-amber-600 text-white'
                : 'bg-red-950/80 border border-red-500 text-red-300'
            }`}>
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
              <span>{recordStatus.paused ? 'REC PAUSED' : 'REC'}</span>
              <span className="text-slate-200 hidden sm:inline">{recordStatus.timecode || '00:00:00'}</span>
            </div>
          )}

          {/* Refresh button */}
          {status === 'connected' && (
            <button
              onClick={handleRefresh}
              aria-label="รีเฟรชข้อมูลจาก OBS"
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 active:scale-95 transition"
              title="ดึงข้อมูลล่าสุดจาก OBS"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            </button>
          )}

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            aria-label="เต็มจอ"
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 active:scale-95 transition hidden sm:flex"
            title="เปิดโหมดเต็มหน้าจอ"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Help / Guide button */}
          <button
            onClick={onOpenGuide}
            aria-label="คู่มือการเชื่อมต่อ"
            className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-xs font-medium"
            title="วิธีเชื่อมต่อ OBS บน Windows & Safari"
          >
            <HelpCircle className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">คู่มือ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
