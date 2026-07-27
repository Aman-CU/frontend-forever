"use client";

import { useState } from "react";

import { RoadmapFlowDiagram } from "@/features/roadmaps/components/RoadmapFlowDiagram";
import { RoadmapMobileList } from "@/features/roadmaps/components/RoadmapMobileList";
import { RoadmapNodePanel } from "@/features/roadmaps/components/RoadmapNodePanel";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  initialNodes: RoadmapNodeView[];
  isLoggedIn: boolean;
};

// Owns node/selection/completion state so the desktop flow diagram and the
// mobile list (rendered side by side, toggled via a CSS breakpoint rather
// than JS viewport detection — avoids an SSR/client hydration mismatch)
// share one source of truth instead of each fetching/mutating independently.
export function RoadmapDetailView({ initialNodes, isLoggedIn }: Props) {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  async function handleToggleComplete(node: RoadmapNodeView, completed: boolean) {
    if (!isLoggedIn || isSaving) return;

    setIsSaving(true);
    setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, isCompleted: completed } : n)));

    try {
      const res = await fetch("/api/roadmap-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: node.id, completed }),
      });
      if (!res.ok) {
        setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, isCompleted: !completed } : n)));
      }
    } catch {
      setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, isCompleted: !completed } : n)));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="hidden md:block">
        <RoadmapFlowDiagram nodes={nodes} onSelectNode={(n) => setSelectedNodeId(n.id)} />
      </div>
      <div className="md:hidden">
        <RoadmapMobileList nodes={nodes} onSelectNode={(n) => setSelectedNodeId(n.id)} />
      </div>

      <RoadmapNodePanel
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onToggleComplete={handleToggleComplete}
        isLoggedIn={isLoggedIn}
        isSaving={isSaving}
      />
    </>
  );
}
