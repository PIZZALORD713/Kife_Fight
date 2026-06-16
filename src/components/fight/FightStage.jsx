// src/components/fight/FightStage.jsx
//
// The arena. Composes the choreography director, the two sliding fighters, the
// tug-of-war lane meter and the CRT/RGB-glitch overlay. Mounts into the empty
// space on the battle screen and is driven entirely by the gameplay props that
// screen already receives — gameplay is never touched.
import { useEffect, useRef } from 'react';
import { SpriteFighter } from './SpriteFighter';
import { GlitchOverlay } from './GlitchOverlay';
import { LaneMeter } from './LaneMeter';
import { useFightChoreography } from '../../hooks/useFightChoreography';
import { FIGHTER_PACKS, shakePixels } from '../../constants/choreography';

// Chromatic-aberration filter for a given intensity (0..1.2).
const aberration = (i) =>
  `drop-shadow(${i * 2.4}px 0 0 rgba(255,40,95,${0.5 * i})) drop-shadow(${-i * 2.4}px 0 0 rgba(40,225,255,${0.5 * i}))`;

export function FightStage(battle) {
  const { momentum, tone, playerClip, opponentClip, clipNonce, fx } = useFightChoreography(battle);

  const stageRef = useRef(null);
  const fxLayerRef = useRef(null);

  // Resting aberration tracks lane tension; the CSS transition smooths the drift.
  const baseRgb = Math.min(1.2, Math.abs(momentum) * 0.6);

  // On the contact frame, spike both the screen shake and the aberration, then
  // ease back to baseline — driven via the Web Animations API so nothing
  // remounts and the fighters' clips keep playing through the impact.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx.nonce]);

  const shift = Math.max(-18, Math.min(18, momentum * 18)); // % the pair slides

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

      <GlitchOverlay intensity={baseRgb} pulseNonce={fx.nonce} finisher={fx.finisher} />
    </div>
  );
}
