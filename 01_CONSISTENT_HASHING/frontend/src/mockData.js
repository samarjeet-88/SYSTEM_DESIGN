import { STRATEGY_KEYS } from "./constants";

/**
 * Generates realistic keysPerNode distribution
 */
const generateKeyDistribution = (activeServers, totalKeys, strategyType, stepIdx) => {
  const map = {};
  const N = activeServers.length;
  const mean = totalKeys / N;

  activeServers.forEach((serverId, idx) => {
    let varianceFactor = 1.0;
    
    if (strategyType === STRATEGY_KEYS.NAIVE) {
      // High variance, some hotspots
      varianceFactor = 0.6 + ((serverId * 17) % 80) / 100;
    } else if (strategyType === STRATEGY_KEYS.CIRCULAR) {
      // Classic ring clustering / hotspots
      if (serverId === 11 || serverId === 23) {
        varianceFactor = 2.4; // Hotspot neighbor
      } else if (serverId === 10 || serverId === 24) {
        varianceFactor = 0.4;
      } else {
        varianceFactor = 0.7 + ((serverId * 31) % 60) / 100;
      }
    } else {
      // Virtual nodes: tightly distributed around ideal
      if (serverId === 42) {
        varianceFactor = 2.0; // High capacity 2x weight
      } else {
        varianceFactor = 0.92 + ((serverId * 13) % 16) / 100;
      }
    }

    map[serverId] = Math.max(10, Math.round(mean * varianceFactor));
  });

  // Normalize sum to totalKeys
  const currentSum = Object.values(map).reduce((a, b) => a + b, 0);
  const scale = totalKeys / currentSum;
  let maxKeys = 0;
  
  Object.keys(map).forEach((k) => {
    map[k] = Math.round(map[k] * scale);
    if (map[k] > maxKeys) maxKeys = map[k];
  });

  return { keysPerNode: map, maxKeysOnNode: maxKeys, meanKeysPerNode: Number(mean.toFixed(2)) };
};

/**
 * Creates step data matching the screenshot
 */
export const createMockSimulation = (servers = 40, keys = 10000, resolutionVnodes = 50) => {
  const baseServers = Array.from({ length: servers }, (_, i) => i + 1);

  // Step 0: INIT
  const initNaive = generateKeyDistribution(baseServers, keys, STRATEGY_KEYS.NAIVE, 0);
  const initRing = generateKeyDistribution(baseServers, keys, STRATEGY_KEYS.CIRCULAR, 0);
  const initVirtual = generateKeyDistribution(baseServers, keys, STRATEGY_KEYS.VIRTUAL, 0);

  const step0 = {
    naive: {
      step: 0,
      operation: "INIT",
      servers: servers,
      activeServers: [...baseServers],
      stats: { ...initNaive, remappedKeysCount: 0, fractionRemapped: 0 }
    },
    circular: {
      step: 0,
      operation: "INIT",
      servers: servers,
      activeServers: [...baseServers],
      stats: { ...initRing, remappedKeysCount: 0, fractionRemapped: 0 }
    },
    virtual: {
      step: 0,
      operation: "INIT",
      servers: servers,
      activeServers: [...baseServers],
      stats: { ...initVirtual, remappedKeysCount: 0, fractionRemapped: 0 }
    }
  };

  // Step 1: ADD 41
  const servers1 = [...baseServers, 41];
  const d1Naive = generateKeyDistribution(servers1, keys, STRATEGY_KEYS.NAIVE, 1);
  const d1Ring = generateKeyDistribution(servers1, keys, STRATEGY_KEYS.CIRCULAR, 1);
  const d1Virtual = generateKeyDistribution(servers1, keys, STRATEGY_KEYS.VIRTUAL, 1);

  const step1 = {
    naive: {
      step: 1,
      operation: "ADD 41",
      servers: 41,
      activeServers: servers1,
      stats: { ...d1Naive, remappedKeysCount: 9756, fractionRemapped: 0.9756 }
    },
    circular: {
      step: 1,
      operation: "ADD 41",
      servers: 41,
      activeServers: servers1,
      stats: { ...d1Ring, remappedKeysCount: 244, fractionRemapped: 0.0244 }
    },
    virtual: {
      step: 1,
      operation: "ADD 41",
      servers: 41,
      activeServers: servers1,
      stats: { ...d1Virtual, remappedKeysCount: 244, fractionRemapped: 0.0244 }
    }
  };

  // Step 2: ADD 42 (High capacity 2x)
  const servers2 = [...servers1, 42];
  const d2Naive = generateKeyDistribution(servers2, keys, STRATEGY_KEYS.NAIVE, 2);
  const d2Ring = generateKeyDistribution(servers2, keys, STRATEGY_KEYS.CIRCULAR, 2);
  const d2Virtual = generateKeyDistribution(servers2, keys, STRATEGY_KEYS.VIRTUAL, 2);

  const step2 = {
    naive: {
      step: 2,
      operation: "ADD 42",
      servers: 42,
      activeServers: servers2,
      stats: { ...d2Naive, remappedKeysCount: 9762, fractionRemapped: 0.9762 }
    },
    circular: {
      step: 2,
      operation: "ADD 42",
      servers: 42,
      activeServers: servers2,
      stats: { ...d2Ring, remappedKeysCount: 238, fractionRemapped: 0.0238 }
    },
    virtual: {
      step: 2,
      operation: "ADD 42",
      servers: 42,
      activeServers: servers2,
      stats: { ...d2Virtual, remappedKeysCount: 476, fractionRemapped: 0.0476 }
    }
  };

  // Step 3: REMOVE 10 (Targeted for Evict - exactly as in screenshot!)
  const servers3 = servers2.filter((id) => id !== 10);
  const d3Naive = generateKeyDistribution(servers3, keys, STRATEGY_KEYS.NAIVE, 3);
  const d3Ring = generateKeyDistribution(servers3, keys, STRATEGY_KEYS.CIRCULAR, 3);
  const d3Virtual = generateKeyDistribution(servers3, keys, STRATEGY_KEYS.VIRTUAL, 3);

  // Match screenshot stats for Step 3:
  d3Naive.maxKeysOnNode = 624;
  d3Ring.maxKeysOnNode = 959;
  d3Virtual.maxKeysOnNode = 278;

  const step3 = {
    naive: {
      step: 3,
      operation: "REMOVE 10",
      servers: 41,
      activeServers: servers3,
      stats: { ...d3Naive, remappedKeysCount: 9744, fractionRemapped: 0.9744 }
    },
    circular: {
      step: 3,
      operation: "REMOVE 10",
      servers: 41,
      activeServers: servers3,
      stats: { ...d3Ring, remappedKeysCount: 256, fractionRemapped: 0.0256 }
    },
    virtual: {
      step: 3,
      operation: "REMOVE 10",
      servers: 41,
      activeServers: servers3,
      stats: { ...d3Virtual, remappedKeysCount: 256, fractionRemapped: 0.0256 }
    }
  };

  // Step 4: ADD 43
  const servers4 = [...servers3, 43];
  const d4Naive = generateKeyDistribution(servers4, keys, STRATEGY_KEYS.NAIVE, 4);
  const d4Ring = generateKeyDistribution(servers4, keys, STRATEGY_KEYS.CIRCULAR, 4);
  const d4Virtual = generateKeyDistribution(servers4, keys, STRATEGY_KEYS.VIRTUAL, 4);

  const step4 = {
    naive: {
      step: 4,
      operation: "ADD 43",
      servers: 42,
      activeServers: servers4,
      stats: { ...d4Naive, remappedKeysCount: 9762, fractionRemapped: 0.9762 }
    },
    circular: {
      step: 4,
      operation: "ADD 43",
      servers: 42,
      activeServers: servers4,
      stats: { ...d4Ring, remappedKeysCount: 238, fractionRemapped: 0.0238 }
    },
    virtual: {
      step: 4,
      operation: "ADD 43",
      servers: 42,
      activeServers: servers4,
      stats: { ...d4Virtual, remappedKeysCount: 238, fractionRemapped: 0.0238 }
    }
  };

  return {
    naive: [step0.naive, step1.naive, step2.naive, step3.naive, step4.naive],
    circular: [step0.circular, step1.circular, step2.circular, step3.circular, step4.circular],
    virtual: [step0.virtual, step1.virtual, step2.virtual, step3.virtual, step4.virtual]
  };
};
