"use client";

import { Fragment, useMemo } from "react";

import { buildFlowRows } from "@/features/roadmaps/lib/flowLayout";
import { useFlowConnectors } from "@/features/roadmaps/hooks/useFlowConnectors";
import { RoadmapSpineNode } from "@/features/roadmaps/components/RoadmapSpineNode";
import { RoadmapBranchPill } from "@/features/roadmaps/components/RoadmapBranchPill";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  nodes: RoadmapNodeView[];
  onSelectNode: (node: RoadmapNodeView) => void;
};

// A static, roadmap.sh-style flow diagram — a single vertical spine read
// top to bottom (no pan/zoom, just the normal page scroll), with each
// section's real content branching off to alternating sides on a dotted
// curve. Replaces the earlier pan/zoom canvas entirely (see
// ui-registry.md's Roadmaps section): a hand-authored 2D canvas with drag/
// zoom gestures read as a worse fit for this content than a page that just
// scrolls, and doesn't match the reference product this feature is modeled
// on in the first place.
export function RoadmapFlowDiagram({ nodes, onSelectNode }: Props) {
  // Memoized on `nodes`, not recomputed fresh every render — buildFlowRows
  // would otherwise return a new array identity each time, and the
  // measurement effect below re-runs whenever `rows` changes identity, so
  // an unmemoized call here becomes an infinite render loop (render → new
  // rows array → effect fires → setState → render → ...).
  const rows = useMemo(() => buildFlowRows(nodes), [nodes]);
  const { containerRef, spineRefs, branchRefs, size, paths } = useFlowConnectors(rows);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto grid max-w-4xl grid-cols-[1fr_auto_1fr] items-center gap-x-8 gap-y-10 py-10 md:gap-x-12 md:gap-y-14"
    >
      {rows.length > 0 && (
        <div
          aria-hidden
          className="pointer-events-none w-px self-stretch justify-self-center bg-border-muted"
          style={{ gridColumn: "2 / 3", gridRow: `1 / ${rows.length + 1}` }}
        />
      )}

      {size.width > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          {paths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              fill="none"
              className="stroke-border-muted"
              strokeWidth={1.5}
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}

      {rows.map((row, index) => {
        const gridRow = index + 1;

        if (row.kind === "topic") {
          return (
            <div key={row.node.id} style={{ gridColumn: "2 / 3", gridRow }}>
              <RoadmapSpineNode node={row.node} onSelect={onSelectNode} />
            </div>
          );
        }

        return (
          <Fragment key={row.node.id}>
            <div style={{ gridColumn: "2 / 3", gridRow }}>
              <RoadmapSpineNode
                ref={(el) => {
                  if (el) spineRefs.current.set(row.node.id, el);
                  else spineRefs.current.delete(row.node.id);
                }}
                node={row.node}
                onSelect={onSelectNode}
              />
            </div>
            {row.branches.length > 0 && (
              <div
                style={{ gridColumn: row.side === "right" ? "3 / 4" : "1 / 2", gridRow }}
                className={
                  row.side === "right"
                    ? "flex flex-col items-start gap-2 justify-self-start"
                    : "flex flex-col items-end gap-2 justify-self-end"
                }
              >
                {row.branches.map((branch) => (
                  <RoadmapBranchPill
                    key={branch.id}
                    ref={(el) => {
                      if (el) branchRefs.current.set(branch.id, el);
                      else branchRefs.current.delete(branch.id);
                    }}
                    node={branch}
                    onSelect={onSelectNode}
                  />
                ))}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
