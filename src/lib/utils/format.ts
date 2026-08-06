/**
 * format.ts — Formatting utilities
 */
import { formatDistanceToNow, format, isAfter } from "date-fns";

/** Format a date as relative distance ("2 hours ago") */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Format a datetime for display */
export function formatDate(date: string | Date, fmt = "d MMM yyyy"): string {
  return format(new Date(date), fmt);
}

/** Check if an expiry date is in the future (post is still active) */
export function isActive(expiresAt: string | Date): boolean {
  return isAfter(new Date(expiresAt), new Date());
}

/** Format distance in meters to a human-readable label */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Format a phone number for display (mask middle digits) */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-3);
}
