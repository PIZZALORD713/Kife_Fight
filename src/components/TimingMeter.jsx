// src/components/TimingMeter.jsx
export function TimingMeter({ position, zone }) {
  if (!zone) return null;
  return (
    <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 shadow-inner">
      <div
        className="absolute inset-y-0 bg-green-500/40"
        style={{ left: `${zone.goodStart}%`, width: `${zone.goodEnd - zone.goodStart}%` }}
      />
      <div
        className="absolute inset-y-0 bg-yellow-300/80 shadow-[0_0_10px_2px_rgba(253,224,71,0.6)]"
        style={{ left: `${zone.perfectStart}%`, width: `${zone.perfectEnd - zone.perfectStart}%` }}
      />
      <div
        className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-[0_0_8px_3px_rgba(255,255,255,0.9)] transition-none"
        style={{ left: `calc(${position}% - 2px)` }}
      />
    </div>
  );
}
