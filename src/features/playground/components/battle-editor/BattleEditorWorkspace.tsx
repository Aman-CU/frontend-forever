"use client";

import { useMemo, useState } from "react";
import { Lock, Unlock } from "lucide-react";

import { CodeEditor } from "@/components/shared/CodeEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ChallengeDifficulty } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BattleBreadcrumb } from "@/features/playground/components/BattleBreadcrumb";
import { buildBattleDoc } from "@/features/playground/lib/buildBattleDoc";
import { useDebouncedValue } from "@/features/playground/hooks/useDebouncedValue";
import { FileTabs, type BattleFile } from "./FileTabs";
import { ComparePane } from "./ComparePane";
import { BattleSolutionPanel } from "./BattleSolutionPanel";
import { BattleShareButton } from "./BattleShareButton";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

const MONACO_LANGUAGE: Record<BattleFile, string> = {
  html: "html",
  css: "css",
  js: "javascript",
};

type Props = {
  challenge: {
    title: string;
    description: string;
    difficulty: ChallengeDifficulty;
    targetHtml: string;
    targetCss: string;
    targetJs: string;
    starterHtml: string;
    starterCss: string;
    starterJs: string;
    solutionHtml: string;
    solutionCss: string;
    solutionJs: string;
    isSolutionLocked: boolean;
  };
};

export function BattleEditorWorkspace({ challenge }: Props) {
  const [activeFile, setActiveFile] = useState<BattleFile>("html");
  const [files, setFiles] = useState({
    html: challenge.starterHtml,
    css: challenge.starterCss,
    js: challenge.starterJs,
  });
  const [fileTreeCollapsed, setFileTreeCollapsed] = useState(false);
  const [isPaneFullscreen, setIsPaneFullscreen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  // Debounced so the output iframe doesn't rebuild on every keystroke.
  const debouncedFiles = useDebouncedValue(files, 500);
  const outputDoc = useMemo(
    () => buildBattleDoc(debouncedFiles.html, debouncedFiles.css, debouncedFiles.js),
    [debouncedFiles],
  );
  // The target never changes — built once from the challenge's own fixed
  // reference source, not the user's editor state.
  const targetDoc = useMemo(
    () => buildBattleDoc(challenge.targetHtml, challenge.targetCss, challenge.targetJs),
    [challenge.targetHtml, challenge.targetCss, challenge.targetJs],
  );

  function handleEditorChange(value: string) {
    setFiles((prev) => ({ ...prev, [activeFile]: value }));
  }

  return (
    // Full-page IDE layout, not a boxed content page — fills the viewport
    // below AppNavbar (h-14 = 3.5rem) edge to edge, same calc pattern
    // LearnSidebar/InterviewPrepSidebar already use for full-height columns.
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-3 md:px-6">
        <BattleBreadcrumb title={challenge.title} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-text-primary">{challenge.title}</h1>
          <span
            className={cn(
              "w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              DIFFICULTY_STYLES[challenge.difficulty],
            )}
          >
            {challenge.difficulty}
          </span>
          <p className="min-w-0 flex-1 truncate text-sm text-text-secondary">
            {challenge.description}
          </p>
          <BattleShareButton title={challenge.title} />
          <button
            type="button"
            onClick={() => setSolutionOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            {challenge.isSolutionLocked ? (
              <Lock className="size-3.5" aria-hidden />
            ) : (
              <Unlock className="size-3.5" aria-hidden />
            )}
            Solution
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 p-3 md:p-4">
        {isPaneFullscreen ? (
          <div className="min-h-0 min-w-0 flex-1">
            <ComparePane
              targetDoc={targetDoc}
              outputDoc={outputDoc}
              isFullscreen
              onToggleFullscreen={() => setIsPaneFullscreen(false)}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
            <FileTabs
              activeFile={activeFile}
              onFileChange={setActiveFile}
              collapsed={fileTreeCollapsed}
              onToggleCollapsed={() => setFileTreeCollapsed((c) => !c)}
            />

            {/* Editor narrower than the compare pane (2:3) — the output
                window is meant to be the bigger of the two. */}
            <div
              className="min-h-0 min-w-0 lg:flex-[2]"
              id="battle-file-panel"
              role="tabpanel"
              aria-labelledby={`battle-file-tab-${activeFile}`}
            >
              {/* One shared editor instance AND one shared Monaco model per
                  file — `path` (not `key`) switches between the 3 files'
                  models without remounting the editor, so each file keeps
                  its own undo history and view state across switches
                  (an earlier `key={activeFile}` version silently reset all
                  of that on every switch, since it discarded and recreated
                  Monaco from scratch each time). height="100%" fills this
                  column's real height (the h-[calc(...)] chain above gives
                  every ancestor a definite height, so the percentage
                  actually resolves — see CodeEditor's comment). */}
              <CodeEditor
                path={activeFile}
                value={files[activeFile]}
                onChange={handleEditorChange}
                language={MONACO_LANGUAGE[activeFile]}
                height="100%"
              />
            </div>

            <div className="min-h-0 min-w-0 lg:flex-[3]">
              <ComparePane
                targetDoc={targetDoc}
                outputDoc={outputDoc}
                isFullscreen={false}
                onToggleFullscreen={() => setIsPaneFullscreen(true)}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog open={solutionOpen} onOpenChange={setSolutionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Official Solution</DialogTitle>
            <DialogDescription>
              {challenge.isSolutionLocked
                ? "The reference recreation for this battle."
                : "A real, working recreation of the target UI."}
            </DialogDescription>
          </DialogHeader>
          <BattleSolutionPanel
            solutionHtml={challenge.solutionHtml}
            solutionCss={challenge.solutionCss}
            solutionJs={challenge.solutionJs}
            isLocked={challenge.isSolutionLocked}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
