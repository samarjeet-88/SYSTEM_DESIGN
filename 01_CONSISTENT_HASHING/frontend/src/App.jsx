import React from "react";
import { useSimulation } from "./hooks/useSimulation";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { StrategyColumn } from "./components/StrategyColumn/StrategyColumn";
import { TimelineChart } from "./components/TimelineChart/TimelineChart";
import { STRATEGY_KEYS } from "./constants";

export function App() {
  const {
    settings,
    setSettings,
    operations,
    runData,
    currentStepIdx,
    currentSteps,
    latestActiveServers,
    isPlaying,
    isLoading,
    error,
    play,
    reset,
    applyOperation,
    deleteOperation,
    totalSteps
  } = useSimulation();

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    reset(settings);
  };

  const currentNaiveStep = currentSteps?.[STRATEGY_KEYS.NAIVE];
  const activeCount = currentNaiveStep?.activeServers?.length ?? settings.servers;

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17] text-white select-none">
      {/* Top Header */}
      <Header
        currentStep={currentNaiveStep}
        totalServers={currentNaiveStep?.servers ?? settings.servers}
        activeCount={activeCount}
        totalKeys={settings.keys}
        currentStepIdx={currentStepIdx}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        onPlay={play}
        onReset={handleReset}
      />

      {/* Main Workspace: Sidebar + 3 Strategy Columns + Bottom Chart */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          settings={settings}
          onSettingChange={handleSettingChange}
          currentActiveCount={activeCount}
          latestActiveServers={latestActiveServers}
          totalKeys={settings.keys}
          isPlaying={isPlaying}
          onApplyOperation={applyOperation}
          operations={operations}
          currentStepIdx={currentStepIdx}
          onRemoveOperation={deleteOperation}
          error={error}
          onRetry={() => reset(settings)}
        />

        {/* Right Dashboard Area */}
        <main className="flex-1 flex flex-col p-4 gap-3.5 overflow-y-auto bg-[#0B0F17]">
          {/* Top: Three Strategy Columns */}
          {isLoading ? (
            /* Subtle Skeleton Placeholders */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 flex-1 min-h-[420px]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#111827] border border-[#1F293D] rounded-lg p-4 animate-pulse flex flex-col gap-3"
                >
                  <div className="h-5 w-1/2 bg-slate-800 rounded" />
                  <div className="h-20 bg-slate-900 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-14 bg-slate-900 rounded" />
                    <div className="h-14 bg-slate-900 rounded" />
                    <div className="h-14 bg-slate-900 rounded" />
                    <div className="h-14 bg-slate-900 rounded" />
                  </div>
                  <div className="mt-auto h-24 bg-slate-900 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 flex-1 items-stretch">
              {/* 1. Naive Hashing */}
              <StrategyColumn
                strategyId={STRATEGY_KEYS.NAIVE}
                stepData={currentSteps?.[STRATEGY_KEYS.NAIVE]}
                totalKeys={settings.keys}
                resolution={settings.resolution}
              />

              {/* 2. Consistent Ring */}
              <StrategyColumn
                strategyId={STRATEGY_KEYS.CIRCULAR}
                stepData={currentSteps?.[STRATEGY_KEYS.CIRCULAR]}
                totalKeys={settings.keys}
                resolution={settings.resolution}
              />

              {/* 3. Virtual Nodes */}
              <StrategyColumn
                strategyId={STRATEGY_KEYS.VIRTUAL}
                stepData={currentSteps?.[STRATEGY_KEYS.VIRTUAL]}
                totalKeys={settings.keys}
                resolution={settings.resolution}
              />
            </div>
          )}

          {/* Bottom: Timeline Graph */}
          {isLoading ? (
            <div className="h-44 bg-[#111827] border border-[#1F293D] rounded-lg p-4 animate-pulse" />
          ) : (
            <TimelineChart
              runData={runData}
              currentStepIdx={currentStepIdx}
              totalKeys={settings.keys}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
