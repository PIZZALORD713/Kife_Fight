// src/App.jsx
import { GameWindow } from './components/GameWindow';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { CountdownScreen } from './components/screens/CountdownScreen';
import { BattleScreen } from './components/screens/BattleScreen';
import { RoundResultScreen } from './components/screens/RoundResultScreen';
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
    roundNumber,
    playerRoundsWon,
    opponentRoundsWon,
    roundOutcome,
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
        <CountdownScreen countdown={countdown} stakeAmount={stakeAmount} roundNumber={roundNumber} />
      )}
      {gameState === 'battle' && (
        <BattleScreen
          playerHealth={playerHealth}
          opponentHealth={opponentHealth}
          playerClicks={playerClicks}
          opponentClicks={opponentClicks}
          timeLeft={timeLeft}
          combo={combo}
          roundNumber={roundNumber}
          playerRoundsWon={playerRoundsWon}
          opponentRoundsWon={opponentRoundsWon}
          promptPhase={prompt.promptPhase}
          promptType={prompt.promptType}
          promptResult={prompt.promptResult}
          holdProgress={prompt.holdProgress}
          isStunned={prompt.isStunned}
          holdStartRef={prompt.holdStartRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />
      )}
      {gameState === 'roundResult' && (
        <RoundResultScreen
          roundOutcome={roundOutcome}
          roundNumber={roundNumber}
          playerRoundsWon={playerRoundsWon}
          opponentRoundsWon={opponentRoundsWon}
          resultCooldown={resultCooldown}
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
          playerRoundsWon={playerRoundsWon}
          opponentRoundsWon={opponentRoundsWon}
          resultCooldown={resultCooldown}
          onRematch={startMatch}
        />
      )}
    </GameWindow>
  );
}
