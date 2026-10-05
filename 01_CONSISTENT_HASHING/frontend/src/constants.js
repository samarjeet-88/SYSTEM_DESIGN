export const STRATEGY_KEYS = {
  NAIVE: "naive",
  CIRCULAR: "circular",
  VIRTUAL: "virtual"
};

export const RESOLUTION_VNODES = {
  Low: 10,
  Medium: 50,
  High: 150
};

export const CAPACITY_WEIGHTS = {
  Low: 0.5,
  Normal: 1.0,
  High: 2.0
};

export const STRATEGIES_META = {
  [STRATEGY_KEYS.NAIVE]: {
    id: STRATEGY_KEYS.NAIVE,
    number: "1",
    name: "Naive Hashing",
    badge: "hash(k) % N",
    subtitle: "Hash mod N",
    note: "Capacity ignored",
    color: "#F43F5E",
    bgAccent: "rgba(244, 63, 94, 0.1)",
    borderAccent: "#4C1D2B",
    barColor: "bg-rose-500",
    textColor: "text-rose-400"
  },
  [STRATEGY_KEYS.CIRCULAR]: {
    id: STRATEGY_KEYS.CIRCULAR,
    number: "2",
    name: "Consistent Ring",
    badge: "1 token / node",
    subtitle: "Hash ring",
    note: "Capacity ignored",
    color: "#F59E0B",
    bgAccent: "rgba(245, 158, 11, 0.1)",
    borderAccent: "#483515",
    barColor: "bg-amber-500",
    textColor: "text-amber-400"
  },
  [STRATEGY_KEYS.VIRTUAL]: {
    id: STRATEGY_KEYS.VIRTUAL,
    number: "3",
    name: "Virtual Nodes",
    badge: "weighted tokens",
    subtitle: "Hash ring with weighted virtual nodes",
    note: null, // dynamic based on resolution
    color: "#10B981",
    bgAccent: "rgba(16, 185, 129, 0.1)",
    borderAccent: "#1A4D3E",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-400"
  }
};
