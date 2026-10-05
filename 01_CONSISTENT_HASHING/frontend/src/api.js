import { STRATEGY_KEYS } from "./constants";
import { createMockSimulation } from "./mockData";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Fetches the simulation run for the given settings and operations
 */
export const fetchSimulationRun = async ({
  servers = 40,
  keys = 10000,
  operations = ["ADD 41", "ADD 42", "REMOVE 10", "ADD 43"],
  resolutionVnodes = 50
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        servers: Number(servers),
        keys: Number(keys),
        seed: 42,
        operations: Array.isArray(operations) ? operations : []
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data[STRATEGY_KEYS.NAIVE]) {
        return data.data;
      }
    } else {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `Server responded with status ${response.status}`);
    }
  } catch (err) {
    console.warn("Backend error / unreachable, using mock data fallback:", err.message);
    return createMockSimulation(servers, keys, resolutionVnodes);
  }
};
