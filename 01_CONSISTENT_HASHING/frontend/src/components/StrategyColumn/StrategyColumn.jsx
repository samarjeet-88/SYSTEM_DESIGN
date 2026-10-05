import React from "react";
import { STRATEGIES_META, STRATEGY_KEYS, RESOLUTION_VNODES } from "../../constants";
import { StatsTiles } from "./StatsTiles";
import { Heatmap } from "./Heatmap";

export const StrategyColumn = ({
  strategyId,
  stepData,
  totalKeys = 10000,
  resolution = "Medium"
}) => {
  const meta = STRATEGIES_META[strategyId];
  const stats = stepData?.stats || {};
  const activeServers = stepData?.activeServers || [];
  const operation = stepData?.operation || "INIT";

  const remappedKeys = stats.remappedKeysCount ?? 0;
  const fractionRemapped = stats.fractionRemapped ?? 0;
  const stayedKeys = Math.max(0, totalKeys - remappedKeys);

  // Dynamic explanation text for operation summary banner
  let opTitle = "Cluster Initialized";
  let opDescription = "Keys distributed across all active servers.";

  if (operation.startsWith("ADD")) {
    const serverNum = operation.split(" ")[1] || "node";
    opTitle = `Server ${serverNum} added`;
    if (strategyId === STRATEGY_KEYS.NAIVE) {
      opDescription = "Changing N to N+1 reshuffles keys across almost all servers.";
    } else if (strategyId === STRATEGY_KEYS.CIRCULAR) {
      opDescription = "Only keys in the new server's arc are reassigned to it.";
    } else {
      opDescription = "New virtual nodes capture small slices across the entire ring.";
    }
  } else if (operation.startsWith("REMOVE")) {
    const serverNum = operation.split(" ")[1] || "node";
    opTitle = `Server ${serverNum} removed`;
    if (strategyId === STRATEGY_KEYS.NAIVE) {
      opDescription = "Server = key mod N, so changing N reshuffles almost every key.";
    } else if (strategyId === STRATEGY_KEYS.CIRCULAR) {
      opDescription = "Only the removed server's keys move, all to its next neighbor.";
    } else {
      opDescription = "The removed server's keys spread evenly across many neighbors.";
    }
  }

  // Tag note
  const resolutionVnodes = RESOLUTION_VNODES[resolution] || 50;
  const tagNote = strategyId === STRATEGY_KEYS.VIRTUAL 
    ? `${resolution} resolution, ${resolutionVnodes} vnodes`
    : meta.note;

  return (
    <div className="flex-1 flex flex-col bg-[#111827] border border-[#1F293D] rounded-lg p-4 shadow-sm min-w-0">
      {/* Column Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            <h2 className="text-sm font-bold text-white tracking-wide">
              {meta.number}. {meta.name}
            </h2>
          </div>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
            style={{
              backgroundColor: meta.bgAccent,
              color: meta.color,
              border: `1px solid ${meta.borderAccent}`
            }}
          >
            {meta.badge}
          </span>
        </div>

        {/* Subtitle & Tag */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{meta.subtitle}</span>
          {tagNote && (
            <span className="text-[10px] font-mono text-slate-500 bg-[#0B0F17] px-1.5 py-0.5 rounded border border-[#1F293D]">
              {tagNote}
            </span>
          )}
        </div>
      </div>

      {/* Operation Summary Banner */}
      <div className="p-3 bg-[#0B0F17]/90 rounded-lg border border-[#1F293D] mb-2">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="font-semibold text-slate-200">{opTitle}</span>
        </div>

        {/* Progress Bar: Stayed vs Moved */}
        <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden flex mb-2">
          <div
            className="h-full bg-slate-600 transition-all duration-300"
            style={{ width: `${((1 - fractionRemapped) * 100).toFixed(1)}%` }}
            title={`Stayed: ${stayedKeys.toLocaleString()} keys`}
          />
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(fractionRemapped * 100).toFixed(1)}%`,
              backgroundColor: meta.color
            }}
            title={`Moved: ${remappedKeys.toLocaleString()} keys (${(fractionRemapped * 100).toFixed(1)}%)`}
          />
        </div>

        {/* Stat Labels */}
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <span className="text-slate-400">
            Stayed <strong className="text-slate-200">{stayedKeys.toLocaleString()}</strong>
          </span>
          <span className="font-semibold" style={{ color: meta.color }}>
            Moved {remappedKeys.toLocaleString()} ({(fractionRemapped * 100).toFixed(1)}%)
          </span>
        </div>

        {/* Strategy Context Explanation */}
        <p className="text-[10px] text-slate-400 leading-tight">
          {opDescription}
        </p>
      </div>

      {/* Stats Section (4 Tiles) */}
      <StatsTiles stats={stats} strategyId={strategyId} />

      {/* Heatmap Grid */}
      <Heatmap
        activeServers={activeServers}
        keysPerNode={stats.keysPerNode || {}}
        meanKeys={stats.meanKeysPerNode || 1}
        strategyId={strategyId}
      />
    </div>
  );
};
