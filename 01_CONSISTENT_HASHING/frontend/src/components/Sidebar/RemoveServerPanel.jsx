import React, { useState, useMemo } from "react";
import { validateRemove } from "../../utils/mathUtils";
import { Loader2, Search, ChevronDown, Check } from "lucide-react";

export const RemoveServerPanel = ({
  latestActiveServers,
  totalKeys,
  onConfirm,
  onCancel,
  isSubmitting
}) => {
  // Sort active servers numerically
  const sortedServers = useMemo(() => {
    return [...latestActiveServers].sort((a, b) => a - b);
  }, [latestActiveServers]);

  const [selectedServer, setSelectedServer] = useState(sortedServers[0] ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filtered servers for searchable dropdown
  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) return sortedServers;
    return sortedServers.filter((id) => String(id).includes(searchQuery.trim()));
  }, [sortedServers, searchQuery]);

  // Validation
  const validation = validateRemove(selectedServer, latestActiveServers);
  const isFormValid = validation.isValid;

  const approxKeysPerServer = latestActiveServers.length > 0 
    ? Math.round(totalKeys / latestActiveServers.length) 
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    onConfirm({
      type: "REMOVE",
      server: Number(selectedServer)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3.5 bg-[#0B0F17] border border-rose-500/30 rounded-lg shadow-inner animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-rose-400 font-mono">
          TARGET SERVER FOR REMOVAL
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">
          {latestActiveServers.length} active
        </span>
      </div>

      {/* Searchable Dropdown */}
      <div className="mb-3 relative">
        <label className="block text-[11px] text-slate-300 mb-1 font-medium">
          Select active server
        </label>

        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#111827] border border-[#24334D] hover:border-rose-500/50 rounded text-xs font-mono text-white text-left transition-colors cursor-pointer"
        >
          <span>
            {selectedServer ? (
              <>
                <strong className="text-rose-400">Server {selectedServer}</strong>{" "}
                <span className="text-slate-400">(Targeted for Evict)</span>
              </>
            ) : (
              <span className="text-slate-500">Choose a server...</span>
            )}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#111827] border border-[#24334D] rounded-md shadow-2xl overflow-hidden max-h-52 flex flex-col">
            {/* Search filter input */}
            <div className="p-2 border-b border-[#1F293D] flex items-center gap-2 bg-[#0D121D]">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Filter active servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-mono text-white placeholder-slate-500 outline-none"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto divide-y divide-[#1F293D]/40">
              {filteredServers.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 font-mono">
                  No matching active servers
                </div>
              ) : (
                filteredServers.map((id) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      setSelectedServer(id);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center justify-between transition-colors hover:bg-rose-950/40 cursor-pointer ${
                      selectedServer === id ? "bg-rose-950/60 text-rose-300 font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>Server {id}</span>
                    {selectedServer === id && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected server description */}
        {selectedServer && (
          <p className="text-[10px] text-slate-400 font-mono mt-1.5">
            Server {selectedServer} active (evicts ~{approxKeysPerServer.toLocaleString()} keys)
          </p>
        )}

        {validation.error && (
          <p className="text-[10px] text-rose-400 mt-1 font-mono">
            {validation.error}
          </p>
        )}
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
              ? "bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95 shadow-rose-600/20"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-rose-300" />
              <span>Evicting...</span>
            </>
          ) : (
            <span>Confirm</span>
          )}
        </button>
      </div>
    </form>
  );
};
