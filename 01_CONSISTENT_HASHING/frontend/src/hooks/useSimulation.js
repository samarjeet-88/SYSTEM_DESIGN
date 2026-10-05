import { useState, useEffect, useRef, useCallback } from "react";
import { STRATEGY_KEYS, RESOLUTION_VNODES } from "../constants";
import { fetchSimulationRun } from "../api";

const DEFAULT_OPERATIONS = ["ADD 41", "ADD 42", "REMOVE 10", "ADD 43"];

export const useSimulation = (initialSettings = { servers: 40, keys: 10000, resolution: "Medium" }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [operations, setOperations] = useState(DEFAULT_OPERATIONS);
  const [runData, setRunData] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const playbackTimerRef = useRef(null);

  const stopPlayback = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const loadSimulation = useCallback(async (customSettings, customOps) => {
    stopPlayback();
    setIsLoading(true);
    setError(null);

    const s = customSettings || settings;
    const ops = customOps || operations;
    const resVnodes = RESOLUTION_VNODES[s.resolution] || 50;

    try {
      const data = await fetchSimulationRun({
        servers: s.servers,
        keys: s.keys,
        operations: ops,
        resolutionVnodes: resVnodes
      });
      setRunData(data);
      setCurrentStepIdx(0);
    } catch (err) {
      setError(err.message || "Failed to load simulation");
    } finally {
      setIsLoading(false);
    }
  }, [settings, operations, stopPlayback]);

  // Initial load
  useEffect(() => {
    loadSimulation();
    return () => {
      stopPlayback();
    };
  }, []);

  // Play button: calls backend simulation with the current operations, then plays through steps
  const play = useCallback(async () => {
    stopPlayback();
    setIsPlaying(true);
    setError(null);

    const resVnodes = RESOLUTION_VNODES[settings.resolution] || 50;

    try {
      // Call backend simulation endpoint
      const data = await fetchSimulationRun({
        servers: settings.servers,
        keys: settings.keys,
        operations,
        resolutionVnodes: resVnodes
      });

      setRunData(data);
      const totalSteps = data?.[STRATEGY_KEYS.NAIVE]?.length || 1;

      // Start stepping through from step 0
      let step = 0;
      setCurrentStepIdx(0);

      playbackTimerRef.current = setInterval(() => {
        step += 1;
        if (step >= totalSteps) {
          stopPlayback();
          setCurrentStepIdx(totalSteps - 1);
        } else {
          setCurrentStepIdx(step);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Simulation request failed");
      setIsPlaying(false);
    }
  }, [settings, operations, stopPlayback]);

  // Reset button: resets operations to empty list, applies current settings, loads initial step
  const reset = useCallback((newSettings) => {
    stopPlayback();
    const updated = newSettings || settings;
    if (newSettings) {
      setSettings(newSettings);
    }
    setOperations([]);
    loadSimulation(updated, []);
  }, [settings, stopPlayback, loadSimulation]);

  // Add an operation from OperationComposer
  const addOperation = useCallback((type, server, tier = "MEDIUM") => {
    const opString = tier && tier !== "MEDIUM" && type === "ADD" 
      ? `${type} ${server} ${tier}`
      : `${type} ${server}`;

    setOperations((prev) => [...prev, opString]);
  }, []);

  // Delete an operation from the queue
  const deleteOperation = useCallback((index) => {
    setOperations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  // Current active servers calculation
  const currentSteps = runData ? {
    [STRATEGY_KEYS.NAIVE]: runData[STRATEGY_KEYS.NAIVE]?.[currentStepIdx] || null,
    [STRATEGY_KEYS.CIRCULAR]: runData[STRATEGY_KEYS.CIRCULAR]?.[currentStepIdx] || null,
    [STRATEGY_KEYS.VIRTUAL]: runData[STRATEGY_KEYS.VIRTUAL]?.[currentStepIdx] || null
  } : null;

  const latestActiveServers = runData?.[STRATEGY_KEYS.NAIVE]?.[runData[STRATEGY_KEYS.NAIVE].length - 1]?.activeServers 
    || Array.from({ length: settings.servers }, (_, i) => i + 1);

  return {
    settings,
    setSettings,
    operations,
    runData,
    currentStepIdx,
    setCurrentStepIdx,
    currentSteps,
    latestActiveServers,
    isPlaying,
    isLoading,
    error,
    play,
    reset,
    addOperation,
    deleteOperation,
    applyOperation: addOperation,
    totalSteps: runData?.[STRATEGY_KEYS.NAIVE]?.length || 0
  };
};
