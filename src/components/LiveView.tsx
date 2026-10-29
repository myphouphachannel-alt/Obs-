/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Radio,
  Video,
  Play,
  Square,
  Pause,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  HardDrive,
  Activity,
  Layers,
  ArrowRightLeft,
  Circle,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';
import { ConfirmModal } from './ConfirmModal';

export const LiveView: React.FC = () => {
  const {
    status,
    streamStatus,
    recordStatus,
    currentProgramScene,
    currentPreviewScene,
    studioMode,
    settings,
    startStreaming,
    stopStreaming,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    toggleStudioMode,
    triggerTransition,
    triggerHaptic,
  } = useOBS();

  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [confirmStreamOpen, setConfirmStreamOpen] = useState<boolean>(false);
  const [confirmRecordOpen, setConfirmRecordOpen] = useState<boolean>(false);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const handleStreamClick = () => {
    if (isLocked) {
      triggerHaptic('light');
      return;
    }
    triggerHaptic('heavy');
    if (streamStatus.active) {
      if (settings.confirmStreamStop) {
        setConfirmStreamOpen(true);
      } else {
        stopStreaming();
      }
    } else {
      startStreaming();
    }
  };

  const handleRecordClick = () => {
    if (isLocked) {
      triggerHaptic('light');
      return;
    }
    triggerHaptic('heavy');
    if (recordStatus.active) {
      if (settings.confirmRecordStop) {
        setConfirmRecordOpen(true);
      } else {
        stopRecording();
      }
    } else {
      startRecording();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmStreamOpen}
        title="หยุดการถ่ายทอดสด (STOP STREAM)?"
        message="ยืนยันการตัดสัญญาณถ่ายทอดสด ผู้ชมในแพลตฟอร์มปลายทางจะหยุดรับชมทันที"
        confirmText="หยุดการถ่ายทอดสด"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={async () => {
          setConfirmStreamOpen(false);
          await stopStreaming();
        }}
        onCancel={() => setConfirmStreamOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmRecordOpen}
        title="หยุดการบันทึกวิดีโอ (STOP RECORD)?"
        message="ยืนยันการหยุดบันทึกไฟล์วิดีโอบนคอมพิวเตอร์"
        confirmText="หยุดบันทึก"
        cancelText="บันทึกต่อ"
        isDestructive={false}
        onConfirm={async () => {
          setConfirmRecordOpen(false);
          await stopRecording();
        }}
        onCancel={() => setConfirmRecordOpen(false)}
      />

      {/* Header & Broadcast Safety Lock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
              BROADCAST OUTPUT CONTROL
            </h2>
            <p className="text-xs text-slate-400">ควบคุมการเริ่ม/หยุด ถ่ายทอดสดและบันทึกวิดีโอ</p>
          </div>
        </div>

        {/* Safety Lock Switch */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsLocked(!isLocked);
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition active:scale-95 shadow-lg ${
            isLocked
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
              : 'bg-emerald-600 text-white shadow-emerald-600/20'
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
          <span>{isLocked ? 'ปุ่มถูกล็อคอยู่ (แตะเพื่อปลดล็อค)' : 'ปลดล็อคแล้ว (พร้อมใช้งาน)'}</span>
        </button>
      </div>

      {/* Safety Notice if Locked */}
      {isLocked && (
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>ระบบเปิดใช้งานความปลอดภัย ปลดล็อคปุ่มด้านบนก่อนสั่งเริ่มหรือหยุดถ่ายทอดสด</span>
        </div>
      )}

      {/* MASTER STREAMING CARD */}
      <div className={`p-5 rounded-2xl border-2 transition shadow-xl ${
        streamStatus.active
          ? 'bg-red-950/40 border-red-500 shadow-red-950/40'
          : 'bg-[#141824] border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                streamStatus.active ? 'bg-red-500 animate-ping' : 'bg-slate-600'
              }`} />
              <h3 className="font-mono font-extrabold text-lg text-white tracking-wider uppercase">
                LIVE STREAMING
              </h3>
              {streamStatus.active && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
                  ON AIR
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {streamStatus.active
                ? 'กำลังถ่ายทอดสดสัญญาณออกไปยังแพลตฟอร์มปลายทาง'
                : 'พร้อมส่งสัญญาณสตรีมสด'}
            </p>
          </div>

          <button
            onClick={handleStreamClick}
            disabled={isLocked}
            className={`py-4 px-8 rounded-xl font-mono font-extrabold text-sm uppercase tracking-wider transition active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
              isLocked
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700'
                : streamStatus.active
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-tally'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {streamStatus.active ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>STOP STREAMING</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>START STREAMING</span>
              </>
            )}
          </button>
        </div>

        {/* Live Stream Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> เวลาถ่ายทอดสด
            </span>
            <span className="font-mono font-bold text-sm text-white">
              {streamStatus.active ? (streamStatus.timecode || '00:00:00') : '--:--:--'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> ปริมาณข้อมูล
            </span>
            <span className="font-mono font-bold text-sm text-white">
              {streamStatus.active ? formatBytes(streamStatus.bytes) : '0 MB'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <Activity className="w-3 h-3" /> บิตเรต
            </span>
            <span className="font-mono font-bold text-sm text-white">
              {streamStatus.kbitsPerSec ? `${streamStatus.kbitsPerSec} kbps` : 'อัตโนมัติ'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> เฟรมตก (Drop)
            </span>
            <span className={`font-mono font-bold text-sm ${
              (streamStatus.skippedFrames || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {streamStatus.skippedFrames || 0} Frames
            </span>
          </div>
        </div>
      </div>

      {/* MASTER RECORDING CARD */}
      <div className={`p-5 rounded-2xl border-2 transition shadow-xl ${
        recordStatus.active
          ? 'bg-red-950/30 border-red-500/70'
          : 'bg-[#141824] border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                recordStatus.active ? 'bg-red-500' : 'bg-slate-600'
              }`} />
              <h3 className="font-mono font-extrabold text-lg text-white tracking-wider uppercase">
                VIDEO RECORDING
              </h3>
              {recordStatus.paused && (
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-mono text-[10px] font-bold">
                  PAUSED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">บันทึกภาพและเสียงลงพื้นที่จัดเก็บของคอมพิวเตอร์</p>
          </div>

          <div className="flex items-center gap-2">
            {recordStatus.active && (
              <button
                onClick={() => recordStatus.paused ? resumeRecording() : pauseRecording()}
                disabled={isLocked}
                className="py-4 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs uppercase flex items-center gap-1.5 active:scale-95 transition disabled:opacity-40"
              >
                {recordStatus.paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                <span>{recordStatus.paused ? 'RESUME' : 'PAUSE'}</span>
              </button>
            )}

            <button
              onClick={handleRecordClick}
              disabled={isLocked}
              className={`py-4 px-8 rounded-xl font-mono font-extrabold text-sm uppercase tracking-wider transition active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700'
                  : recordStatus.active
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {recordStatus.active ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>STOP RECORDING</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>START RECORDING</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Record Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> ระยะเวลาบันทึก
            </span>
            <span className="font-mono font-bold text-sm text-white">
              {recordStatus.active ? (recordStatus.timecode || '00:00:00') : '--:--:--'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> ขนาดไฟล์ปัจจุบัน
            </span>
            <span className="font-mono font-bold text-sm text-white">
              {recordStatus.active ? formatBytes(recordStatus.bytes) : '0 MB'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 flex items-center gap-1">
              <Circle className="w-3 h-3 text-red-500 fill-current" /> สถานะไฟล์
            </span>
            <span className="font-mono font-bold text-sm text-white">
              {recordStatus.active ? (recordStatus.paused ? 'พักชั่วคราว' : 'กำลังเขียนข้อมูล') : 'พร้อม'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
