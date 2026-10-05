import React from "react";
import { calculateStdDev, calculateMaxMeanRatio } from "../../utils/mathUtils";
import { STRATEGY_KEYS } from "../../constants";

export const StatsTiles = ({ stats = {}, strategyId }) => {
  const maxKeys = stats?.maxKeysOnNode ?? 0;
  const meanKeys = stats?.meanKeysPerNode ?? 1;
  const keysPerNode = stats?.keysPerNode || {};
  const remappedCount = stats?.remappedKeysCount ?? 0;
  const fractionRemapped = stats?.fractionRemapped ?? 0;

  const stdDev = calculateStdDev(keysPerNode, meanKeys);
  const maxMeanRatio = calculateMaxMeanRatio(maxKeys, meanKeys);

  // Derive sub-labels based on strategy and values
  let ratioSubtitle = "Optimal balance";
  let stdDevSubtitle = "Minimal variance";
  let keysMovedSubtitle = "1/N diffused churn";
  let maxKeysSubtitle = "Balanced load";

  if (strategyId === STRATEGY_KEYS.NAIVE) {
    if (fractionRemapped > 0.5) keysMovedSubtitle = "Catastrophic churn!";
    else if (fractionRemapped > 0) keysMovedSubtitle = "High churn";
    else keysMovedSubtitle = "Cluster initialized";

    if (maxMeanRatio > 1.8) ratioSubtitle = "Severe skew";
    if (stdDev > 50) stdDevSubtitle = "High variance";
    maxKeysSubtitle = "Hotspot skew";
  } else if (strategyId === STRATEGY_KEYS.CIRCULAR) {
    if (fractionRemapped > 0) keysMovedSubtitle = "1/N localized churn";
    else keysMovedSubtitle = "Cluster initialized";

    if (maxMeanRatio > 2.0) ratioSubtitle = "Severe neighbor hotspot";
    else if (maxMeanRatio > 1.4) ratioSubtitle = "Moderate clustering";

    if (stdDev > 60) stdDevSubtitle = "Partition variance";
    maxKeysSubtitle = "Neighbor hotspot";
  } else {
    // Virtual nodes
    if (fractionRemapped > 0) keysMovedSubtitle = "1/N diffused churn";
    else keysMovedSubtitle = "Cluster initialized";

    if (maxMeanRatio < 1.5) ratioSubtitle = "Optimal balance";
    stdDevSubtitle = "Minimal variance";
    maxKeysSubtitle = "Optimal load balance";
  }

  return (
    <div className="grid grid-cols-2 gap-2 my-3">
      {/* Tile 1: Max Keys on Node */}
      <div className="p-2.5 bg-[#0B0F17]/90 border border-[#1F293D] rounded-lg">
        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-0.5">
          MAX KEYS ON NODE
        </span>
        <div className="font-mono text-sm font-bold text-white tabular-nums">
          {maxKeys.toLocaleString()} <span className="text-xs font-normal text-slate-400">keys</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
          {maxKeysSubtitle}
        </span>
      </div>

      {/* Tile 2: Max / Mean Ratio */}
      <div className="p-2.5 bg-[#0B0F17]/90 border border-[#1F293D] rounded-lg">
        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-0.5">
          MAX / MEAN RATIO
        </span>
        <div className="font-mono text-sm font-bold text-white tabular-nums">
          {maxMeanRatio.toFixed(2)}x
        </div>
        <span className={`text-[10px] font-mono block mt-0.5 truncate ${
          maxMeanRatio > 2.0 ? "text-rose-400" : maxMeanRatio > 1.5 ? "text-amber-400" : "text-emerald-400"
        }`}>
          {ratioSubtitle}
        </span>
      </div>

      {/* Tile 3: Std Dev (σ) */}
      <div className="p-2.5 bg-[#0B0F17]/90 border border-[#1F293D] rounded-lg">
        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-0.5">
          STD DEV (σ)
        </span>
        <div className="font-mono text-sm font-bold text-white tabular-nums">
          {stdDev.toFixed(1)} <span className="text-xs font-normal text-slate-400">keys</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
          {stdDevSubtitle}
        </span>
      </div>

      {/* Tile 4: Keys Moved */}
      <div className="p-2.5 bg-[#0B0F17]/90 border border-[#1F293D] rounded-lg">
        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-0.5">
          KEYS MOVED
        </span>
        <div className="font-mono text-sm font-bold text-white tabular-nums flex items-baseline gap-1">
          <span>{remappedCount.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-slate-300">
            ({(fractionRemapped * 100).toFixed(1)}%)
          </span>
        </div>
        <span className={`text-[10px] font-mono block mt-0.5 truncate ${
          fractionRemapped > 0.5 ? "text-rose-400 font-semibold" : fractionRemapped > 0 ? "text-emerald-400" : "text-slate-400"
        }`}>
          {keysMovedSubtitle}
        </span>
      </div>
    </div>
  );
};
