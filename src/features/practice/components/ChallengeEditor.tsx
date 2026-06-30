"use client";

import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: number;
};

// Monaco is always dark regardless of site theme (intentional contrast), minimap
// off, explicit pixel height — per library-docs.md → Monaco Editor.
export function ChallengeEditor({
  value,
  onChange,
  language = "javascript",
  height = 360,
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
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

function EditorSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex animate-pulse flex-col gap-2.5 bg-editor-surface p-4"
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
