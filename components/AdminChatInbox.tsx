'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Search,
  UserRound,
} from 'lucide-react';

export interface AdminChatMessage {
  id: string;
  role: string;
  body: string;
  createdAt: string;
}

export interface AdminChatConversation {
  id: string;
  visitorName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: AdminChatMessage[];
}

const STATUSES = [
  { id: 'new', label: 'New', tone: 'bg-gold-400 text-espresso-950' },
  { id: 'open', label: 'Open', tone: 'bg-sage-500 text-espresso-950' },
  { id: 'closed', label: 'Closed', tone: 'bg-espresso-700 text-cream-50' },
  { id: 'archived', label: 'Archived', tone: 'bg-espresso-400 text-cream-50' },
];

function displayName(conversation: AdminChatConversation) {
  return conversation.visitorName || conversation.email || conversation.phone || 'Website visitor';
}

function timeLabel(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AdminChatInbox({
  conversations: initial,
}: {
  conversations: AdminChatConversation[];
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(initial[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);

  const selected =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0] ??
    null;

  const stats = useMemo(
    () => ({
      total: conversations.length,
      newCount: conversations.filter((c) => c.status === 'new').length,
      open: conversations.filter((c) => c.status === 'open').length,
      archived: conversations.filter((c) => c.status === 'archived').length,
    }),
    [conversations]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (filter !== 'all' && conversation.status !== filter) return false;
      if (!q) return true;
      return [
        conversation.visitorName,
        conversation.email,
        conversation.phone,
        ...conversation.messages.map((message) => message.body),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [conversations, filter, query]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    const res = await fetch(`/api/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setConversations((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, status: data.conversation.status, updatedAt: data.conversation.updatedAt }
            : item
        )
      );
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <main className="container-mg py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">Receptionist chats</h1>
          <p className="mt-1.5 text-[14px] text-espresso-900/55">
            Visitor messages from the corner chat show up here for Katie.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'New', value: stats.newCount, icon: Inbox },
          { label: 'Open', value: stats.open, icon: MessageCircle },
          { label: 'Archived', value: stats.archived, icon: Archive },
          { label: 'All chats', value: stats.total, icon: UserRound },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <item.icon className="h-5 w-5 text-gold-600" />
            <p className="h-display mt-3 text-3xl tabular-nums">{item.value}</p>
            <p className="mt-0.5 text-[13px] text-espresso-900/50">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-900/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats, names, email, phone..."
            className="field !pl-11"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {['all', ...STATUSES.map((status) => status.id)].map((id) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all ${
                filter === id
                  ? 'border-espresso-900 bg-espresso-900 text-cream-50'
                  : 'border-espresso-900/12 bg-white text-espresso-900/65 hover:border-gold-400'
              }`}
            >
              {id === 'all' ? 'All' : STATUSES.find((status) => status.id === id)?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)]">
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="card p-10 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-espresso-900/25" />
              <p className="mt-4 text-[14px] text-espresso-900/55">
                No receptionist chats match that view.
              </p>
            </div>
          )}

          {visible.map((conversation) => {
            const status = STATUSES.find((s) => s.id === conversation.status) ?? STATUSES[0];
            const last = conversation.messages[conversation.messages.length - 1];
            const active = selected?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`card w-full p-4 text-left hover:shadow-lift ${
                  active ? 'border-gold-400/50 ring-4 ring-gold-300/15' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-espresso-950">
                      {displayName(conversation)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-espresso-900/55">
                      {last?.body ?? 'No messages yet'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${status.tone}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-3 text-[12px] text-espresso-900/35">
                  Updated {timeLabel(conversation.updatedAt)}
                </p>
              </button>
            );
          })}
        </div>

        <div className="card min-h-[560px] overflow-hidden">
          {selected ? (
            <>
              <div className="border-b border-espresso-900/8 bg-cream-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="h-display text-2xl">{displayName(selected)}</h2>
                    <p className="mt-1 text-[12.5px] text-espresso-900/45">
                      Started {timeLabel(selected.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status.id}
                        disabled={busy === selected.id}
                        onClick={() => setStatus(selected.id, status.id)}
                        className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-all ${
                          selected.status === status.id
                            ? status.tone
                            : 'bg-white text-espresso-900/55 hover:bg-cream-200'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(selected.phone || selected.email) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.phone && (
                      <a
                        href={`tel:${selected.phone}`}
                        className="inline-flex items-center gap-2 rounded-full border border-espresso-900/10 bg-white px-3 py-2 text-[12.5px] font-semibold text-espresso-900/65 hover:border-gold-400"
                      >
                        <Phone className="h-3.5 w-3.5 text-gold-600" />
                        {selected.phone}
                      </a>
                    )}
                    {selected.email && (
                      <a
                        href={`mailto:${selected.email}`}
                        className="inline-flex items-center gap-2 rounded-full border border-espresso-900/10 bg-white px-3 py-2 text-[12.5px] font-semibold text-espresso-900/65 hover:border-gold-400"
                      >
                        <Mail className="h-3.5 w-3.5 text-gold-600" />
                        {selected.email}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                {selected.messages.map((message) => {
                  const fromVisitor = message.role === 'visitor';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${fromVisitor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-3xl px-4 py-3 ${
                          fromVisitor
                            ? 'rounded-br-lg bg-espresso-950 text-cream-50'
                            : 'rounded-bl-lg border border-espresso-900/8 bg-cream-50 text-espresso-900/75'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                          {message.body}
                        </p>
                        <p
                          className={`mt-2 text-[11px] ${
                            fromVisitor ? 'text-cream-200/45' : 'text-espresso-900/35'
                          }`}
                        >
                          {fromVisitor ? 'Visitor' : 'Receptionist'} ·{' '}
                          {timeLabel(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex min-h-[560px] flex-col items-center justify-center p-10 text-center">
              <MessageCircle className="h-9 w-9 text-espresso-900/25" />
              <p className="mt-4 text-[14px] text-espresso-900/55">
                New website conversations will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
