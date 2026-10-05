/**
 * Calculates standard deviation of key counts across all active nodes
 */
export const calculateStdDev = (keysPerNode = {}, mean = 0) => {
  const counts = Object.values(keysPerNode);
  if (counts.length === 0) return 0;
  
  const sumSquaredDiffs = counts.reduce((acc, count) => {
    const diff = count - mean;
    return acc + diff * diff;
  }, 0);

  return Math.sqrt(sumSquaredDiffs / counts.length);
};

/**
 * Calculates Max / Mean ratio formatted to 2 decimals
 */
export const calculateMaxMeanRatio = (maxKeys = 0, meanKeys = 1) => {
  if (!meanKeys || meanKeys <= 0) return 1.0;
  return maxKeys / meanKeys;
};

/**
 * Calculates cumulative keys moved up to the given step index
 */
export const calculateCumulativeMoved = (steps = [], currentStepIdx = 0) => {
  let sum = 0;
  const targetIdx = Math.min(currentStepIdx, steps.length - 1);
  for (let i = 0; i <= targetIdx; i++) {
    sum += steps[i]?.stats?.remappedKeysCount || 0;
  }
  return sum;
};

/**
 * Validates Add Server input against current active servers
 */
export const validateAdd = (serverIdInput, activeServers = []) => {
  if (serverIdInput === "" || serverIdInput === undefined || serverIdInput === null) {
    return { isValid: false, error: null }; // Disabled, but no error shown yet
  }

  const id = Number(serverIdInput);
  if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
    return { isValid: false, error: "Server ID must be a positive integer" };
  }

  if (activeServers.includes(id)) {
    return { isValid: false, error: `Server ${id} already exists` };
  }

  if (activeServers.length >= 10000) {
    return { isValid: false, error: "Server count cannot exceed 10,000" };
  }

  return { isValid: true, error: null };
};

/**
 * Validates Remove Server selection against current active servers
 */
export const validateRemove = (serverIdInput, activeServers = []) => {
  if (activeServers.length <= 1) {
    return { isValid: false, error: "At least one server must remain" };
  }

  if (serverIdInput === "" || serverIdInput === undefined || serverIdInput === null) {
    return { isValid: false, error: null }; // Disabled, no selection
  }

  const id = Number(serverIdInput);
  if (!activeServers.includes(id)) {
    return { isValid: false, error: `Server ${id} is not active` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates custom weight input
 */
export const validateCustomWeight = (weightInput) => {
  const w = Number(weightInput);
  if (isNaN(w) || w < 0.25 || w > 8.0) {
    return { isValid: false, error: "Weight must be between 0.25 and 8" };
  }
  return { isValid: true, error: null };
};
