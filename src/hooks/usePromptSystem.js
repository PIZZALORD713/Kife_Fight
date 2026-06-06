// src/hooks/usePromptSystem.js
import { useState, useRef, useCallback } from 'react';
import {
  PROMPT_TYPES,
  TELEGRAPH_MIN,
  TELEGRAPH_MAX,
  HOLD_DURATION,
  PAUSE_DURATION,
  DOUBLE_MIN_GAP,
  DOUBLE_MAX_GAP,
  DOUBLE_TIMEOUT,
  STUN_DURATION,
  STAGGER_DURATION,
  PROMPT_SPAWN_MIN,
  PROMPT_SPAWN_MAX,
} from '../constants/game';

export function usePromptSystem({ battleEndedRef }) {
  const [promptPhase, setPromptPhase] = useState(null);
  const [promptType, setPromptType] = useState(null);
  const [promptResult, setPromptResult] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isStunned, setIsStunned] = useState(false);
  const [opponentStaggered, setOpponentStaggered] = useState(false);

  const promptPhaseRef = useRef(null);
  const promptTypeRef = useRef(null);
  const isStunnedRef = useRef(false);
  const opponentStaggeredRef = useRef(false);
  const lastTapRef = useRef(0);
  const holdStartRef = useRef(null);

  const promptSpawnRef = useRef(null);
  const promptTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const stunTimeoutRef = useRef(null);

  const syncPromptPhase = (v) => { promptPhaseRef.current = v; setPromptPhase(v); };
  const syncPromptType = (v) => { promptTypeRef.current = v; setPromptType(v); };
  const syncIsStunned = (v) => { isStunnedRef.current = v; setIsStunned(v); };
  const syncOpponentStaggered = (v) => { opponentStaggeredRef.current = v; setOpponentStaggered(v); };

  const clearPromptTimers = useCallback(() => {
    clearTimeout(promptSpawnRef.current);
    clearTimeout(promptTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    clearTimeout(stunTimeoutRef.current);
  }, []);

  const reset = useCallback(() => {
    clearPromptTimers();
    syncPromptPhase(null);
    syncPromptType(null);
    setPromptResult(null);
    setHoldProgress(0);
    syncIsStunned(false);
    syncOpponentStaggered(false);
    lastTapRef.current = 0;
    holdStartRef.current = null;
  }, [clearPromptTimers]);

  const scheduleNextPrompt = useCallback(() => {
    const delay = PROMPT_SPAWN_MIN + Math.random() * (PROMPT_SPAWN_MAX - PROMPT_SPAWN_MIN);
    promptSpawnRef.current = setTimeout(() => {
      if (!battleEndedRef.current && promptPhaseRef.current === null && !isStunnedRef.current) {
        spawnPrompt();
      } else if (!battleEndedRef.current) {
        scheduleNextPrompt();
      }
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completePrompt = useCallback(() => {
    clearTimeout(promptTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    syncPromptPhase(null);
    syncPromptType(null);
    setHoldProgress(0);
    holdStartRef.current = null;
    setPromptResult('success');
    syncOpponentStaggered(true);
    setTimeout(() => syncOpponentStaggered(false), STAGGER_DURATION);
    setTimeout(() => setPromptResult(null), 700);
    scheduleNextPrompt();
  }, [scheduleNextPrompt]);

  const failPrompt = useCallback(() => {
    clearTimeout(promptTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    syncPromptPhase(null);
    syncPromptType(null);
    setHoldProgress(0);
    holdStartRef.current = null;
    setPromptResult('fail');
    syncIsStunned(true);
    stunTimeoutRef.current = setTimeout(() => {
      syncIsStunned(false);
      setPromptResult(null);
      scheduleNextPrompt();
    }, STUN_DURATION);
  }, [scheduleNextPrompt]);

  const spawnPrompt = useCallback(() => {
    const type = PROMPT_TYPES[Math.floor(Math.random() * PROMPT_TYPES.length)];
    syncPromptType(type);
    syncPromptPhase('telegraph');
    setPromptResult(null);
    lastTapRef.current = 0;
    holdStartRef.current = null;

    const telegraphDuration = TELEGRAPH_MIN + Math.random() * (TELEGRAPH_MAX - TELEGRAPH_MIN);

    promptTimeoutRef.current = setTimeout(() => {
      syncPromptPhase('active');

      if (type === 'PAUSE') {
        promptTimeoutRef.current = setTimeout(() => {
          if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'PAUSE') {
            completePrompt();
          }
        }, PAUSE_DURATION);
      } else if (type === 'HOLD') {
        setHoldProgress(0);
        holdIntervalRef.current = setInterval(() => {
          if (!holdStartRef.current) return;
          const elapsed = Date.now() - holdStartRef.current;
          const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100);
          setHoldProgress(pct);
          if (pct >= 100) {
            clearInterval(holdIntervalRef.current);
            completePrompt();
          }
        }, 40);
        promptTimeoutRef.current = setTimeout(() => {
          if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'HOLD') {
            failPrompt();
          }
        }, HOLD_DURATION + 2000);
      } else if (type === 'DOUBLE') {
        promptTimeoutRef.current = setTimeout(() => {
          if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'DOUBLE') {
            failPrompt();
          }
        }, DOUBLE_TIMEOUT);
      }
    }, telegraphDuration);
  }, [completePrompt, failPrompt]);

  const handlePointerDown = useCallback(() => {
    if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'HOLD') {
      holdStartRef.current = Date.now();
      return true;
    }
    return false;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'HOLD') {
      if (holdStartRef.current !== null) {
        const held = Date.now() - holdStartRef.current;
        if (held < HOLD_DURATION) failPrompt();
        holdStartRef.current = null;
      }
    }
  }, [failPrompt]);

  const handleAttackDuringPrompt = useCallback(() => {
    const type = promptTypeRef.current;
    if (type === 'PAUSE') { failPrompt(); return 'blocked'; }
    if (type === 'HOLD') return 'blocked';
    if (type === 'DOUBLE') {
      const now = Date.now();
      const prev = lastTapRef.current;
      lastTapRef.current = now;
      if (prev > 0) {
        const gap = now - prev;
        if (gap >= DOUBLE_MIN_GAP && gap <= DOUBLE_MAX_GAP) completePrompt();
      }
      return 'blocked';
    }
    return 'pass';
  }, [failPrompt, completePrompt]);

  return {
    promptPhase,
    promptPhaseRef,
    promptType,
    promptTypeRef,
    promptResult,
    holdProgress,
    isStunned,
    isStunnedRef,
    opponentStaggered,
    opponentStaggeredRef,
    lastTapRef,
    holdStartRef,
    scheduleNextPrompt,
    clearPromptTimers,
    reset,
    handlePointerDown,
    handlePointerUp,
    handleAttackDuringPrompt,
  };
}
