import React from 'react';
import { Scale, Sparkles, PieChart, TrendingUp } from 'lucide-react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const MODULES = [
  {
    icon: Scale,
    title: 'Your baseline',
    body: "Nectar starts with your body — current weight, height, age, and activity level — to work out your metabolic baseline.",
  },
  {
    icon: Sparkles,
    title: 'A plan built for you',
    body: "Every day's meals are generated fresh, tailored to your calorie target and what you actually like to eat. No static templates.",
  },
  {
    icon: PieChart,
    title: 'Macros, worked out',
    body: 'Full visibility into your protein, carbs, and fat — broken down precisely so you know exactly what a meal is doing for you.',
  },
  {
    icon: TrendingUp,
    title: 'Progress over time',
    body: 'Log your weigh-ins and meals as you go, and watch your trend — not just today\'s number — take shape.',
  },
];

const About: React.FC = () => {
  const navigate = useSmartNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-linen p-6 md:p-12">
      <div className="w-full max-w-5xl">
        <div className="mb-12 border-b border-line pb-6">
          <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">About Nectar</h1>
          <p className="mt-4 max-w-xl text-base text-ink-soft">
            A diet plan that starts with your body and your goal, not a generic calorie count.
          </p>
        </div>

        <Card variant="quiet" padding="lg" className="mb-16 md:p-12">
          <p className="text-lg leading-relaxed text-ink md:text-xl md:leading-loose">
            Nectar isn't a spreadsheet with extra steps. Give it your biometrics and your goal — cutting, bulking,
            or holding steady — and it works out exactly what to eat, one full day at a time, and adjusts as your
            weight and preferences change.
          </p>
        </Card>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-2xl font-semibold text-ink">How it works</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {MODULES.map(({ icon: Icon, title, body }) => (
              <Card key={title} variant="quiet" padding="lg" className="transition-colors hover:border-beet/40">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-linen text-beet">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card variant="accent" padding="lg" className="text-center md:p-12">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink md:text-3xl">Ready to see your plan?</h2>
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
            Go to your dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default About;
