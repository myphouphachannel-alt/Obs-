/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Server,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

interface ConnectionViewProps {
  onOpenGuide: () => void;
  onSuccess?: () => void;
}

export const ConnectionView: React.FC<ConnectionViewProps> = ({ onOpenGuide, onSuccess }) => {
  const {
    status,
    statusMessage,
    serverIp,
    serverPort,
    rememberSettings,
    obsVersion,
    obsWsVersion,
    connect,
    disconnect,
    testConnection,
    triggerHaptic,
  } = useOBS();

  const [ip, setIp] = useState<string>(serverIp || '192.168.1.');
  const [port, setPort] = useState<number>(serverPort || 4455);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(rememberSettings);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isConnectingLocal, setIsConnectingLocal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';

  const formatErrorMessage = (err: any): string => {
    const raw = String(err?.message || err || '');
    if (raw.toLowerCase().includes('auth') || raw.includes('4009')) {
      return 'รหัสผ่านไม่ถูกต้อง หรือใน OBS มีการตั้งรหัสผ่านไว้แต่ยังไม่ได้กรอกในหน้านี้ (ตรวจสอบใน OBS > Tools > WebSocket Server Settings)';
    }
    if (raw.toLowerCase().includes('security') || raw.toLowerCase().includes('insecure')) {
      return 'เบราว์เซอร์บล็อกการเชื่อมต่อ (Mixed Content): คุณกำลังเปิดผ่าน HTTPS แต่ OBS WebSocket เป็น ws:// แบบไม่เข้ารหัส กรุณาเปิดผ่าน HTTP (http://192.168.1.43:3000) หรือใช้ WSS';
    }
    if (isHttpsPage && (raw.includes('ConnectionClosed') || raw.includes('failed') || raw.includes('1006') || raw.includes('Error'))) {
      return `เชื่อมต่อไม่สำเร็จ: เนื่องจากคุณเปิดเว็บผ่าน HTTPS (${window.location.hostname}) ทำให้ Safari บล็อกการติดต่อกับ ws://${ip}:${port} ภายในบ้าน (Mixed Content) กรุณารันเว็บในคอมแล้วเข้าผ่าน http://192.168.1.43:3000 หรือเช็ครหัสผ่าน OBS`;
    }
    return raw || 'เชื่อมต่อกับ OBS ไม่สำเร็จ ตรวจสอบ IP และการตั้งค่า WebSocket';
  };

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ip.trim()) {
      setErrorMessage('กรุณาระบุ IP Address ของคอมพิวเตอร์');
      return;
    }

    setErrorMessage(null);
    setTestResult(null);
    setIsConnectingLocal(true);
    triggerHaptic('medium');

    try {
      await connect(ip.trim(), port, password, remember);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(formatErrorMessage(err));
    } finally {
      setIsConnectingLocal(false);
    }
  };

  const handleTest = async () => {
    if (!ip.trim()) {
      setErrorMessage('กรุณาระบุ IP Address ก่อนทดสอบ');
      return;
    }
    setErrorMessage(null);
    setIsTesting(true);
    setTestResult(null);
    triggerHaptic('light');

    try {
      const msg = await testConnection(ip.trim(), port, password);
      setTestResult({ success: true, message: msg });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'ทดสอบไม่สำเร็จ ตรวจสอบว่าเปิด OBS Studio แล้วหรือยัง',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    triggerHaptic('medium');
    await disconnect();
  };

  const quickSetIp = (prefix: string) => {
    triggerHaptic('light');
    setIp(prefix);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-5 animate-in fade-in duration-200">
      {/* Title Card */}
      <div className="bg-[#141824] rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              OBS PRO <span className="text-red-500">REMOTE</span>
            </h1>
            <p className="text-xs text-slate-400">เชื่อมต่อ OBS Studio ผ่านเครือข่าย Wi-Fi เดียวกัน</p>
          </div>
        </div>

        {/* Current status display */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                  : status === 'connecting'
                  ? 'bg-amber-400 ring-4 ring-amber-400/20 animate-ping'
                  : status === 'error'
                  ? 'bg-red-500 ring-4 ring-red-500/20'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              สถานะ: {status === 'connected' ? 'เชื่อมต่อแล้ว' : status === 'connecting' ? 'กำลังเชื่อมต่อ...' : status === 'error' ? 'เกิดข้อผิดพลาด' : 'ยังไม่ได้เชื่อมต่อ'}
            </span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ดูวิธีเชื่อมต่อ</span>
          </button>
        </div>
      </div>

      {/* Connected State Actions */}
      {status === 'connected' ? (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 text-emerald-200 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-base">เชื่อมต่อกับ OBS สำเร็จแล้ว!</h3>
              <p className="text-xs text-emerald-300/90 mt-1">
                OBS Studio v{obsVersion} (WebSocket v{obsWsVersion}) ที่ {ip}:{port}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onSuccess && onSuccess()}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>ไปที่หน้าควบคุมหลัก</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDisconnect}
              className="py-3 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm active:scale-95 transition"
            >
              ตัดการเชื่อมต่อ
            </button>
          </div>
        </div>
      ) : (
        /* Form Connection */
        <form onSubmit={handleConnect} className="bg-[#141824] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          {/* HTTPS Mixed Content Warning Banner */}
          {isHttpsPage && (
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/60 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>กำลังเปิดผ่าน HTTPS ({typeof window !== 'undefined' ? window.location.hostname : 'Cloud'}):</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-200/90">
                Safari บน iPhone จะบล็อกการเชื่อมต่อกับ <code className="bg-black/40 px-1 rounded font-mono text-white">ws://192.168.1.43:4455</code> ตามมาตรฐานความปลอดภัย Mixed Content
              </p>
              <div className="pt-1 text-[11px] text-amber-100 bg-black/30 p-2 rounded-lg font-medium">
                💡 <strong>วิธีแก้:</strong> รันคำสั่ง <code className="text-emerald-300 font-mono">npm run dev</code> ในคอม แล้วเปิด Safari เข้าผ่าน <code className="text-white font-mono underline">http://192.168.1.43:3000</code> (เป็น HTTP จะไม่ถูกบล็อก)
              </div>
            </div>
          )}

          {/* IP Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-red-400" />
                <span>IP Address ของคอมพิวเตอร์ Windows</span>
              </label>
              <span className="text-[10px] text-slate-400">เช่น 192.168.1.100</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.xxx หรือ localhost"
                required
                className="w-full bg-[#0d1019] border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-3 text-sm text-white font-mono focus:outline-none transition shadow-inner"
              />
            </div>
            {/* IP Quick presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center mr-1">ตั้งค่าด่วน:</span>
              <button
                type="button"
                onClick={() => quickSetIp('192.168.1.43')}
                className="px-2 py-0.5 rounded-md bg-red-950/80 border border-red-500/60 hover:bg-red-900 text-[10px] font-mono text-red-200 font-bold"
              >
                192.168.1.43
              </button>
              <button
                type="button"
                onClick={() => quickSetIp('192.168.1.')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                192.168.1.
              </button>
              <button
                type="button"
                onClick={() => quickSetIp('192.168.0.')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                192.168.0.
              </button>
              <button
                type="button"
                onClick={() => quickSetIp('localhost')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                localhost
              </button>
            </div>
          </div>

          {/* Port */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-red-400" />
                <span>WebSocket Port</span>
              </label>
              <span className="text-[10px] text-slate-400">ค่าเริ่มต้น 4455</span>
            </div>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value, 10) || 4455)}
              placeholder="4455"
              required
              className="w-full bg-[#0d1019] border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-3 text-sm text-white font-mono focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>รหัสผ่าน OBS WebSocket (ถ้ามี)</span>
              </label>
              <span className="text-[10px] text-slate-400">ว่างไว้หากไม่ได้ตั้ง</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านจาก OBS Studio"
                className="w-full bg-[#0d1019] border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-3 pr-10 text-sm text-white font-mono focus:outline-none transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember IP & Port (Security rule: never auto-save password) */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500"
              />
              <span>บันทึก IP และ Port ไว้ใช้งานครั้งต่อไป</span>
            </label>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>รหัสผ่านจะไม่ถูกบันทึกลง LocalStorage โดยอัตโนมัติ เพื่อความปลอดภัยสูงสุด</span>
          </div>

          {/* Error Message */}
          {(errorMessage || status === 'error') && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">การเชื่อมต่อล้มเหลว</p>
                <p className="mt-0.5 text-red-300/90">{errorMessage || statusMessage}</p>
              </div>
            </div>
          )}

          {/* Test Result Box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex gap-2.5 text-xs ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-white">
                  {testResult.success ? 'ทดสอบการเชื่อมต่อสำเร็จ' : 'ผลการทดสอบล้มเหลว'}
                </p>
                <p className="mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || isConnectingLocal}
              className="py-3 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm active:scale-95 transition disabled:opacity-50"
            >
              {isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
            </button>
            <button
              type="submit"
              disabled={isConnectingLocal || isTesting}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-sm shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isConnectingLocal ? (
                <span>กำลังเชื่อมต่อ...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>เชื่อมต่อ OBS Studio</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Safari Notice */}
      <div className="bg-[#121622] rounded-2xl border border-slate-800/80 p-4 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>เคล็ดลับการใช้งานสำหรับ iPhone Safari:</span>
        </h4>
        <p className="leading-relaxed">
          หากเปิดเว็บไซต์ผ่าน <code className="bg-black/50 px-1 py-0.5 rounded text-slate-200 font-mono">http://&lt;IP-คอมพิวเตอร์&gt;:3000</code> บน Safari การส่งข้อมูลผ่าน WebSocket ในวง LAN จะทำงานได้รวดเร็วทันที ปราศจากปัญหาความปลอดภัย Mixed Content
        </p>
      </div>
    </div>
  );
};
