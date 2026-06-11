// src/components/RoundIndicator.jsx
import { MAX_ROUNDS, ROUNDS_TO_WIN } from '../constants/game';

function Pips({ wins, align }) {
  return (
    <div className={`flex gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      {Array.from({ length: ROUNDS_TO_WIN }, (_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${i < wins ? 'bg-red-500' : 'bg-gray-600'}`}
        />
      ))}
    </div>
  );
}

export function RoundIndicator({ roundNumber, playerRoundWins, opponentRoundWins }) {
  return (
    <div className="flex items-center justify-center gap-3 shrink-0">
      <Pips wins={playerRoundWins} />
      <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
        Round {roundNumber}/{MAX_ROUNDS}
      </span>
      <Pips wins={opponentRoundWins} align="right" />
    </div>
  );
}
