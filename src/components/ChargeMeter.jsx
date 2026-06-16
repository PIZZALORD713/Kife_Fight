// src/components/ChargeMeter.jsx
// CHARGE check: hold to fill the bar, release while the leading edge sits in the
// green zone (yellow = perfect). Hold too long and it overcharges → fail.
export function ChargeMeter({ progress = 0, zone }) {
  if (!zone) return null;
  const inGreen = progress >= zone.greenStart && progress <= zone.greenEnd;
  const inPerfect = progress >= zone.perfectStart && progress <= zone.perfectEnd;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 shadow-inner">
        {/* green release zone */}
        <div
          className="absolute inset-y-0 bg-green-500/40"
          style={{ left: `${zone.greenStart}%`, width: `${zone.greenEnd - zone.greenStart}%` }}
        />
        {/* perfect band */}
        <div
          className="absolute inset-y-0 bg-yellow-300/80 shadow-[0_0_10px_2px_rgba(253,224,71,0.6)]"
          style={{ left: `${zone.perfectStart}%`, width: `${zone.perfectEnd - zone.perfectStart}%` }}
        />
        {/* charge fill */}
        <div
          className={`absolute inset-y-0 left-0 transition-[width] duration-75 ease-linear ${
            inPerfect ? 'bg-yellow-400' : inGreen ? 'bg-green-400' : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%`, boxShadow: inGreen ? '0 0 10px 2px rgba(74,222,128,0.7)' : 'none' }}
        />
        {/* leading edge marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-[0_0_8px_3px_rgba(255,255,255,0.9)]"
          style={{ left: `calc(${progress}% - 2px)` }}
        />
      </div>
      <span
        className={`font-mono text-xs tabular-nums shrink-0 font-black ${
          inGreen ? 'text-green-300 animate-pulse' : 'text-amber-300'
        }`}
      >
        {inGreen ? 'RELEASE!' : 'HOLD'}
      </span>
    </div>
  );
}
