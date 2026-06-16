// src/components/fight/LaneMeter.jsx
//
// The tug-of-war lane: a token between YOU and THEM that drifts toward whoever
// is winning. The "emotional scoreboard" that augments the health bars.
const TONE_LABEL = { tense: '', heated: 'PRESSURE', chaos: 'FINISH HIM' };

export function LaneMeter({ momentum, tone }) {
  const pct = ((momentum + 1) / 2) * 100; // 0 = YOU wall, 100 = THEM wall
  const tokenColor = tone === 'chaos' ? 'bg-red-500' : tone === 'heated' ? 'bg-orange-400' : 'bg-emerald-400';
  const ahead = momentum >= 0;

  return (
    <div className="absolute inset-x-0 top-0 z-10 px-3 pt-2">
      <div className="mb-1 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
        <span>You</span>
        {TONE_LABEL[tone] && (
          <span className={tone === 'chaos' ? 'animate-pulse text-red-400' : 'text-orange-300'}>
            {TONE_LABEL[tone]}
          </span>
        )}
        <span>Them</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-700/80">
        <div className="absolute left-1/2 top-0 h-full w-px bg-gray-500/70" />
        {/* fill from centre toward the leader */}
        <div
          className={`absolute top-0 h-full transition-all duration-300 ${ahead ? 'bg-emerald-400/70' : 'bg-red-400/70'}`}
          style={ahead ? { left: '50%', width: `${pct - 50}%` } : { left: `${pct}%`, width: `${50 - pct}%` }}
        />
      </div>
      <div className="relative h-0">
        <div
          className={`absolute -top-[7px] -ml-1.5 h-3 w-3 rounded-full ${tokenColor} shadow-[0_0_8px] transition-all duration-300`}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
