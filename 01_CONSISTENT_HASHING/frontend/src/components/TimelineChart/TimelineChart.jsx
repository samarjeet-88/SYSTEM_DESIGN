import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from "recharts";
import { STRATEGY_KEYS, STRATEGIES_META } from "../../constants";
import { calculateCumulativeMoved } from "../../utils/mathUtils";

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="p-2.5 bg-[#0B0F17] border border-[#1F293D] rounded shadow-xl font-mono text-xs">
        <div className="font-bold text-white mb-1 pb-1 border-b border-[#1F293D]">
          Step {dataPoint.step}: {dataPoint.operation}
        </div>
        <div className="space-y-1">
          {payload.map((entry) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const TimelineChart = ({
  runData,
  currentStepIdx = 0,
  totalKeys = 10000
}) => {
  const naiveSteps = runData?.[STRATEGY_KEYS.NAIVE] || [];
  const circularSteps = runData?.[STRATEGY_KEYS.CIRCULAR] || [];
  const virtualSteps = runData?.[STRATEGY_KEYS.VIRTUAL] || [];

  // Transform data for Recharts (draw only up to current step)
  const chartData = useMemo(() => {
    return naiveSteps.map((stepObj, idx) => {
      const isVisible = idx <= currentStepIdx;
      const op = stepObj.operation || `Step ${idx}`;

      return {
        step: idx,
        operation: op,
        label: `${idx}: ${op}`,
        naive: isVisible ? (stepObj?.stats?.fractionRemapped ?? 0) * 100 : null,
        circular: isVisible ? (circularSteps[idx]?.stats?.fractionRemapped ?? 0) * 100 : null,
        virtual: isVisible ? (virtualSteps[idx]?.stats?.fractionRemapped ?? 0) * 100 : null
      };
    });
  }, [naiveSteps, circularSteps, virtualSteps, currentStepIdx]);

  // Calculate cumulative stats up to current step
  const naiveCumulative = calculateCumulativeMoved(naiveSteps, currentStepIdx);
  const circularCumulative = calculateCumulativeMoved(circularSteps, currentStepIdx);
  const virtualCumulative = calculateCumulativeMoved(virtualSteps, currentStepIdx);

  const naivePercent = totalKeys > 0 ? (naiveCumulative / totalKeys) * 100 : 0;
  const circularPercent = totalKeys > 0 ? (circularCumulative / totalKeys) * 100 : 0;
  const virtualPercent = totalKeys > 0 ? (virtualCumulative / totalKeys) * 100 : 0;

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-3.5 shadow-sm select-none">
      {/* Chart Header & Cumulative Stats Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 font-mono tracking-wide">
            Keys remapped per step (% of Total Keys)
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1F293D]">
            Baseline 1/N ≈ 2.5%
          </span>
        </div>

        {/* Cumulative Keys Moved Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Naive Pill */}
          <div className="px-2 py-1 rounded bg-[#2A121A] border border-[#4C1D2B] text-rose-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Naive:</span>
            <strong className="text-white">{naiveCumulative.toLocaleString()}</strong>
            <span className="text-slate-400">({naivePercent.toFixed(1)}%)</span>
          </div>

          {/* Ring Pill */}
          <div className="px-2 py-1 rounded bg-[#261B0B] border border-[#483515] text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Ring:</span>
            <strong className="text-white">{circularCumulative.toLocaleString()}</strong>
            <span className="text-slate-400">({circularPercent.toFixed(1)}%)</span>
          </div>

          {/* Virtual Nodes Pill */}
          <div className="px-2 py-1 rounded bg-[#0D261F] border border-[#1A4D3E] text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>V-Nodes:</span>
            <strong className="text-white">{virtualCumulative.toLocaleString()}</strong>
            <span className="text-slate-400">({virtualPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1F293D" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              tickLine={false}
              fontFamily="monospace"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={chartData[currentStepIdx]?.label}
              stroke="#3B82F6"
              strokeDasharray="2 2"
              label={{ value: `Step ${currentStepIdx}`, position: "top", fill: "#60A5FA", fontSize: 10, fontFamily: "monospace" }}
            />
            <Line
              type="monotone"
              dataKey="naive"
              name="Naive Modulo"
              stroke={STRATEGIES_META[STRATEGY_KEYS.NAIVE].color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: STRATEGIES_META[STRATEGY_KEYS.NAIVE].color }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="circular"
              name="Consistent Ring"
              stroke={STRATEGIES_META[STRATEGY_KEYS.CIRCULAR].color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: STRATEGIES_META[STRATEGY_KEYS.CIRCULAR].color }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="virtual"
              name="Virtual Nodes"
              stroke={STRATEGIES_META[STRATEGY_KEYS.VIRTUAL].color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: STRATEGIES_META[STRATEGY_KEYS.VIRTUAL].color }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
