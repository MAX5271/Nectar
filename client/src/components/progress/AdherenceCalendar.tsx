import React from 'react';
import { Calendar } from 'lucide-react';
import { NectarDroplet } from '../nectar/NectarDroplet';
import { NectarStat } from '../ui/NectarStat';

export interface AdherenceCalendarProps {
  adherenceRate?: number;
}

interface DayCell {
  date: Date;
  label: string;
  state: 'filled' | 'hollow';
  color: 'herb' | 'turmeric' | 'line';
  mealsLogged: number;
}

export const AdherenceCalendar: React.FC<AdherenceCalendarProps> = ({
  adherenceRate = 86,
}) => {
  // Generate last 28 days
  const days: DayCell[] = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));

    // Simulated cadence for visual representation
    const isToday = i === 27;
    const isMissed = i % 7 === 1 || i % 9 === 0;
    const isPartial = i % 5 === 0;

    let state: DayCell['state'] = 'filled';
    let color: DayCell['color'] = 'herb';
    let mealsLogged = 4;

    if (isMissed && !isToday) {
      state = 'hollow';
      color = 'line';
      mealsLogged = 0;
    } else if (isPartial) {
      state = 'hollow';
      color = 'turmeric';
      mealsLogged = 2;
    }

    return {
      date: d,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      state,
      color,
      mealsLogged,
    };
  });

  return (
    <div className="rounded-3xl border border-line bg-bone-light/90 p-6 sm:p-8 shadow-warm-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ink-muted" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Cadence & Rhythm
            </span>
          </div>
          <NectarStat
            label=""
            value={`${adherenceRate}%`}
            unit="4-week compliance"
            size="lg"
            className="mt-1"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-ink-muted self-start sm:self-center">
          <span className="flex items-center gap-1.5">
            <NectarDroplet state="filled" color="herb" size="xs" /> Full plan
          </span>
          <span className="flex items-center gap-1.5">
            <NectarDroplet state="hollow" color="turmeric" size="xs" /> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <NectarDroplet state="hollow" color="line" size="xs" /> Missed
          </span>
        </div>
      </div>

      {/* 28-day grid */}
      <div className="mt-6">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day} className="text-[11px] font-mono uppercase text-ink-muted">
              {day}
            </span>
          ))}

          {days.map((day, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-bone border border-line/70 hover:border-beet/40 transition-colors cursor-default"
            >
              <NectarDroplet
                state={day.state}
                color={day.color}
                size="xs"
              />
              <span className="mt-1 text-[10px] font-mono text-ink-muted group-hover:text-ink">
                {day.date.getDate()}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                <div className="rounded-lg bg-ink text-bone px-2 py-1 text-[10px] font-mono whitespace-nowrap shadow-warm-md">
                  {day.label}: {day.mealsLogged} meals
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
