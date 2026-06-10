// src/hooks/useGameState.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { BATTLE_DURATION, RESULT_COOLDOWN, OPPONENT_INTERVAL, COMBO_MAX, PROMPT_SUCCESS_DAMAGE } from '../constants/game';
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
  const [resultCooldown, setResultCooldown] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [combo, setCombo] = useState(1);

  const comboRef = useRef(1);
  const battleEndedRef = useRef(false);
  const playerHealthRef = useRef(100);
  const opponentHealthRef = useRef(100);
  const battleTimerRef = useRef(null);
  const opponentAIRef = useRef(null);

  const prompt = usePromptSystem({
    battleEndedRef,
    onSuccess: () => {
      setOpponentHealth(h => {
        const next = Math.max(0, h - PROMPT_SUCCESS_DAMAGE);
        opponentHealthRef.current = next;
        if (next <= 0 && !battleEndedRef.current) endBattle();
        return next;
      });
      const next = Math.min(COMBO_MAX, comboRef.current + 1);
      comboRef.current = next;
      setCombo(next);
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
    setMatchResult(result);
    setGameState('result');
    setResultCooldown(RESULT_COOLDOWN);
  }, [clearBattleTimers]);

  const startMatch = useCallback(() => {
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
    setCombo(1);
    comboRef.current = 1;
    battleEndedRef.current = false;
    playerHealthRef.current = 100;
    opponentHealthRef.current = 100;
  }, [clearBattleTimers, prompt]);

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
      setPlayerHealth(h => {
        const next = Math.max(0, h - damage);
        playerHealthRef.current = next;
        if (next <= 0 && !battleEndedRef.current) endBattle();
        return next;
      });
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
    if (gameState !== 'result' || resultCooldown <= 0) return;
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
    resultCooldown,
    countdown,
    combo,
    startMatch,
    handlePointerDown,
    handlePointerUp,
    prompt,
  };
}
