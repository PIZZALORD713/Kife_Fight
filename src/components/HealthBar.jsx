// src/components/HealthBar.jsx
export function HealthBar({ label, health, flip = false, shield = 0, blockEvent = null }) {
  const pct = Math.max(0, health);
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`relative flex flex-col gap-1 ${flip ? 'items-end' : 'items-start'} flex-1`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">{label}</span>
        {shield > 0 && (
          <span className="text-xs leading-none animate-pulse" title={`${shield} shield`}>
            {'🛡️'.repeat(shield)}
          </span>
        )}
      </div>
      <div
        className={`w-full h-3 bg-gray-700 rounded-full overflow-hidden transition-shadow duration-300 ${
          shield > 0 ? 'ring-2 ring-blue-400/70 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : ''
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-100 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-black text-white">{Math.ceil(health)} HP</span>

      {blockEvent && (
        <div key={blockEvent} className={`absolute -top-1 ${flip ? 'right-0' : 'left-0'} pointer-events-none z-10`}>
          <span className="animate-float-up-fade inline-block bg-blue-900/90 border border-blue-400 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
            🛡️ BLOCKED!
          </span>
        </div>
      )}
    </div>
  );
}
