// src/hooks/useFightChoreography.js
//
// The choreography director. A PURE CONSUMER of the gameplay state useGameState
// produces — it never calls back into the engine. It turns each outcome (a
// landed attack, a raised shield, a heal, a whiff, a block, a KO) into a
// branching multi-beat sequence chosen by the lane state, and derives the
// tug-of-war position from the HP gap.
import { useEffect, useRef, useState } from 'react';
import {
  CLIPS,
  healthToMomentum,
  momentumToLane,
  laneToTone,
  selectSequence,
  scaleFx,
} from '../constants/choreography';

let _nonce = 0;
const nextNonce = () => ++_nonce;

const REWARD_KIND = { damage: 'attack', shield: 'shield', heal: 'heal' };

export function useFightChoreography({
  playerHealth = 100,
  opponentHealth = 100,
  rewardEvent = null,
  shieldBlockEvent = null,
  promptResult = null,
}) {
  const momentum = healthToMomentum(playerHealth, opponentHealth);
  const lane = momentumToLane(momentum);
  const tone = laneToTone(lane);

  const [playerClip, setPlayerClip] = useState(CLIPS.IDLE);
  const [opponentClip, setOpponentClip] = useState(CLIPS.IDLE);
  const [clipNonce, setClipNonce] = useState(0);
  const [fx, setFx] = useState({ nonce: 0, shake: 'S', rgb: 0, finisher: false });

  const timers = useRef([]);
  const seen = useRef({ reward: null, block: null, prompt: null, koP: false, koO: false });

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  // Play a sequence of beats in order; FX lands on each beat's contact frame.
  const fireSequence = (seq, power = 'good') => {
    clearTimers();
    let i = 0;
    const playStep = () => {
      const s = seq[i];
      setPlayerClip(s.player);
      setOpponentClip(s.opponent);
      setClipNonce(nextNonce());
      const f = scaleFx(s.fx, power);
      if (f) later(() => setFx({ nonce: nextNonce(), shake: f.shake, rgb: f.rgb, finisher: !!f.finisher }), s.contact ?? 0);
      i += 1;
      if (i < seq.length) {
        later(playStep, s.dur);
      } else if (!s.fx?.finisher) {
        later(() => {
          setPlayerClip(CLIPS.IDLE);
          setOpponentClip(CLIPS.IDLE);
          setClipNonce(nextNonce());
        }, s.dur);
      }
    };
    playStep();
  };

  // Landed skill check → attack combo / shield brace / heal recover, branched.
  useEffect(() => {
    if (!rewardEvent || rewardEvent.id === seen.current.reward) return;
    seen.current.reward = rewardEvent.id;
    const kind = REWARD_KIND[rewardEvent.reward] || 'attack';
    fireSequence(selectSequence(kind, momentum), rewardEvent.tier);
  }, [rewardEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whiffed check → stun, branched (cornered fighters eat a bigger punish).
  useEffect(() => {
    if (promptResult === 'fail' && seen.current.prompt !== 'fail') {
      fireSequence(selectSequence('fail', momentum));
    }
    seen.current.prompt = promptResult;
  }, [promptResult]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shield soaks an incoming hit → brace.
  useEffect(() => {
    if (shieldBlockEvent && shieldBlockEvent !== seen.current.block) {
      seen.current.block = shieldBlockEvent;
      fireSequence(selectSequence('block', momentum));
    }
  }, [shieldBlockEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Knockout → finisher sequence, staged where the lane ended.
  useEffect(() => {
    if (opponentHealth <= 0 && !seen.current.koO) {
      seen.current.koO = true;
      fireSequence(selectSequence('ko-win', momentum));
    }
    if (playerHealth <= 0 && !seen.current.koP) {
      seen.current.koP = true;
      fireSequence(selectSequence('ko-lose', momentum));
    }
  }, [playerHealth, opponentHealth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimers(), []);

  return { momentum, lane, tone, playerClip, opponentClip, clipNonce, fx };
}
