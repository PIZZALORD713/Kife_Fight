// src/components/PromptBanner.jsx
function getStatusDisplay(isStunned, promptPhase, promptType, promptResult) {
  if (isStunned)
    return { label: '💫 STUNNED', color: 'text-blue-400', bg: 'bg-blue-900/40 border border-blue-700' };
  if (promptPhase === 'telegraph') {
    if (promptType === 'HOLD')   return { label: '⚠️ HOLD INCOMING',   color: 'text-blue-300',   bg: 'bg-blue-900/30 border border-blue-600', pulse: true };
    if (promptType === 'PAUSE')  return { label: '⚠️ FREEZE INCOMING', color: 'text-purple-300', bg: 'bg-purple-900/30 border border-purple-600', pulse: true };
    if (promptType === 'CHARGE') return { label: '⚠️ CHARGE INCOMING', color: 'text-amber-300', bg: 'bg-amber-900/30 border border-amber-600', pulse: true };
    if (promptType === 'MASH')   return { label: '⚠️ MASH INCOMING',   color: 'text-orange-300', bg: 'bg-orange-900/30 border border-orange-600', pulse: true };
    if (promptType === 'TIMING') return { label: '⚠️ TIMING CHECK INCOMING', color: 'text-emerald-300', bg: 'bg-emerald-900/30 border border-emerald-600', pulse: true };
  }
  if (promptPhase === 'active') {
    if (promptType === 'HOLD')   return { label: '✊ HOLD THE BUTTON', color: 'text-blue-300',   bg: 'bg-blue-900/50 border border-blue-500 ring-1 ring-blue-400/50' };
    if (promptType === 'PAUSE')  return { label: '🧘 HOLD STILL — RECOVER', color: 'text-purple-300', bg: 'bg-purple-900/50 border border-purple-500 ring-1 ring-purple-400/50' };
    if (promptType === 'CHARGE') return { label: '⚡ CHARGE & RELEASE IN GREEN', color: 'text-amber-300', bg: 'bg-amber-900/50 border border-amber-500 ring-1 ring-amber-400/50' };
    if (promptType === 'MASH')   return { label: '👊 MASH THE BUTTON!', color: 'text-orange-300', bg: 'bg-orange-900/50 border border-orange-500 ring-1 ring-orange-400/50' };
    if (promptType === 'TIMING') return { label: '🎯 TAP THE SWEET SPOT!', color: 'text-emerald-300', bg: 'bg-emerald-900/50 border border-emerald-500 ring-1 ring-emerald-400/50' };
  }
  if (promptResult === 'success')
    return { label: '✅ SUCCESS!', color: 'text-green-400', bg: 'bg-green-900/40 border border-green-600' };
  if (promptResult === 'fail')
    return { label: '❌ FAILED! COMBO LOST', color: 'text-red-400', bg: 'bg-red-900/40 border border-red-600' };
  return null;
}

export function PromptBanner({ isStunned, promptPhase, promptType, promptResult }) {
  const status = getStatusDisplay(isStunned, promptPhase, promptType, promptResult);
  return (
    <div className="h-12 shrink-0 flex items-center justify-center">
      {status && (
        <div className={`w-full text-center rounded-lg py-2 px-3 text-sm font-black ${status.color} ${status.bg} ${status.pulse ? 'animate-pulse' : ''}`}>
          {status.label}
        </div>
      )}
    </div>
  );
}
