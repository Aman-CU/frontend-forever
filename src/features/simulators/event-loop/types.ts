export type PanelTheme = "premium" | "success" | "info" | "streak";

export type PanelItem = {
  code: string;
  status: string;
};

export type SimulatorFrame = {
  step: number;
  callStack: PanelItem[];
  webAPIs: PanelItem[];
  microtaskQueue: PanelItem[];
  taskQueue: PanelItem[];
  // The console output so far, as a list of scenario-defined tokens. Each token
  // is looked up in the active scenario's executionOrderByOutput map for its
  // display label + colour — so a frame never has to repeat that styling.
  consoleOutput: string[];
  activeCodeLines: number[];
  description: string;
};

export type ExecutionOrderEntry = {
  code: string;
  theme: PanelTheme;
};

// Syntax colours for the data-driven code panel. Each maps to one design token
// class in CodePanel — no raw colours anywhere.
export type CodeColor = "fn" | "str" | "num" | "plain";

export type CodeToken = {
  text: string;
  color?: CodeColor;
};

export type CodeLine = {
  tokens: CodeToken[];
  /** Indent level (each level is one nested block). Blank lines have no tokens. */
  indent?: number;
};

// A selectable Event Loop scenario. The code, the authored frames, the output
// lookup map, and the insight callout all differ per scenario; the panel layout
// and controls are shared.
export type EventLoopScenario = {
  id: string;
  label: string;
  code: CodeLine[];
  frames: SimulatorFrame[];
  executionOrderByOutput: Record<string, ExecutionOrderEntry>;
  insight: { title: string; body: string };
};
