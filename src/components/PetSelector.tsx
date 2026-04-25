'use client';
import { useState } from 'react';
import { PET_INFO, type PetType } from '@/lib/frames';

export default function PetSelector({ onSelect }: { onSelect: (pet: PetType, name: string) => void }) {
  const [selected, setSelected] = useState<PetType>('cat');
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Choose Your Pet</h1>
        <p className="text-gray-400 text-sm mb-6">Pick a companion and give it a name!</p>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {(Object.keys(PET_INFO) as PetType[]).map(pet => (
            <button key={pet} onClick={() => setSelected(pet)}
              className={`p-3 rounded-xl border transition-all ${selected === pet ? 'border-cyan-400 bg-cyan-400/10 scale-105' : 'border-white/10 bg-white/3 hover:bg-white/5'}`}>
              <div className="text-2xl mb-1">{PET_INFO[pet].emoji}</div>
              <div className="text-xs text-gray-300">{PET_INFO[pet].name}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-4">{PET_INFO[selected].desc}</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name your pet..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-cyan-400/50 mb-4" maxLength={20} />
        <button onClick={() => onSelect(selected, name || PET_INFO[selected].name)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity">
          Begin Journey
        </button>
      </div>
    </div>
  );
}
