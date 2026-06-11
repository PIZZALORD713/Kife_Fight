function getButtonStyle(isStunned, promptPhase, promptType) {
  if (isStunned) return 'bg-gray-600 cursor-not-allowed opacity-60';
  if (promptPhase === 'active') {
    if (promptType === 'HOLD')   return 'bg-blue-600 hover:bg-blue-500 active:scale-95';
    if (promptType === 'PAUSE')  return 'bg-purple-700 cursor-not-allowed opacity-80';
    if (promptType === 'DOUBLE') return 'bg-yellow-600 hover:bg-yellow-500 active:scale-95';
    if (promptType === 'MASH')   return 'bg-orange-600 hover:bg-orange-500 active:scale-95 animate-pulse';
    if (promptType === 'TIMING') return 'bg-emerald-600 hover:bg-emerald-500 active:scale-95';
  }
  return 'bg-red-600 hover:bg-red-500 active:scale-95';
}

function getButtonLabel(isStunned, promptPhase, promptType, isHolding, combo) {
  if (isStunned) return '💫 STUNNED';
  if (promptPhase === 'active') {
    if (promptType === 'HOLD')   return isHolding ? '✊ HOLDING...' : '✋ PRESS & HOLD';
    if (promptType === 'PAUSE')  return '🥶 FREEZE!';
    if (promptType === 'DOUBLE') return '👆 TAP TWICE!';
    if (promptType === 'MASH')   return '👊 MASH MASH MASH!';
    if (promptType === 'TIMING') return '🎯 TAP NOW!';
  }
  return combo > 1 ? `⚔️ ATTACK ×${combo}` : '⚔️ ATTACK';
}

export function AttackButton({ combo = 1, isStunned, promptPhase, promptType, isHolding, onPointerDown, onPointerUp, onPointerLeave }) {
  const disabled = isStunned || (promptPhase === 'active' && promptType === 'PAUSE');
  return (
    <div className="shrink-0 flex flex-col gap-1.5">
      <button
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        disabled={disabled}
        className={`w-full py-5 rounded-xl font-black text-xl transition-all select-none touch-none ${getButtonStyle(isStunned, promptPhase, promptType)}`}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {getButtonLabel(isStunned, promptPhase, promptType, isHolding, combo)}
      </button>
      <p className="text-center text-gray-600 text-xs">Tap rapidly · SPACEBAR</p>
    </div>
  );
}
