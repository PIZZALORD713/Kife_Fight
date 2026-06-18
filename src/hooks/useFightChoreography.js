// src/hooks/useFightChoreography.js
//
// The choreography director. It is a PURE CONSUMER of the gameplay state that
// useGameState already produces — it never calls back into the engine, so the
// fight logic stays untouched ("lane as visualization"). It turns prop
// transitions (a jab, a hit taken, a landed prompt, a whiff, a block, a KO)
// into paired sprite beats, and derives the tug-of-war lane position from the
// HP gap and the dramatic tension from how close + how deadly + how late it is.
import { useEffect, useRef, useState } from 'react';
import {
  BEATS,
  CLIPS,
  healthToMomentum,
  momentumToLane,
  computeTension,
  tensionToTone,
} from '../constants/choreography';

let _nonce = 0;
const nextNonce = () => ++_nonce;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// Rapid mashing must read as a flurry, not a per-tap restart-storm; a hit taken
// every AI tick (~170ms) must read as the occasional recoil, not a seizure.
const JAB_THROTTLE = 120;
const HURT_THROTTLE = 650;

export function useFightChoreography({
  playerHealth = 100,
  opponentHealth = 100,
  timeLeft = 99,
  rewardEvent = null,
  shieldBlockEvent = null,
  promptResult = null,
  attackEvent = null,
  playerHurtEvent = null,
}) {
  // Lane token = who's winning (HP gap). Tone/intensity = how tense it is.
  const momentum = healthToMomentum(playerHealth, opponentHealth);
  const lane = momentumToLane(momentum);
  const tension = computeTension({ playerHealth, opponentHealth, timeLeft });
  const tone = tensionToTone(tension);

  const [playerClip, setPlayerClip] = useState(CLIPS.IDLE);
  const [opponentClip, setOpponentClip] = useState(CLIPS.IDLE);
  const [clipNonce, setClipNonce] = useState(0); // bump = restart the clip anim
  const [fx, setFx] = useState({ nonce: 0, shake: 'S', rgb: 0, finisher: false, hitstop: 0 });

  const idleTimer = useRef(null);
  const contactTimer = useRef(null);
  const beatRef = useRef({ until: 0, priority: -1 }); // what's currently playing
  const lastJabRef = useRef(0);
  const lastHurtRef = useRef(0);
  // Remembers the last event we already dramatized, so each one fires once.
  const seen = useRef({ reward: null, block: null, prompt: null, attack: null, hurt: null, koP: false, koO: false });

  const fireBeat = (beat, priority = beat.priority ?? 1) => {
    const t = now();
    // A small beat can't stomp a bigger one that's still on screen.
    if (priority < beatRef.current.priority && t < beatRef.current.until) return;
    beatRef.current = { until: t + beat.duration, priority };

    clearTimeout(idleTimer.current);
    clearTimeout(contactTimer.current);
    setPlayerClip(beat.player);
    setOpponentClip(beat.opponent);
    setClipNonce(nextNonce());

    // FX fires on the contact frame so the hit, shake, glitch and hit-stop land together.
    contactTimer.current = setTimeout(() => {
      setFx({
        nonce: nextNonce(),
        shake: beat.fx.shake,
        rgb: beat.fx.rgb,
        finisher: !!beat.fx.finisher,
        hitstop: beat.fx.hitstop || 0,
      });
    }, beat.contact);

    // Return to neutral after the beat (a finisher holds its pose).
    if (!beat.fx.finisher) {
      idleTimer.current = setTimeout(() => {
        setPlayerClip(CLIPS.IDLE);
        setOpponentClip(CLIPS.IDLE);
        setClipNonce(nextNonce());
      }, beat.duration);
    }
  };

  // Every normal attack → a throttled jab so the core mash actually animates.
  useEffect(() => {
    if (!attackEvent || attackEvent.id === seen.current.attack) return;
    seen.current.attack = attackEvent.id;
    const t = now();
    if (t - lastJabRef.current < JAB_THROTTLE) return;
    lastJabRef.current = t;
    fireBeat(BEATS.PLAYER_JAB);
  }, [attackEvent]);

  // Every unblocked hit taken → a throttled flinch (you're getting cut).
  useEffect(() => {
    if (!playerHurtEvent || playerHurtEvent.id === seen.current.hurt) return;
    seen.current.hurt = playerHurtEvent.id;
    const t = now();
    if (t - lastHurtRef.current < HURT_THROTTLE) return;
    lastHurtRef.current = t;
    fireBeat(BEATS.PLAYER_HURT);
  }, [playerHurtEvent]);

  // Player lands a prompt hit → lunge / opponent stumbles.
  useEffect(() => {
    if (!rewardEvent || rewardEvent.id === seen.current.reward) return;
    seen.current.reward = rewardEvent.id;
    fireBeat(rewardEvent.tier === 'perfect' ? BEATS.PLAYER_PERFECT : BEATS.PLAYER_WIN);
  }, [rewardEvent]);

  // Player whiffs a prompt → stun / opponent presses.
  useEffect(() => {
    if (promptResult === 'fail' && seen.current.prompt !== 'fail') fireBeat(BEATS.PLAYER_FAIL);
    seen.current.prompt = promptResult;
  }, [promptResult]);

  // Player shield blocks an incoming hit → brace.
  useEffect(() => {
    if (shieldBlockEvent && shieldBlockEvent !== seen.current.block) {
      seen.current.block = shieldBlockEvent;
      fireBeat(BEATS.PLAYER_BLOCK);
    }
  }, [shieldBlockEvent]);

  // Knockout → finisher pose + glitch tear + hit-stop, staged wherever the lane ended.
  useEffect(() => {
    if (opponentHealth <= 0 && !seen.current.koO) {
      seen.current.koO = true;
      fireBeat(BEATS.KO_WIN);
    }
    if (playerHealth <= 0 && !seen.current.koP) {
      seen.current.koP = true;
      fireBeat(BEATS.KO_LOSE);
    }
  }, [playerHealth, opponentHealth]);

  useEffect(
    () => () => {
      clearTimeout(idleTimer.current);
      clearTimeout(contactTimer.current);
    },
    []
  );

  return { momentum, lane, tone, tension, playerClip, opponentClip, clipNonce, fx };
}
