import { CheckCircle2, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  nodes: RoadmapNodeView[];
  onSelectNode: (node: RoadmapNodeView) => void;
};

// A pan/zoom canvas is a poor fit under ~768px — this renders the same
// node data as a simple grouped, scrollable list instead of forcing canvas
// gestures on a touch viewport. Sections become group headers; root-level
// topics with no section (the 4 skill-based roadmaps) render as one flat
// list under an implicit group.
export function RoadmapMobileList({ nodes, onSelectNode }: Props) {
  const sections = nodes.filter((n) => n.nodeType === "section");
  const topicsByParent = new Map<string | null, RoadmapNodeView[]>();
  for (const node of nodes) {
    if (node.nodeType !== "topic") continue;
    const list = topicsByParent.get(node.parentId) ?? [];
    list.push(node);
    topicsByParent.set(node.parentId, list);
  }

  const groups = sections.length
    ? sections.map((section) => ({ id: section.id, title: section.title, topics: topicsByParent.get(section.id) ?? [] }))
    : [{ id: null, title: null, topics: topicsByParent.get(null) ?? [] }];

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-6">
      {groups.map((group) => (
        <div key={group.id ?? "root"}>
          {group.title && (
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {group.title}
            </h2>
          )}
          <ul className="space-y-2">
            {group.topics.map((topic) => (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => onSelectNode(topic)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-left shadow-sm",
                    topic.isCompleted ? "border-success/50 bg-success-muted/40" : "border-border",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {topic.isCompleted && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                    )}
                    <span className="truncate text-sm font-medium text-text-primary">{topic.title}</span>
                    {topic.isOptional && (
                      <span className="shrink-0 text-xs text-text-muted">Optional</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
