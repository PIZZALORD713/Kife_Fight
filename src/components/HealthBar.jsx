// src/components/HealthBar.jsx
export function HealthBar({ label, health, flip = false }) {
  const pct = Math.max(0, health);
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={`flex flex-col gap-1 ${flip ? 'items-end' : 'items-start'} flex-1`}>
      <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">{label}</span>
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-black text-white">{Math.ceil(health)} HP</span>
    </div>
  );
}
