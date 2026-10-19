import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  Save,
  Trash2,
  Check,
  Cloud,
  User,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PresetProfile, UserEngineerProfile } from '../types/mixer';

interface PresetManagerModalProps {
  presets: PresetProfile[];
  onLoadPreset: (preset: PresetProfile) => void;
  onSaveNewScene: (sceneName: string) => void;
  onDeletePreset: (id: string) => void;
  profiles: UserEngineerProfile[];
  activeProfile: UserEngineerProfile;
  onSelectProfile: (profile: UserEngineerProfile) => void;
  onClose: () => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  presets,
  onLoadPreset,
  onSaveNewScene,
  onDeletePreset,
  profiles,
  activeProfile,
  onSelectProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'scenes' | 'profiles'>('presets');
  const [sceneNameInput, setSceneNameInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const categories = ['All', 'Vocal', 'Drums', 'Bass', 'Guitar', 'Keys', 'Master', 'Full Scene'];

  const filteredPresets = presets.filter((p) => {
    if (activeTab === 'scenes') return p.category === 'Full Scene';
    if (selectedCategory === 'All') return p.category !== 'Full Scene';
    return p.category === selectedCategory;
  });

  const handleRecall = (preset: PresetProfile) => {
    onLoadPreset(preset);
    setFeedbackMsg(`Recalled "${preset.name}" successfully!`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleSaveScene = () => {
    if (sceneNameInput.trim()) {
      onSaveNewScene(sceneNameInput.trim());
      setSceneNameInput('');
      setFeedbackMsg(`Saved new scene successfully!`);
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-sm text-zinc-100">PRESETS, SCENES & PROFILES</div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Instant recall & cloud synchronized sound library
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

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-700 px-4 py-1.5 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'presets'
                ? 'border-amber-400 text-amber-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            CHANNEL PRESETS
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'scenes'
                ? 'border-amber-400 text-amber-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            FULL SHOW SCENES
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-amber-400 text-amber-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ENGINEER PROFILES
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 space-y-4">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories
                  .filter((c) => c !== 'Full Scene')
                  .map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded text-xs font-mono cursor-pointer border ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-black font-bold border-amber-300'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>

              {/* Presets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {preset.category}
                        </span>
                        {preset.isCloudSynced && (
                          <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                            <Cloud className="w-3 h-3" />
                            <span>Cloud Synced</span>
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-sm text-zinc-100 mt-2">{preset.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Author: {preset.author} · {new Date(preset.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-zinc-850">
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 cursor-pointer"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRecall(preset)}
                        className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs cursor-pointer shadow-sm"
                      >
                        RECALL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scenes' && (
            <div className="space-y-4">
              {/* Save Scene Box */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Scene Name (e.g. Festival Headliner Stage 1)..."
                  value={sceneNameInput}
                  onChange={(e) => setSceneNameInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleSaveScene}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs rounded cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Snapshot Scene</span>
                </button>
              </div>

              {/* Scenes List */}
              <div className="space-y-2">
                {[
                  {
                    id: 'scn-1',
                    name: '01: Sunday Morning Worship Live',
                    desc: 'Full acoustic band + 4 vocalists + IEM mixes 1-6',
                    time: 'Updated 2026-10-05',
                  },
                  {
                    id: 'scn-2',
                    name: '02: Rock Festival Mainstage',
                    desc: 'High gain drums, dual guitar stacks, sidefill monitors',
                    time: 'Updated 2026-10-02',
                  },
                  {
                    id: 'scn-3',
                    name: '03: Corporate Keynote & Panel',
                    desc: '8 wireless lavaliers with Dugan automix routing + broadcast feed',
                    time: 'Updated 2026-09-28',
                  },
                ].map((scn) => (
                  <div
                    key={scn.id}
                    className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-zinc-100">{scn.name}</div>
                      <div className="text-xs text-zinc-400">{scn.desc}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{scn.time}</div>
                    </div>

                    <button
                      onClick={() => {
                        setFeedbackMsg(`Scene loaded: ${scn.name}`);
                        setTimeout(() => setFeedbackMsg(null), 2500);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded cursor-pointer"
                    >
                      LOAD SCENE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 font-mono pb-2 border-b border-zinc-800">
                Switch user permissions (Head FOH Engineer vs Musician IEM Personal Mix Lockout):
              </div>

              <div className="space-y-2.5">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfile.id;
                  return (
                    <div
                      key={prof.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-zinc-950 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-zinc-100">{prof.name}</div>
                          <div className="text-xs text-amber-400/90 font-mono">{prof.role}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            Preamp Access: {prof.canModifyPreamp ? 'Full' : 'Locked'} · Routing:{' '}
                            {prof.canModifyRouting ? 'Full' : 'Locked'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectProfile(prof)}
                        className={`px-3 py-1.5 rounded font-mono font-bold text-xs cursor-pointer border ${
                          isActive
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'SWITCH'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
