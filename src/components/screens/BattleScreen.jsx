// src/components/screens/BattleScreen.jsx
import { HealthBar } from '../HealthBar';
import { PromptBanner } from '../PromptBanner';
import { AttackButton } from '../AttackButton';

export function BattleScreen({
  playerHealth,
  opponentHealth,
  playerClicks,
  opponentClicks,
  timeLeft,
  promptPhase,
  promptType,
  promptResult,
  holdProgress,
  isStunned,
  holdStartRef,
  onPointerDown,
  onPointerUp,
}) {
  return (
    <div className="flex-1 flex flex-col p-4 gap-2 min-h-0">
      <div className="flex gap-3 items-start shrink-0">
        <HealthBar label="YOU" health={playerHealth} />
        <div className="flex flex-col items-center pt-4 shrink-0">
          <span className="text-red-500 font-black text-lg">VS</span>
        </div>
        <HealthBar label="THEM" health={opponentHealth} flip />
      </div>

      <div className="flex items-center justify-between shrink-0 px-1">
        <span className="font-mono text-sm text-gray-400">{playerClicks} hits</span>
        <span className={`font-black text-2xl tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {timeLeft}s
        </span>
        <span className="font-mono text-sm text-gray-400">{opponentClicks} hits</span>
      </div>

      <div className="h-2 shrink-0">
        {promptPhase === 'active' && promptType === 'HOLD' && (
          <div className="w-full h-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-none" style={{ width: `${holdProgress}%` }} />
          </div>
        )}
      </div>

      <PromptBanner
        isStunned={isStunned}
        promptPhase={promptPhase}
        promptType={promptType}
        promptResult={promptResult}
      />

      <div className="flex-1 min-h-0" />

      <AttackButton
        isStunned={isStunned}
        promptPhase={promptPhase}
        promptType={promptType}
        isHolding={holdStartRef?.current !== null}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </div>
  );
}
