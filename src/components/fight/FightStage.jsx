// src/components/fight/FightStage.jsx
//
// The arena. Composes the choreography director, the two sliding fighters, the
// tug-of-war lane meter, floating damage numbers, the KO stamp and the CRT/RGB
// glitch overlay. Driven entirely by the gameplay props the battle screen
// already receives — the engine is never touched.
import { useEffect, useRef, useState } from 'react';
import { SpriteFighter } from './SpriteFighter';
import { GlitchOverlay } from './GlitchOverlay';
import { LaneMeter } from './LaneMeter';
import { useFightChoreography } from '../../hooks/useFightChoreography';
import { FIGHTER_PACKS, shakePixels } from '../../constants/choreography';

// Chromatic-aberration filter for a given intensity (0..1.2).
const aberration = (i) =>
  `drop-shadow(${i * 2.4}px 0 0 rgba(255,40,95,${0.5 * i})) drop-shadow(${-i * 2.4}px 0 0 rgba(40,225,255,${0.5 * i}))`;

const perfNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const NUM_THROTTLE = 130; // coalesce a mash flurry into readable pops
const HURT_NUM_THROTTLE = 320;

export function FightStage(battle) {
  const { momentum, tone, tension, playerClip, opponentClip, clipNonce, fx } = useFightChoreography(battle);

  const stageRef = useRef(null);
  const fxLayerRef = useRef(null);

  // Resting aberration tracks dramatic tension (close + deadly + late), so the
  // screen screams loudest in a nail-biter — not in a decided blowout.
  const baseRgb = Math.min(1.2, tension * 0.85);

  // On the contact frame, spike the shake + aberration and (on big hits) freeze
  // the stage for a few frames — all driven via the Web Animations API / a CSS
  // class so nothing remounts and the fighters' clips keep playing through it.
  useEffect(() => {
    if (!fx.nonce) return;
    const x = shakePixels(fx.shake, tone);
    const y = x * 0.5;
    stageRef.current?.animate(
      [
        { transform: 'translate(0,0)' },
        { transform: `translate(${x}px, ${-y}px)` },
        { transform: `translate(${-x * 0.8}px, ${y * 0.6}px)` },
        { transform: `translate(${x * 0.5}px, ${-y * 0.4}px)` },
        { transform: 'translate(0,0)' },
      ],
      { duration: 300, easing: 'ease-out' }
    );
    const spike = Math.min(1.2, baseRgb + fx.rgb);
    fxLayerRef.current?.animate(
      [{ filter: aberration(spike) }, { filter: aberration(baseRgb) }],
      { duration: 280, easing: 'ease-out' }
    );
    if (fx.hitstop && stageRef.current) {
      const el = stageRef.current;
      el.classList.add('fx-hitstop');
      const id = setTimeout(() => el.classList.remove('fx-hitstop'), fx.hitstop);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx.nonce]);

  const shift = Math.max(-18, Math.min(18, momentum * 18)); // % the pair slides

  // ── Floating damage numbers ─────────────────────────────
  const [floaters, setFloaters] = useState([]);
  const seenRef = useRef({ atk: null, rew: null, hurt: null });
  const lastAtkNum = useRef(0);
  const lastHurtNum = useRef(0);

  const pushFloater = (f) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = (f.side === 'opp' ? 70 : 30) + shift + (Math.random() - 0.5) * 10;
    const y = 52 + Math.random() * 8;
    setFloaters((list) => [...list, { ...f, id, x, y }]);
    setTimeout(() => setFloaters((list) => list.filter((n) => n.id !== id)), 1000);
  };

  // normal attack → number over the opponent (throttled into a readable flurry)
  useEffect(() => {
    const ae = battle.attackEvent;
    if (!ae || ae.id === seenRef.current.atk) return;
    seenRef.current.atk = ae.id;
    const t = perfNow();
    if (t - lastAtkNum.current < NUM_THROTTLE) return;
    lastAtkNum.current = t;
    pushFloater({ side: 'opp', amount: ae.damage, kind: 'normal' });
  }, [battle.attackEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // prompt crit → big number over the opponent (always shown)
  useEffect(() => {
    const re = battle.rewardEvent;
    if (!re || re.id === seenRef.current.rew) return;
    seenRef.current.rew = re.id;
    pushFloater({ side: 'opp', amount: re.damage, kind: re.tier === 'perfect' ? 'perfect' : 'crit' });
  }, [battle.rewardEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // hit taken → number over you (throttled)
  useEffect(() => {
    const he = battle.playerHurtEvent;
    if (!he || he.id === seenRef.current.hurt) return;
    seenRef.current.hurt = he.id;
    const t = perfNow();
    if (t - lastHurtNum.current < HURT_NUM_THROTTLE) return;
    lastHurtNum.current = t;
    pushFloater({ side: 'player', amount: he.damage, kind: 'hurt' });
  }, [battle.playerHurtEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative my-1 flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-700/60 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* arena depth */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 118%, rgba(56,189,248,0.12), transparent 60%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />

      <LaneMeter momentum={momentum} tone={tone} />

      <div ref={stageRef} className="absolute inset-0">
        {/* fighters layer carries the chromatic aberration */}
        <div ref={fxLayerRef} className="absolute inset-0" style={{ transition: 'filter 240ms ease-out', filter: aberration(baseRgb) }}>
          <SpriteFighter pack={FIGHTER_PACKS.player} facing="right" clip={playerClip} clipNonce={clipNonce} style={{ left: `${30 + shift}%`, bottom: '12%' }} />
          <SpriteFighter pack={FIGHTER_PACKS.rival} facing="left" clip={opponentClip} clipNonce={clipNonce} style={{ left: `${70 + shift}%`, bottom: '14%', '--depth': 0.94 }} />
        </div>
      </div>

      {/* impact spark at the point of contact (sized by hit strength) */}
      {fx.nonce > 0 && (() => {
        const size = 18 + fx.rgb * 46;
        return (
          <div
            key={`spark-${fx.nonce}`}
            className="spark-pop pointer-events-none absolute z-20"
            style={{
              left: `${50 + shift}%`,
              bottom: '30%',
              width: `${size}px`,
              height: `${size}px`,
              marginLeft: `-${size / 2}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,210,90,0.6) 42%, transparent 70%)',
            }}
          />
        );
      })()}

      {/* floating damage numbers */}
      {floaters.map((f) => (
        <DamageNumber key={f.id} f={f} />
      ))}

      {/* KO stamp — the moment */}
      {fx.finisher && fx.nonce > 0 && (
        <div key={`ko-${fx.nonce}`} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <span
            className="ko-stamp font-black tracking-tighter text-white"
            style={{ fontSize: 'clamp(3rem, 18vw, 6rem)', textShadow: '0 0 24px rgba(255,0,80,0.85), 0 0 6px rgba(0,200,255,0.6)' }}
          >
            K.O.
          </span>
        </div>
      )}

      <GlitchOverlay intensity={baseRgb} pulseNonce={fx.nonce} finisher={fx.finisher} />
    </div>
  );
}

function DamageNumber({ f }) {
  const cls =
    f.kind === 'perfect' ? 'dmg-crit text-yellow-300 text-3xl' :
    f.kind === 'crit'    ? 'dmg-crit text-orange-400 text-2xl' :
    f.kind === 'hurt'    ? 'dmg-float text-red-400 text-base' :
                           'dmg-float text-gray-100 text-sm';
  return (
    <div
      className={`pointer-events-none absolute z-20 -translate-x-1/2 font-black tabular-nums ${cls}`}
      style={{ left: `${f.x}%`, bottom: `${f.y}%`, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
    >
      {f.kind === 'perfect' && <span className="mr-1 align-middle text-xs">PERFECT</span>}
      −{f.amount}
    </div>
  );
}
