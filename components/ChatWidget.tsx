'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { business } from '@/lib/content';

type ChatRole = 'assistant' | 'visitor';

interface WidgetMessage {
  id: string;
  role: ChatRole;
  body: string;
  createdAt?: string;
}

const STORAGE_ID = 'mapleGlowChatConversationId';
const STORAGE_MESSAGES = 'mapleGlowChatMessages';
const STORAGE_VISITOR = 'mapleGlowChatVisitor';

const INTRO: WidgetMessage = {
  id: 'intro',
  role: 'assistant',
  body: "Hi, I'm Maple Glow's receptionist. I can help with services, estimates, and scheduling notes for Katie.",
};

const QUICK_PROMPTS = [
  'I would like an estimate for a cleaning.',
  'Do you have availability this week?',
  'Can Katie call or text me back?',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<WidgetMessage[]>([INTRO]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitor, setVisitor] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const hasUnread = !open && messages.length > 1;

  useEffect(() => {
    const savedId = window.localStorage.getItem(STORAGE_ID);
    const savedMessages = window.localStorage.getItem(STORAGE_MESSAGES);
    const savedVisitor = window.localStorage.getItem(STORAGE_VISITOR);

    if (savedId) setConversationId(savedId);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_MESSAGES);
      }
    }
    if (savedVisitor) {
      try {
        const parsed = JSON.parse(savedVisitor);
        setVisitor({
          name: String(parsed.name ?? ''),
          email: String(parsed.email ?? ''),
          phone: String(parsed.phone ?? ''),
        });
      } catch {
        window.localStorage.removeItem(STORAGE_VISITOR);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (conversationId) window.localStorage.setItem(STORAGE_ID, conversationId);
  }, [conversationId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages.slice(-40)));
  }, [messages, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_VISITOR, JSON.stringify(visitor));
  }, [visitor, hydrated]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open]);

  const canSend = useMemo(() => input.trim().length > 0 && !submitting, [input, submitting]);

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setInput('');

    const localVisitor: WidgetMessage = {
      id: `local-${Date.now()}`,
      role: 'visitor',
      body: text,
    };
    setMessages((current) => [...current, localVisitor]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: text,
          visitorName: visitor.name,
          email: visitor.email,
          phone: visitor.phone,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? 'Could not send that message.');
      }

      setConversationId(data.conversationId);
      const returned = Array.isArray(data.messages) ? data.messages : [];
      const savedVisitor = returned.find((m: WidgetMessage) => m.role === 'visitor');
      const replies = returned.filter((m: WidgetMessage) => m.role === 'assistant');

      setMessages((current) => [
        ...current.map((message) =>
          message.id === localVisitor.id && savedVisitor ? savedVisitor : message
        ),
        ...replies,
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          body: `I could not save that message. You can call or text Katie at ${business.phone.replace(
            '+1 ',
            ''
          )}.`,
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="mb-3 flex h-[min(690px,calc(100vh-7rem))] w-[calc(100vw-2rem)]
                       max-w-[390px] flex-col overflow-hidden rounded-4xl border
                       border-espresso-900/10 bg-cream-50 shadow-lift"
          >
            <div className="bg-espresso-950 p-4 text-cream-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-400/15">
                    <Sparkles className="h-5 w-5 text-gold-300" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">Maple Glow receptionist</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-cream-200/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage-400" />
                      Saved for Katie
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close receptionist chat"
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-cream-100 transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-espresso-900/8 bg-white px-4 py-3">
              <details>
                <summary className="cursor-pointer select-none text-[12.5px] font-semibold text-espresso-900/65">
                  Add contact details for Katie
                </summary>
                <div className="mt-3 grid gap-2">
                  <label className="relative">
                    <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-espresso-900/35" />
                    <input
                      value={visitor.name}
                      onChange={(e) => setVisitor((v) => ({ ...v, name: e.target.value }))}
                      placeholder="Name"
                      className="field !rounded-xl !py-2.5 !pl-9 !text-[13px]"
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="relative">
                      <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-espresso-900/35" />
                      <input
                        value={visitor.phone}
                        onChange={(e) => setVisitor((v) => ({ ...v, phone: e.target.value }))}
                        placeholder="Phone"
                        className="field !rounded-xl !py-2.5 !pl-9 !text-[13px]"
                      />
                    </label>
                    <label className="relative">
                      <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-espresso-900/35" />
                      <input
                        value={visitor.email}
                        onChange={(e) => setVisitor((v) => ({ ...v, email: e.target.value }))}
                        placeholder="Email"
                        className="field !rounded-xl !py-2.5 !pl-9 !text-[13px]"
                      />
                    </label>
                  </div>
                </div>
              </details>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => {
                const fromVisitor = message.role === 'visitor';
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${fromVisitor ? 'justify-end' : 'justify-start'}`}
                  >
                    {!fromVisitor && (
                      <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                        <Bot className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <p
                      className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5
                                  text-[13.5px] leading-relaxed ${
                                    fromVisitor
                                      ? 'rounded-br-md bg-espresso-950 text-cream-50'
                                      : 'rounded-bl-md border border-espresso-900/8 bg-white text-espresso-900/75'
                                  }`}
                    >
                      {message.body}
                    </p>
                  </div>
                );
              })}
              {submitting && (
                <div className="flex items-center gap-2 pl-9 text-[12.5px] text-espresso-900/40">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-espresso-900/8 bg-white p-3">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="shrink-0 rounded-full border border-espresso-900/10 bg-cream-50 px-3 py-1.5 text-[11.5px] font-semibold text-espresso-900/55 hover:border-gold-300"
                  >
                    {prompt.replace('I would like ', '').replace('Can Katie ', 'Katie ')}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="Ask about cleaning, pricing, or scheduling..."
                  className="field max-h-28 min-h-[46px] resize-none !rounded-2xl !py-3 !text-[13.5px]"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send message"
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-espresso-950 shadow-glow transition-all hover:bg-gold-300 disabled:opacity-45"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open receptionist chat"
        className="group relative ml-auto flex items-center gap-3 rounded-full bg-espresso-950 px-4 py-3
                   text-cream-50 shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-espresso-950">
          <MessageCircle className="h-[18px] w-[18px]" />
        </span>
        <span className="hidden pr-1 text-left sm:block">
          <span className="block text-[13px] font-semibold">Ask Katie</span>
          <span className="block text-[11.5px] text-cream-200/55">Quick receptionist</span>
        </span>
        {hasUnread && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-cream-100 bg-gold-400" />
        )}
      </button>
    </div>
  );
}
