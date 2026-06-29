import { useEffect, useRef, useState } from "react";

import type {
  ScenarioOption,
  SimulatorSpeed,
} from "@/components/shared/simulator-chrome/types";

import { EVENT_LOOP_SCENARIOS } from "../data/scenarios";
import type { EventLoopScenario, SimulatorFrame } from "../types";

const BASE_INTERVAL_MS = 1800;
const SCENARIO_OPTIONS: ScenarioOption[] = EVENT_LOOP_SCENARIOS.map((s) => ({
  id: s.id,
  label: s.label,
}));

type UseEventLoopSimulatorOptions = {
  /** Fired each time the simulator reaches its final frame (a full play-through). */
  onReachedEnd?: () => void;
};

type UseEventLoopSimulatorResult = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  autoplay: boolean;
  speed: SimulatorSpeed;
  setSpeed: (speed: SimulatorSpeed) => void;
  frame: SimulatorFrame;
  scenario: EventLoopScenario;
  scenarios: ScenarioOption[];
  activeScenarioId: string;
  setScenario: (id: string) => void;
  play: () => void;
  pause: () => void;
  step: () => void;
  stepBack: () => void;
  restart: () => void;
  toggleAutoplay: () => void;
};

export function useEventLoopSimulator(
  { onReachedEnd }: UseEventLoopSimulatorOptions = {},
): UseEventLoopSimulatorResult {
  const [activeScenarioId, setActiveScenarioId] = useState(EVENT_LOOP_SCENARIOS[0].id);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [speed, setSpeed] = useState<SimulatorSpeed>(1);

  const scenario =
    EVENT_LOOP_SCENARIOS.find((s) => s.id === activeScenarioId) ?? EVENT_LOOP_SCENARIOS[0];
  const frames = scenario.frames;
  const totalSteps = frames.length;

  const onReachedEndRef = useRef(onReachedEnd);
  useEffect(() => {
    onReachedEndRef.current = onReachedEnd;
  });

  useEffect(() => {
    if (currentStep === totalSteps) {
      onReachedEndRef.current?.();
    }
  }, [currentStep, totalSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const id = setTimeout(() => {
      if (currentStep === totalSteps) {
        if (autoplay) {
          setCurrentStep(1);
        } else {
          setIsPlaying(false);
        }
        return;
      }
      setCurrentStep((step) => step + 1);
    }, BASE_INTERVAL_MS / speed);

    return () => clearTimeout(id);
  }, [isPlaying, currentStep, speed, autoplay, totalSteps]);

  function setScenario(id: string) {
    setActiveScenarioId(id);
    setCurrentStep(1);
    setIsPlaying(false);
  }

  function play() {
    setCurrentStep((step) => (step === totalSteps ? 1 : step));
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  function step() {
    setIsPlaying(false);
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  }

  function stepBack() {
    setIsPlaying(false);
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  function restart() {
    setIsPlaying(false);
    setCurrentStep(1);
  }

  function toggleAutoplay() {
    setAutoplay((value) => !value);
  }

  return {
    currentStep,
    totalSteps,
    isPlaying,
    autoplay,
    speed,
    setSpeed,
    frame: frames[currentStep - 1],
    scenario,
    scenarios: SCENARIO_OPTIONS,
    activeScenarioId,
    setScenario,
    play,
    pause,
    step,
    stepBack,
    restart,
    toggleAutoplay,
  };
}
