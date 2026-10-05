import React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { OperationComposer } from "./OperationComposer";
import { OperationLog } from "./OperationLog";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const Sidebar = ({
  settings,
  onSettingChange,
  currentActiveCount,
  latestActiveServers,
  totalKeys,
  isPlaying,
  onApplyOperation,
  operations,
  currentStepIdx,
  onRemoveOperation,
  error,
  onRetry
}) => {
  return (
    <aside className="w-80 shrink-0 flex flex-col gap-3 p-4 bg-[#0D121D] border-r border-[#1F293D] overflow-y-auto">
      {/* Inline Global Error if present */}
      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs font-mono flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-white">Simulation Error</p>
            <p className="text-[11px] text-rose-300/90 mt-0.5">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-rose-200 hover:text-white underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Section: Simulation Settings */}
      <SettingsPanel
        settings={settings}
        onSettingChange={onSettingChange}
        currentActiveCount={currentActiveCount}
      />

      {/* Middle Section: Operation Composer */}
      <OperationComposer
        latestActiveServers={latestActiveServers}
        resolution={settings.resolution}
        totalKeys={settings.keys}
        isPlaying={isPlaying}
        onApplyOperation={onApplyOperation}
      />

      {/* Bottom Section: Operations Queue & History */}
      <OperationLog
        operations={operations}
        currentStepIdx={currentStepIdx}
        initialServers={settings.servers}
        onRemoveOperation={onRemoveOperation}
        isPlaying={isPlaying}
      />
    </aside>
  );
};
