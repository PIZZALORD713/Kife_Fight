// src/components/screens/ResultScreen.jsx
export function ResultScreen({ matchResult, stakeAmount, playerHealth, opponentHealth, playerClicks, opponentClicks, resultCooldown, onRematch }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
      <div
        className={`text-7xl ${matchResult === 'win' ? 'animate-bounce' : ''}`}
        style={{ fontSize: 'clamp(3.5rem, 18vw, 5rem)' }}
      >
        {matchResult === 'win' ? '🏆' : matchResult === 'lose' ? '💀' : '🤝'}
      </div>

      <div>
        <h2 className={`font-black text-3xl ${
          matchResult === 'win' ? 'text-green-400' :
          matchResult === 'lose' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {matchResult === 'win' ? 'VICTORY!' : matchResult === 'lose' ? 'DEFEATED' : 'DRAW'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {matchResult === 'win'  && `You won ${(parseFloat(stakeAmount) * 1.9).toFixed(3)} ETH`}
          {matchResult === 'lose' && `You lost ${stakeAmount} ETH`}
          {matchResult === 'draw' && 'Stakes returned'}
        </p>
      </div>

      <div className="bg-gray-700/50 rounded-xl p-4 w-full text-sm space-y-1.5">
        <div className="flex justify-between"><span className="text-gray-400">Your HP</span><span className="font-mono text-white">{Math.ceil(playerHealth)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Their HP</span><span className="font-mono text-white">{Math.ceil(opponentHealth)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Your hits</span><span className="font-mono text-white">{playerClicks}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Their hits</span><span className="font-mono text-white">{opponentClicks}</span></div>
      </div>

      <button
        onClick={resultCooldown <= 0 ? onRematch : undefined}
        disabled={resultCooldown > 0}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
          resultCooldown > 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95'
        }`}
      >
        {resultCooldown > 0
          ? <span className="flex items-center justify-center gap-2">
              <span className="text-gray-400">REMATCH IN</span>
              <span className="text-white text-2xl font-black tabular-nums">{resultCooldown}</span>
            </span>
          : '⚔️ REMATCH'
        }
      </button>
    </div>
  );
}
