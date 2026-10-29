/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Radio,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'obs' | 'iphone' | 'troubleshoot'>('quick');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#121622] border border-slate-700/80 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#161b2a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                คู่มือการเชื่อมต่อ OBS PRO REMOTE
              </h2>
              <p className="text-xs text-slate-400">ควบคุม OBS Studio บน Windows ผ่าน iPhone Safari ใน LAN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-[#0e121d] px-4 overflow-x-auto no-scrollbar gap-1 pt-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'quick'
                ? 'bg-[#161b2a] text-red-400 border-t-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            สรุป 3 ขั้นตอน
          </button>
          <button
            onClick={() => setActiveTab('obs')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'obs'
                ? 'bg-[#161b2a] text-red-400 border-t-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. ตั้งค่าใน OBS Studio
          </button>
          <button
            onClick={() => setActiveTab('iphone')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'iphone'
                ? 'bg-[#161b2a] text-red-400 border-t-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. เชื่อมต่อจาก iPhone Safari
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'troubleshoot'
                ? 'bg-[#161b2a] text-red-400 border-t-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. แก้ปัญหาการเชื่อมต่อ
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm leading-relaxed text-slate-300">
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <Laptop className="w-5 h-5" />
                    <span>ขั้นที่ 1: OBS Studio</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    เปิด OBS บนคอมพิวเตอร์ ไปที่ <strong className="text-white">Tools &gt; WebSocket Server Settings</strong> ติ๊ก <span className="text-emerald-400">Enable WebSocket server</span> (พอร์ต 4455)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Wifi className="w-5 h-5" />
                    <span>ขั้นที่ 2: เช็ค IP คอม</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    เปิด Command Prompt (cmd) พิมพ์ <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">ipconfig</code> แล้วจด IPv4 Address เช่น <span className="text-white font-mono">192.168.1.105</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Smartphone className="w-5 h-5" />
                    <span>ขั้นที่ 3: เปิดบน iPhone</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    ต่อ Wi-Fi เดียวกัน เปิด Safari เข้าเว็บนี้ กรอก IP คอมและพอร์ต 4455 แล้วกด <span className="text-emerald-400 font-bold">Connect</span>
                  </p>
                </div>
              </div>

              {/* iPhone Safari Tip */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 flex gap-3 text-xs text-blue-200">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-1">เทคนิคใช้งานบน iPhone ให้เต็มจอแบบแอปมือถือ:</strong>
                  เมื่อเปิดหน้าเว็บใน Safari ให้กดปุ่ม <strong>แชร์ (Share)</strong> ด้านล่าง แล้วเลือก <strong>&quot;เพิ่มไปยังหน้าจอโฮม&quot; (Add to Home Screen)</strong> จะได้ไอคอนแอปที่เปิดเต็มหน้าจอ ไม่มีแถบ URL รบกวน
                </div>
              </div>

              {/* Mixed content note */}
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-1">หมายเหตุสำคัญเรื่อง Mixed Content ใน Safari:</strong>
                  เมื่อเปิดเว็บผ่าน <code className="bg-black/30 px-1 py-0.5 rounded text-white font-mono">http://&lt;IP-คอม&gt;:3000</code> ภายใน Wi-Fi วงเดียวกัน Safari จะยอมรับ WebSocket <code className="bg-black/30 px-1 py-0.5 rounded text-white font-mono">ws://</code> ได้อย่างราบรื่น 100%!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'obs' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base">วิธีเปิดใช้งาน OBS WebSocket 5.x บน Windows:</h3>
              <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm pl-1">
                <li>เปิดโปรแกรม <strong>OBS Studio</strong> (เวอร์ชัน 28.0 ขึ้นไป มี WebSocket ในตัว)</li>
                <li>ไปที่แถบเมนูด้านบน คลิก <strong>Tools (เครื่องมือ)</strong> &gt; <strong>WebSocket Server Settings (การตั้งค่าเซิร์ฟเวอร์ WebSocket)</strong></li>
                <li>ติ๊กถูกที่ช่อง <strong className="text-emerald-400">&quot;Enable WebSocket server&quot;</strong></li>
                <li>ตรวจสอบหมายเลขพอร์ต: ค่าเริ่มต้นคือ <code className="bg-black/40 text-red-400 font-mono px-1 py-0.5 rounded">4455</code></li>
                <li>
                  <strong>รหัสผ่าน (Authentication):</strong>
                  <ul className="list-disc list-inside mt-1 ml-4 text-slate-400 space-y-1">
                    <li>สามารถกด <em>Generate Password</em> เพื่อตั้งรหัสผ่าน หรือ</li>
                    <li>หากใช้งานในบ้าน/LAN ส่วนตัว สามารถเอาติ๊กถูกที่ <em>Enable Authentication</em> ออกชั่วคราวเพื่อความสะดวกได้</li>
                  </ul>
                </li>
                <li>กด <strong>Apply (นำไปใช้)</strong> และ <strong>OK</strong></li>
              </ol>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>คำสั่งตรวจสอบ IP เครื่องคอมพิวเตอร์ใน Windows (CMD):</span>
                  <button
                    onClick={() => copyToClipboard('ipconfig', 'cmd')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'cmd' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
                <div className="bg-black/70 p-2.5 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 flex justify-between items-center">
                  <code>ipconfig</code>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  มองหาบรรทัด <span className="text-white font-mono">IPv4 Address</span> เช่น <span className="text-amber-300 font-mono">192.168.1.100</span> หรือ <span className="text-amber-300 font-mono">10.0.0.5</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'iphone' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base">วิธีเชื่อมต่อผ่าน iPhone Safari:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">เชื่อมต่อ Wi-Fi เดียวกัน</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ตรวจสอบให้แน่ใจว่าทั้ง iPhone และคอมพิวเตอร์ Windows เชื่อมต่อกับเราเตอร์ Wi-Fi ตัวเดียวกัน
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">เปิด Safari แล้วเข้าใช้งานเว็บ</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      พิมพ์ที่อยู่ URL บน Safari เช่น <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">http://192.168.1.105:3000</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">กรอก IP Address และ Port</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ในหน้า Connection ใส่ IP ของคอมพิวเตอร์ (เช่น 192.168.1.105) และ Port 4455 แล้วกด <strong>Connect</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-3.5">
              <h3 className="font-bold text-white text-base">วิธีแก้ไขเมื่อเชื่อมต่อไม่สำเร็จ:</h3>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                <span className="font-semibold text-red-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 1. Windows Defender Firewall บล็อกพอร์ต 4455
                </span>
                <p className="text-xs text-slate-300">
                  เมื่อเปิด OBS ครั้งแรก Windows อาจถามสิทธิ์ ให้เลือก Allow สำหรับ Private Networks หรือเพิ่มกฎเปิดพอร์ต 4455 (TCP) ใน Windows Firewall
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                <span className="font-semibold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <Wifi className="w-4 h-4" /> 2. การแยกเครือข่าย Wi-Fi (AP Isolation / Guest Mode)
                </span>
                <p className="text-xs text-slate-300">
                  เราเตอร์บางตัวเปิด &quot;AP Isolation&quot; หรือต่ออยู่บนสัญญาณ Guest Wi-Fi ทำให้โทรศัพท์มองไม่เห็นคอมพิวเตอร์ ให้เชื่อมต่อ Wi-Fi หลักที่ไม่มีระบบแยก Client
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                <span className="font-semibold text-blue-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> 3. Mixed Content Warning บน Safari
                </span>
                <p className="text-xs text-slate-300">
                  หากเปิดหน้าเว็บผ่าน HTTPS แต่พยายามเชื่อมต่อไปยัง <code className="bg-black/40 text-white font-mono px-1">ws://192.168.x.x</code> ทาง Safari จะบล็อกเพื่อความปลอดภัย การแก้ปัญหาที่แนะนำคือเปิดหน้าเว็บผ่าน HTTP เช่น <code className="bg-black/40 text-emerald-300 font-mono px-1">http://&lt;IP-คอม&gt;:3000</code> หรือเปิดใช้ SSL บน OBS WebSocket
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#161b2a] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-xs sm:text-sm active:scale-95 transition"
          >
            เข้าใจแล้ว เริ่มใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};
