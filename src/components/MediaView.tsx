/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Square,
  RefreshCw,
  Music,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

export const MediaView: React.FC = () => {
  const {
    status,
    mediaInputs,
    triggerMedia,
    refreshAllData,
    triggerHaptic,
  } = useOBS();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const handleAction = async (
    inputName: string,
    action: 'OBS_WEBMEDIA_INPUT_ACTION_PLAY' | 'OBS_WEBMEDIA_INPUT_ACTION_PAUSE' | 'OBS_WEBMEDIA_INPUT_ACTION_RESTART' | 'OBS_WEBMEDIA_INPUT_ACTION_STOP',
    label: string
  ) => {
    triggerHaptic('medium');
    try {
      await triggerMedia(inputName, action);
      setActionStatus(`${label} บน ${inputName} แล้ว`);
      setTimeout(() => setActionStatus(null), 2500);
    } catch (err: any) {
      setActionStatus(`เกิดข้อผิดพลาด: ${err?.message || err}`);
      setTimeout(() => setActionStatus(null), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
              MEDIA CONTROL (ควบคุมวิดีโอ & สื่อ)
            </h2>
            <p className="text-xs text-slate-400">ควบคุมการเล่นคลิปวิดีโอ Replay, Stinger, และเพลงใน OBS</p>
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
          <span>รีเฟรช Media</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionStatus && (
        <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Media Sources List */}
      {mediaInputs.length === 0 ? (
        <div className="bg-[#141824] rounded-2xl border border-slate-800 p-12 text-center text-slate-400 text-xs space-y-2">
          <Film className="w-8 h-8 mx-auto text-slate-600" />
          <p>
            {status === 'connected'
              ? 'ไม่พบ Media Source (เช่น Video Clip, VLC Video, เพลง) ใน OBS Studio'
              : 'กรุณาเชื่อมต่อกับ OBS Studio เพื่อควบคุมคลิปวิดีโอ'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {mediaInputs.map((media) => (
            <div
              key={media.inputName}
              className="p-4 sm:p-5 rounded-2xl bg-[#141824] border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate font-mono">
                      {media.inputName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {media.inputKind}
                    </span>
                  </div>
                </div>

                {media.mediaState && (
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                    {media.mediaState.replace('OBS_MEDIA_STATE_', '')}
                  </span>
                )}
              </div>

              {/* Big tactile playback controls */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {/* Play */}
                <button
                  onClick={() =>
                    handleAction(media.inputName, 'OBS_WEBMEDIA_INPUT_ACTION_PLAY', 'สั่งเล่น')
                  }
                  className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow-lg shadow-emerald-600/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span className="text-[10px]">PLAY</span>
                </button>

                {/* Pause */}
                <button
                  onClick={() =>
                    handleAction(media.inputName, 'OBS_WEBMEDIA_INPUT_ACTION_PAUSE', 'พักชั่วคราว')
                  }
                  className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                >
                  <Pause className="w-4 h-4" />
                  <span className="text-[10px]">PAUSE</span>
                </button>

                {/* Restart */}
                <button
                  onClick={() =>
                    handleAction(media.inputName, 'OBS_WEBMEDIA_INPUT_ACTION_RESTART', 'เริ่มใหม่')
                  }
                  className="py-3 px-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[10px]">RESTART</span>
                </button>

                {/* Stop */}
                <button
                  onClick={() =>
                    handleAction(media.inputName, 'OBS_WEBMEDIA_INPUT_ACTION_STOP', 'หยุดเล่น')
                  }
                  className="py-3 px-2 rounded-xl bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span className="text-[10px]">STOP</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
