"use client";

import { BrowserChromeBar } from "@/components/shared/simulator-chrome/BrowserChromeBar";
import { PanelHeader } from "@/components/shared/simulator-chrome/PanelHeader";
import { ScenarioSwitcher } from "@/components/shared/simulator-chrome/ScenarioSwitcher";
import { SimulatorControls } from "@/components/shared/simulator-chrome/SimulatorControls";
import type { SimulatorRootProps } from "@/components/shared/simulator-chrome/types";

import { useCssSpecificitySimulator } from "../hooks/useCssSpecificitySimulator";
import { ExecutionFlowBar } from "./ExecutionFlowBar";
import { ReferenceSection } from "./ReferenceSection";
import { StageCardsRow } from "./StageCardsRow";

export function CssSpecificitySimulator({
  showScenarioSwitcher,
  onReachedEnd,
}: SimulatorRootProps = {}) {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    autoplay,
    speed,
    setSpeed,
    frame,
    scenario,
    scenarios,
    activeScenarioId,
    setScenario,
    play,
    pause,
    step,
    stepBack,
    restart,
    toggleAutoplay,
  } = useCssSpecificitySimulator({ onReachedEnd });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {`Step ${currentStep} of ${totalSteps}: ${frame.description}`}
      </span>

      <BrowserChromeBar />
      <PanelHeader currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      <div className="flex flex-col gap-2.5 p-4">
        {showScenarioSwitcher && (
          <ScenarioSwitcher
            scenarios={scenarios}
            activeId={activeScenarioId}
            onChange={setScenario}
          />
        )}
        <StageCardsRow
          stageStatuses={frame.stageStatuses}
          selectors={scenario.selectors}
          winner={scenario.winner}
          elementHtml={scenario.elementHtml}
          captionSubtexts={scenario.captionSubtexts}
        />
        <ExecutionFlowBar currentStep={currentStep} />
        <ReferenceSection />
      </div>

      <SimulatorControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        autoplay={autoplay}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onStep={step}
        onStepBack={stepBack}
        onRestart={restart}
        onToggleAutoplay={toggleAutoplay}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
