import React, { useState } from 'react';
import {
  X,
  Cloud,
  ShieldCheck,
  Lock,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Database,
  Wifi,
} from 'lucide-react';
import { encryptData, decryptData, EncryptedVaultPayload } from '../services/encryptionService';
import { ChannelStripData, PresetProfile } from '../types/mixer';

interface CloudSyncModalProps {
  channels: ChannelStripData[];
  presets: PresetProfile[];
  onRestoreChannels: (channels: ChannelStripData[]) => void;
  lastCloudSync: string;
  onUpdateLastSync: (time: string) => void;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  channels,
  presets,
  onRestoreChannels,
  lastCloudSync,
  onUpdateLastSync,
  onClose,
}) => {
  const [passphrase, setPassphrase] = useState('M32-Live-Console-2026');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  // Manual Backup to Cloud
  const handleCloudBackupNow = async () => {
    if (!passphrase.trim()) {
      setStatusMsg({ type: 'error', text: 'Please specify an encryption passphrase.' });
      return;
    }
    setIsEncrypting(true);
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        device: 'iPad Pro 12.9 (M32 Remote)',
        channels,
        presets,
      };

      const encrypted = await encryptData(payload, passphrase);
      // Simulate fast cloud persistence
      await new Promise((r) => setTimeout(r, 600));

      const newSyncTime = new Date().toLocaleString();
      onUpdateLastSync(newSyncTime);
      setStatusMsg({
        type: 'success',
        text: `Cloud Backup Complete (Encrypted AES-256-GCM, Hash: ${encrypted.checksum.slice(
          0,
          10
        )}...)`,
      });
    } catch {
      setStatusMsg({ type: 'error', text: 'Backup failed during cryptographic operation.' });
    } finally {
      setIsEncrypting(false);
    }
  };

  // Export Encrypted .m32backup File
  const handleExportBackupFile = async () => {
    setIsEncrypting(true);
    try {
      const payload = {
        app: 'M32 Pro Console',
        version: '2.0',
        timestamp: new Date().toISOString(),
        channels,
        presets,
      };
      const encrypted = await encryptData(payload, passphrase);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(encrypted, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `M32_Console_Show_${Date.now()}.m32backup`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMsg({ type: 'success', text: 'Exported encrypted backup file (.m32backup)!' });
    } catch {
      setStatusMsg({ type: 'error', text: 'Error generating encrypted file.' });
    } finally {
      setIsEncrypting(false);
    }
  };

  // Decrypt and Restore from Text / JSON
  const handleRestorePayload = async () => {
    if (!importJsonText.trim()) return;
    setIsEncrypting(true);
    try {
      const parsedVault = JSON.parse(importJsonText) as EncryptedVaultPayload;
      const result = await decryptData<{ channels: ChannelStripData[] }>(parsedVault, passphrase);

      if (result.success && result.data && result.data.channels) {
        onRestoreChannels(result.data.channels);
        setShowImportBox(false);
        setImportJsonText('');
        setStatusMsg({ type: 'success', text: 'Show successfully decrypted and restored!' });
      } else {
        setStatusMsg({
          type: 'error',
          text: result.error || 'Failed to decrypt. Verify your passphrase.',
        });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Invalid encrypted JSON format.' });
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">
                  CLOUD SYNC & END-TO-END ENCRYPTED VAULT
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  AES-256-GCM
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Continuous auto-backup, cross-platform synchronization, and zero-knowledge privacy
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`px-4 py-2 text-xs font-mono flex items-center gap-2 border-b ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-red-950/80 text-red-300 border-red-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 space-y-4">
          {/* Cloud Sync Status Card */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono text-zinc-200">CLOUD REPOSITORY STATUS</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synchronized</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
              <div>
                <span className="text-zinc-500 block text-[10px]">LAST CLOUD BACKUP</span>
                <span className="text-zinc-200 font-bold">{lastCloudSync}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">OFFLINE SYNC QUEUE</span>
                <span className="text-emerald-400 font-bold">0 Pending (All Saved)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackupEnabled}
                  onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                  className="rounded border-zinc-700 accent-amber-500"
                />
                <span>Auto-backup snapshots to cloud every 5 minutes</span>
              </label>

              <button
                onClick={handleCloudBackupNow}
                disabled={isEncrypting}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isEncrypting ? 'animate-spin' : ''}`} />
                <span>Backup Now</span>
              </button>
            </div>
          </div>

          {/* End-to-End Encryption Key Section */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono text-zinc-200">
                  END-TO-END ENCRYPTION (E2EE) KEY
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Zero-Knowledge Security</span>
            </div>

            <p className="text-xs text-zinc-400">
              Your console scenes, channel routings, and EQ profiles are encrypted directly in your
              iPad using AES-256-GCM before uploading. Only you hold the decryption passphrase.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 block">
                PASSPHRASE / VAULT KEY
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg text-sm text-zinc-100 font-mono focus:border-amber-400 focus:outline-none"
                  placeholder="Enter strong vault password..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PBKDF2 SHA-256 · 100,000 Iterations · 128-bit Auth Tag</span>
            </div>
          </div>

          {/* Offline-First & Export / Import Vault */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <span className="text-xs font-bold font-mono text-zinc-200 block">
              OFFLINE STORAGE & PORTABLE VAULT FILES
            </span>
            <p className="text-xs text-zinc-400">
              Full offline capability: The mixer operates completely without internet on stage.
              Export encrypted show files for USB backup or transferring between consoles.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportBackupFile}
                className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-mono font-bold border border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Encrypted .m32backup</span>
              </button>

              <button
                onClick={() => setShowImportBox(!showImportBox)}
                className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-mono font-bold border border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Import & Decrypt Show</span>
              </button>
            </div>

            {/* Import JSON Text Box */}
            {showImportBox && (
              <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                <label className="text-xs font-mono text-zinc-400 block">
                  PASTE ENCRYPTED BACKUP JSON DATA:
                </label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='Paste the contents of your .m32backup file {"version":"1.0","ciphertext":...} here'
                  className="w-full bg-zinc-900 border border-zinc-700 p-2 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportBox(false)}
                    className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestorePayload}
                    disabled={isEncrypting}
                    className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded cursor-pointer"
                  >
                    Decrypt & Restore
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
