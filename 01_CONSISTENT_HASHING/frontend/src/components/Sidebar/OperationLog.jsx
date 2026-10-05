import React from "react";
import { Plus, Minus, Trash2, CheckCircle2, Clock } from "lucide-react";

export const OperationLog = ({
  operations = [],
  currentStepIdx = 0,
  initialServers = 40,
  onRemoveOperation,
  isPlaying
}) => {
  return (
    <div className="p-4 bg-[#111827] border border-[#1F293D] rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
          3. OPERATIONS QUEUE
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0F17] text-slate-400 border border-[#1F293D]">
          Step {currentStepIdx} of {operations.length}
        </span>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {/* Step 0: Cluster Init */}
        <div
          className={`flex items-center justify-between p-2 rounded text-xs font-mono transition-all ${
            currentStepIdx === 0
              ? "bg-blue-950/50 border border-blue-500/50 text-white shadow-sm"
              : "bg-[#0B0F17]/60 border border-[#1F293D]/50 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-slate-500 font-bold w-3.5 text-right">0</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              INIT
            </span>
            <span className="truncate">Initial Cluster</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">
            {initialServers} servers
          </span>
        </div>

        {/* Queued Operations: Step 1 to N */}
        {operations.map((op, idx) => {
          const stepNum = idx + 1;
          const isCurrent = currentStepIdx === stepNum;
          const isPast = currentStepIdx > stepNum;
          const isAdd = op.startsWith("ADD");
          const parts = op.split(" ");
          const serverId = parts[1];
          const weightOrTier = parts[2] ? `[${parts[2]}]` : "";

          return (
            <div
              key={`${op}-${idx}`}
              className={`flex items-center justify-between p-2 rounded text-xs font-mono transition-all group ${
                isCurrent
                  ? isAdd
                    ? "bg-blue-950/60 border border-blue-500 text-white shadow-md"
                    : "bg-rose-950/60 border border-rose-500 text-white shadow-md"
                  : isPast
                  ? "bg-[#0B0F17]/80 border border-[#1F293D] text-slate-300"
                  : "bg-[#0B0F17]/40 border border-[#1F293D]/40 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] text-slate-500 font-bold w-3.5 text-right">
                  {stepNum}
                </span>

                {/* Operation Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    isAdd
                      ? "bg-blue-950 text-blue-400 border border-blue-800/60"
                      : "bg-rose-950 text-rose-400 border border-rose-800/60"
                  }`}
                >
                  {isAdd ? <Plus className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                  {isAdd ? "ADD" : "REM"} {serverId}
                </span>

                <span className="truncate text-[11px] text-slate-300">
                  Server {serverId} {weightOrTier}
                </span>
              </div>

              {/* Status / Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isCurrent && (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-800/40">
                    ACTIVE
                  </span>
                )}
                {!isPlaying && onRemoveOperation && (
                  <button
                    type="button"
                    onClick={() => onRemoveOperation(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                    title="Remove operation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
