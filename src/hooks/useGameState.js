// src/hooks/useGameState.js
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  BATTLE_DURATION,
  RESULT_COOLDOWN,
  OPPONENT_INTERVAL,
  COMBO_MAX,
  PROMPT_SUCCESS_DAMAGE,
  PROMPT_PERFECT_DAMAGE,
  REWARD_BONUS_CHANCE,
  HEAL_AMOUNT,
  MAX_SHIELD,
  MAX_ROUNDS,
  ROUNDS_TO_WIN,
  KO_HOLD,
} from '../constants/game';
import { usePromptSystem } from './usePromptSystem';
import { sfx, haptic, unlockAudio } from '../audio/sfx';

// Event ids and reward rolls live at module scope so the render-purity lint
// doesn't flag the (legitimate) Math.random()/Date.now() used inside callbacks.
const uid = () => Date.now() + Math.random();
const rollReward = () => (Math.random() < 0.5 ? 'shield' : 'heal');
const rollBonus = () => Math.random() < REWARD_BONUS_CHANCE;

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
  const [attackEvent, setAttackEvent] = useState(null);
  const [playerHurtEvent, setPlayerHurtEvent] = useState(null);

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
  const koTimerRef = useRef(null);
  const lastHurtSfxRef = useRef(0);

  const prompt = usePromptSystem({
    battleEndedRef,
    onSuccess: (tier) => {
      const damage = tier === 'perfect' ? PROMPT_PERFECT_DAMAGE : PROMPT_SUCCESS_DAMAGE;
      const willKill = opponentHealthRef.current - damage <= 0;
      setOpponentHealth(h => {
        const next = Math.max(0, h - damage);
        opponentHealthRef.current = next;
        return next;
      });
      const next = Math.min(COMBO_MAX, comboRef.current + 1);
      comboRef.current = next;
      setCombo(next);

      let reward = 'damage';
      if (tier === 'perfect') {
        reward = rollReward();
      } else if (rollBonus()) {
        reward = rollReward();
      }

      if (reward === 'shield') {
        setPlayerShield(s => {
          const shielded = Math.min(MAX_SHIELD, s + 1);
          playerShieldRef.current = shielded;
          return shielded;
        });
      } else if (reward === 'heal') {
        setPlayerHealth(h => {
          const healed = Math.min(100, h + HEAL_AMOUNT);
          playerHealthRef.current = healed;
          return healed;
        });
      }

      setRewardEvent({ id: uid(), tier, reward, damage });
      if (tier === 'perfect') sfx.perfect(); else sfx.crit();
      haptic(tier === 'perfect' ? [15, 25, 35] : 18);
      if (willKill) endByKO();
    },
    onFail: () => {
      comboRef.current = 1;
      setCombo(1);
      sfx.stun();
      haptic([20, 40]);
    },
  });

  const clearBattleTimers = useCallback(() => {
    clearInterval(battleTimerRef.current);
    clearInterval(opponentAIRef.current);
    clearTimeout(koTimerRef.current);
    prompt.clearPromptTimers();
  }, [prompt]);

  // Compute the round/match outcome and move to the result screen.
  const finalizeRound = useCallback(() => {
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
      if (overall === 'win') sfx.win();
      else if (overall === 'lose') sfx.lose();
    } else {
      setGameState('roundResult');
      if (result === 'win') sfx.win();
      else if (result === 'lose') sfx.lose();
    }
    setResultCooldown(RESULT_COOLDOWN);
  }, []);

  // Time ran out (both alive) → resolve immediately on the decision.
  const endByTimeout = useCallback(() => {
    if (battleEndedRef.current) return;
    battleEndedRef.current = true;
    clearBattleTimers();
    finalizeRound();
  }, [clearBattleTimers, finalizeRound]);

  // Someone hit 0 HP → crunch + hold the finisher, THEN cut to the result.
  const endByKO = useCallback(() => {
    if (battleEndedRef.current) return;
    battleEndedRef.current = true;
    clearBattleTimers();
    sfx.ko();
    haptic([50, 40, 80]);
    koTimerRef.current = setTimeout(finalizeRound, KO_HOLD);
  }, [clearBattleTimers, finalizeRound]);

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
    setAttackEvent(null);
    setPlayerHurtEvent(null);
  }, [clearBattleTimers, prompt]);

  const startMatch = useCallback(() => {
    unlockAudio();
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

  const returnToLobby = useCallback(() => {
    clearBattleTimers();
    prompt.reset();
    setGameState('lobby');
  }, [clearBattleTimers, prompt]);

  const handleAttack = useCallback(() => {
    if (gameState !== 'battle' || battleEndedRef.current || prompt.isStunnedRef.current) return;
    if (prompt.promptPhaseRef.current === 'active') {
      prompt.handleAttackDuringPrompt();
      return;
    }
    const damage = comboRef.current;
    const willKill = opponentHealthRef.current - damage <= 0;
    setOpponentHealth(h => {
      const next = Math.max(0, h - damage);
      opponentHealthRef.current = next;
      return next;
    });
    setPlayerClicks(c => c + 1);
    setAttackEvent({ id: uid(), damage });
    if (willKill) {
      endByKO();
    } else {
      sfx.hit();
      haptic(6);
    }
  }, [gameState, prompt, endByKO]);

  const handlePointerDown = useCallback(() => {
    unlockAudio();
    if (gameState !== 'battle' || battleEndedRef.current || prompt.isStunnedRef.current) return;
    if (prompt.handlePointerDown()) return;
    handleAttack();
  }, [gameState, prompt, handleAttack]);

  const handlePointerUp = useCallback(() => {
    prompt.handlePointerUp();
  }, [prompt]);

  // Countdown → battle transition (with audio cues)
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdown <= 0) { setGameState('battle'); sfx.go(); return; }
    sfx.countdownTick();
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, countdown]);

  // Battle start: timers + AI + prompts
  useEffect(() => {
    if (gameState !== 'battle') return;

    battleTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endByTimeout(); return 0; }
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
        setShieldBlockEvent(uid());
        sfx.block();
        haptic(14);
      } else {
        const willKill = playerHealthRef.current - damage <= 0;
        setPlayerHealth(h => {
          const next = Math.max(0, h - damage);
          playerHealthRef.current = next;
          return next;
        });
        setPlayerHurtEvent({ id: uid(), damage });
        if (willKill) {
          endByKO();
        } else {
          const t = performance.now();
          if (t - lastHurtSfxRef.current > 250) {
            lastHurtSfxRef.current = t;
            sfx.hurt();
            haptic(10);
          }
        }
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
    attackEvent,
    playerHurtEvent,
    startMatch,
    startNextRound,
    returnToLobby,
    handlePointerDown,
    handlePointerUp,
    prompt,
  };
}
