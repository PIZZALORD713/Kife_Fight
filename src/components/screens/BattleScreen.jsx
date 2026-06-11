// src/components/screens/BattleScreen.jsx
import { HealthBar } from '../HealthBar';
import { PromptBanner } from '../PromptBanner';
import { AttackButton } from '../AttackButton';
import { TimingMeter } from '../TimingMeter';
import { MashMeter } from '../MashMeter';
import { RewardPopup } from '../RewardPopup';
import { RoundIndicator } from '../RoundIndicator';

export function BattleScreen({
  playerHealth,
  opponentHealth,
  playerClicks,
  opponentClicks,
  timeLeft,
  combo,
  playerShield,
  rewardEvent,
  shieldBlockEvent,
  roundNumber,
  playerRoundWins,
  opponentRoundWins,
  promptPhase,
  promptType,
  promptResult,
  holdProgress,
  pauseProgress,
  mashCount,
  mashProgress,
  timingPosition,
  timingZone,
  isStunned,
  holdStartRef,
  onPointerDown,
  onPointerUp,
}) {
  return (
    <div
      className={`relative flex-1 flex flex-col p-4 gap-2 min-h-0 transition-shadow duration-300 ${
        promptResult === 'success' ? 'shadow-[inset_0_0_50px_rgba(34,197,94,0.25)]' :
        promptResult === 'fail' ? 'shadow-[inset_0_0_50px_rgba(239,68,68,0.25)]' : ''
      }`}
    >
      <RewardPopup rewardEvent={rewardEvent} />

      <RoundIndicator
        roundNumber={roundNumber}
        playerRoundWins={playerRoundWins}
        opponentRoundWins={opponentRoundWins}
      />

      <div className="flex gap-3 items-start shrink-0">
        <HealthBar label="YOU" health={playerHealth} shield={playerShield} blockEvent={shieldBlockEvent} />
        <div className="flex flex-col items-center pt-4 shrink-0">
          <span className="text-red-500 font-black text-lg">VS</span>
        </div>
        <HealthBar label="THEM" health={opponentHealth} flip />
      </div>

      <div className="flex items-center justify-between shrink-0 px-1">
        <span className="font-mono text-sm text-gray-400">
          {playerClicks} hits
          {combo > 1 && (
            <span className={`ml-2 font-black ${combo >= 4 ? 'text-orange-400 animate-pulse' : combo >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
              ×{combo}
            </span>
          )}
        </span>
        <span className={`font-black text-2xl tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {timeLeft}s
        </span>
        <span className="font-mono text-sm text-gray-400">{opponentClicks} hits</span>
      </div>

      <div className="h-4 shrink-0 flex items-center">
        {promptPhase === 'active' && promptType === 'HOLD' && (
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-none shadow-[0_0_10px_2px_rgba(59,130,246,0.6)]"
              style={{ width: `${holdProgress}%` }}
            />
          </div>
        )}
        {promptPhase === 'active' && promptType === 'PAUSE' && (
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-none shadow-[0_0_10px_2px_rgba(168,85,247,0.6)]"
              style={{ width: `${pauseProgress}%` }}
            />
          </div>
        )}
        {promptPhase === 'active' && promptType === 'MASH' && (
          <MashMeter progress={mashProgress} count={mashCount} />
        )}
        {promptPhase === 'active' && promptType === 'TIMING' && (
          <TimingMeter position={timingPosition} zone={timingZone} />
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
        combo={combo}
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
