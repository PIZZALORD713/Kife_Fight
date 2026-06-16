// src/hooks/useFightChoreography.js
//
// The choreography director. It is a PURE CONSUMER of the gameplay state that
// useGameState already produces — it never calls back into the engine, so the
// fight logic stays untouched ("lane as visualization"). It turns prop
// transitions (a landed prompt, a whiff, a block, a KO) into paired sprite
// beats, and derives the tug-of-war lane position from the HP gap.
import { useEffect, useRef, useState } from 'react';
import {
  BEATS,
  CLIPS,
  healthToMomentum,
  momentumToLane,
  laneToTone,
} from '../constants/choreography';

let _nonce = 0;
const nextNonce = () => ++_nonce;

export function useFightChoreography({
  playerHealth = 100,
  opponentHealth = 100,
  rewardEvent = null,
  shieldBlockEvent = null,
  promptResult = null,
}) {
  // Derived lane position — the emotional scoreboard.
  const momentum = healthToMomentum(playerHealth, opponentHealth);
  const lane = momentumToLane(momentum);
  const tone = laneToTone(lane);

  const [playerClip, setPlayerClip] = useState(CLIPS.IDLE);
  const [opponentClip, setOpponentClip] = useState(CLIPS.IDLE);
  const [clipNonce, setClipNonce] = useState(0); // bump = restart the clip anim
  const [fx, setFx] = useState({ nonce: 0, shake: 'S', rgb: 0, finisher: false });

  const idleTimer = useRef(null);
  const contactTimer = useRef(null);
  // Remembers the last event we already dramatized, so each one fires once.
  const seen = useRef({ reward: null, block: null, prompt: null, koP: false, koO: false });

  const fireBeat = (beat) => {
    clearTimeout(idleTimer.current);
    clearTimeout(contactTimer.current);
    setPlayerClip(beat.player);
    setOpponentClip(beat.opponent);
    setClipNonce(nextNonce());

    // FX fires on the contact frame so the hit, shake and glitch land together.
    contactTimer.current = setTimeout(() => {
      setFx({
        nonce: nextNonce(),
        shake: beat.fx.shake,
        rgb: beat.fx.rgb,
        finisher: !!beat.fx.finisher,
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

  // Knockout → finisher pose + glitch tear, staged wherever the lane ended.
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

  return { momentum, lane, tone, playerClip, opponentClip, clipNonce, fx };
}
