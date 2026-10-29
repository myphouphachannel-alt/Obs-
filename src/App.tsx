/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OBSProvider, useOBS } from './context/OBSContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ScenesView } from './components/ScenesView';
import { SourcesView } from './components/SourcesView';
import { AudioView } from './components/AudioView';
import { CameraPadsView } from './components/CameraPadsView';
import { MediaView } from './components/MediaView';
import { LiveView } from './components/LiveView';
import { SettingsView } from './components/SettingsView';
import { ConnectionView } from './components/ConnectionView';
import { SetupGuideModal } from './components/SetupGuideModal';
import { AlertCircle, RefreshCw, X, WifiOff } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { status, statusMessage, serverIp, serverPort, connect, triggerHaptic } = useOBS();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  const handleQuickReconnect = async () => {
    if (!serverIp) {
      setIsConnectionModalOpen(true);
      return;
    }
    triggerHaptic('medium');
    setIsReconnecting(true);
    try {
      await connect(serverIp, serverPort);
    } catch {
      // Handled by context
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Broadcast Bar */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenConnection={() => setIsConnectionModalOpen(true)}
      />

      {/* Disconnection Warning Banner when not connected & on a control tab */}
      {status !== 'connected' && (
        <div className="bg-amber-950/60 border-b border-amber-500/40 px-3 sm:px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              {status === 'connecting'
                ? 'กำลังเชื่อมต่อกับ OBS Studio...'
                : status === 'error'
                ? `เชื่อมต่อไม่สำเร็จ: ${statusMessage}`
                : 'ยังไม่ได้เชื่อมต่อกับ OBS Studio บนคอมพิวเตอร์'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {serverIp && status !== 'connecting' && (
              <button
                onClick={handleQuickReconnect}
                disabled={isReconnecting}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 active:scale-95 transition"
              >
                <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
                <span>ต่อใหม่</span>
              </button>
            )}
            <button
              onClick={() => setIsConnectionModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] active:scale-95 transition"
            >
              ตั้งค่า IP
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-24 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'scenes' && <ScenesView />}
        {activeTab === 'sources' && <SourcesView />}
        {activeTab === 'audio' && <AudioView />}
        {activeTab === 'cameras' && <CameraPadsView />}
        {activeTab === 'media' && <MediaView />}
        {activeTab === 'live' && <LiveView />}
        {activeTab === 'settings' && (
          <SettingsView
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenConnection={() => setIsConnectionModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Thumb Navigation Bar */}
      <BottomNav currentTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Connection Modal */}
      {isConnectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl my-auto">
            <button
              onClick={() => setIsConnectionModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
            <ConnectionView
              onOpenGuide={() => {
                setIsConnectionModalOpen(false);
                setIsGuideOpen(true);
              }}
              onSuccess={() => setIsConnectionModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      <SetupGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <OBSProvider>
      <MainLayout />
    </OBSProvider>
  );
}
