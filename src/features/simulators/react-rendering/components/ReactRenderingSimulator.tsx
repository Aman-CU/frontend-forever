"use client";

import { Lightbulb } from "lucide-react";

import { BrowserChromeBar } from "@/components/shared/simulator-chrome/BrowserChromeBar";
import { PanelHeader } from "@/components/shared/simulator-chrome/PanelHeader";
import { ScenarioSwitcher } from "@/components/shared/simulator-chrome/ScenarioSwitcher";
import { SimulatorControls } from "@/components/shared/simulator-chrome/SimulatorControls";
import type { SimulatorRootProps } from "@/components/shared/simulator-chrome/types";

import { useReactRenderingSimulator } from "../hooks/useReactRenderingSimulator";
import { ExecutionFlowBar } from "./ExecutionFlowBar";
import { StageCardsRow } from "./StageCardsRow";

export function ReactRenderingSimulator({
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
  } = useReactRenderingSimulator({ onReachedEnd });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {`Step ${currentStep} of ${totalSteps}: ${frame.description}`}
      </span>

      <BrowserChromeBar />
      <PanelHeader currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      <div className="flex flex-col gap-3 p-4">
        {showScenarioSwitcher && (
          <ScenarioSwitcher
            scenarios={scenarios}
            activeId={activeScenarioId}
            onChange={setScenario}
          />
        )}
        <StageCardsRow
          kind={scenario.kind}
          cardStatuses={frame.cardStatuses}
          componentStateCount={frame.componentStateCount}
          realDomCount={frame.realDomCount}
          targetCount={scenario.targetCount}
          componentLabel={scenario.componentLabel}
          stateLabel={scenario.stateLabel}
          clickLabel={scenario.clickLabel}
          childLabel={scenario.childLabel}
          captionSubtexts={scenario.captionSubtexts}
          isPlaying={isPlaying}
          onIncrement={play}
        />
        <InsightCallout title={scenario.insight.title} body={scenario.insight.body} />
        <ExecutionFlowBar currentStep={currentStep} actionLabel={`Click ${scenario.clickLabel}`} />
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

function InsightCallout({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border-light bg-accent-light p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">{title}</span> {body}
      </p>
    </div>
  );
}
