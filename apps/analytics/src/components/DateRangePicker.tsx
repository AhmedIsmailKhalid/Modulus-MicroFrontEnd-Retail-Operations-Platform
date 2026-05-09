import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@modulus/ui";

import { useAnalyticsStore } from "../store/analyticsStore";

// ─── Presets ──────────────────────────────────────────────────────────────────

type Preset = { label: string; days: number };

const PRESETS: Preset[] = [
  { label: "Last 7 days",  days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 60 days", days: 60 },
  { label: "Last 90 days", days: 90 },
];

function daysAgoString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return d.toISOString().split("T")[0] ?? "";
}

function todayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DateRangePicker() {
  const { startDate, endDate, setDateRange } = useAnalyticsStore();
  const [open, setOpen] = useState(false);

  function applyPreset(days: number) {
    setDateRange(daysAgoString(days), todayString());
    setOpen(false);
  }

  function formatDisplay(): string {
    const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end   = new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${start} – ${end}`;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setOpen((o) => !o); }}
        leftIcon={<CalendarDays className="h-4 w-4" />}
        data-testid="date-range-picker"
      >
        {formatDisplay()}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => { setOpen(false); }}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => { applyPreset(preset.days); }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {preset.label}
              </button>
            ))}

            <div className="border-t border-gray-100 px-4 py-2">
              <p className="mb-2 text-xs font-medium text-gray-500">Custom Range</p>
              <div className="flex flex-col gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => { setDateRange(e.target.value, endDate); }}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={todayString()}
                  onChange={(e) => { setDateRange(startDate, e.target.value); }}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
