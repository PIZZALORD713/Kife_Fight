// src/components/HealthBar.jsx
import { useEffect, useRef, useState } from 'react';

export function HealthBar({ label, health, flip = false, shield = 0, blockEvent = null }) {
  const pct = Math.max(0, health);
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  // "Chip" / ghost bar: the front bar snaps to the new HP instantly while a pale
  // bar drains down behind it a beat later, so a 10-dmg crit reads as a big hit
  // and a 1-dmg tap reads as a nick. Heals snap up so the ghost never lags above.
  const [chip, setChip] = useState(pct);
  const chipRef = useRef(pct);
  useEffect(() => {
    if (pct >= chipRef.current) {
      chipRef.current = pct;
      setChip(pct);
      return;
    }
    const t = setTimeout(() => {
      chipRef.current = pct;
      setChip(pct);
    }, 260);
    return () => clearTimeout(t);
  }, [pct]);

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
        className={`relative w-full h-3 bg-gray-700 rounded-full overflow-hidden transition-shadow duration-300 ${
          shield > 0 ? 'ring-2 ring-blue-400/70 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : ''
        }`}
      >
        {/* draining ghost (what HP just was) */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-rose-200/70 transition-[width] duration-500 ease-out"
          style={{ width: `${chip}%` }}
        />
        {/* live HP */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-100 ${color}`}
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
