import { ResistanceBand } from '../types';

export const KG_TO_LBS = 2.20462;

/** Parse "(3-7 kg)" style ranges from a band name when min values are missing. */
function parsedMinKg(band: ResistanceBand): number | undefined {
  const m = band.name.match(/\((\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*kg\)/i);
  return m ? parseFloat(m[1]) : undefined;
}

/**
 * Representative band load in kg: the midpoint of the printed range when one is
 * known (bands are rated as a range and real tension depends on stretch),
 * otherwise the single rated value.
 */
export function bandLoadKg(band: ResistanceBand): number {
  const min = band.minKg ?? parsedMinKg(band);
  return min !== undefined ? (min + band.weightKg) / 2 : band.weightKg;
}

export function bandLoadLbs(band: ResistanceBand): number {
  const minLbs = band.minLbs ?? (band.minKg !== undefined ? band.minKg * KG_TO_LBS : undefined);
  if (minLbs !== undefined) return (minLbs + band.weightLbs) / 2;
  const min = parsedMinKg(band);
  return min !== undefined ? ((min + band.weightKg) / 2) * KG_TO_LBS : band.weightLbs;
}

/** Total stacked load of the selected bands, in canonical lbs. */
export function stackLoadLbs(bandIds: string[], owned: ResistanceBand[]): number {
  return round1(bandIds.reduce((sum, id) => {
    const b = owned.find(x => x.id === id);
    return sum + (b ? bandLoadLbs(b) : 0);
  }, 0));
}

/** Convert canonical lbs to the user's display unit. */
export function toDisplay(lbs: number, unit: 'kg' | 'lbs'): number {
  return unit === 'kg' ? round1(lbs / KG_TO_LBS) : round1(lbs);
}

/** Human label of a band's printed range in the user's unit, e.g. "3–7 kg". */
export function bandRangeLabel(band: ResistanceBand, unit: 'kg' | 'lbs'): string {
  const min = band.minKg ?? parsedMinKg(band);
  if (unit === 'kg') return min !== undefined ? `${min}–${band.weightKg} kg` : `${band.weightKg} kg`;
  const minLbs = band.minLbs ?? (min !== undefined ? Math.round(min * KG_TO_LBS) : undefined);
  return minLbs !== undefined ? `${minLbs}–${band.weightLbs} lbs` : `${band.weightLbs} lbs`;
}

/** Bands sorted lightest to heaviest by representative load. */
export function bandsByLoad(owned: ResistanceBand[]): ResistanceBand[] {
  return [...owned].sort((a, b) => bandLoadLbs(a) - bandLoadLbs(b));
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
