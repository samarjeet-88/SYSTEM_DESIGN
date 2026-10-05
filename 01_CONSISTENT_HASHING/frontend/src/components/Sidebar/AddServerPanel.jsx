import React, { useState, useEffect, useMemo } from "react";
import { CAPACITY_WEIGHTS, RESOLUTION_VNODES } from "../../constants";
import { validateAdd, validateCustomWeight } from "../../utils/mathUtils";
import { Loader2 } from "lucide-react";

export const AddServerPanel = ({
  latestActiveServers,
  resolution,
  onConfirm,
  onCancel,
  isSubmitting
}) => {
  // Default server number: highest ever used + 1
  const defaultId = useMemo(() => {
    const maxId = latestActiveServers.length > 0 ? Math.max(...latestActiveServers) : 0;
    return maxId + 1;
  }, [latestActiveServers]);

  const [serverId, setServerId] = useState(defaultId);
  const [capacityTier, setCapacityTier] = useState("Normal");
  const [customWeight, setCustomWeight] = useState(1.0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setServerId(defaultId);
  }, [defaultId]);

  // Determine active weight
  const activeWeight = useMemo(() => {
    if (capacityTier === "Custom") {
      return Number(customWeight) || 1.0;
    }
    return CAPACITY_WEIGHTS[capacityTier] || 1.0;
  }, [capacityTier, customWeight]);

  // Validations
  const idValidation = validateAdd(serverId, latestActiveServers);
  const weightValidation = capacityTier === "Custom" ? validateCustomWeight(customWeight) : { isValid: true };
  const isFormValid = idValidation.isValid && weightValidation.isValid;

  // Live vnode preview
  const baseVnodes = RESOLUTION_VNODES[resolution] || 50;
  const calculatedVnodes = Math.max(1, Math.round(baseVnodes * activeWeight));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    onConfirm({
      type: "ADD",
      server: Number(serverId),
      weight: activeWeight
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3.5 bg-[#0B0F17] border border-blue-500/30 rounded-lg shadow-inner animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-blue-400 font-mono">
          ADD NEW SERVER
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">
          Target server
        </span>
      </div>

      {/* Server Number Input */}
      <div className="mb-3">
        <label className="block text-[11px] text-slate-300 mb-1 font-medium">
          Server number
        </label>
        <input
          type="number"
          min="1"
          value={serverId}
          onChange={(e) => {
            setHasInteracted(true);
            setServerId(e.target.value);
          }}
          className="w-full px-2.5 py-1.5 bg-[#111827] border border-[#24334D] focus:border-blue-500 rounded text-xs font-mono text-white outline-none"
          placeholder="e.g. 41"
          autoFocus
        />
        {hasInteracted && idValidation.error && (
          <p className="text-[10px] text-rose-400 mt-1 font-mono">
            {idValidation.error}
          </p>
        )}
      </div>

      {/* Server Capacity Segmented Control */}
      <div className="mb-3">
        <label className="block text-[11px] text-slate-300 mb-1 font-medium">
          Server capacity
        </label>
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#111827] rounded border border-[#1F293D] mb-1.5">
          {["Low", "Normal", "High", "Custom"].map((tier) => (
            <button
              type="button"
              key={tier}
              onClick={() => setCapacityTier(tier)}
              className={`py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                capacityTier === tier
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Custom Weight Field */}
        {capacityTier === "Custom" && (
          <div className="mt-2 mb-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <span>Custom Weight multiplier (0.25x - 8.0x):</span>
              <span className="text-white font-bold">{customWeight}x</span>
            </div>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="8"
              value={customWeight}
              onChange={(e) => setCustomWeight(e.target.value)}
              className="w-full px-2 py-1 bg-[#111827] border border-[#24334D] rounded text-xs font-mono text-white outline-none"
            />
            {weightValidation.error && (
              <p className="text-[10px] text-rose-400 mt-1 font-mono">
                {weightValidation.error}
              </p>
            )}
          </div>
        )}

        {/* Live Muted Preview */}
        <p className="text-[10px] text-slate-400 font-mono mt-1 leading-tight">
          {capacityTier} capacity at {resolution} resolution:{" "}
          <strong className="text-emerald-400">{calculatedVnodes} virtual nodes</strong>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1F293D]">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isFormValid && !isSubmitting
              ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-blue-300" />
              <span>Adding...</span>
            </>
          ) : (
            <span>Confirm</span>
          )}
        </button>
      </div>
    </form>
  );
};
