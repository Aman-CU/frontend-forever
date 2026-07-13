import { Fragment, type ReactNode } from "react";

// A deliberately small Markdown subset renderer — enough for the teaching content
// we author ourselves (headings, paragraphs, ordered + unordered lists, fenced
// code blocks, blockquotes, inline `code`, **bold**, and *italic*) without pulling
// in a markdown dependency. Content is always authored by us (concept challenge
// descriptions, interview answers — all from the seed), never user input, so there
// is no HTML-injection surface.
//
// Shared across features/practice (challenge descriptions) and
// features/interview-prep (question answers) — promoted here in Feature 25 as the
// third consumer.
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
      !UNORDERED_ITEM.test(lines[i])
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

// Inline `code`, **bold**, and *italic* spans. The `**` alternative precedes the
// single `*` one so bold is matched before italic at any given position.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={key++}>{text.slice(last, match.index)}</Fragment>);
    }
    if (match[1] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-surface-secondary px-1 py-0.5 font-mono text-[0.8125rem] text-text-primary"
        >
          {match[1]}
        </code>,
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {match[2]}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key++} className="italic">
          {match[3]}
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
