import React from "react";
import { Play, RotateCcw, Loader2 } from "lucide-react";

export const Header = ({
  currentStep,
  totalServers,
  activeCount,
  totalKeys,
  currentStepIdx,
  totalSteps,
  isPlaying,
  onPlay,
  onReset
}) => {
  const operationName = currentStep?.operation || "INIT";

  return (
    <header className="h-14 border-b border-[#1F293D] bg-[#0D121D] px-4 flex items-center justify-between select-none">
      {/* Left: Brand & Info Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#131C2E] border border-[#24334D] text-xs font-semibold text-white tracking-wide">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Consistent Hashing Simulator</span>
        </div>

        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1F293D] text-xs text-slate-300 font-mono">
          <span className="text-rose-400 font-bold">•</span>
          <span>
            <strong className="text-white">{totalServers} servers</strong> ({activeCount} active)
          </span>
          <span className="text-slate-600">•</span>
          <span>{totalKeys.toLocaleString()} keys</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-semibold">
            [Step {currentStepIdx}: {operationName}]
          </span>
        </div>
      </div>

      {/* Right: Sync Status & Playback Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#182234] hover:bg-[#202E46] border border-[#2A3B57] text-xs font-medium text-slate-200 transition-colors active:scale-95 cursor-pointer shadow-sm"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          {/* Play Button */}
          <button
            onClick={onPlay}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all shadow-md active:scale-95 ${isPlaying
              ? "bg-blue-600/50 text-blue-200 border border-blue-500/30 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 cursor-pointer hover:shadow-blue-500/20"
              }`}
          >
            {isPlaying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-300" />
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
