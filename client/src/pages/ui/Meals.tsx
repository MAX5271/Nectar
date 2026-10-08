import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { NectarBadge } from '../../components/ui/NectarBadge';
import { NectarButton } from '../../components/ui/NectarButton';
import { notify } from '../../lib/toast';

interface MealRecipe {
  id: string;
  name: string;
  category: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  tag: 'High Protein' | 'Balanced' | 'Low Carb' | 'Quick Prep';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string;
}

const RECIPES: MealRecipe[] = [
  {
    id: 'm1',
    name: 'Wild Salmon Bowl with Quinoa & Charred Asparagus',
    category: 'DINNER',
    tag: 'High Protein',
    calories: 540,
    protein: 42,
    carbs: 46,
    fat: 18,
    prepTime: '20 min',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ingredients: ['6 oz wild salmon fillet', '3/4 cup cooked tricolor quinoa', '1 bunch fresh asparagus', '1 tbsp extra virgin olive oil', 'Half lemon, sea salt, cracked black pepper'],
    instructions: 'Pan-sear salmon on medium-high heat for 4 minutes skin-side down. Roast asparagus with olive oil and flake salmon over warm seasoned quinoa.',
  },
  {
    id: 'm2',
    name: 'Overnight Chia Oats with Wild Blueberries & Hemp Seed',
    category: 'BREAKFAST',
    tag: 'Balanced',
    calories: 410,
    protein: 24,
    carbs: 52,
    fat: 12,
    prepTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
    ingredients: ['1/2 cup rolled oats', '1 tbsp chia seeds', '1 scoop unflavored whey/plant protein', '3/4 cup unsweetened almond milk', '1/3 cup fresh wild blueberries', '1 tbsp shelled hemp hearts'],
    instructions: 'Combine oats, chia seeds, and protein powder with almond milk in a glass jar. Chill overnight and top with fresh blueberries and hemp seeds before serving.',
  },
  {
    id: 'm3',
    name: 'Seared Grass-Fed Sirloin with Sweet Potato Hash',
    category: 'DINNER',
    tag: 'High Protein',
    calories: 590,
    protein: 48,
    carbs: 42,
    fat: 22,
    prepTime: '25 min',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    ingredients: ['6 oz lean grass-fed sirloin', '1 medium diced sweet potato', '1 cup torn kale leaves', '1 tbsp rosemary garlic butter', 'Coarse sea salt'],
    instructions: 'Dice sweet potato into cubes and crisp in cast iron skillet. Sear steak for 3 minutes per side for medium-rare, rest 5 minutes, then slice across the grain.',
  },
  {
    id: 'm4',
    name: 'Mediterranean Poached Eggs with Whipped Feta & Herbs',
    category: 'BREAKFAST',
    tag: 'Low Carb',
    calories: 380,
    protein: 22,
    carbs: 14,
    fat: 26,
    prepTime: '15 min',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    ingredients: ['2 large pasture-raised eggs', '2 oz Greek feta cheese', '1 tbsp Greek yogurt', 'Fresh dill, parsley, and mint', 'Chili infused olive oil drizzle'],
    instructions: 'Whip feta cheese with Greek yogurt until silky. Soft poach two eggs in simmering water for 3 minutes. Plate poached eggs atop the whipped feta with fresh herbs.',
  },
  {
    id: 'm5',
    name: 'Grilled Herb Chicken with Avocado & Butter Lettuce Salad',
    category: 'LUNCH',
    tag: 'High Protein',
    calories: 470,
    protein: 44,
    carbs: 18,
    fat: 24,
    prepTime: '15 min',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ingredients: ['6 oz chicken breast marinated in thyme & lemon', 'Half ripe Hass avocado', '3 cups crispy butter lettuce', 'Shaved radishes and cucumber', 'Dijon lemon vinaigrette'],
    instructions: 'Grill chicken breast until internal temperature reaches 165°F. Rest, slice, and toss gently with butter lettuce, sliced avocado, radishes, and vinaigrette.',
  },
  {
    id: 'm6',
    name: 'Raw Cacao & Almond Butter Protein Crunch',
    category: 'SNACK',
    tag: 'Quick Prep',
    calories: 260,
    protein: 16,
    carbs: 19,
    fat: 14,
    prepTime: '3 min',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    ingredients: ['2 tbsp stone-ground almond butter', '1 tbsp raw cacao nibs', '1 rice cake or sliced green apple', 'Pinch flaky sea salt'],
    instructions: 'Spread creamy almond butter evenly over sliced green apple or whole grain rice cake, then sprinkle with crunchy cacao nibs and flaky salt.',
  },
];

const FILTER_TAGS = ['All', 'High Protein', 'Balanced', 'Low Carb', 'Quick Prep'] as const;

export const Meals: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<MealRecipe | null>(null);

  const filtered = RECIPES.filter(
    (r) => selectedTag === 'All' || r.tag === selectedTag,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <section className="pb-4 border-b border-line">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Culinary Formulations
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-normal tracking-tight text-ink">
          Meals Crafted for Fuel & Pleasure
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-sans text-ink-muted max-w-2xl leading-relaxed">
          Every recipe is precision-balanced around macro densities and whole-food ingredients. Explore formulas to swap directly into your daily protocol.
        </p>
      </section>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all select-none cursor-pointer ${
              selectedTag === tag
                ? 'bg-ink text-bone font-medium shadow-warm-sm'
                : 'bg-bone-light text-ink-muted border border-line hover:text-ink hover:border-ink/30'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Editorial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            className="group rounded-3xl border border-line bg-bone-light/90 overflow-hidden shadow-warm-sm hover:shadow-warm-md hover:border-line-subtle transition-all duration-300 flex flex-col"
          >
            {/* Food Editorial Photography */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-bone">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-mono uppercase font-semibold px-2.5 py-1 rounded-full bg-bone-light/95 backdrop-blur-xs text-ink border border-line shadow-warm-sm">
                  {recipe.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-turmeric-subtle text-turmeric-dark border border-turmeric/30">
                  {recipe.tag}
                </span>
              </div>
            </div>

            {/* Content & Nutrition Data */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-display text-lg font-normal text-ink leading-snug group-hover:text-beet transition-colors">
                  {recipe.name}
                </h3>

                <div className="flex items-center gap-3 mt-2 text-xs font-mono text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {recipe.prepTime}
                  </span>
                  <span>•</span>
                  <span>{recipe.ingredients.length} ingredients</span>
                </div>
              </div>

              {/* Monospaced Nutrition Pills */}
              <div className="pt-2 border-t border-line/60">
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  <NectarBadge variant="calorie" size="sm">
                    {recipe.calories} kcal
                  </NectarBadge>
                  <NectarBadge variant="protein" size="sm">
                    P {recipe.protein}g
                  </NectarBadge>
                  <NectarBadge variant="carb" size="sm">
                    C {recipe.carbs}g
                  </NectarBadge>
                  <NectarBadge variant="fat" size="sm">
                    F {recipe.fat}g
                  </NectarBadge>
                </div>

                <NectarButton
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  View Formulation
                </NectarButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs"
            onClick={() => setSelectedRecipe(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-line bg-bone-light p-6 sm:p-8 shadow-warm-lg z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-[11px] font-mono text-honey-dark uppercase tracking-wider">
                {selectedRecipe.category} • {selectedRecipe.tag}
              </span>
              <h2 className="mt-1 font-display text-2xl font-normal text-ink">
                {selectedRecipe.name}
              </h2>
            </div>

            {/* Macro Badges */}
            <div className="flex flex-wrap gap-2">
              <NectarBadge variant="calorie" size="md">
                {selectedRecipe.calories} kcal
              </NectarBadge>
              <NectarBadge variant="protein" size="md">
                Protein {selectedRecipe.protein}g
              </NectarBadge>
              <NectarBadge variant="carb" size="md">
                Carbs {selectedRecipe.carbs}g
              </NectarBadge>
              <NectarBadge variant="fat" size="md">
                Fat {selectedRecipe.fat}g
              </NectarBadge>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">
                Ingredients Required
              </h4>
              <ul className="space-y-1.5 text-xs font-sans text-ink">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-honey mt-1.5 shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">
                Preparation Instructions
              </h4>
              <p className="text-xs font-sans text-ink-muted leading-relaxed">
                {selectedRecipe.instructions}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line/60">
              <NectarButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecipe(null)}
              >
                Close
              </NectarButton>
              <NectarButton
                variant="primary"
                size="sm"
                onClick={() => {
                  notify.success(`"${selectedRecipe.name}" added to recommendations.`);
                  setSelectedRecipe(null);
                }}
              >
                Use in Next Plan
              </NectarButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meals;
