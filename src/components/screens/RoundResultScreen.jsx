// src/components/screens/RoundResultScreen.jsx
export function RoundResultScreen({ roundOutcome, roundNumber, playerRoundsWon, opponentRoundsWon, resultCooldown }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
      <div className="text-6xl" style={{ fontSize: 'clamp(3rem, 16vw, 4.5rem)' }}>
        {roundOutcome === 'win' ? '🥊' : roundOutcome === 'lose' ? '😵' : '🤝'}
      </div>

      <div>
        <h2 className={`font-black text-2xl ${
          roundOutcome === 'win' ? 'text-green-400' :
          roundOutcome === 'lose' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          ROUND {roundNumber} {roundOutcome === 'win' ? 'WON' : roundOutcome === 'lose' ? 'LOST' : 'DRAW'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Match score: {playerRoundsWon} - {opponentRoundsWon}
        </p>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span>Next round in</span>
        <span className="text-white text-2xl font-black tabular-nums">{resultCooldown}</span>
      </div>
    </div>
  );
}
