/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in OBS PRO REMOTE:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0d13] text-slate-100 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#141824] border border-red-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-mono">OBS PRO REMOTE</h1>
              <p className="text-xs text-red-400 mt-1 font-mono">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</p>
              <p className="text-[11px] text-slate-400 mt-2 bg-black/40 p-2.5 rounded-lg font-mono text-left break-all">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีโหลดหน้าเว็บใหม่</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
