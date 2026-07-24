import "server-only";
import fs from "node:fs";
import path from "node:path";

import type { ExperimentSourceFile } from "@/features/playground/experiments/registry";

// Reads an Experiment's real source files off disk so the "View Code" panel
// shows exactly what runs — a single source of truth, never a hand-maintained
// copy that could drift from the component (Feature 54 decision). All paths
// come from the in-repo registry (first-party, not user input), but the read
// is still traversal-guarded to EXPERIMENTS_ROOT, same guard as
// systemDesignGuides.ts / lib/mdx.ts.
const EXPERIMENTS_ROOT = path.join(
  process.cwd(),
  "src",
  "features",
  "playground",
  "experiments",
);

export type ExperimentSource = {
  label: string;
  // Monaco/highlighter language id, derived from the file extension.
  language: string;
  code: string;
};

const LANGUAGE_BY_EXT: Record<string, string> = {
  ".tsx": "typescript",
  ".ts": "typescript",
  ".jsx": "javascript",
  ".js": "javascript",
  ".css": "css",
  ".html": "html",
  ".json": "json",
};

function resolveSourcePath(relativePath: string): string | null {
  const baseDir = path.resolve(EXPERIMENTS_ROOT);
  const filePath = path.resolve(baseDir, relativePath);
  // Must stay inside the experiments dir — a crafted "../../.." can't escape.
  if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) {
    return null;
  }
  return filePath;
}

export function readExperimentSources(
  files: ExperimentSourceFile[],
): ExperimentSource[] {
  const sources: ExperimentSource[] = [];
  for (const file of files) {
    const filePath = resolveSourcePath(file.path);
    if (!filePath || !fs.existsSync(filePath)) continue;
    const code = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath).toLowerCase();
    sources.push({
      label: file.label,
      language: LANGUAGE_BY_EXT[ext] ?? "plaintext",
      code,
    });
  }
  return sources;
}
