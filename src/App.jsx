// src/App.jsx
import { GameWindow } from './components/GameWindow';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { CountdownScreen } from './components/screens/CountdownScreen';
import { BattleScreen } from './components/screens/BattleScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { useGameState } from './hooks/useGameState';

export default function App() {
  const {
    gameState,
    playerHealth,
    opponentHealth,
    playerClicks,
    opponentClicks,
    timeLeft,
    stakeAmount,
    setStakeAmount,
    matchResult,
    resultCooldown,
    countdown,
    combo,
    playerShield,
    rewardEvent,
    shieldBlockEvent,
    startMatch,
    handlePointerDown,
    handlePointerUp,
    prompt,
  } = useGameState();

  return (
    <GameWindow>
      {gameState === 'lobby' && (
        <LobbyScreen
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          onEnterArena={startMatch}
        />
      )}
      {gameState === 'countdown' && (
        <CountdownScreen countdown={countdown} stakeAmount={stakeAmount} />
      )}
      {gameState === 'battle' && (
        <BattleScreen
          playerHealth={playerHealth}
          opponentHealth={opponentHealth}
          playerClicks={playerClicks}
          opponentClicks={opponentClicks}
          timeLeft={timeLeft}
          combo={combo}
          playerShield={playerShield}
          rewardEvent={rewardEvent}
          shieldBlockEvent={shieldBlockEvent}
          promptPhase={prompt.promptPhase}
          promptType={prompt.promptType}
          promptResult={prompt.promptResult}
          holdProgress={prompt.holdProgress}
          pauseProgress={prompt.pauseProgress}
          mashCount={prompt.mashCount}
          mashProgress={prompt.mashProgress}
          timingPosition={prompt.timingPosition}
          timingZone={prompt.timingZone}
          isStunned={prompt.isStunned}
          holdStartRef={prompt.holdStartRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />
      )}
      {gameState === 'result' && (
        <ResultScreen
          matchResult={matchResult}
          stakeAmount={stakeAmount}
          playerHealth={playerHealth}
          opponentHealth={opponentHealth}
          playerClicks={playerClicks}
          opponentClicks={opponentClicks}
          resultCooldown={resultCooldown}
          onRematch={startMatch}
        />
      )}
    </GameWindow>
  );
}
