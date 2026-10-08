interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  /** The full data row for this point — useful for showing a field other than `value`. */
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
  labelFormatter?: (label: string | number) => string;
  formatValue?: (value: number | string, item: TooltipPayloadItem) => string;
}

/** Shared tooltip chrome for every chart in the app — values lead, labels follow, one swatch per series. */
export function ChartTooltip({ active, label, payload, labelFormatter, formatValue }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-line bg-bone p-3 shadow-warm-md">
      {label !== undefined && (
        <p className="mb-1.5 text-xs text-ink-soft">{labelFormatter ? labelFormatter(label) : label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item, index) => (
          <div key={`${item.dataKey ?? item.name ?? index}`} className="flex items-center gap-2 text-sm">
            <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span className="font-semibold text-ink">
              {formatValue && item.value !== undefined ? formatValue(item.value, item) : item.value}
            </span>
            {item.name && <span className="text-ink-soft">{item.name}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
