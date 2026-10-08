import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DietMealDTO } from '@nectar/types';

vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../src/services/api';
import { MealCard } from '../../src/components/dashboard/MealCard';

const meal: DietMealDTO = {
  id: 'meal-1',
  type: 'BREAKFAST',
  mealType: 'BREAKFAST',
  meal: 'Oatmeal with berries',
  portion: '1 bowl',
  calories: 350,
  carb: 55,
  protein: 12,
  fat: 8,
  dietPlanId: 'plan-1',
};

describe('MealCard — adherence toggle', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockClear();
  });

  it('starts on "Mark eaten" by default', () => {
    render(<MealCard meal={meal} onMealSwapped={vi.fn()} />);
    expect(screen.getByRole('button', { name: /mark eaten/i })).toBeInTheDocument();
  });

  it('starts already marked eaten when initialAdhered is true', () => {
    render(<MealCard meal={meal} onMealSwapped={vi.fn()} initialAdhered />);
    expect(screen.getByRole('button', { name: /^eaten$/i })).toBeInTheDocument();
  });

  it('logs adherence and flips to "Eaten" when clicked', async () => {
    const user = userEvent.setup();
    render(<MealCard meal={meal} onMealSwapped={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /mark eaten/i }));

    expect(api.post).toHaveBeenCalledWith(
      '/tracking/meals',
      expect.objectContaining({
        name: 'Oatmeal with berries',
        mealType: 'BREAKFAST',
        adhered: true,
        dietPlanId: 'plan-1',
      }),
    );
    expect(await screen.findByRole('button', { name: /^eaten$/i })).toBeInTheDocument();
  });

  it('re-syncs when the parent later confirms the server state (initialAdhered changes)', () => {
    const { rerender } = render(<MealCard meal={meal} onMealSwapped={vi.fn()} initialAdhered={false} />);
    expect(screen.getByRole('button', { name: /mark eaten/i })).toBeInTheDocument();

    rerender(<MealCard meal={meal} onMealSwapped={vi.fn()} initialAdhered={true} />);
    expect(screen.getByRole('button', { name: /^eaten$/i })).toBeInTheDocument();
  });
});
