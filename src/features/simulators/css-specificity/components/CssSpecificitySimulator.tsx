"use client";

import { BrowserChromeBar } from "@/components/shared/simulator-chrome/BrowserChromeBar";
import { PanelHeader } from "@/components/shared/simulator-chrome/PanelHeader";
import { SimulatorControls } from "@/components/shared/simulator-chrome/SimulatorControls";

import { useCssSpecificitySimulator } from "../hooks/useCssSpecificitySimulator";
import { ExecutionFlowBar } from "./ExecutionFlowBar";
import { ReferenceSection } from "./ReferenceSection";
import { StageCardsRow } from "./StageCardsRow";

export function CssSpecificitySimulator() {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    autoplay,
    speed,
    setSpeed,
    frame,
    play,
    pause,
    step,
    stepBack,
    restart,
    toggleAutoplay,
  } = useCssSpecificitySimulator();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {`Step ${currentStep} of ${totalSteps}: ${frame.description}`}
      </span>

      <BrowserChromeBar />
      <PanelHeader currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      <div className="flex flex-col gap-2.5 p-4">
        <StageCardsRow stageStatuses={frame.stageStatuses} />
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
