import { Fragment, type ReactNode } from "react";

// A deliberately small Markdown subset renderer for challenge descriptions —
// enough to write a proper teaching brief (headings, paragraphs, bullet lists,
// fenced code blocks, blockquotes, inline `code` and **bold**) without pulling
// in a markdown dependency. Content is authored by us (the seed), never user
// input, so there is no HTML injection surface.
type Props = {
  markdown: string;
};

export function ChallengeDescription({ markdown }: Props) {
  return <div className="flex flex-col gap-3">{renderBlocks(markdown)}</div>;
}

function renderBlocks(src: string): ReactNode[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

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
            {code.join("\n")}
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

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
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
      !/^\s*[-*]\s+/.test(lines[i])
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
