// src/components/MashMeter.jsx
import { MASH_TARGET_TAPS } from '../constants/game';

export function MashMeter({ progress, count }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-[width] duration-75 ease-out shadow-[0_0_10px_2px_rgba(249,115,22,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="font-mono text-xs text-orange-300 tabular-nums shrink-0">
        {count}/{MASH_TARGET_TAPS}
      </span>
    </div>
  );
}
