import React from "react";
import { RESOLUTION_VNODES } from "../../constants";

export const SettingsPanel = ({ settings, onSettingChange, currentActiveCount }) => {
  const currentResolutionVnodes = RESOLUTION_VNODES[settings.resolution] || 50;

  return (
    <div className="p-4 bg-[#111827] border border-[#1F293D] rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
          1. SIMULATION SETTINGS
        </h3>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
          SYNCED
        </span>
      </div>

      {/* Initial Servers Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-300 font-medium">Initial servers</span>
          <span className="font-mono text-white font-semibold">
            {settings.servers}{" "}
            <span className="text-slate-400 font-normal">
              ({currentActiveCount ?? settings.servers} active)
            </span>
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="128"
          step="1"
          value={settings.servers}
          onChange={(e) => onSettingChange("servers", Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>20</span>
          <span className="text-slate-400 italic">(applies on Reset)</span>
          <span>128</span>
        </div>
      </div>

      {/* Total Keys Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-300 font-medium">Total Keys</span>
          <span className="font-mono text-white font-semibold">
            {settings.keys.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={settings.keys}
          onChange={(e) => onSettingChange("keys", Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>1,000</span>
          <span className="text-slate-400">Linear scale</span>
          <span>100,000</span>
        </div>
      </div>

      {/* Resolution Segmented Control */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-300 font-medium">Resolution</span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            Virtual nodes only
          </span>
        </div>

        {/* Segmented Control Buttons */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0F17] rounded-md border border-[#1F293D] mb-2">
          {["Low", "Medium", "High"].map((level) => {
            const isSelected = settings.resolution === level;
            return (
              <button
                key={level}
                onClick={() => onSettingChange("resolution", level)}
                className={`py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1E293B] text-white shadow-sm font-semibold border border-slate-600"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* Muted Helper Text */}
        <div className="text-[11px] text-slate-400 leading-tight space-y-1">
          <p className="font-mono text-slate-300">
            {settings.resolution}: <strong className="text-emerald-400">{currentResolutionVnodes}</strong> virtual nodes per normal server
          </p>
          <p className="text-slate-500 text-[10px]">
            Higher resolution spreads load more evenly but uses more ring entries.
          </p>
        </div>
      </div>
    </div>
  );
};
