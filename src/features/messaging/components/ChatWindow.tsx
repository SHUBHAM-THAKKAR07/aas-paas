"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Send, Users, Info } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/lib/db/local-db";
import { useAuth } from "@/lib/auth/AuthContext";
import { MessageBubble } from "./MessageBubble";
import { GroupInfoDrawer } from "./GroupInfoDrawer";
import { useConversation } from "../hooks";
import { conversationTitle } from "../index";
import type { MessageWithSender } from "@/lib/db/types";

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
}

const isSameDay = (a: string, b: string) =>
  format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd");

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-1">
      <span className="label-sm font-semibold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
        {label}
      </span>
    </div>
  );
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const data = useConversation(conversationId);
  const [draft, setDraft] = useState("");
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const nearBottomRef = useRef(true);

  const messages = data?.messages ?? [];
  const members = data?.members ?? [];
  const isGroup = data?.conversation.type === "group";

  const otherMember = members.find((m) => m.user_id !== user?.id);

  // Mark the conversation as read whenever it is open and has unread messages
  // (regardless of who sent the last one).
  useEffect(() => {
    if (!user || !data) return;
    let cancelled = false;
    void db.getUnreadCountByConversation(conversationId, user.id).then((count) => {
      if (!cancelled && count > 0) void db.markConversationRead(conversationId, user.id);
    });
    return () => {
      cancelled = true;
    };
  }, [user, data, conversationId]);

  // Keep the latest message in view — but respect the user scrolling up to
  // read history; new messages only auto-scroll when already near the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Jump to the bottom when switching to a conversation.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    nearBottomRef.current = true;
  }, [conversationId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !draft.trim()) return;
    await db.sendMessage(conversationId, user.id, draft);
    setDraft("");
    const el = composerRef.current;
    if (el) el.style.height = "auto";
  };

  if (!data) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className={`h-14 w-2/3 ${i % 2 ? "ml-auto" : ""}`} />
          ))}
        </div>
      </div>
    );
  }

  const title = conversationTitle({
    conversation: data.conversation,
    displayName: data.conversation.name || otherMember?.user.full_name || "Neighbour",
    avatarUrl: isGroup ? data.conversation.avatar_url : otherMember?.user.avatar_url || null,
    lastMessage: null,
    lastSenderName: null,
    unreadCount: 0,
    memberCount: members.length,
  });

  const subtitle = isGroup
    ? `${members.length} ${members.length === 1 ? "member" : "members"}`
    : otherMember?.user.neighbourhood || "Neighbourhood member";

  // Insert date separators between messages from different days.
  const rendered: Array<{ kind: "date"; label: string; key: string } | { kind: "msg"; message: MessageWithSender; key: string }> = [];
  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    if (!previous || !isSameDay(previous.created_at, message.created_at)) {
      rendered.push({
        kind: "date",
        label: isSameDay(message.created_at, new Date().toISOString())
          ? "Today"
          : format(new Date(message.created_at), "d MMM yyyy"),
        key: `date-${message.id}`,
      });
    }
    rendered.push({ kind: "msg", message, key: message.id });
  });

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>

        {isGroup ? (
          <Avatar
            src={data.conversation.avatar_url}
            fallback={title}
            size="md"
            className="shrink-0"
          />
        ) : (
          <Link
            href={otherMember ? `/profile/${otherMember.user.id}` : "#"}
            className="shrink-0"
          >
            <Avatar
              src={otherMember?.user.avatar_url}
              fallback={title}
              size="md"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {isGroup ? (
            <h3 className="label-md font-bold text-on-surface truncate">{title}</h3>
          ) : (
            <Link
              href={otherMember ? `/profile/${otherMember.user.id}` : "#"}
              className="label-md font-bold text-on-surface truncate block hover:text-primary transition-colors"
            >
              {title}
            </Link>
          )}
          <p className="label-sm text-on-surface-variant truncate">{subtitle}</p>
        </div>

        {isGroup && (
          <button
            onClick={() => setGroupInfoOpen(true)}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-colors"
            aria-label="Group info"
          >
            <Users size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-surface space-y-2.5 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <EmptyState
            icon={<Info size={28} />}
            title={isGroup ? "Say hello to the group" : "Start the conversation"}
            description="Send the first message — your neighbour will see it instantly."
          />
        ) : (
          rendered.map((item) =>
            item.kind === "date" ? (
              <DateSeparator key={item.key} label={item.label} />
            ) : (
              <MessageBubble
                key={item.key}
                message={item.message}
                isOwn={item.message.sender_id === user?.id}
                showSenderName={isGroup}
              />
            )
          )
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 p-3 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0"
      >
        <textarea
          ref={composerRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          rows={1}
          name="message"
          placeholder={isGroup ? "Message the group..." : "Write a message..."}
          aria-label="Message"
          className="flex-1 resize-none max-h-32 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
        <Button
          type="submit"
          variant="primary"
          size="icon-lg"
          className="shrink-0 hover-lift"
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <Send size={20} />
        </Button>
      </form>

      {isGroup && (
        <GroupInfoDrawer
          conversationId={conversationId}
          myRole={data.myRole}
          isOpen={groupInfoOpen}
          onClose={() => setGroupInfoOpen(false)}
          onLeft={onBack}
        />
      )}
    </div>
  );
}
