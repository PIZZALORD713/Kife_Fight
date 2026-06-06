// src/components/GameWindow.jsx
export function GameWindow({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start pt-6 p-4">
      <div className="w-full max-w-sm flex flex-col" style={{ height: 'min(620px, calc(100dvh - 3rem))' }}>
        <div className="text-center mb-3 shrink-0">
          <h1 className="text-3xl font-black text-red-500 tracking-tight leading-none">⚔️ KNIFE FIGHT</h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Button-mash PvP wagering</p>
        </div>
        <div className="bg-gray-800 rounded-2xl flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
