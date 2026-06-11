// src/components/RewardPopup.jsx
import { HEAL_AMOUNT } from '../constants/game';

const REWARD_INFO = {
  damage: { icon: '💥', label: 'CRITICAL HIT', cls: 'border-orange-500 text-orange-300' },
  shield: { icon: '🛡️', label: 'SHIELD UP', cls: 'border-blue-500 text-blue-300' },
  heal: { icon: '💚', label: 'HP RESTORED', cls: 'border-green-500 text-green-300' },
};

export function RewardPopup({ rewardEvent }) {
  if (!rewardEvent) return null;
  const info = REWARD_INFO[rewardEvent.reward] || REWARD_INFO.damage;
  const isPerfect = rewardEvent.tier === 'perfect';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center z-20">
      <div
        key={rewardEvent.id}
        className={`animate-float-up-fade flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900/95 border font-black text-xs whitespace-nowrap ${
          isPerfect ? 'border-yellow-400 text-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.6)]' : info.cls
        }`}
      >
        {isPerfect && <span>PERFECT!</span>}
        <span className="text-base leading-none">{info.icon}</span>
        <span>{info.label}</span>
        {rewardEvent.reward === 'shield' && <span>+1</span>}
        {rewardEvent.reward === 'heal' && <span>+{HEAL_AMOUNT}</span>}
        {rewardEvent.reward === 'damage' && <span>-{rewardEvent.damage}</span>}
      </div>
    </div>
  );
}
