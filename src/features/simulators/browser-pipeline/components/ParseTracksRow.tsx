import { GitBranch, ListTree } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CSSOM_TREE, CSS_SOURCE, DOM_TREE, HTML_SOURCE } from "../data/scenarios";
import type { StageId, StageStatuses, TreeNode } from "../types";
import { ParseTrack } from "./ParseTrack";
import type { PipelineColor } from "./PipelineCard";

type TrackMeta = {
  targetId: StageId;
  icon: LucideIcon;
  color: PipelineColor;
  title: string;
  sourceCode: string;
  tree: TreeNode;
  captionTitle: string;
  captionSubtext: string;
};

// Keyed by targetId (the stage whose status this track reflects) so a
// caller always looks up status via stageStatuses[meta.targetId] — same
// "key by id, not position" precedent as react-rendering's STAGE_META.
const TRACK_META: TrackMeta[] = [
  {
    targetId: "dom",
    icon: GitBranch,
    color: "info",
    title: "HTML → DOM",
    sourceCode: HTML_SOURCE,
    tree: DOM_TREE,
    captionTitle: "Parse HTML",
    captionSubtext: "Builds the DOM tree",
  },
  {
    targetId: "cssom",
    icon: ListTree,
    color: "premium",
    title: "CSS → CSSOM",
    sourceCode: CSS_SOURCE,
    tree: CSSOM_TREE,
    captionTitle: "Parse CSS",
    captionSubtext: "Builds the CSSOM",
  },
];

export function ParseTracksRow({ stageStatuses }: { stageStatuses: StageStatuses }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TRACK_META.map((meta, index) => (
        <ParseTrack
          key={meta.targetId}
          icon={meta.icon}
          color={meta.color}
          title={meta.title}
          sourceCode={meta.sourceCode}
          tree={meta.tree}
          status={stageStatuses[meta.targetId]}
          captionNumber={index + 1}
          captionTitle={meta.captionTitle}
          captionSubtext={meta.captionSubtext}
        />
      ))}
    </div>
  );
}
