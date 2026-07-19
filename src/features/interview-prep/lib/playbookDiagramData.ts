import type { FlowEdge, FlowNode } from "@/features/interview-prep/components/diagrams/rough/FlowDiagram";

export type DiagramSpec = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  ariaLabel: string;
  columns?: number;
};

// Feature 50's 3 diagram chapters (build-plan.md's architect-session
// decision: only chapters that are genuinely a process/structure, not every
// chapter — most Playbook content is prose-shaped). Reuses Feature 49's
// generic FlowDiagram primitive, no new diagram component. Keyed by
// "playbookSlug/chapterSlug" since chapterSlug alone isn't globally unique.
export const PLAYBOOK_DIAGRAMS: Record<string, DiagramSpec> = {
  "frontend-interview-playbook/the-five-interview-formats": {
    ariaLabel:
      "A single frontend interview loop branches into 5 formats: coding, UI coding, system design, quiz-style trivia, and behavioral.",
    columns: 3,
    nodes: [
      { id: "loop", label: ["Interview Loop"] },
      { id: "coding", label: ["Coding"] },
      { id: "ui", label: ["UI Coding"] },
      { id: "system-design", label: ["System Design"] },
      { id: "quiz", label: ["Quiz / Trivia"] },
      { id: "behavioral", label: ["Behavioral"] },
    ],
    edges: [
      ["loop", "coding"],
      ["loop", "ui"],
      ["loop", "system-design"],
      ["loop", "quiz"],
      ["loop", "behavioral"],
    ],
  },
  "behavioural-interview-playbook/the-star-method-done-properly": {
    ariaLabel:
      "The STAR method flows in order: Situation, then Task, then Action, then Result.",
    columns: 4,
    nodes: [
      { id: "situation", label: ["Situation"] },
      { id: "task", label: ["Task"] },
      { id: "action", label: ["Action"] },
      { id: "result", label: ["Result"] },
    ],
    edges: [
      ["situation", "task"],
      ["task", "action"],
      ["action", "result"],
    ],
  },
  "frontend-system-design-playbook/a-repeatable-framework-for-frontend-system-design": {
    ariaLabel:
      "A repeatable frontend system design framework flows in order: Requirements, then Data Model, then Component Architecture, then Performance, then Tradeoffs.",
    columns: 5,
    nodes: [
      { id: "requirements", label: ["Requirements"] },
      { id: "data-model", label: ["Data Model"] },
      { id: "architecture", label: ["Component", "Architecture"] },
      { id: "performance", label: ["Performance"] },
      { id: "tradeoffs", label: ["Tradeoffs"] },
    ],
    edges: [
      ["requirements", "data-model"],
      ["data-model", "architecture"],
      ["architecture", "performance"],
      ["performance", "tradeoffs"],
    ],
  },
};
