/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Camera,
  Vibrate,
  ShieldAlert,
  Server,
  HelpCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

interface SettingsViewProps {
  onOpenGuide: () => void;
  onOpenConnection: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenGuide,
  onOpenConnection,
}) => {
  const {
    status,
    serverIp,
    serverPort,
    obsVersion,
    obsWsVersion,
    scenes,
    settings,
    updateSettings,
    updateCameraPad,
    disconnect,
    triggerHaptic,
  } = useOBS();

  const [savedToast, setSavedToast] = useState(false);

  const showSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handlePadLabelChange = (index: number, newLabel: string) => {
    const existing = settings.cameraPads[index];
    updateCameraPad(index, { ...existing, label: newLabel });
    showSaved();
  };

  const handlePadSceneChange = (index: number, newSceneName: string) => {
    const existing = settings.cameraPads[index];
    updateCameraPad(index, { ...existing, targetSceneName: newSceneName });
    showSaved();
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
      {/* Toast */}
      {savedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wide">
              SETTINGS & HOTKEYS (การตั้งค่า)
            </h2>
            <p className="text-xs text-slate-400">กำหนดปุ่มลัด สลับกล้อง และตัวเลือกความปลอดภัย</p>
          </div>
        </div>

        <button
          onClick={onOpenGuide}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
        >
          <HelpCircle className="w-4 h-4 text-red-400" />
          <span>คู่มือติดตั้ง</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm font-mono uppercase flex items-center gap-2">
            <Server className="w-4 h-4 text-red-400" />
            <span>OBS WEBSOCKET SERVER</span>
          </h3>
          <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase ${
            status === 'connected' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
          }`}>
            {status === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-slate-400 block mb-0.5">ที่อยู่เซิร์ฟเวอร์:</span>
            <span className="text-white font-bold">{serverIp ? `${serverIp}:${serverPort}` : 'ยังไม่ได้เชื่อมต่อ'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e111a] border border-slate-800">
            <span className="text-slate-400 block mb-0.5">OBS Studio เวอร์ชัน:</span>
            <span className="text-white font-bold">{obsVersion ? `v${obsVersion} (WS v${obsWsVersion})` : '-'}</span>
          </div>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onOpenConnection}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs active:scale-95 transition"
          >
            ตั้งค่าหรือเปลี่ยนเซิร์ฟเวอร์
          </button>
          {status === 'connected' && (
            <button
              onClick={() => disconnect()}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs active:scale-95 transition"
            >
              ตัดการเชื่อมต่อ
            </button>
          )}
        </div>
      </div>

      {/* Camera Pads Customization */}
      <div className="bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="font-extrabold text-white text-sm font-mono uppercase flex items-center gap-2">
            <Camera className="w-4 h-4 text-red-400" />
            <span>ปรับแต่งปุ่มลัดสลับกล้อง (Camera Pads)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            เปลี่ยนชื่อปุ่มและเลือก Scene จริงใน OBS ที่ต้องการให้ปุ่มแต่ละปุ่มเรียกใช้งาน
          </p>
        </div>

        <div className="space-y-3">
          {settings.cameraPads.map((pad, idx) => (
            <div
              key={pad.id || idx}
              className="p-3.5 rounded-xl bg-[#0e111a] border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2 sm:w-1/3">
                <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={pad.label}
                  onChange={(e) => handlePadLabelChange(idx, e.target.value)}
                  placeholder="ชื่อปุ่ม"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 w-full"
                />
              </div>

              <div className="flex-1">
                <select
                  value={pad.targetSceneName}
                  onChange={(e) => handlePadSceneChange(idx, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="">-- เลือก Scene ใน OBS --</option>
                  {scenes.map((s) => (
                    <option key={s.sceneName} value={s.sceneName}>
                      {s.sceneName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Operator Preferences */}
      <div className="bg-[#141824] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-sm font-mono uppercase flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>ระบบความปลอดภัยและการตอบสนอง</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          {/* Stream Stop Confirmation */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0e111a] border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">ยืนยันก่อนหยุดถ่ายทอดสด (Stop Stream Confirmation)</span>
              <span className="text-[11px] text-slate-400">แสดงกล่องข้อความยืนยันเพื่อป้องกันการกดพลาดตัดสัญญาณ</span>
            </div>
            <input
              type="checkbox"
              checked={settings.confirmStreamStop}
              onChange={(e) => updateSettings({ confirmStreamStop: e.target.checked })}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 ml-3"
            />
          </label>

          {/* Record Stop Confirmation */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0e111a] border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">ยืนยันก่อนหยุดบันทึก (Stop Record Confirmation)</span>
              <span className="text-[11px] text-slate-400">ป้องกันการหยุดบันทึกไฟล์วิดีโอโดยไม่ได้ตั้งใจ</span>
            </div>
            <input
              type="checkbox"
              checked={settings.confirmRecordStop}
              onChange={(e) => updateSettings({ confirmRecordStop: e.target.checked })}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 ml-3"
            />
          </label>

          {/* Haptic feedback */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0e111a] border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block flex items-center gap-1.5">
                <Vibrate className="w-3.5 h-3.5 text-amber-400" />
                <span>ระบบสั่นเมื่อสัมผัสปุ่ม (Tactile Haptic Feedback)</span>
              </span>
              <span className="text-[11px] text-slate-400">สั่นสะเทือนสั้นๆ เพื่อให้ความรู้สึกเหมือนกดปุ่มสวิตเชอร์จริง</span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableHaptics}
              onChange={(e) => updateSettings({ enableHaptics: e.target.checked })}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 ml-3"
            />
          </label>
        </div>
      </div>

      {/* Safari Add to Home Screen tip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/40 text-xs text-blue-200 space-y-1.5">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>เคล็ดลับ Safari บน iPhone:</span>
        </span>
        <p className="leading-relaxed">
          กดปุ่มแชร์ของ Safari (Share icon) &gt; เลือก <strong>&quot;Add to Home Screen&quot; (เพิ่มไปยังหน้าจอโฮม)</strong> จะได้แอปเต็มหน้าจอที่ใช้งานได้รวดเร็วเหมือนแอปพลิเคชันจริงโดยไม่ต้องติดตั้งผ่าน App Store!
        </p>
      </div>
    </div>
  );
};
