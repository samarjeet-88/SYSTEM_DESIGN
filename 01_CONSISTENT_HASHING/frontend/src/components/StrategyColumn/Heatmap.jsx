import React, { useState } from "react";
import { STRATEGY_KEYS } from "../../constants";

export const Heatmap = ({ activeServers = [], keysPerNode = {}, meanKeys = 1, strategyId }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const getNodeColor = (keys) => {
    const ratio = meanKeys > 0 ? keys / meanKeys : 1.0;

    if (strategyId === STRATEGY_KEYS.NAIVE) {
      if (ratio > 1.6) return "bg-[#F43F5E] shadow-[0_0_6px_rgba(244,63,94,0.6)]";
      if (ratio > 1.2) return "bg-[#BE123C]";
      if (ratio > 0.8) return "bg-[#881337]";
      return "bg-[#4C1D2B]";
    }

    if (strategyId === STRATEGY_KEYS.CIRCULAR) {
      if (ratio > 1.8) return "bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.6)]";
      if (ratio > 1.2) return "bg-[#D97706]";
      if (ratio > 0.8) return "bg-[#92400E]";
      return "bg-[#483515]";
    }

    // Virtual Nodes
    if (ratio > 1.4) return "bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.6)]";
    if (ratio > 1.1) return "bg-[#059669]";
    if (ratio > 0.8) return "bg-[#047857]";
    return "bg-[#1A4D3E]";
  };

  return (
    <div className="mt-auto pt-2 border-t border-[#1F293D]/60 relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-slate-400">
          Heatmap ({activeServers.length} nodes):
        </span>
        {hoveredNode && (
          <span className="text-[10px] font-mono text-slate-300 bg-[#0B0F17] px-2 py-0.5 rounded border border-slate-700 animate-in fade-in">
            Server {hoveredNode.id}: <strong className="text-white">{hoveredNode.keys} keys</strong> ({(hoveredNode.keys / meanKeys).toFixed(2)}x)
          </span>
        )}
      </div>

      {/* Grid of Nodes */}
      <div className="flex flex-wrap gap-1 p-2 bg-[#0B0F17]/80 rounded border border-[#1F293D] max-h-32 overflow-y-auto">
        {activeServers.map((serverId) => {
          const count = keysPerNode[serverId] ?? 0;
          const colorClass = getNodeColor(count);

          return (
            <div
              key={serverId}
              onMouseEnter={() => setHoveredNode({ id: serverId, keys: count })}
              onMouseLeave={() => setHoveredNode(null)}
              className={`w-3.5 h-3.5 rounded-xs transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
              title={`Server ${serverId}: ${count} keys`}
            />
          );
        })}
      </div>
    </div>
  );
};
