/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Radio,
  Tv,
  Video,
  Volume2,
  VolumeX,
  Play,
  Square,
  Pause,
  Repeat,
  Sliders,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
  Circle,
  Eye,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';
import { ConfirmModal } from './ConfirmModal';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    status,
    scenes,
    currentProgramScene,
    currentPreviewScene,
    studioMode,
    audioInputs,
    streamStatus,
    recordStatus,
    settings,
    switchProgramScene,
    switchPreviewScene,
    toggleStudioMode,
    triggerTransition,
    toggleAudioMute,
    setAudioVolume,
    startStreaming,
    stopStreaming,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    triggerHaptic,
  } = useOBS();

  // Safety confirmation dialogs
  const [confirmStreamOpen, setConfirmStreamOpen] = useState(false);
  const [confirmRecordOpen, setConfirmRecordOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3000);
  };

  const handleSceneClick = async (sceneName: string) => {
    triggerHaptic('medium');
    try {
      if (studioMode) {
        await switchPreviewScene(sceneName);
      } else {
        await switchProgramScene(sceneName);
      }
    } catch (err: any) {
      showToast(`เปลี่ยน Scene ไม่สำเร็จ: ${err?.message || err}`);
    }
  };

  const handleCameraPadClick = async (targetSceneName: string) => {
    triggerHaptic('medium');
    if (!targetSceneName) {
      showToast('ปุ่มนี้ยังไม่ได้จับคู่กับ Scene ในหน้า Settings');
      return;
    }
    try {
      if (studioMode) {
        await switchPreviewScene(targetSceneName);
      } else {
        await switchProgramScene(targetSceneName);
      }
    } catch (err: any) {
      showToast(`ไม่สามารถสลับไปยัง ${targetSceneName}: ${err?.message || err}`);
    }
  };

  const handleStreamToggle = () => {
    triggerHaptic('heavy');
    if (streamStatus.active) {
      if (settings.confirmStreamStop) {
        setConfirmStreamOpen(true);
      } else {
        stopStreaming().catch((e) => showToast(e.message));
      }
    } else {
      startStreaming().catch((e) => showToast(e.message));
    }
  };

  const handleRecordToggle = () => {
    triggerHaptic('heavy');
    if (recordStatus.active) {
      if (settings.confirmRecordStop) {
        setConfirmRecordOpen(true);
      } else {
        stopRecording().catch((e) => showToast(e.message));
      }
    } else {
      startRecording().catch((e) => showToast(e.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Toast Alert */}
      {errorToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmStreamOpen}
        title="หยุดการถ่ายทอดสด (STOP STREAM)?"
        message="คุณกำลังจะหยุดการถ่ายทอดสด ผู้ชมทั้งหมดจะถูกตัดสัญญาณ ยืนยันการหยุดไลฟ์หรือไม่?"
        confirmText="หยุดการถ่ายทอดสด"
        cancelText="ถ่ายทอดสดต่อ"
        isDestructive={true}
        onConfirm={async () => {
          setConfirmStreamOpen(false);
          try {
            await stopStreaming();
          } catch (e: any) {
            showToast(e.message);
          }
        }}
        onCancel={() => setConfirmStreamOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmRecordOpen}
        title="หยุดการบันทึกวิดีโอ (STOP RECORD)?"
        message="ต้องการหยุดการบันทึกไฟล์วิดีโอบน OBS หรือไม่?"
        confirmText="หยุดการบันทึก"
        cancelText="บันทึกต่อ"
        isDestructive={false}
        onConfirm={async () => {
          setConfirmRecordOpen(false);
          try {
            await stopRecording();
          } catch (e: any) {
            showToast(e.message);
          }
        }}
        onCancel={() => setConfirmRecordOpen(false)}
      />

      {/* TALLY MONITORS: PROGRAM (PGM) & PREVIEW (PVW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* PROGRAM TALLY (ON AIR) */}
        <div className="relative rounded-2xl bg-[#131622] border-2 border-red-500/80 p-4 shadow-xl shadow-red-950/20 overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-bl-xl font-mono flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            PROGRAM (ON AIR)
          </div>

          <div className="flex items-center gap-3 mt-1 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-24">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">SCENE กำลังออกอากาศ</span>
              <h2 className="text-lg sm:text-xl font-bold text-white truncate font-mono">
                {currentProgramScene || 'ยังไม่ได้เลือก Scene'}
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">สถานะ: <strong className="text-red-400">LIVE OUTPUT</strong></span>
            <button
              onClick={() => onNavigate('scenes')}
              className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>ดู Scene ทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PREVIEW TALLY (STANDBY / STUDIO MODE) */}
        <div className={`relative rounded-2xl bg-[#131622] border-2 ${
          studioMode ? 'border-emerald-500/80 shadow-emerald-950/20' : 'border-slate-800'
        } p-4 shadow-xl overflow-hidden`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                studioMode
                  ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                <Eye className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                  {studioMode ? 'PREVIEW (STANDBY)' : 'STUDIO MODE ปิดอยู่'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate font-mono">
                  {studioMode ? (currentPreviewScene || 'เลือกภาพตัวอย่าง') : 'โหมดสลับทันที (Direct)'}
                </h2>
              </div>
            </div>

            {/* Studio Mode Toggle */}
            <button
              onClick={toggleStudioMode}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide transition active:scale-95 ${
                studioMode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {studioMode ? 'โหมด STUDIO: ON' : 'เปิด STUDIO MODE'}
            </button>
          </div>

          {studioMode && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">กด Transition เพื่อส่งภาพขึ้น Program</span>
              <button
                onClick={triggerTransition}
                className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-red-600/20 active:scale-95 transition flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>TRANSITION / CUT</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MASTER LIVE & RECORDING CONTROL STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Stream Control Button */}
        <div className={`rounded-2xl p-4 border flex items-center justify-between transition ${
          streamStatus.active
            ? 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-900/30'
            : 'bg-[#141824] border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
              streamStatus.active ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base font-mono">STREAMING</span>
                {streamStatus.active && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">LIVE</span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {streamStatus.active ? (streamStatus.timecode || '00:00:00') : 'ออฟไลน์ (พร้อมเริ่มถ่ายทอดสด)'}
              </span>
            </div>
          </div>

          <button
            onClick={handleStreamToggle}
            className={`py-3 px-5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition active:scale-95 shadow-lg ${
              streamStatus.active
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-tally'
                : 'bg-slate-800 hover:bg-red-600 hover:text-white text-slate-200 border border-slate-700'
            }`}
          >
            {streamStatus.active ? 'STOP LIVE' : 'START LIVE'}
          </button>
        </div>

        {/* Record Control Button */}
        <div className={`rounded-2xl p-4 border flex items-center justify-between transition ${
          recordStatus.active
            ? 'bg-red-950/30 border-red-500/60'
            : 'bg-[#141824] border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              recordStatus.active ? 'bg-red-600/20 text-red-500 border border-red-500/40' : 'bg-slate-800 text-slate-400'
            }`}>
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base font-mono">RECORDING</span>
                {recordStatus.paused && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold">PAUSED</span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {recordStatus.active ? (recordStatus.timecode || '00:00:00') : 'พร้อมบันทึกไฟล์วิดีโอ'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {recordStatus.active && (
              <button
                onClick={() => recordStatus.paused ? resumeRecording() : pauseRecording()}
                className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition"
                title={recordStatus.paused ? 'เล่นต่อ' : 'พักการบันทึก'}
              >
                {recordStatus.paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleRecordToggle}
              className={`py-3 px-5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition active:scale-95 shadow-lg ${
                recordStatus.active
                  ? 'bg-red-600 text-white shadow-red-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {recordStatus.active ? 'STOP REC' : 'START REC'}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK CAMERA & SOURCE PADS (Dedicated for Football / Events / Multi-Camera) */}
      <div className="bg-[#141824] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-red-500" />
            <h3 className="font-extrabold text-white text-sm sm:text-base tracking-wide font-mono uppercase">
              CAMERA SWITCHER (สลับกล้องด่วน)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            ตั้งค่าปุ่มกล้อง
          </button>
        </div>

        {/* 6 Broadcast Pads Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {settings.cameraPads.map((pad, idx) => {
            const isLive = pad.targetSceneName && currentProgramScene === pad.targetSceneName;
            const isPreview = studioMode && pad.targetSceneName && currentPreviewScene === pad.targetSceneName;

            return (
              <button
                key={pad.id || idx}
                onClick={() => handleCameraPadClick(pad.targetSceneName)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl font-mono text-center transition active:scale-95 min-h-[85px] sm:min-h-[100px] border-2 ${
                  isLive
                    ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/50 animate-tally'
                    : isPreview
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-900/30'
                    : 'bg-[#0d1019] border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                {/* Tally dot */}
                <span className={`w-2.5 h-2.5 rounded-full mb-1.5 ${
                  isLive ? 'bg-white animate-ping' : isPreview ? 'bg-emerald-400' : 'bg-slate-700'
                }`} />

                <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase block">
                  {pad.label}
                </span>

                <span className="text-[10px] opacity-75 truncate max-w-full px-1 block mt-0.5">
                  {pad.targetSceneName || '(ยังไม่ตั้ง)'}
                </span>

                {isLive && (
                  <span className="absolute bottom-1 text-[9px] font-extrabold uppercase tracking-widest text-red-100">
                    ON AIR
                  </span>
                )}
                {isPreview && (
                  <span className="absolute bottom-1 text-[9px] font-extrabold uppercase tracking-widest text-emerald-300">
                    STANDBY
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK SCENE LIST CARDS (Real Scenes from OBS) */}
      <div className="bg-[#141824] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <h3 className="font-extrabold text-white text-sm sm:text-base tracking-wide font-mono uppercase">
              SCENES ({scenes.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('scenes')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            <span>ดูภาพตัวอย่าง Scene</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {scenes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {status === 'connected' ? 'ไม่พบ Scene ใน OBS Studio' : 'กรุณาเชื่อมต่อกับ OBS Studio เพื่อโหลดรายชื่อ Scene'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {scenes.map((scene) => {
              const isProgram = scene.sceneName === currentProgramScene;
              const isPreview = studioMode && scene.sceneName === currentPreviewScene;

              return (
                <button
                  key={scene.sceneName}
                  onClick={() => handleSceneClick(scene.sceneName)}
                  className={`p-3.5 rounded-xl text-left border-2 transition active:scale-95 flex flex-col justify-between min-h-[75px] ${
                    isProgram
                      ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-500'
                      : isPreview
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-[#0e111a] border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-slate-400">
                      #{scene.sceneIndex + 1}
                    </span>
                    {isProgram && (
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-extrabold uppercase animate-pulse">
                        PROGRAM
                      </span>
                    )}
                    {isPreview && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[9px] font-extrabold uppercase">
                        PREVIEW
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-xs sm:text-sm font-mono truncate mt-2 text-white">
                    {scene.sceneName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK AUDIO MINI MIXER */}
      <div className="bg-[#141824] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-red-500" />
            <h3 className="font-extrabold text-white text-sm sm:text-base tracking-wide font-mono uppercase">
              AUDIO MINI MIXER
            </h3>
          </div>
          <button
            onClick={() => onNavigate('audio')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            <span>เปิด Audio Mixer เต็มรูปแบบ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {audioInputs.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            {status === 'connected' ? 'ไม่พบ Audio Input ใน OBS' : 'เชื่อมต่อ OBS เพื่อควบคุมระดับเสียง'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {audioInputs.slice(0, 3).map((audio) => (
              <div
                key={audio.inputName}
                className={`p-3.5 rounded-xl border ${
                  audio.muted ? 'bg-red-950/20 border-red-900/50' : 'bg-[#0e111a] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white truncate max-w-[150px] font-mono">
                    {audio.inputName}
                  </span>
                  <button
                    onClick={() => toggleAudioMute(audio.inputName)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition active:scale-95 flex items-center gap-1 ${
                      audio.muted
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {audio.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{audio.muted ? 'MUTED' : 'MUTE'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audio.volumeMul}
                    onChange={(e) => setAudioVolume(audio.inputName, parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                    {Math.round(audio.volumeMul * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
