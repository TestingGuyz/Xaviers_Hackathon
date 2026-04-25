'use client';
import { Apple, Heart, Shield, Zap, Droplets } from 'lucide-react';

interface Props {
  hunger: number; happiness: number; health: number; energy: number; poop: number;
}

const STATS = [
  { key: 'hunger', label: 'Hunger', icon: Apple, gradient: 'from-amber-500 to-orange-400' },
  { key: 'happiness', label: 'Happy', icon: Heart, gradient: 'from-pink-500 to-rose-400' },
  { key: 'health', label: 'Health', icon: Shield, gradient: 'from-emerald-500 to-green-400' },
  { key: 'energy', label: 'Energy', icon: Zap, gradient: 'from-blue-500 to-cyan-400' },
  { key: 'poop', label: 'Poop', icon: Droplets, gradient: 'from-violet-500 to-purple-400' },
] as const;

export default function StatBars(props: Props) {
  return (
    <div className="space-y-2.5">
      {STATS.map(s => {
        const val = props[s.key as keyof Props];
        return (
          <div key={s.key}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-gray-400"><s.icon size={11} /> {s.label}</span>
              <span className="text-gray-500 tabular-nums">{val}/10</span>
            </div>
            <div className="stat-bar">
              <div className={`stat-bar-fill bg-gradient-to-r ${s.gradient}`} style={{ width: `${val * 10}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
