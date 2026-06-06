// src/components/screens/ConnectScreen.jsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function ConnectScreen() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 gap-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🔗</div>
        <h2 className="text-xl font-black mb-1">Enter the Arena</h2>
        <p className="text-gray-400 text-sm">Connect your wallet to start wagering</p>
      </div>
      <ConnectButton />
    </div>
  );
}
