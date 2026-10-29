/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Box,
  Volume2,
  Camera,
  Film,
  Radio,
  Settings,
  Circle,
} from 'lucide-react';
import { useOBS } from '../context/OBSContext';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { streamStatus, recordStatus, triggerHaptic } = useOBS();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scenes', label: 'Scenes', icon: Layers },
    { id: 'sources', label: 'Sources', icon: Box },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'cameras', label: 'Cameras', icon: Camera },
    { id: 'media', label: 'Media', icon: Film },
    {
      id: 'live',
      label: 'Live / Rec',
      icon: Radio,
      badge: streamStatus.active || recordStatus.active,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f18]/95 backdrop-blur-lg border-t border-slate-800/80 pb-[calc(0.35rem+var(--sab))] pt-1.5 px-2">
      <div className="max-w-4xl mx-auto flex items-center justify-around overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onTabChange(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-xl transition duration-150 active:scale-90 min-w-[54px] sm:min-w-[64px] ${
                isActive
                  ? 'text-red-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110 text-red-500' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-[#0c0f18] animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-mono tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
