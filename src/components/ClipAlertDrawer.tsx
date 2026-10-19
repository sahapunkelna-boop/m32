import React from 'react';
import {
  X,
  AlertTriangle,
  Radio,
  CheckCheck,
  Activity,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  VolumeX,
  Zap,
} from 'lucide-react';
import { ClipAlertEvent } from '../types/mixer';
import { audioEngine } from '../services/audioEngine';

interface ClipAlertDrawerProps {
  alerts: ClipAlertEvent[];
  onClose: () => void;
  onClearAlerts: () => void;
  onSelectChannel: (channelId: number) => void;
  onOpenFxRack?: () => void;
}

export const ClipAlertDrawer: React.FC<ClipAlertDrawerProps> = ({
  alerts,
  onClose,
  onClearAlerts,
  onSelectChannel,
  onOpenFxRack,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end select-none">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <div className="font-bold text-sm text-zinc-100">CLIP & ABNORMALITY ALERTS</div>
              <div className="text-[10px] text-zinc-400 font-mono">
                {alerts.length} logged event{alerts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <button
                onClick={onClearAlerts}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* FBQ2496 Anti-Feedback Master Toolbar */}
          <div className="bg-[#0b0e14] p-3 rounded-xl border border-cyan-900/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FBQ2496 ANTI-FEEDBACK DSP</span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700">
                ACTIVE
              </span>
            </div>

            <div className="text-[10px] text-zinc-400 font-mono">
              24-Notch surgical suppressor actively protecting vocal and monitor mics from feedback howling.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  audioEngine.panicKillFeedback();
                }}
                className="py-1.5 px-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded font-mono text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow active:scale-95"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>KILL HOWL NOW</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.triggerSimulatedFeedback();
                }}
                className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded font-mono text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-zinc-700 active:scale-95"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>TEST FEEDBACK</span>
              </button>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <ShieldAlert className="w-12 h-12 text-zinc-700 mx-auto" />
              <div className="text-zinc-400 font-bold text-sm">All Audio Signals Healthy</div>
              <div className="text-zinc-600 text-xs font-mono max-w-xs mx-auto">
                No digital clipping (&gt;0 dBFS) or runaway acoustic feedback loops detected.
              </div>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  alert.type === 'clip'
                    ? 'bg-rose-950/40 border-rose-800/80'
                    : 'bg-amber-950/40 border-amber-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          alert.type === 'clip'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-black'
                        }`}
                      >
                        {alert.type === 'clip' ? 'CLIP WARNING' : 'FEEDBACK RISK'}
                      </span>
                      <span className="text-xs font-bold text-zinc-200">{alert.channelName}</span>
                    </div>

                    <div className="text-xs font-mono text-rose-300 font-bold mt-1">
                      Peak Level: {alert.peakDb > 0 ? `+${alert.peakDb.toFixed(1)}` : alert.peakDb.toFixed(1)} dBFS
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500">{alert.timestamp}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/80">
                  {alert.type === 'feedback_warning' && onOpenFxRack && (
                    <button
                      onClick={() => {
                        onOpenFxRack();
                        onClose();
                      }}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Open FBQ2496 Rack</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectChannel(alert.channelId);
                      onClose();
                    }}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <span>Inspect Ch {alert.channelId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
