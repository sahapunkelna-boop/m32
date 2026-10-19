import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-mono select-none">
          <div className="max-w-md w-full bg-[#12151e] border-2 border-red-600/80 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="p-2.5 rounded-lg bg-red-950 text-red-400 border border-red-600/60">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-black text-red-300 tracking-wider">
                  M32 SYSTEM RECOVERY / ตรวจพบข้อผิดพลาด
                </h1>
                <p className="text-[10px] text-zinc-400">
                  Audio DSP &amp; Console Interface Self-Healing
                </p>
              </div>
            </div>

            <div className="bg-[#090b10] p-3 rounded-lg border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <p className="font-bold text-red-400">
                {this.state.error?.message || 'Unexpected application render issue'}
              </p>
              <p className="text-[10px] text-zinc-500">
                ระบบตรวจพบข้อมูลคอนโซลไม่สมบูรณ์ สามารถกดปุ่มรีเซ็ตเพื่อคืนค่าเริ่มต้นของมิกเซอร์ M32 ได้ทันที
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-black font-black text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตคืนค่า M32 (RESET &amp; RESTORE DEFAULT)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
