import { cn } from "@/lib/utils/cn";
import { formatClockTime } from "@/lib/utils/format";
import type { MessageWithSender } from "@/lib/db/types";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  /** Show the sender's name above the bubble (group chats, other people). */
  showSenderName?: boolean;
}

/**
 * MessageBubble — a subtle chat bubble in the Aas-Paas visual language.
 * Own messages use the warm terracotta fixed palette; other messages sit on a
 * soft surface tone with a hairline border. Rounded but not exaggerated.
 */
export function MessageBubble({ message, isOwn, showSenderName = false }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[72%]",
        isOwn ? "items-end self-end" : "items-start self-start"
      )}
    >
      {showSenderName && !isOwn && (
        <span className="label-sm font-bold text-primary mb-1 ml-1">{message.sender.full_name}</span>
      )}
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl border leading-relaxed",
          isOwn
            ? "bg-primary-fixed/50 border-primary-fixed/70 text-on-primary-fixed-variant rounded-br-md"
            : "bg-surface-container-low border-outline-variant/30 text-on-surface rounded-bl-md",
          "soft-card-shadow"
        )}
      >
        <p className="body-md whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            "block text-right mt-1 text-[11px] leading-none",
            isOwn ? "text-on-primary-fixed-variant/50" : "text-on-surface-variant/60"
          )}
        >
          {formatClockTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
