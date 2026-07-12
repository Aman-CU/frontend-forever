"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, Loader2, MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DiscussionPost, DiscussionReply } from "@/features/practice/lib/discussionQueries";

type Props = {
  challengeId: string;
  posts: DiscussionPost[];
  isLoggedIn: boolean;
};

function authorName(author: DiscussionReply["author"]): string {
  return author.fullName || author.username;
}

function initials(author: DiscussionReply["author"]): string {
  const name = authorName(author);
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// One unified space for both freeform comments and shared solutions — a post
// with a code block IS a shared solution, not a separate system (see
// progress-tracker.md's Feature 29 language-alignment entry). Flat, one-level
// replies only: a top-level post can be replied to, a reply cannot. Open to
// every viewer, logged in or not, solved or not — no spoiler gate.
export function DiscussionThread({ challengeId, posts, isLoggedIn }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {isLoggedIn ? (
        <NewPostForm challengeId={challengeId} />
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted">
          Log in to share your thoughts or a solution.
        </p>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <MessageSquare className="h-6 w-6 text-text-muted" aria-hidden />
          <p className="text-sm text-text-muted">No discussion yet — be the first to share your thoughts.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} challengeId={challengeId} post={post} isLoggedIn={isLoggedIn} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PostCard({
  challengeId,
  post,
  isLoggedIn,
}: {
  challengeId: string;
  post: DiscussionPost;
  isLoggedIn: boolean;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <PostBody author={post.author} createdAt={post.createdAt} title={post.title} body={post.body} code={post.code} />

      {isLoggedIn && (
        <button
          type="button"
          onClick={() => setReplying((value) => !value)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <CornerDownRight className="h-3.5 w-3.5" aria-hidden />
          Reply
        </button>
      )}

      {replying && (
        <div className="mt-3 border-t border-border pt-3">
          <NewPostForm
            challengeId={challengeId}
            parentId={post.id}
            compact
            onPosted={() => setReplying(false)}
          />
        </div>
      )}

      {post.replies.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3 border-l-2 border-border pl-4">
          {post.replies.map((reply) => (
            <li key={reply.id}>
              <PostBody
                author={reply.author}
                createdAt={reply.createdAt}
                title={null}
                body={reply.body}
                code={reply.code}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function PostBody({
  author,
  createdAt,
  title,
  body,
  code,
}: {
  author: DiscussionReply["author"];
  createdAt: string;
  title: string | null;
  body: string;
  code: string | null;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={author.avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-xs">{initials(author)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-text-primary">{authorName(author)}</span>
          <span className="text-xs text-text-muted">{formatDate(createdAt)}</span>
        </div>
        {title && <p className="mt-1 text-sm font-semibold text-text-primary">{title}</p>}
        <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{body}</p>
        {code && (
          <pre className="mt-2 overflow-x-auto rounded-lg bg-editor-surface p-3.5">
            <code className="font-mono text-xs leading-relaxed text-editor-foreground">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function NewPostForm({
  challengeId,
  parentId,
  compact,
  onPosted,
}: {
  challengeId: string;
  parentId?: string;
  compact?: boolean;
  onPosted?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/practice/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          parentId,
          title: parentId ? undefined : title.trim() || undefined,
          body: body.trim(),
          code: showCode && code.trim() ? code.trim() : undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not post — please try again.");
        return;
      }
      setTitle("");
      setBody("");
      setCode("");
      setShowCode(false);
      router.refresh();
      onPosted?.();
    } catch {
      setError("Could not post — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {!compact && (
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={'Title (optional) — e.g. "O(n) two-pointer approach"'}
          maxLength={200}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
      )}
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={compact ? "Write a reply…" : "Share your thoughts or a solution…"}
        rows={compact ? 2 : 3}
        maxLength={4000}
        className="resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
      />

      {showCode ? (
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Paste your code…"
          rows={6}
          maxLength={4000}
          className="resize-y rounded-lg border border-border bg-editor-surface px-3 py-2 font-mono text-xs text-editor-foreground outline-none focus:border-accent"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowCode(true)}
          className="w-fit text-xs font-medium text-accent transition-colors hover:text-accent-dark"
        >
          + Add code
        </button>
      )}

      {error && <p className="text-xs text-error">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !body.trim()}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent-dark px-4 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-darker disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {parentId ? "Post reply" : "Post"}
      </button>
    </div>
  );
}
