import React, { useState } from 'react';
import { PlayerStats, SnakeSkinId, FoodSkinId } from '../types/game';
import { SNAKE_SKINS, FOOD_SKINS } from '../types/skins';

interface SettingsModalProps {
  stats: PlayerStats;
  onUpdateStats: (updated: Partial<PlayerStats>) => void;
  onResetStats: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  stats,
  onUpdateStats,
  onResetStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'mechanics' | 'controls'>('palette');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const isLight = stats.theme === 'light';

  const handleReset = () => {
    onResetStats();
    setShowConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-100 font-mono text-xs">
      <div
        className={`relative w-full max-w-xl max-h-[88vh] rounded-lg border flex flex-col shadow-sm overflow-hidden ${
          isLight
            ? 'bg-[#faf8f5] border-[#dcd8cd] text-[#1c1f24]'
            : 'bg-[#181a1d] border-[#2c3038] text-[#eae8e3]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'border-[#e4e1d7]' : 'border-[#282b33]'
          }`}
        >
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase">
              Configuration & Materials
            </h2>
            <div className={`text-[11px] ${isLight ? 'text-[#7d7a70]' : 'text-[#878a94]'}`}>
              Pacing, visual materials, and tactile options
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-2 py-1 tracking-wider transition-colors cursor-pointer ${
              isLight ? 'hover:text-[#cf382b]' : 'hover:text-white'
            }`}
          >
            [CLOSE]
          </button>
        </div>

        {/* Quiet Navigation Tabs */}
        <div
          className={`px-5 border-b flex items-center gap-6 shrink-0 text-xs tracking-wider ${
            isLight ? 'border-[#e4e1d7] bg-[#f4f2ec]' : 'border-[#282b33] bg-[#141618]'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('palette')}
            className={`py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'palette'
                ? isLight
                  ? 'text-[#1c1f24] border-b-2 border-[#1c1f24]'
                  : 'text-white border-b-2 border-white'
                : isLight
                ? 'text-[#7d7a70] hover:text-[#1c1f24]'
                : 'text-[#878a94] hover:text-white'
            }`}
          >
            PALETTE & MATERIALS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'mechanics'
                ? isLight
                  ? 'text-[#1c1f24] border-b-2 border-[#1c1f24]'
                  : 'text-white border-b-2 border-white'
                : isLight
                ? 'text-[#7d7a70] hover:text-[#1c1f24]'
                : 'text-[#878a94] hover:text-white'
            }`}
          >
            PACING & BEHAVIOR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'controls'
                ? isLight
                  ? 'text-[#1c1f24] border-b-2 border-[#1c1f24]'
                  : 'text-white border-b-2 border-white'
                : isLight
                ? 'text-[#7d7a70] hover:text-[#1c1f24]'
                : 'text-[#878a94] hover:text-white'
            }`}
          >
            CONTROLS
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'palette' && (
            <div className="space-y-6">
              {/* Snake Materials */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className={`text-[11px] uppercase tracking-wider font-semibold ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                    Snake Pigment
                  </span>
                  <span className="text-[11px] text-[#cf382b]">
                    {SNAKE_SKINS[stats.snakeSkin]?.name}
                  </span>
                </div>
                <div className="space-y-2">
                  {(Object.keys(SNAKE_SKINS) as SnakeSkinId[]).map((id) => {
                    const skin = SNAKE_SKINS[id];
                    const isSelected = stats.snakeSkin === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onUpdateStats({ snakeSkin: id })}
                        className={`w-full p-2.5 rounded border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'border-[#1c1f24] bg-white ring-1 ring-[#1c1f24]'
                              : 'border-white bg-[#22252a] ring-1 ring-white'
                            : isLight
                            ? 'border-[#e4e1d7] hover:border-[#b8b4a7] bg-white/60'
                            : 'border-[#282b33] hover:border-[#424754] bg-[#1a1c20]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span
                              className="w-4 h-4 rounded-sm border"
                              style={{ backgroundColor: skin.headColor, borderColor: skin.borderColor }}
                            />
                            <span
                              className="w-4 h-4 rounded-sm border"
                              style={{ backgroundColor: skin.bodyColor, borderColor: skin.borderColor }}
                            />
                            <span
                              className="w-4 h-4 rounded-sm border"
                              style={{ backgroundColor: skin.tailColor, borderColor: skin.borderColor }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold">{skin.name}</div>
                            <div className={`text-[10px] ${isLight ? 'text-[#7d7a70]' : 'text-[#878a94]'}`}>
                              {skin.tagline}
                            </div>
                          </div>
                        </div>
                        {isSelected && <span className="text-[11px] font-bold">SELECTED</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Food Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className={`text-[11px] uppercase tracking-wider font-semibold ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                    Food Token Mark
                  </span>
                  <span className="text-[11px] text-[#cf382b]">
                    {FOOD_SKINS[stats.foodSkin]?.name}
                  </span>
                </div>
                <div className="space-y-2">
                  {(Object.keys(FOOD_SKINS) as FoodSkinId[]).map((id) => {
                    const skin = FOOD_SKINS[id];
                    const isSelected = stats.foodSkin === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onUpdateStats({ foodSkin: id })}
                        className={`w-full p-2.5 rounded border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'border-[#1c1f24] bg-white ring-1 ring-[#1c1f24]'
                              : 'border-white bg-[#22252a] ring-1 ring-white'
                            : isLight
                            ? 'border-[#e4e1d7] hover:border-[#b8b4a7] bg-white/60'
                            : 'border-[#282b33] hover:border-[#424754] bg-[#1a1c20]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-xs border flex items-center justify-center shrink-0"
                            style={{ backgroundColor: skin.fillColor, borderColor: skin.strokeColor }}
                          />
                          <div>
                            <div className="font-semibold">{skin.name}</div>
                            <div className={`text-[10px] ${isLight ? 'text-[#7d7a70]' : 'text-[#878a94]'}`}>
                              {skin.tagline}
                            </div>
                          </div>
                        </div>
                        {isSelected && <span className="text-[11px] font-bold">SELECTED</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mechanics' && (
            <div className="space-y-4">
              {/* Wall wrap mechanics note */}
              <div
                className={`p-3.5 rounded border ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                <div className="font-bold mb-1">
                  Edge Boundary Behavior
                </div>
                <div className={`text-[11px] leading-relaxed ${isLight ? 'text-[#625f56]' : 'text-[#9c9a93]'}`}>
                  Walls wrap around freely. The snake passes from one edge to the opposite edge without crashing. The only failure condition is crossing into your own growing body.
                </div>
              </div>

              {/* Progressive Difficulty Curve note */}
              <div
                className={`p-3.5 rounded border ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                <div className="font-bold mb-1 text-[#cf382b]">
                  Pace Acceleration Curve
                </div>
                <div className={`text-[11px] leading-relaxed ${isLight ? 'text-[#625f56]' : 'text-[#9c9a93]'}`}>
                  Every 5 pieces of food consumed, the snake's tick duration slightly decreases, steadily quickening movement to test your steering precision as your length increases.
                </div>
              </div>

              {/* Base Speed Slider */}
              <div
                className={`p-3.5 rounded border space-y-2 ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">Starting Base Pace</span>
                  <span className="font-bold">{stats.initialSpeed} ms</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="135"
                  step="5"
                  value={stats.initialSpeed}
                  onChange={(e) => onUpdateStats({ initialSpeed: Number(e.target.value) })}
                  className="w-full accent-[#cf382b] cursor-pointer"
                />
                <div className={`flex justify-between text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                  <span>Fast (55ms)</span>
                  <span>Standard (95ms)</span>
                  <span>Deliberate (135ms)</span>
                </div>
              </div>

              {/* Audio & Motion Toggles */}
              <div
                className={`p-3.5 rounded border space-y-3 ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Synthesized Audio</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      Mechanical clicks and bite chimes
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateStats({ soundEnabled: !stats.soundEnabled })}
                    className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer ${
                      stats.soundEnabled
                        ? 'bg-[#1c1f24] text-white border-[#1c1f24] dark:bg-white dark:text-black dark:border-white'
                        : isLight
                        ? 'bg-[#f4f2ec] border-[#d8d5ca] text-[#7d7a70]'
                        : 'bg-[#22252a] border-[#363a42] text-[#878a94]'
                    }`}
                  >
                    {stats.soundEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e4e1d7]/60 dark:border-[#282b33]/60">
                  <div>
                    <div className="font-semibold">Reduced Motion</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      Suppress ripple animations on bites
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateStats({ reducedMotion: !stats.reducedMotion })}
                    className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer ${
                      stats.reducedMotion
                        ? 'bg-[#1c1f24] text-white border-[#1c1f24] dark:bg-white dark:text-black dark:border-white'
                        : isLight
                        ? 'bg-[#f4f2ec] border-[#d8d5ca] text-[#7d7a70]'
                        : 'bg-[#22252a] border-[#363a42] text-[#878a94]'
                    }`}
                  >
                    {stats.reducedMotion ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Reset Records Confirmation */}
              <div
                className={`p-3.5 rounded border ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                {!showConfirmReset ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className={`text-xs tracking-wider transition-colors cursor-pointer ${
                      isLight ? 'text-[#cf382b] hover:underline' : 'text-[#e0584b] hover:underline'
                    }`}
                  >
                    CLEAR CAREER RECORD HISTORY
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-[#cf382b] font-bold">
                      Permanently wipe high scores and run logs?
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="py-1 px-3 bg-[#cf382b] text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        CONFIRM WIPE
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmReset(false)}
                        className={`py-1 px-3 rounded border text-xs cursor-pointer ${
                          isLight ? 'border-[#d8d5ca] text-[#5a574f]' : 'border-[#363a42] text-[#9c9a93]'
                        }`}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded border space-y-3 ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                <div className="font-semibold text-xs tracking-wider uppercase mb-2">
                  Keyboard Steering
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-bold">Arrows / WASD</span>
                    <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      Direct snake movement
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">Space / P</span>
                    <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      Toggle pause / resume
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">R</span>
                    <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      Restart current run
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">Escape</span>
                    <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      Close modals / pause
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded border space-y-4 ${
                  isLight ? 'bg-white border-[#e4e1d7]' : 'bg-[#141618] border-[#282b33]'
                }`}
              >
                <div className="font-semibold text-xs tracking-wider uppercase">
                  Mobile & Touch Steering
                </div>
                
                {/* Control Style Switcher */}
                <div className="space-y-2">
                  <div className={`text-[11px] ${isLight ? 'text-[#7d7a70]' : 'text-[#878a94]'}`}>
                    Navigation Layout
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateStats({ mobileControlStyle: 'invisible' })}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                        stats.mobileControlStyle === 'invisible'
                          ? isLight
                            ? 'border-[#1c1f24] bg-[#f4f2ec] ring-1 ring-[#1c1f24]'
                            : 'border-white bg-[#22252a] ring-1 ring-white'
                          : isLight
                          ? 'border-[#e4e1d7] hover:border-[#b8b4a7]'
                          : 'border-[#282b33] hover:border-[#424754]'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Invisible Tap Zones</span>
                        {stats.mobileControlStyle === 'invisible' && <span className="text-[10px] text-[#cf382b]">ACTIVE</span>}
                      </div>
                      <div className={`text-[10px] mt-1 ${isLight ? 'text-[#625f56]' : 'text-[#9c9a93]'}`}>
                        Full vertical board with 4-way screen tap quadrants & swiping
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateStats({ mobileControlStyle: 'dpad' })}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                        stats.mobileControlStyle === 'dpad'
                          ? isLight
                            ? 'border-[#1c1f24] bg-[#f4f2ec] ring-1 ring-[#1c1f24]'
                            : 'border-white bg-[#22252a] ring-1 ring-white'
                          : isLight
                          ? 'border-[#e4e1d7] hover:border-[#b8b4a7]'
                          : 'border-[#282b33] hover:border-[#424754]'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Tactile D-Pad</span>
                        {stats.mobileControlStyle === 'dpad' && <span className="text-[10px] text-[#cf382b]">ACTIVE</span>}
                      </div>
                      <div className={`text-[10px] mt-1 ${isLight ? 'text-[#625f56]' : 'text-[#9c9a93]'}`}>
                        Dedicated physical cross pad stationed at the bottom bar
                      </div>
                    </button>
                  </div>
                </div>

                {/* Guide Lines Toggle (when in invisible mode) */}
                {stats.mobileControlStyle === 'invisible' && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#e4e1d7]/60 dark:border-[#282b33]/60">
                    <div>
                      <div className="font-semibold">Tap Quadrant Guides</div>
                      <div className={`text-[10px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                        Display subtle architectural lines showing Up/Down/Left/Right zones
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateStats({ showTapGuides: !stats.showTapGuides })}
                      className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer ${
                        stats.showTapGuides
                          ? 'bg-[#1c1f24] text-white border-[#1c1f24] dark:bg-white dark:text-black dark:border-white'
                          : isLight
                          ? 'bg-[#f4f2ec] border-[#d8d5ca] text-[#7d7a70]'
                          : 'bg-[#22252a] border-[#363a42] text-[#878a94]'
                      }`}
                    >
                      {stats.showTapGuides ? 'SHOWN' : 'HIDDEN'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end shrink-0 ${
            isLight ? 'border-[#e4e1d7] bg-[#f4f2ec]' : 'border-[#282b33] bg-[#141618]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`font-semibold tracking-wider cursor-pointer ${
              isLight ? 'hover:text-[#cf382b]' : 'hover:text-white'
            }`}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
