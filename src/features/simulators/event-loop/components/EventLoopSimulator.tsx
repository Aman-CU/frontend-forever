"use client";

import { Lightbulb } from "lucide-react";

import { BrowserChromeBar } from "@/components/shared/simulator-chrome/BrowserChromeBar";
import { PanelHeader } from "@/components/shared/simulator-chrome/PanelHeader";
import { ScenarioSwitcher } from "@/components/shared/simulator-chrome/ScenarioSwitcher";
import { SimulatorControls } from "@/components/shared/simulator-chrome/SimulatorControls";
import type { SimulatorRootProps } from "@/components/shared/simulator-chrome/types";

import { useEventLoopSimulator } from "../hooks/useEventLoopSimulator";
import { CallStack } from "./CallStack";
import { CodePanel } from "./CodePanel";
import { ExecutionOrder } from "./ExecutionOrder";
import { MicrotaskQueue } from "./MicrotaskQueue";
import { OutputPanel } from "./OutputPanel";
import { TaskQueue } from "./TaskQueue";
import { WebAPIs } from "./WebAPIs";

export function EventLoopSimulator({
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
  } = useEventLoopSimulator({ onReachedEnd });

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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CallStack items={frame.callStack} />
          <WebAPIs items={frame.webAPIs} />
          <MicrotaskQueue items={frame.microtaskQueue} />
          <TaskQueue items={frame.taskQueue} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <CodePanel code={scenario.code} activeLines={frame.activeCodeLines} />
          </div>
          <div className="lg:col-span-1">
            <OutputPanel
              consoleOutput={frame.consoleOutput}
              executionOrderByOutput={scenario.executionOrderByOutput}
            />
          </div>
        </div>

        <ExecutionOrder
          consoleOutput={frame.consoleOutput}
          executionOrderByOutput={scenario.executionOrderByOutput}
        />
        <InsightCallout title={scenario.insight.title} body={scenario.insight.body} />
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
    <div className="flex items-start gap-2.5 rounded-lg border border-border-light bg-surface-secondary p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">{title}</span> {body}
      </p>
    </div>
  );
}
