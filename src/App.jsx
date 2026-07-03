// src/App.jsx
import { GameWindow } from './components/GameWindow';
import { RoundIndicator } from './components/RoundIndicator';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { CountdownScreen } from './components/screens/CountdownScreen';
import { BattleScreen } from './components/screens/BattleScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { RoundResultScreen } from './components/screens/RoundResultScreen';
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
    roundResult,
    roundNumber,
    playerRoundWins,
    opponentRoundWins,
    resultCooldown,
    countdown,
    combo,
    playerShield,
    rewardEvent,
    shieldBlockEvent,
    attackEvent,
    playerHurtEvent,
    startMatch,
    startNextRound,
    returnToLobby,
    handlePointerDown,
    handlePointerUp,
    prompt,
  } = useGameState();

  return (
    <GameWindow
      header={
        gameState !== 'lobby' && (
          <RoundIndicator
            roundNumber={roundNumber}
            playerRoundWins={playerRoundWins}
            opponentRoundWins={opponentRoundWins}
          />
        )
      }
    >
      {gameState === 'lobby' && (
        <LobbyScreen
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          onEnterArena={startMatch}
        />
      )}
      {gameState === 'countdown' && (
        <CountdownScreen
          countdown={countdown}
          stakeAmount={stakeAmount}
          roundNumber={roundNumber}
        />
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
          attackEvent={attackEvent}
          playerHurtEvent={playerHurtEvent}
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
      {gameState === 'roundResult' && (
        <RoundResultScreen
          roundResult={roundResult}
          roundNumber={roundNumber}
          playerRoundWins={playerRoundWins}
          opponentRoundWins={opponentRoundWins}
          playerHealth={playerHealth}
          opponentHealth={opponentHealth}
          playerClicks={playerClicks}
          opponentClicks={opponentClicks}
          resultCooldown={resultCooldown}
          onNextRound={startNextRound}
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
          playerRoundWins={playerRoundWins}
          opponentRoundWins={opponentRoundWins}
          resultCooldown={resultCooldown}
          onContinue={returnToLobby}
        />
      )}
    </GameWindow>
  );
}
