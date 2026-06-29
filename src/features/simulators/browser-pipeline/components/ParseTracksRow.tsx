import { GitBranch, ListTree } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

type ParseTracksRowProps = {
  stageStatuses: StageStatuses;
  htmlSource: string;
  cssSource: string;
  domTree: TreeNode;
  cssomTree: TreeNode;
};

export function ParseTracksRow({
  stageStatuses,
  htmlSource,
  cssSource,
  domTree,
  cssomTree,
}: ParseTracksRowProps) {
  // Keyed by targetId (the stage whose status this track reflects) so a caller
  // always looks up status via stageStatuses[meta.targetId] — same "key by id,
  // not position" precedent as react-rendering's STAGE_META. Built from the
  // active scenario's source/trees, not module constants.
  const TRACK_META: TrackMeta[] = [
    {
      targetId: "dom",
      icon: GitBranch,
      color: "info",
      title: "HTML → DOM",
      sourceCode: htmlSource,
      tree: domTree,
      captionTitle: "Parse HTML",
      captionSubtext: "Builds the DOM tree",
    },
    {
      targetId: "cssom",
      icon: ListTree,
      color: "premium",
      title: "CSS → CSSOM",
      sourceCode: cssSource,
      tree: cssomTree,
      captionTitle: "Parse CSS",
      captionSubtext: "Builds the CSSOM",
    },
  ];

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
