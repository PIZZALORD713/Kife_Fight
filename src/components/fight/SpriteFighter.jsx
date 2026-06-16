// src/components/fight/SpriteFighter.jsx
//
// Plays one clip for one fighter. Presentational only: the director tells it
// which clip to show and bumps `clipNonce` to restart the animation each beat.
//
// Placeholder render = a procedural humanoid silhouette so lunges/stumbles read
// clearly without art. A real pack swaps <Silhouette> for a sprite-sheet blit;
// the props (pack, clip, clipNonce, facing) stay identical.
import { CLIP_ANIM } from '../../constants/choreography';

function Silhouette({ pack }) {
  const { accent, trim } = pack;
  return (
    <div className="relative h-24 w-12">
      {/* legs */}
      <div className="absolute bottom-0 left-3 h-10 w-2.5 rounded-md bg-gray-800" />
      <div className="absolute bottom-0 left-6 h-10 w-2.5 rounded-md bg-gray-700" />
      {/* torso */}
      <div
        className="absolute bottom-8 left-2.5 h-11 w-7 rounded-lg"
        style={{ background: `linear-gradient(160deg, ${accent}, rgba(0,0,0,0.55))` }}
      />
      {/* head */}
      <div className="absolute bottom-[74px] left-4 h-5 w-5 rounded-full" style={{ background: trim }} />
      {/* back arm */}
      <div className="absolute bottom-[58px] left-1 h-8 w-2 rotate-12 rounded-md" style={{ background: accent }} />
      {/* lead arm + knife */}
      <div className="absolute bottom-[60px] left-8 h-7 w-2 -rotate-12 rounded-md" style={{ background: accent }} />
      <div className="absolute bottom-[70px] left-[42px] h-6 w-1 rotate-[40deg] rounded-sm bg-gray-200 shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
    </div>
  );
}

export function SpriteFighter({ pack, clip, clipNonce, facing = 'right', style }) {
  const face = facing === 'right' ? 1 : -1;
  const depth = (style && style['--depth']) || 1;

  return (
    <div
      className="absolute -translate-x-1/2 transition-[left] duration-300 ease-out"
      style={{ '--face': face, ...style }}
    >
      {/* ground shadow stays planted while the body lunges */}
      <div className="absolute bottom-[-6px] left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-black/50 blur-[2px]" />

      {/* keyed wrapper → React remounts it each beat, restarting the clip */}
      <div key={clipNonce} style={{ animation: CLIP_ANIM[clip] || CLIP_ANIM.IDLE, transformOrigin: 'bottom center' }}>
        <div style={{ transform: `scaleX(${face}) scale(${depth})`, transformOrigin: 'bottom center' }}>
          <Silhouette pack={pack} />
        </div>
      </div>
    </div>
  );
}
