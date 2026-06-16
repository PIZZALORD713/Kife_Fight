// src/hooks/useGameState.js
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  BATTLE_DURATION,
  RESULT_COOLDOWN,
  OPPONENT_INTERVAL,
  COMBO_MAX,
  PROMPT_SUCCESS_DAMAGE,
  PROMPT_PERFECT_DAMAGE,
  PROMPT_ROLE,
  HEAL_AMOUNT,
  CHARGE_PERFECT_HEAL,
  MAX_SHIELD,
  MAX_ROUNDS,
  ROUNDS_TO_WIN,
} from '../constants/game';
import { usePromptSystem } from './usePromptSystem';

export function useGameState() {
  const [gameState, setGameState] = useState('lobby');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [playerClicks, setPlayerClicks] = useState(0);
  const [opponentClicks, setOpponentClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [matchResult, setMatchResult] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [playerRoundWins, setPlayerRoundWins] = useState(0);
  const [opponentRoundWins, setOpponentRoundWins] = useState(0);
  const [resultCooldown, setResultCooldown] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [combo, setCombo] = useState(1);
  const [playerShield, setPlayerShield] = useState(0);
  const [rewardEvent, setRewardEvent] = useState(null);
  const [shieldBlockEvent, setShieldBlockEvent] = useState(null);

  const comboRef = useRef(1);
  const battleEndedRef = useRef(false);
  const playerHealthRef = useRef(100);
  const opponentHealthRef = useRef(100);
  const playerShieldRef = useRef(0);
  const roundNumberRef = useRef(1);
  const playerRoundWinsRef = useRef(0);
  const opponentRoundWinsRef = useRef(0);
  const battleTimerRef = useRef(null);
  const opponentAIRef = useRef(null);

  const prompt = usePromptSystem({
    battleEndedRef,
    playerHealthRef,
    opponentHealthRef,
    onSuccess: (tier, type) => {
      const role = PROMPT_ROLE[type] || 'attack';

      // Offensive check → damage + combo.
      if (role === 'attack') {
        const damage = tier === 'perfect' ? PROMPT_PERFECT_DAMAGE : PROMPT_SUCCESS_DAMAGE;
        setOpponentHealth(h => {
          const next = Math.max(0, h - damage);
          opponentHealthRef.current = next;
          if (next <= 0 && !battleEndedRef.current) endBattle();
          return next;
        });
        const combo = Math.min(COMBO_MAX, comboRef.current + 1);
        comboRef.current = combo;
        setCombo(combo);
        setRewardEvent({ id: Date.now() + Math.random(), tier, reward: 'damage', damage });
        return;
      }

      // Defensive CHARGE → raise a shield (perfect also chips back some HP).
      if (role === 'shield') {
        setPlayerShield(s => {
          const shielded = Math.min(MAX_SHIELD, s + 1);
          playerShieldRef.current = shielded;
          return shielded;
        });
        if (tier === 'perfect') {
          setPlayerHealth(h => {
            const healed = Math.min(100, h + CHARGE_PERFECT_HEAL);
            playerHealthRef.current = healed;
            return healed;
          });
        }
        setRewardEvent({ id: Date.now() + Math.random(), tier, reward: 'shield' });
        return;
      }

      // Defensive PAUSE → catch your breath and recover HP.
      setPlayerHealth(h => {
        const healed = Math.min(100, h + HEAL_AMOUNT);
        playerHealthRef.current = healed;
        return healed;
      });
      setRewardEvent({ id: Date.now() + Math.random(), tier, reward: 'heal', amount: HEAL_AMOUNT });
    },
    onFail: () => {
      comboRef.current = 1;
      setCombo(1);
    },
  });

  const clearBattleTimers = useCallback(() => {
    clearInterval(battleTimerRef.current);
    clearInterval(opponentAIRef.current);
    prompt.clearPromptTimers();
  }, [prompt]);

  const endBattle = useCallback(() => {
    if (battleEndedRef.current) return;
    battleEndedRef.current = true;
    clearBattleTimers();
    const ph = playerHealthRef.current;
    const oh = opponentHealthRef.current;
    let result;
    if (oh <= 0 && ph > 0)      result = 'win';
    else if (ph <= 0 && oh > 0) result = 'lose';
    else if (ph > oh)           result = 'win';
    else if (oh > ph)           result = 'lose';
    else                        result = 'draw';

    setRoundResult(result);
    if (result === 'win') {
      playerRoundWinsRef.current += 1;
      setPlayerRoundWins(playerRoundWinsRef.current);
    } else if (result === 'lose') {
      opponentRoundWinsRef.current += 1;
      setOpponentRoundWins(opponentRoundWinsRef.current);
    }

    const pWins = playerRoundWinsRef.current;
    const oWins = opponentRoundWinsRef.current;
    const isMatchOver = pWins >= ROUNDS_TO_WIN || oWins >= ROUNDS_TO_WIN || roundNumberRef.current >= MAX_ROUNDS;

    if (isMatchOver) {
      let overall;
      if (pWins > oWins)      overall = 'win';
      else if (oWins > pWins) overall = 'lose';
      else                    overall = 'draw';
      setMatchResult(overall);
      setGameState('result');
    } else {
      setGameState('roundResult');
    }
    setResultCooldown(RESULT_COOLDOWN);
  }, [clearBattleTimers]);

  const startRound = useCallback(() => {
    clearBattleTimers();
    prompt.reset();
    setGameState('countdown');
    setCountdown(3);
    setPlayerHealth(100);
    setOpponentHealth(100);
    setPlayerClicks(0);
    setOpponentClicks(0);
    setTimeLeft(BATTLE_DURATION);
    setMatchResult(null);
    setRoundResult(null);
    setCombo(1);
    comboRef.current = 1;
    battleEndedRef.current = false;
    playerHealthRef.current = 100;
    opponentHealthRef.current = 100;
    setPlayerShield(0);
    playerShieldRef.current = 0;
    setRewardEvent(null);
    setShieldBlockEvent(null);
  }, [clearBattleTimers, prompt]);

  const startMatch = useCallback(() => {
    roundNumberRef.current = 1;
    playerRoundWinsRef.current = 0;
    opponentRoundWinsRef.current = 0;
    setRoundNumber(1);
    setPlayerRoundWins(0);
    setOpponentRoundWins(0);
    startRound();
  }, [startRound]);

  const startNextRound = useCallback(() => {
    roundNumberRef.current += 1;
    setRoundNumber(roundNumberRef.current);
    startRound();
  }, [startRound]);

  const handleAttack = useCallback(() => {
    if (gameState !== 'battle' || prompt.isStunnedRef.current) return;
    if (prompt.promptPhaseRef.current === 'active') {
      prompt.handleAttackDuringPrompt();
      return;
    }
    const damage = comboRef.current;
    setOpponentHealth(h => {
      const next = Math.max(0, h - damage);
      opponentHealthRef.current = next;
      if (next <= 0 && !battleEndedRef.current) endBattle();
      return next;
    });
    setPlayerClicks(c => c + 1);
  }, [gameState, prompt, endBattle]);

  const handlePointerDown = useCallback(() => {
    if (gameState !== 'battle' || prompt.isStunnedRef.current) return;
    if (prompt.handlePointerDown()) return;
    handleAttack();
  }, [gameState, prompt, handleAttack]);

  const handlePointerUp = useCallback(() => {
    prompt.handlePointerUp();
  }, [prompt]);

  // Countdown → battle transition
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdown <= 0) { setGameState('battle'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, countdown]);

  // Battle start: timers + AI + prompts
  useEffect(() => {
    if (gameState !== 'battle') return;

    battleTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endBattle(); return 0; }
        return t - 1;
      });
    }, 1000);

    opponentAIRef.current = setInterval(() => {
      if (prompt.opponentStaggeredRef.current) return;
      if (prompt.promptPhaseRef.current === 'active') return;
      const damage = Math.random() > 0.85 ? 2 : 1;
      if (playerShieldRef.current > 0) {
        playerShieldRef.current -= 1;
        setPlayerShield(playerShieldRef.current);
        setShieldBlockEvent(Date.now() + Math.random());
      } else {
        setPlayerHealth(h => {
          const next = Math.max(0, h - damage);
          playerHealthRef.current = next;
          if (next <= 0 && !battleEndedRef.current) endBattle();
          return next;
        });
      }
      setOpponentClicks(c => c + 1);
    }, OPPONENT_INTERVAL + Math.random() * 80);

    prompt.scheduleNextPrompt();
    return () => clearBattleTimers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Spacebar support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        handlePointerDown();
      }
    };
    const onKeyUp = (e) => { if (e.code === 'Space') handlePointerUp(); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handlePointerDown, handlePointerUp]);

  // Result cooldown
  useEffect(() => {
    if ((gameState !== 'result' && gameState !== 'roundResult') || resultCooldown <= 0) return;
    const t = setTimeout(() => setResultCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, resultCooldown]);

  return {
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
    startMatch,
    startNextRound,
    handlePointerDown,
    handlePointerUp,
    prompt,
  };
}
