/** Shared color/label convention for macros, used everywhere calorie or macro data is shown. */
export const MACRO_META = {
  protein: { label: 'Protein', barClass: 'bg-beet', textClass: 'text-beet', color: 'var(--color-beet)', kcalPerGram: 4 },
  carbs: { label: 'Carbs', barClass: 'bg-turmeric', textClass: 'text-turmeric-dark', color: 'var(--color-turmeric)', kcalPerGram: 4 },
  fat: { label: 'Fat', barClass: 'bg-herb', textClass: 'text-herb-dark', color: 'var(--color-herb)', kcalPerGram: 9 },
} as const;

export type MacroKey = keyof typeof MACRO_META;

/** Fixed read order for every macro chart/legend in the app — never reorder or cycle. */
export const MACRO_ORDER: MacroKey[] = ['protein', 'carbs', 'fat'];

/** Percentage of total calories a macro (in grams) contributes. */
export function macroShare(grams: number, kcalPerGram: number, totalCalories?: number) {
  if (!totalCalories) return 0;
  return Math.min(100, Math.round((grams * kcalPerGram * 100) / totalCalories));
}

export interface RingSegment {
  key: MacroKey;
  label: string;
  grams: number;
  /** Fraction (0-1) of the ring this segment occupies. */
  share: number;
  /** Fraction (0-1) around the ring where this segment starts. */
  offset: number;
  color: string;
  textClass: string;
}

/** Builds the beet/turmeric/herb ring segments (share + starting offset) for a macro donut, in fixed order. */
export function buildRingSegments(
  macros: { protein: number; carbs: number; fat: number },
  totalCalories: number,
): RingSegment[] {
  let cumulative = 0;
  return MACRO_ORDER.map((key) => {
    const meta = MACRO_META[key];
    const grams = macros[key];
    const share = totalCalories ? Math.max(0, Math.min(1, (grams * meta.kcalPerGram) / totalCalories)) : 0;
    const offset = cumulative;
    cumulative += share;
    return { key, label: meta.label, grams, share, offset, color: meta.color, textClass: meta.textClass };
  });
}
