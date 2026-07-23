"use client";

import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  // Widened to accept a CSS string (e.g. "100%") alongside the original pixel
  // number — @monaco-editor/react's own Editor already supports both; every
  // existing caller still passes a number, so this is purely additive.
  height?: number | string;
};

// Monaco is always dark regardless of site theme (intentional contrast), minimap
// off, explicit pixel height — per library-docs.md → Monaco Editor. Promoted here
// (Feature 26) from features/practice/components/ so features/build can use the
// identical editor without a features/ → features/ import.
export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  height = 360,
}: Props) {
  return (
    // h-full is a no-op for every existing caller (their ancestors have no
    // definite height, so a percentage height computes to "auto" per the CSS
    // spec — Editor's own explicit pixel height still governs). It only
    // takes effect where a caller's own ancestor chain establishes a real
    // height (a flex column sized off 100dvh, e.g. BattleEditorWorkspace),
    // letting a string height prop like "100%" actually resolve.
    <div className="h-full overflow-hidden rounded-lg border border-border">
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(next) => onChange(next ?? "")}
        loading={<EditorSkeleton height={height} />}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "line",
          automaticLayout: true,
        }}
      />
    </div>
  );
}

function EditorSkeleton({ height }: { height: number | string }) {
  return (
    <div
      className="flex h-full animate-pulse flex-col gap-2.5 bg-editor-surface p-4"
      style={{ height }}
      aria-label="Loading editor"
    >
      {[80, 64, 72, 56, 68, 48].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded bg-editor-foreground/10"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}
