// ============================================================
// Accessory Shop Data
// ============================================================
import type { Accessory } from './types';

export const ACCESSORIES: Accessory[] = [
  // HATS
  {
    id: 'hat_crown',
    name: 'Royal Crown',
    type: 'hat',
    icon: 'Crown',
    cost: 50,
    ascii: ['  👑  ', '     '],
  },
  {
    id: 'hat_tophat',
    name: 'Top Hat',
    type: 'hat',
    icon: 'GraduationCap',
    cost: 30,
    ascii: ['  ___  ', ' |   | ', '  ‾‾‾  '],
  },
  {
    id: 'hat_party',
    name: 'Party Hat',
    type: 'hat',
    icon: 'PartyPopper',
    cost: 20,
    ascii: ['   /\\   ', '  /  \\  '],
  },
  {
    id: 'hat_flower',
    name: 'Flower Crown',
    type: 'hat',
    icon: 'Flower2',
    cost: 40,
    ascii: [' *~*~* '],
  },
  {
    id: 'hat_chef',
    name: 'Chef Hat',
    type: 'hat',
    icon: 'ChefHat',
    cost: 35,
    ascii: ['  _O_  ', ' |   | '],
  },
  // VESTS
  {
    id: 'vest_tux',
    name: 'Tuxedo',
    type: 'vest',
    icon: 'Shirt',
    cost: 60,
    ascii: ['[==|==]'],
  },
  {
    id: 'vest_cape',
    name: 'Hero Cape',
    type: 'vest',
    icon: 'Shield',
    cost: 45,
    ascii: ['  )__(  '],
  },
  {
    id: 'vest_armor',
    name: 'Knight Armor',
    type: 'vest',
    icon: 'Shield',
    cost: 80,
    ascii: ['[####]'],
  },
  {
    id: 'vest_hoodie',
    name: 'Cozy Hoodie',
    type: 'vest',
    icon: 'Shirt',
    cost: 25,
    ascii: ['(====)'],
  },
  // SHADES
  {
    id: 'shades_cool',
    name: 'Cool Shades',
    type: 'shades',
    icon: 'Glasses',
    cost: 30,
    ascii: [],  // Modifies face
  },
  {
    id: 'shades_star',
    name: 'Star Glasses',
    type: 'shades',
    icon: 'Star',
    cost: 40,
    ascii: [],
  },
  {
    id: 'shades_heart',
    name: 'Heart Glasses',
    type: 'shades',
    icon: 'Heart',
    cost: 35,
    ascii: [],
  },
];

export function getAccessoryById(id: string): Accessory | undefined {
  return ACCESSORIES.find(a => a.id === id);
}
