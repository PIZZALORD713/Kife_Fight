// src/components/fight/GlitchOverlay.jsx
//
// The signature look: a "slightly bad CRT" — scanlines, RGB edge fringe, and a
// vignette — with an RGB-split glitch burst on impact. `intensity` is driven by
// gameplay (lane tension + hit pulses), so the visual noise itself signals that
// someone is about to get folded. CSS-only for now; a WebGL chromatic-aberration
// pass is the drop-in upgrade.
export function GlitchOverlay({ intensity = 0, pulseNonce = 0, finisher = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* scanlines */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
          animation: 'scanline-roll 0.4s steps(2) infinite',
        }}
      />
      {/* RGB edge fringe — grows with lane tension */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          opacity: Math.min(0.6, intensity * 0.6),
          background:
            'linear-gradient(90deg, rgba(255,0,80,0.5), transparent 12%, transparent 88%, rgba(0,200,255,0.5))',
        }}
      />
      {/* vignette / barrel */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55))' }}
      />
      {/* impact glitch slice (remounts on each pulse to restart the burst) */}
      {pulseNonce > 0 && (
        <div
          key={pulseNonce}
          className="absolute inset-x-0 top-0 h-full mix-blend-screen"
          style={{
            background: 'linear-gradient(90deg, rgba(255,0,80,0.35), rgba(0,200,255,0.35))',
            animation: 'glitch-burst 280ms steps(3) forwards',
          }}
        />
      )}
      {/* finisher flash */}
      {finisher && pulseNonce > 0 && (
        <div key={`flash-${pulseNonce}`} className="absolute inset-0 bg-white" style={{ animation: 'glitch-flash 360ms ease-out forwards' }} />
      )}
    </div>
  );
}
