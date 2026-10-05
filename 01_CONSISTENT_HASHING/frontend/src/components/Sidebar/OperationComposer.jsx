import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { AddServerPanel } from "./AddServerPanel";
import { RemoveServerPanel } from "./RemoveServerPanel";

export const OperationComposer = ({
  latestActiveServers,
  resolution,
  totalKeys,
  isPlaying,
  onApplyOperation
}) => {
  const [activePanel, setActivePanel] = useState(null); // 'ADD' | 'REMOVE' | null
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Close panel if playback starts
  useEffect(() => {
    if (isPlaying) {
      setActivePanel(null);
    }
  }, [isPlaying]);

  const handleConfirm = async (opData) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await onApplyOperation(opData.type, opData.server, opData.weight);
      setActivePanel(null);
    } catch (err) {
      setApiError(err.message || "Failed to apply operation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-[#111827] border border-[#1F293D] rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
          2. OPERATION COMPOSER
        </h3>
        {activePanel && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
            ACTIVE: {activePanel}
          </span>
        )}
      </div>

      {/* Side-by-Side Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Add Server Button */}
        <button
          type="button"
          disabled={isPlaying}
          onClick={() => {
            setApiError(null);
            setActivePanel(activePanel === "ADD" ? null : "ADD");
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium border transition-all ${isPlaying
            ? "bg-[#141B29] border-[#1F293D] text-slate-600 cursor-not-allowed"
            : activePanel === "ADD"
              ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
              : "bg-[#182234] hover:bg-[#202E46] border-[#2A3B57] text-slate-200 cursor-pointer active:scale-95"
            }`}
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Add server</span>
        </button>

        {/* Remove Server Button */}
        <button
          type="button"
          disabled={isPlaying || latestActiveServers.length <= 1}
          onClick={() => {
            setApiError(null);
            setActivePanel(activePanel === "REMOVE" ? null : "REMOVE");
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium border transition-all ${isPlaying || latestActiveServers.length <= 1
            ? "bg-[#141B29] border-[#1F293D] text-slate-600 cursor-not-allowed"
            : activePanel === "REMOVE"
              ? "bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm"
              : "bg-[#182234] hover:bg-[#202E46] border-[#2A3B57] text-slate-200 cursor-pointer active:scale-95"
            }`}
        >
          <Minus className="w-3.5 h-3.5 text-rose-400" />
          <span>Remove server</span>
        </button>
      </div>

      {/* Inline Errors */}
      {apiError && (
        <div className="mt-2.5 p-2 rounded bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300 font-mono">
          {apiError}
        </div>
      )}

      {/* Inline Panels */}
      {activePanel === "ADD" && (
        <AddServerPanel
          latestActiveServers={latestActiveServers}
          resolution={resolution}
          onConfirm={handleConfirm}
          onCancel={() => setActivePanel(null)}
          isSubmitting={isSubmitting}
        />
      )}

      {activePanel === "REMOVE" && (
        <RemoveServerPanel
          latestActiveServers={latestActiveServers}
          totalKeys={totalKeys}
          onConfirm={handleConfirm}
          onCancel={() => setActivePanel(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
