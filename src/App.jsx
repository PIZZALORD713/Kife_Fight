// src/App.jsx
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

import { wagmiConfig } from './wagmi';
import { GameWindow } from './components/GameWindow';
import { ConnectScreen } from './components/screens/ConnectScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { CountdownScreen } from './components/screens/CountdownScreen';
import { BattleScreen } from './components/screens/BattleScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { useGameState } from './hooks/useGameState';

const queryClient = new QueryClient();

function Game() {
  const { isConnected, address } = useAccount();
  const {
    gameState,
    walletAddress,
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
    startMatch,
    handlePointerDown,
    handlePointerUp,
    prompt,
  } = useGameState();

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : walletAddress;

  const effectiveGameState = isConnected && gameState === 'connect' ? 'lobby' : gameState;

  return (
    <GameWindow>
      {effectiveGameState === 'connect' && <ConnectScreen />}
      {effectiveGameState === 'lobby' && (
        <LobbyScreen
          walletAddress={displayAddress}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          onEnterArena={startMatch}
        />
      )}
      {effectiveGameState === 'countdown' && (
        <CountdownScreen countdown={countdown} stakeAmount={stakeAmount} />
      )}
      {effectiveGameState === 'battle' && (
        <BattleScreen
          playerHealth={playerHealth}
          opponentHealth={opponentHealth}
          playerClicks={playerClicks}
          opponentClicks={opponentClicks}
          timeLeft={timeLeft}
          combo={combo}
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
      {effectiveGameState === 'result' && (
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

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Game />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
