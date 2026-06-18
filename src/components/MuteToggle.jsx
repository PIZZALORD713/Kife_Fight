// src/components/MuteToggle.jsx
import { useState } from 'react';
import { isMuted, setMuted, unlockAudio } from '../audio/sfx';

export function MuteToggle() {
  const [muted, setM] = useState(isMuted());
  return (
    <button
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setM(next);
        unlockAudio();
      }}
      aria-label={muted ? 'Unmute' : 'Mute'}
      title={muted ? 'Sound off' : 'Sound on'}
      className="absolute right-0 top-0 text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none p-1"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
