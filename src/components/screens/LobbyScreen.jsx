// src/components/screens/LobbyScreen.jsx
export function LobbyScreen({ stakeAmount, setStakeAmount, onEnterArena }) {
  return (
    <div className="flex-1 flex flex-col p-5 gap-4">
      <div className="text-center">
        <div className="text-yellow-400 text-xs font-mono tracking-widest">🎮 PRACTICE MODE</div>
        <div className="text-gray-400 font-mono text-xs mt-0.5">Stakes are simulated — crypto rails coming later</div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4">
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Stake Amount (ETH)</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={e => setStakeAmount(e.target.value)}
            step="0.005"
            min="0.001"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="bg-gray-700/50 rounded-xl p-4 text-sm text-gray-400 space-y-1.5">
          <div className="flex justify-between"><span>Format</span><span className="text-white font-mono">Best of 3 rounds</span></div>
          <div className="flex justify-between"><span>Your stake</span><span className="text-white font-mono">{stakeAmount} ETH</span></div>
          <div className="flex justify-between"><span>Potential win</span><span className="text-green-400 font-mono">{(parseFloat(stakeAmount || 0) * 1.9).toFixed(3)} ETH</span></div>
          <div className="flex justify-between"><span>Protocol fee</span><span className="text-gray-500 font-mono">5%</span></div>
        </div>
      </div>
      <button
        onClick={onEnterArena}
        className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-black text-lg transition-all active:scale-95"
      >
        ⚔️ ENTER ARENA
      </button>
    </div>
  );
}
