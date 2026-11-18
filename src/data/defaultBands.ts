import { ResistanceBand } from '../types';

// SLOVIC PULL-UP & LOOP RESISTANCE BANDS (Natural Latex Loop Bands)
// Specifically calibrated to Slovic's official weight ranges in kg and lbs
export const SLOVIC_LOOP_BANDS: ResistanceBand[] = [
  {
    id: 'slovic-loop-yellow',
    name: 'Slovic Yellow (3-7 kg)',
    colorHex: '#eab308',
    weightLbs: 15,
    weightKg: 7,
    type: 'Long Loop Band',
    isActive: true,
    brand: 'Slovic',
  },
  {
    id: 'slovic-loop-red',
    name: 'Slovic Red (7-15 kg)',
    colorHex: '#ef4444',
    weightLbs: 33,
    weightKg: 15,
    type: 'Long Loop Band',
    isActive: true,
    brand: 'Slovic',
  },
  {
    id: 'slovic-loop-blue',
    name: 'Slovic Blue (15-30 kg)',
    colorHex: '#3b82f6',
    weightLbs: 66,
    weightKg: 30,
    type: 'Long Loop Band',
    isActive: true,
    brand: 'Slovic',
  },
  {
    id: 'slovic-loop-purple',
    name: 'Slovic Purple (30-45 kg)',
    colorHex: '#a855f7',
    weightLbs: 99,
    weightKg: 45,
    type: 'Long Loop Band',
    isActive: true,
    brand: 'Slovic',
  },
  {
    id: 'slovic-loop-orange',
    name: 'Slovic Orange/Green (45-60 kg)',
    colorHex: '#f97316',
    weightLbs: 132,
    weightKg: 60,
    type: 'Long Loop Band',
    isActive: true,
    brand: 'Slovic',
  },
];

// Default Bands Kit is now 100% Loop Bands
export const ALL_DEFAULT_BANDS: ResistanceBand[] = [
  ...SLOVIC_LOOP_BANDS,
];
