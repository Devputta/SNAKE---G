import React from 'react';
import { PlayerStats } from '../types/game';

interface RecordsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({ stats, onClose }) => {
  const isLight = stats.theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-100 font-mono">
      <div
        className={`relative w-full max-w-lg max-h-[85vh] rounded-lg border flex flex-col shadow-sm overflow-hidden text-xs ${
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
              Career Ledger
            </h2>
            <div className={`text-[11px] ${isLight ? 'text-[#7d7a70]' : 'text-[#878a94]'}`}>
              Verified run history and metrics
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-2 py-1 text-xs tracking-wider transition-colors cursor-pointer ${
              isLight ? 'hover:text-[#cf382b]' : 'hover:text-white'
            }`}
          >
            [CLOSE]
          </button>
        </div>

        {/* Minimal High-Water Metrics Row */}
        <div
          className={`grid grid-cols-3 border-b py-3 px-5 text-center shrink-0 tabular-nums ${
            isLight ? 'border-[#e4e1d7] bg-[#f4f2ec]' : 'border-[#282b33] bg-[#141618]'
          }`}
        >
          <div>
            <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Best Score
            </div>
            <div className={`text-base font-bold mt-0.5 ${isLight ? 'text-[#cf382b]' : '#e0584b'}`}>
              {stats.highScore.toString().padStart(6, '0')}
            </div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Max Length
            </div>
            <div className="text-base font-bold mt-0.5">
              {stats.longestSnake}
            </div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Total Bites
            </div>
            <div className="text-base font-bold mt-0.5">
              {stats.totalFoodEaten}
            </div>
          </div>
        </div>

        {/* Table of Past Runs */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className={`text-[11px] uppercase tracking-wider mb-2 font-semibold ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
            Recorded Runs ({stats.recentGames.length})
          </div>

          {stats.recentGames.length === 0 ? (
            <div className={`py-12 text-center text-xs ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              No completed runs recorded yet. Start playing to build your ledger.
            </div>
          ) : (
            <table className="w-full text-left tabular-nums border-collapse">
              <thead>
                <tr className={`border-b text-[10px] uppercase tracking-wider ${isLight ? 'border-[#e4e1d7] text-[#8c897f]' : 'border-[#282b33] text-[#70757d]'}`}>
                  <th className="py-1.5 font-normal">Score</th>
                  <th className="py-1.5 font-normal">Length</th>
                  <th className="py-1.5 font-normal">Time</th>
                  <th className="py-1.5 font-normal text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e1d7]/40 dark:divide-[#282b33]/40">
                {stats.recentGames.map((game, idx) => (
                  <tr key={game.id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-2 font-semibold">
                      {game.score.toString().padStart(6, '0')}
                    </td>
                    <td className="py-2">
                      {game.length}
                    </td>
                    <td className="py-2">
                      {game.survivalTime.toFixed(1)}s
                    </td>
                    <td className={`py-2 text-right text-[11px] ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                      {game.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-between items-center text-[11px] shrink-0 ${
            isLight ? 'border-[#e4e1d7] bg-[#f4f2ec] text-[#7d7a70]' : 'border-[#282b33] bg-[#141618] text-[#878a94]'
          }`}
        >
          <span>Runs Logged: {stats.gamesPlayed}</span>
          <button
            type="button"
            onClick={onClose}
            className={`tracking-wider font-semibold cursor-pointer ${
              isLight ? 'hover:text-[#cf382b]' : 'hover:text-white'
            }`}
          >
            RETURN TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
