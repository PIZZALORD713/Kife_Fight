// src/components/PromptBanner.jsx
function getStatusDisplay(isStunned, promptPhase, promptType, promptResult) {
  if (isStunned)
    return { label: '💫 STUNNED', color: 'text-blue-400', bg: 'bg-blue-900/40 border border-blue-700' };
  if (promptPhase === 'telegraph') {
    if (promptType === 'HOLD')   return { label: '⚠️ HOLD INCOMING',   color: 'text-blue-300',   bg: 'bg-blue-900/30 border border-blue-600' };
    if (promptType === 'PAUSE')  return { label: '⚠️ PAUSE INCOMING',  color: 'text-purple-300', bg: 'bg-purple-900/30 border border-purple-600' };
    if (promptType === 'DOUBLE') return { label: '⚠️ DOUBLE INCOMING', color: 'text-yellow-300', bg: 'bg-yellow-900/30 border border-yellow-600' };
  }
  if (promptPhase === 'active') {
    if (promptType === 'HOLD')   return { label: '✊ HOLD THE BUTTON', color: 'text-blue-300',   bg: 'bg-blue-900/50 border border-blue-500' };
    if (promptType === 'PAUSE')  return { label: '🛑 DO NOT CLICK',    color: 'text-purple-300', bg: 'bg-purple-900/50 border border-purple-500' };
    if (promptType === 'DOUBLE') return { label: '👆 DOUBLE TAP NOW',  color: 'text-yellow-300', bg: 'bg-yellow-900/50 border border-yellow-500' };
  }
  if (promptResult === 'success')
    return { label: '✅ NICE! BONUS DAMAGE', color: 'text-green-400', bg: 'bg-green-900/40 border border-green-600' };
  if (promptResult === 'fail')
    return { label: '❌ FAILED!', color: 'text-red-400', bg: 'bg-red-900/40 border border-red-600' };
  return null;
}

export function PromptBanner({ isStunned, promptPhase, promptType, promptResult }) {
  const status = getStatusDisplay(isStunned, promptPhase, promptType, promptResult);
  return (
    <div className="h-12 shrink-0 flex items-center justify-center">
      {status && (
        <div className={`w-full text-center rounded-lg py-2 px-3 text-sm font-black ${status.color} ${status.bg}`}>
          {status.label}
        </div>
      )}
    </div>
  );
}
