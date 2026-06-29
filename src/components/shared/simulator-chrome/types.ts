export type SimulatorSpeed = 0.5 | 1 | 1.5 | 2;

// Shared props every simulator root accepts so a host (the homepage Hero or the
// concept-page Simulate tab) can opt into the "full" behaviours. Both are off by
// default, so the homepage Hero keeps its original single-scenario, untracked
// behaviour by simply rendering <XSimulator /> with no props.
export type SimulatorRootProps = {
  /** Show the scenario switcher above the simulator (Simulate tab only). */
  showScenarioSwitcher?: boolean;
  /** Fired when the user reaches the final frame — used to track completion. */
  onReachedEnd?: () => void;
};

// A selectable scenario for the scenario switcher. Each simulator's data layer
// exposes a list of these (id + human label); the rest of the scenario payload
// stays internal to that simulator.
export type ScenarioOption = {
  id: string;
  label: string;
};
