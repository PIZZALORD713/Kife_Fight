// src/hooks/usePromptSystem.js
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  PROMPT_ROLE,
  TELEGRAPH_MIN,
  TELEGRAPH_MAX,
  HOLD_DURATION,
  PAUSE_DURATION,
  STUN_DURATION,
  STAGGER_DURATION,
  PROMPT_SPAWN_MIN,
  PROMPT_SPAWN_MAX,
  MASH_TARGET_TAPS,
  MASH_WINDOW,
  MASH_PERFECT_RATIO,
  TIMING_PERIOD,
  TIMING_TIMEOUT,
  TIMING_UPDATE_INTERVAL,
  CHARGE_FILL_DURATION,
  CHARGE_ZONE_WIDTH,
  CHARGE_PERFECT_RATIO,
  CHARGE_TIMEOUT,
  CHARGE_UPDATE_INTERVAL,
  pickPromptType,
} from '../constants/game';

export function usePromptSystem({ battleEndedRef, playerHealthRef, opponentHealthRef, onSuccess, onFail }) {
  const onSuccessRef = useRef(onSuccess);
  const onFailRef = useRef(onFail);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onFailRef.current = onFail;
  });
  const [promptPhase, setPromptPhase] = useState(null);
  const [promptType, setPromptType] = useState(null);
  const [promptResult, setPromptResult] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pauseProgress, setPauseProgress] = useState(0);
  const [mashCount, setMashCount] = useState(0);
  const [mashProgress, setMashProgress] = useState(0);
  const [timingPosition, setTimingPosition] = useState(0);
  const [timingZone, setTimingZone] = useState(null);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [chargeZone, setChargeZone] = useState(null);
  const [isStunned, setIsStunned] = useState(false);
  const [opponentStaggered, setOpponentStaggered] = useState(false);

  const promptPhaseRef = useRef(null);
  const promptTypeRef = useRef(null);
  const isStunnedRef = useRef(false);
  const opponentStaggeredRef = useRef(false);
  const holdStartRef = useRef(null);
  const mashCountRef = useRef(0);
  const mashStartRef = useRef(null);
  const timingStartRef = useRef(null);
  const timingZoneRef = useRef(null);
  const timingPositionRef = useRef(0);
  const chargeStartRef = useRef(null);
  const chargeProgressRef = useRef(0);
  const chargeZoneRef = useRef(null);

  const promptSpawnRef = useRef(null);
  const promptTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const timingIntervalRef = useRef(null);
  const chargeIntervalRef = useRef(null);
  const stunTimeoutRef = useRef(null);

  const syncPromptPhase = (v) => { promptPhaseRef.current = v; setPromptPhase(v); };
  const syncPromptType = (v) => { promptTypeRef.current = v; setPromptType(v); };
  const syncIsStunned = (v) => { isStunnedRef.current = v; setIsStunned(v); };
  const syncOpponentStaggered = (v) => { opponentStaggeredRef.current = v; setOpponentStaggered(v); };

  const clearActiveIntervals = useCallback(() => {
    clearInterval(holdIntervalRef.current);
    clearInterval(timingIntervalRef.current);
    clearInterval(chargeIntervalRef.current);
  }, []);

  const clearPromptTimers = useCallback(() => {
    clearTimeout(promptSpawnRef.current);
    clearTimeout(promptTimeoutRef.current);
    clearTimeout(stunTimeoutRef.current);
    clearActiveIntervals();
  }, [clearActiveIntervals]);

  const reset = useCallback(() => {
    clearPromptTimers();
    syncPromptPhase(null);
    syncPromptType(null);
    setPromptResult(null);
    setHoldProgress(0);
    setPauseProgress(0);
    setMashCount(0);
    setMashProgress(0);
    setTimingPosition(0);
    setTimingZone(null);
    setChargeProgress(0);
    setChargeZone(null);
    syncIsStunned(false);
    syncOpponentStaggered(false);
    holdStartRef.current = null;
    mashCountRef.current = 0;
    mashStartRef.current = null;
    timingStartRef.current = null;
    timingZoneRef.current = null;
    timingPositionRef.current = 0;
    chargeStartRef.current = null;
    chargeProgressRef.current = 0;
    chargeZoneRef.current = null;
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

  const resetActiveState = () => {
    setHoldProgress(0);
    setPauseProgress(0);
    setMashProgress(0);
    setMashCount(0);
    setTimingZone(null);
    setChargeProgress(0);
    setChargeZone(null);
    holdStartRef.current = null;
    mashCountRef.current = 0;
    timingZoneRef.current = null;
    chargeStartRef.current = null;
    chargeProgressRef.current = 0;
    chargeZoneRef.current = null;
  };

  const completePrompt = useCallback((tier = 'good') => {
    const completedType = promptTypeRef.current;
    clearTimeout(promptTimeoutRef.current);
    clearActiveIntervals();
    syncPromptPhase(null);
    syncPromptType(null);
    resetActiveState();
    setPromptResult('success');
    onSuccessRef.current?.(tier, completedType);
    // Only a landed attack rocks the opponent; defensive checks don't.
    if (PROMPT_ROLE[completedType] === 'attack') {
      syncOpponentStaggered(true);
      setTimeout(() => syncOpponentStaggered(false), STAGGER_DURATION);
    }
    setTimeout(() => setPromptResult(null), 700);
    scheduleNextPrompt();
  }, [clearActiveIntervals, scheduleNextPrompt]);

  const failPrompt = useCallback(() => {
    clearTimeout(promptTimeoutRef.current);
    clearActiveIntervals();
    syncPromptPhase(null);
    syncPromptType(null);
    resetActiveState();
    setPromptResult('fail');
    onFailRef.current?.();
    syncIsStunned(true);
    stunTimeoutRef.current = setTimeout(() => {
      syncIsStunned(false);
      setPromptResult(null);
      scheduleNextPrompt();
    }, STUN_DURATION);
  }, [clearActiveIntervals, scheduleNextPrompt]);

  const spawnPrompt = useCallback(() => {
    const advantage = ((playerHealthRef?.current ?? 100) - (opponentHealthRef?.current ?? 100)) / 100;
    const type = pickPromptType(advantage);
    syncPromptType(type);
    syncPromptPhase('telegraph');
    setPromptResult(null);
    holdStartRef.current = null;
    chargeStartRef.current = null;

    const telegraphDuration = TELEGRAPH_MIN + Math.random() * (TELEGRAPH_MAX - TELEGRAPH_MIN);

    promptTimeoutRef.current = setTimeout(() => {
      syncPromptPhase('active');

      if (type === 'PAUSE') {
        setPauseProgress(100);
        const startTime = Date.now();
        holdIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.max(0, 100 - (elapsed / PAUSE_DURATION) * 100);
          setPauseProgress(pct);
          if (pct <= 0) clearInterval(holdIntervalRef.current);
        }, 40);
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
      } else if (type === 'MASH') {
        mashCountRef.current = 0;
        setMashCount(0);
        setMashProgress(0);
        mashStartRef.current = Date.now();
        promptTimeoutRef.current = setTimeout(() => {
          if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'MASH') {
            failPrompt();
          }
        }, MASH_WINDOW);
      } else if (type === 'TIMING') {
        const goodWidth = 22 + Math.random() * 8;
        const goodStart = Math.random() * (100 - goodWidth);
        const goodEnd = goodStart + goodWidth;
        const perfectWidth = goodWidth * 0.35;
        const perfectStart = goodStart + (goodWidth - perfectWidth) / 2;
        const perfectEnd = perfectStart + perfectWidth;
        const zone = { goodStart, goodEnd, perfectStart, perfectEnd };
        timingZoneRef.current = zone;
        setTimingZone(zone);
        timingStartRef.current = Date.now();
        timingPositionRef.current = 0;
        setTimingPosition(0);
        timingIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - timingStartRef.current;
          const cyclePos = (elapsed % (TIMING_PERIOD * 2)) / TIMING_PERIOD;
          const pos = cyclePos <= 1 ? cyclePos * 100 : (2 - cyclePos) * 100;
          timingPositionRef.current = pos;
          setTimingPosition(pos);
        }, TIMING_UPDATE_INTERVAL);
        promptTimeoutRef.current = setTimeout(() => {
          if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'TIMING') {
            failPrompt();
          }
        }, TIMING_TIMEOUT);
      } else if (type === 'CHARGE') {
        const greenStart = 42 + Math.random() * 24;
        const greenEnd = greenStart + CHARGE_ZONE_WIDTH;
        const perfectWidth = CHARGE_ZONE_WIDTH * CHARGE_PERFECT_RATIO;
        const perfectStart = greenStart + (CHARGE_ZONE_WIDTH - perfectWidth) / 2;
        const perfectEnd = perfectStart + perfectWidth;
        const zone = { greenStart, greenEnd, perfectStart, perfectEnd };
        chargeZoneRef.current = zone;
        setChargeZone(zone);
        chargeStartRef.current = null;
        chargeProgressRef.current = 0;
        setChargeProgress(0);
        chargeIntervalRef.current = setInterval(() => {
          if (!chargeStartRef.current) return;
          const elapsed = Date.now() - chargeStartRef.current;
          const pct = Math.min(100, (elapsed / CHARGE_FILL_DURATION) * 100);
          chargeProgressRef.current = pct;
          setChargeProgress(pct);
          if (pct >= 100) {
            clearInterval(chargeIntervalRef.current);
            failPrompt(); // overcharged — released too late
          }
        }, CHARGE_UPDATE_INTERVAL);
        promptTimeoutRef.current = setTimeout(() => {
          if (promptPhaseRef.current === 'active' && promptTypeRef.current === 'CHARGE') {
            failPrompt();
          }
        }, CHARGE_TIMEOUT);
      }
    }, telegraphDuration);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completePrompt, failPrompt]);

  const handlePointerDown = useCallback(() => {
    if (promptPhaseRef.current !== 'active') return false;
    if (promptTypeRef.current === 'HOLD') {
      holdStartRef.current = Date.now();
      return true;
    }
    if (promptTypeRef.current === 'CHARGE') {
      if (chargeStartRef.current === null) chargeStartRef.current = Date.now();
      return true;
    }
    return false;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (promptPhaseRef.current !== 'active') return;
    if (promptTypeRef.current === 'HOLD') {
      if (holdStartRef.current !== null) {
        const held = Date.now() - holdStartRef.current;
        if (held < HOLD_DURATION) failPrompt();
        holdStartRef.current = null;
      }
    } else if (promptTypeRef.current === 'CHARGE') {
      if (chargeStartRef.current !== null) {
        const pct = chargeProgressRef.current;
        const zone = chargeZoneRef.current;
        chargeStartRef.current = null;
        if (zone && pct >= zone.perfectStart && pct <= zone.perfectEnd) completePrompt('perfect');
        else if (zone && pct >= zone.greenStart && pct <= zone.greenEnd) completePrompt('good');
        else failPrompt();
      }
    }
  }, [failPrompt, completePrompt]);

  const handleAttackDuringPrompt = useCallback(() => {
    const type = promptTypeRef.current;
    if (type === 'PAUSE') { failPrompt(); return 'blocked'; }
    if (type === 'HOLD' || type === 'CHARGE') return 'blocked';
    if (type === 'MASH') {
      mashCountRef.current += 1;
      const count = mashCountRef.current;
      setMashCount(count);
      setMashProgress(Math.min(100, (count / MASH_TARGET_TAPS) * 100));
      if (count >= MASH_TARGET_TAPS) {
        const elapsed = Date.now() - mashStartRef.current;
        completePrompt(elapsed <= MASH_WINDOW * MASH_PERFECT_RATIO ? 'perfect' : 'good');
      }
      return 'blocked';
    }
    if (type === 'TIMING') {
      const pos = timingPositionRef.current;
      const zone = timingZoneRef.current;
      if (zone && pos >= zone.perfectStart && pos <= zone.perfectEnd) completePrompt('perfect');
      else if (zone && pos >= zone.goodStart && pos <= zone.goodEnd) completePrompt('good');
      else failPrompt();
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
    pauseProgress,
    mashCount,
    mashProgress,
    timingPosition,
    timingZone,
    chargeProgress,
    chargeZone,
    isStunned,
    isStunnedRef,
    opponentStaggered,
    opponentStaggeredRef,
    holdStartRef,
    scheduleNextPrompt,
    clearPromptTimers,
    reset,
    handlePointerDown,
    handlePointerUp,
    handleAttackDuringPrompt,
  };
}
