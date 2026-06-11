// src/components/screens/RoundResultScreen.jsx
import { ROUNDS_TO_WIN } from '../../constants/game';
import { RoundIndicator } from '../RoundIndicator';

export function RoundResultScreen({
  roundResult,
  roundNumber,
  playerRoundWins,
  opponentRoundWins,
  playerHealth,
  opponentHealth,
  playerClicks,
  opponentClicks,
  resultCooldown,
  onNextRound,
}) {
  let subtitle;
  if (playerRoundWins === opponentRoundWins) {
    subtitle = 'All square — the next round decides it!';
  } else if (playerRoundWins === ROUNDS_TO_WIN - 1 && playerRoundWins > opponentRoundWins) {
    subtitle = 'One more win takes the match!';
  } else if (opponentRoundWins === ROUNDS_TO_WIN - 1 && opponentRoundWins > playerRoundWins) {
    subtitle = 'On the ropes — win to stay alive!';
  } else {
    subtitle = 'Keep fighting!';
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
      <div className="text-7xl" style={{ fontSize: 'clamp(3.5rem, 18vw, 5rem)' }}>
        {roundResult === 'win' ? '✅' : roundResult === 'lose' ? '❌' : '➖'}
      </div>

      <div>
        <h2 className={`font-black text-3xl ${
          roundResult === 'win' ? 'text-green-400' :
          roundResult === 'lose' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {roundResult === 'win' ? 'ROUND WON!' : roundResult === 'lose' ? 'ROUND LOST' : 'ROUND DRAWN'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>

      <RoundIndicator
        roundNumber={roundNumber}
        playerRoundWins={playerRoundWins}
        opponentRoundWins={opponentRoundWins}
      />

      <div className="bg-gray-700/50 rounded-xl p-4 w-full text-sm space-y-1.5">
        <div className="flex justify-between"><span className="text-gray-400">Your HP</span><span className="font-mono text-white">{Math.ceil(playerHealth)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Their HP</span><span className="font-mono text-white">{Math.ceil(opponentHealth)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Your hits</span><span className="font-mono text-white">{playerClicks}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Their hits</span><span className="font-mono text-white">{opponentClicks}</span></div>
      </div>

      <button
        onClick={resultCooldown <= 0 ? onNextRound : undefined}
        disabled={resultCooldown > 0}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
          resultCooldown > 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95'
        }`}
      >
        {resultCooldown > 0
          ? <span className="flex items-center justify-center gap-2">
              <span className="text-gray-400">NEXT ROUND IN</span>
              <span className="text-white text-2xl font-black tabular-nums">{resultCooldown}</span>
            </span>
          : `⚔️ ROUND ${roundNumber + 1}`
        }
      </button>
    </div>
  );
}
