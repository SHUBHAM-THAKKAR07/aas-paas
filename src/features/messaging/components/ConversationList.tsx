"use client";

import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge } from "@/components/ui/count-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { formatConversationTime } from "@/lib/utils/format";
import type { ConversationSummary } from "@/lib/db/types";
import {
  conversationAvatar,
  conversationTitle,
  lastMessagePreview,
} from "../index";

interface ConversationListProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewMessage: () => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewMessage,
  loading,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<MessageCircle size={28} />}
          title="No conversations yet"
          description="Message a neighbour directly or start a community group chat."
          actionLabel="New Message"
          onAction={onNewMessage}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2" role="list" aria-label="Conversations">
      {conversations.map((summary) => {
        const id = summary.conversation.id;
        const active = id === activeId;
        return (
          <button
            key={id}
            role="listitem"
            onClick={() => onSelect(id)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex items-center gap-3 w-full text-left px-3 py-3 rounded-2xl",
              "transition-all duration-180 ease-out",
              active
                ? "bg-secondary-container/30 border border-secondary-container/40"
                : "border border-transparent hover:bg-surface-container/70 hover:border-outline-variant/30"
            )}
          >
            <Avatar
              src={conversationAvatar(summary)}
              fallback={conversationTitle(summary)}
              size="lg"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="label-md font-bold text-on-surface truncate">
                  {conversationTitle(summary)}
                </span>
                <span className="label-sm text-on-surface-variant/70 shrink-0">
                  {summary.lastMessage ? formatConversationTime(summary.lastMessage.created_at) : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p
                  className={cn(
                    "label-sm truncate",
                    summary.unreadCount > 0
                      ? "font-semibold text-on-surface"
                      : "text-on-surface-variant"
                  )}
                >
                  {lastMessagePreview(summary)}
                </p>
                {summary.unreadCount > 0 && (
                  <CountBadge count={summary.unreadCount} className="shrink-0" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
