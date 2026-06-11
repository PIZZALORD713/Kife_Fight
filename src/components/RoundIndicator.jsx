// src/components/RoundIndicator.jsx
import { MAX_ROUNDS } from '../constants/game';

export function RoundIndicator({ roundNumber, playerRoundWins, opponentRoundWins }) {
  return (
    <div className="flex items-center justify-center gap-3 mx-auto w-fit bg-gray-900/80 border border-gray-700 rounded-full px-4 py-1.5">
      <span className="font-mono font-black text-base tabular-nums leading-none">
        <span className="text-gray-500 mr-1.5 text-xs align-middle">YOU</span>
        <span className="text-green-400">{playerRoundWins}</span>
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
        Round {roundNumber}/{MAX_ROUNDS}
      </span>
      <span className="font-mono font-black text-base tabular-nums leading-none">
        <span className="text-red-400">{opponentRoundWins}</span>
        <span className="text-gray-500 ml-1.5 text-xs align-middle">THEM</span>
      </span>
    </div>
  );
}
