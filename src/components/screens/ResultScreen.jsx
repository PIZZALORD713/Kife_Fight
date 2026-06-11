// src/components/screens/ResultScreen.jsx
const MATCH_THEME = {
  win:  { icon: '🏆', title: 'MATCH WON!',   color: 'text-green-400',  anim: 'animate-match-result', glow: 'bg-green-400/30',  bg: 'bg-green-500/5' },
  lose: { icon: '💀', title: 'MATCH LOST',   color: 'text-red-400',    anim: 'animate-match-lose',   glow: 'bg-red-500/25',    bg: 'bg-red-500/5' },
  draw: { icon: '🤝', title: 'MATCH DRAWN',  color: 'text-yellow-400', anim: 'animate-pop-in',       glow: 'bg-yellow-400/20', bg: '' },
};

export function ResultScreen({ matchResult, stakeAmount, playerHealth, opponentHealth, playerClicks, opponentClicks, playerRoundWins, opponentRoundWins, resultCooldown, onContinue }) {
  const theme = MATCH_THEME[matchResult] || MATCH_THEME.draw;

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 ${theme.bg}`}>
      <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
        <div className={`absolute inset-0 rounded-full blur-xl animate-glow-pulse ${theme.glow}`} />
        <div className="relative" style={{ fontSize: 'clamp(4rem, 22vw, 6rem)' }}>
          <span className={`inline-block ${theme.anim}`}>{theme.icon}</span>
        </div>
      </div>

      <div>
        <h2 className={`font-black text-4xl ${theme.color}`}>{theme.title}</h2>
        <p className="text-gray-300 text-sm mt-1 font-mono">
          Final score {playerRoundWins} - {opponentRoundWins}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {matchResult === 'win'  && `You won ${(parseFloat(stakeAmount) * 1.9).toFixed(3)} ETH`}
          {matchResult === 'lose' && `You lost ${stakeAmount} ETH`}
          {matchResult === 'draw' && 'Stakes returned'}
        </p>
      </div>

      <div className="bg-gray-700/50 rounded-xl p-4 w-full text-sm space-y-1.5">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center pb-0.5">Final round</div>
        <div className="flex justify-between"><span className="text-gray-400">Your HP</span><span className="font-mono text-white">{Math.ceil(playerHealth)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Their HP</span><span className="font-mono text-white">{Math.ceil(opponentHealth)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Your hits</span><span className="font-mono text-white">{playerClicks}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Their hits</span><span className="font-mono text-white">{opponentClicks}</span></div>
      </div>

      <button
        onClick={resultCooldown <= 0 ? onContinue : undefined}
        disabled={resultCooldown > 0}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
          resultCooldown > 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95'
        }`}
      >
        {resultCooldown > 0
          ? <span className="flex items-center justify-center gap-2">
              <span className="text-gray-400">CONTINUE IN</span>
              <span className="text-white text-2xl font-black tabular-nums">{resultCooldown}</span>
            </span>
          : '💰 NEW WAGER'
        }
      </button>
    </div>
  );
}
