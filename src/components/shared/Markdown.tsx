import { Fragment, type ReactNode } from "react";
import Link from "next/link";

// A deliberately small Markdown subset renderer — enough for the teaching content
// we author ourselves (headings, paragraphs, ordered + unordered lists, fenced
// code blocks, blockquotes, pipe tables, inline `code`, **bold**, *italic*, and
// `[text](url)` links) without pulling in a markdown dependency. Content is
// always authored by us (concept challenge descriptions, interview answers —
// all from the seed), never user input, so there is no HTML-injection surface.
//
// Shared across features/practice (challenge descriptions) and
// features/interview-prep (question answers) — promoted here in Feature 25 as the
// third consumer. Table support added in Feature 31: the content-guide format
// leans on comparison tables (`X vs Y` questions), which plain prose renders
// worse for both readers and GEO-style extraction than a real <table>. Link
// support added the same feature, for real internal links from a question's
// "Related:" line to a matching Learn concept page — real targets only, never
// fabricated hrefs to pages that don't exist yet.
type Props = {
  markdown: string;
};

export function Markdown({ markdown }: Props) {
  return <div className="flex flex-col gap-3">{renderBlocks(markdown)}</div>;
}

function renderBlocks(src: string): ReactNode[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const ORDERED_ITEM = /^\s*\d+\.\s+/;
  const UNORDERED_ITEM = /^\s*[-*]\s+/;
  const TABLE_ROW = /^\s*\|(.+)\|\s*$/;

  // A "|...|"-shaped line only actually starts a table when a valid
  // separator row follows it — otherwise it's a stray pipe in ordinary prose
  // (e.g. a quoted shell pipeline) and must be treated as paragraph content.
  // Guards the "no next line" case explicitly rather than relying on
  // short-circuiting, so it's never ambiguous at the very end of the input.
  function isTableStart(idx: number): boolean {
    if (!TABLE_ROW.test(lines[idx])) return false;
    if (idx + 1 >= lines.length) return false;
    return isTableSeparatorRow(lines[idx + 1]);
  }

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-lg bg-editor-surface p-3.5"
        >
          <code className="font-mono text-xs leading-relaxed text-editor-foreground">
            {highlightCode(code.join("\n"))}
          </code>
        </pre>,
      );
      continue;
    }

    // Heading
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      blocks.push(
        level === 2 ? (
          <h3 key={key++} className="mt-1 text-base font-bold text-text-primary">
            {renderInline(text)}
          </h3>
        ) : (
          <h4 key={key++} className="text-sm font-semibold text-text-primary">
            {renderInline(text)}
          </h4>
        ),
      );
      i++;
      continue;
    }

    // Table (pipe syntax): a header row, then a required "---|---" separator
    // row, then body rows — standard GFM table shape.
    if (isTableStart(i)) {
      const headerCells = splitTableRow(line);
      i += 2; // skip header + separator rows
      const bodyRows: string[][] = [];
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        bodyRows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50">
                {headerCells.map((cell, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-semibold text-text-primary">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-border/60 last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 align-top text-text-secondary">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="rounded-r-md border-l-2 border-accent bg-accent-muted/40 px-3.5 py-2.5 text-sm text-text-secondary"
        >
          {renderInline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    // Ordered list
    if (ORDERED_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && ORDERED_ITEM.test(lines[i])) {
        items.push(lines[i].replace(ORDERED_ITEM, ""));
        i++;
      }
      blocks.push(
        <ol
          key={key++}
          className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-text-secondary"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Unordered list
    if (UNORDERED_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UNORDERED_ITEM.test(lines[i])) {
        items.push(lines[i].replace(UNORDERED_ITEM, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-text-secondary">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-blank, non-special lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !/^(#{2,3})\s/.test(lines[i]) &&
      !lines[i].trimStart().startsWith(">") &&
      !ORDERED_ITEM.test(lines[i]) &&
      !UNORDERED_ITEM.test(lines[i]) &&
      !isTableStart(i)
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed text-text-secondary">
        {renderInline(para.join(" "))}
      </p>,
    );
  }

  return blocks;
}

// Splits on an unescaped "|" only — built via the RegExp constructor (like
// TOKEN_RE/the link regex above), not a regex literal, for consistency: a
// lookbehind in a literal isn't actually blocked by this project's ES2017
// target (unlike named groups), but building it the same way keeps every
// advanced-regex-feature case in this file handled identically.
const UNESCAPED_PIPE = new RegExp("(?<!\\\\)\\|");

// Splits a pipe-delimited table row into trimmed cells, dropping the leading/
// trailing pipe and unescaping "\|" back into a literal "|" within a cell.
function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split(UNESCAPED_PIPE).map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

// A separator row ("|---|:---:|---:|") has one or more pipe-delimited cells
// that are each nothing but dashes with optional leading/trailing colons
// (alignment markers) — checked cell-by-cell rather than one large regex,
// which is easy to get subtly wrong across 3+ columns.
function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|");
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell.trim()));
}

// A small, deliberately non-exhaustive JS/TS syntax highlighter for fenced code
// blocks (Feature 29) — same "roll our own minimal, no dependency" ethos as this
// file's markdown parsing itself. Content is always authored by us, same trust
// tier as the rest of this file. Colors match Monaco's real vs-dark theme
// (ui-tokens.md's --color-editor-* set) so a description's example code and the
// actual editor read as the same product, not two different-looking ones.
const JS_KEYWORDS =
  "const|let|var|function|return|if|else|for|while|class|new|this|typeof|instanceof|in|of|try|catch|finally|throw|async|await|yield|import|export|default|from|extends|implements|interface|type|enum|public|private|protected|readonly|static|as|is|keyof|infer|never|unknown|any|void|null|undefined|true|false|switch|case|break|continue|do|delete|super";
const TOKEN_RE = new RegExp(
  `(?<comment>//.*|/\\*[\\s\\S]*?\\*/)|(?<string>'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|\`(?:[^\`\\\\]|\\\\.)*\`)|(?<number>\\b\\d+\\.?\\d*\\b)|(?<keyword>\\b(?:${JS_KEYWORDS})\\b)|(?<func>[a-zA-Z_$][\\w$]*)(?=\\s*\\()`,
  "g",
);
const TOKEN_CLASS: Record<string, string> = {
  comment: "text-editor-comment",
  string: "text-editor-string",
  number: "text-editor-number",
  keyword: "text-editor-keyword",
  func: "text-editor-function",
};

function highlightCode(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(code)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={key++}>{code.slice(last, match.index)}</Fragment>);
    }
    const groupName = Object.keys(match.groups ?? {}).find((name) => match!.groups![name] !== undefined);
    const className = groupName ? TOKEN_CLASS[groupName] : undefined;
    nodes.push(
      className ? (
        <span key={key++} className={className}>
          {match[0]}
        </span>
      ) : (
        <Fragment key={key++}>{match[0]}</Fragment>
      ),
    );
    last = TOKEN_RE.lastIndex;
  }
  if (last < code.length) {
    nodes.push(<Fragment key={key++}>{code.slice(last)}</Fragment>);
  }
  return nodes;
}

// Inline `[text](url)` links, `code`, **bold**, and *italic* spans. Links are
// checked first so a link's own text (which may itself contain nothing else
// special) is never partially re-matched by the code/bold/italic alternatives.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Built via the RegExp constructor (like TOKEN_RE above), not a regex
  // literal — named capture groups in a literal require an ES2018+ compile
  // target, which this project's tsconfig doesn't set.
  const regex = new RegExp(
    "\\[(?<linkText>[^\\]]+)\\]\\((?<linkUrl>[^)]+)\\)|`(?<code>[^`]+)`|\\*\\*(?<bold>[^*]+)\\*\\*|\\*(?<italic>[^*]+)\\*",
    "g",
  );
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={key++}>{text.slice(last, match.index)}</Fragment>);
    }
    const groups = match.groups!;
    if (groups.linkUrl !== undefined) {
      const isInternal = groups.linkUrl.startsWith("/");
      const linkClassName = "font-medium text-accent underline underline-offset-2 hover:text-accent-dark";
      nodes.push(
        isInternal ? (
          <Link key={key++} href={groups.linkUrl} className={linkClassName}>
            {groups.linkText}
          </Link>
        ) : (
          <a
            key={key++}
            href={groups.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {groups.linkText}
          </a>
        ),
      );
    } else if (groups.code !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-surface-secondary px-1 py-0.5 font-mono text-[0.8125rem] text-text-primary"
        >
          {groups.code}
        </code>,
      );
    } else if (groups.bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {groups.bold}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key++} className="italic">
          {groups.italic}
        </em>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  }
  return nodes;
}
