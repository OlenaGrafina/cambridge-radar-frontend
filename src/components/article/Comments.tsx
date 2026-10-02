import type {Comment} from '@/lib/sanity/types'
import {formatDate, initials, pad} from '@/lib/utils'

import {CommentForm} from './CommentForm'

type Node = Comment & {replies: Node[]}

function thread(comments: Comment[]): Node[] {
  const byId = new Map<string, Node>(comments.map((c) => [c._id, {...c, replies: []}]))
  const roots: Node[] = []
  for (const node of byId.values()) {
    const parent = node.parent ? byId.get(node.parent) : undefined
    if (parent) parent.replies.push(node)
    else roots.push(node)
  }
  return roots
}

function CommentItem({c, postId, depth}: {c: Node; postId: string; depth: number}) {
  return (
    <li id={`comment-${c._id}`} className="scroll-mt-24">
      <article className="grid grid-cols-[2.5rem_1fr] gap-4">
        <span
          aria-hidden="true"
          className={`grid h-10 w-10 place-items-center rounded-full border text-[12px] font-medium ${c.staffAuthor ? 'border-signal text-signal' : 'border-rule text-muted'}`}
        >
          {initials(c.staffAuthor?.name ?? c.name)}
        </span>
        <div>
          <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-[15px] font-medium">{c.staffAuthor?.name ?? c.name}</p>
            {c.staffAuthor && <span className="meta !text-signal">Author</span>}
            <time dateTime={c.createdAt} className="meta">
              {formatDate(c.createdAt)}
            </time>
          </header>
          <div className="mt-2 font-serif text-[1.0625rem] leading-relaxed whitespace-pre-line text-ink-2">{c.body}</div>
          {depth < 2 && <CommentForm postId={postId} parentId={c._id} parentName={c.staffAuthor?.name ?? c.name} />}
        </div>
      </article>
      {c.replies.length > 0 && (
        <ol className="mt-6 space-y-6 border-l border-rule pl-5 sm:ml-5 sm:pl-8">
          {c.replies.map((r) => (
            <CommentItem key={r._id} c={r} postId={postId} depth={depth + 1} />
          ))}
        </ol>
      )}
    </li>
  )
}

export function Comments({comments, postId, open}: {comments: Comment[]; postId: string; open: boolean}) {
  const roots = thread(comments)
  return (
    <section id="comments" aria-labelledby="comments-title" className="scroll-mt-24">
      <h2 id="comments-title" className="flex items-baseline justify-between border-t-2 border-rule-strong pt-3">
        <span className="display text-[1.75rem]">Discussion</span>
        <span className="meta">{pad(comments.length)} {comments.length === 1 ? 'comment' : 'comments'}</span>
      </h2>
      {roots.length > 0 ? (
        <ol className="mt-8 space-y-8">
          {roots.map((c) => (
            <CommentItem key={c._id} c={c} postId={postId} depth={0} />
          ))}
        </ol>
      ) : (
        <p className="mt-6 font-serif text-[1.0625rem] text-muted">No comments yet. Start the conversation.</p>
      )}
      {open ? (
        <div className="mt-10">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <p className="meta mt-8">Comments are closed for this article.</p>
      )}
    </section>
  )
}
