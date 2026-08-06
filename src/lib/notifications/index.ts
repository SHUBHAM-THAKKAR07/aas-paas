/**
 * src/lib/notifications/index.ts — In-App Notifications
 *
 * MVP: In-app notifications only. No OneSignal, Firebase, or paid push.
 * Notifications are stored in Supabase and fetched on page load.
 * Supabase Realtime can be used selectively for instant delivery.
 *
 * Browser Push Notifications can be added as a V1.1 feature
 * without rewriting this layer.
 *
 * Full implementation in Stage 1.
 */

import type { NotificationType } from "@/types/domain";

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification message templates.
 * Supports both English and Hindi.
 */
export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  { en: string; hi: string }
> = {
  post_nearby:   { en: "Someone shared something nearby",       hi: "पास में कुछ हुआ" },
  post_help:     { en: "A new help offer near you",             hi: "पास में सहायता उपलब्ध है" },
  post_need:     { en: "Someone needs help nearby",             hi: "पास में किसी को मदद चाहिए" },
  reply:         { en: "Someone replied to your post",          hi: "आपके पोस्ट पर जवाब आया" },
  trust_update:  { en: "Your trust score was updated",          hi: "आपका भरोसा स्कोर बदला" },
  moderation:    { en: "Your post was reviewed",                hi: "आपका पोस्ट समीक्षित हुआ" },
  system:        { en: "System notification",                   hi: "सिस्टम सूचना" },
};

/**
 * Create a notification record in Supabase.
 * Full implementation in Stage 1.
 */
export async function createNotification(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _payload: CreateNotificationPayload
): Promise<void> {
  // Placeholder — Supabase insert in Stage 1
}

