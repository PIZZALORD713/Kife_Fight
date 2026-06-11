// src/components/screens/CountdownScreen.jsx
import { MAX_ROUNDS } from '../../constants/game';

export function CountdownScreen({ countdown, stakeAmount, roundNumber }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
      <div className="text-gray-400 uppercase tracking-widest text-sm">
        Round {roundNumber} of {MAX_ROUNDS} — Get ready...
      </div>
      <div className="font-black text-red-500 leading-none" style={{ fontSize: 'clamp(5rem, 25vw, 8rem)' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <div className="text-gray-500 text-sm">Stake: {stakeAmount} ETH</div>
    </div>
  );
}
