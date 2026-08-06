import type { Metadata } from "next";
import { Bell, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your Aas-Paas neighbourhood notifications.",
};

const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    type: "reply",
    title: "Priya M. responded to your request",
    message: "I have a reliable plumber contact for you: +91 9876543210.",
    time: "15m ago",
    icon: MessageCircle,
    color: "bg-primary-fixed text-on-primary-fixed",
  },
  {
    id: "2",
    type: "verify",
    title: "Community Verified Status",
    message: "Your profile has been verified as a trusted neighbour in Sector 15.",
    time: "2h ago",
    icon: ShieldCheck,
    color: "bg-secondary-fixed text-on-secondary-fixed",
  },
  {
    id: "3",
    type: "like",
    title: "Anita K. liked your update",
    message: "Anita liked 'Community Garden Clean-up this Sunday'.",
    time: "5h ago",
    icon: Heart,
    color: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <header className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 soft-card-shadow flex items-center justify-between">
        <div>
          <h1 className="headline-lg text-primary font-extrabold tracking-tight">
            Notifications
          </h1>
          <p className="body-md text-on-surface-variant mt-1">
            Stay updated when neighbours reply to your posts or interact with your profile.
          </p>
        </div>
        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-primary-fixed/40 text-primary items-center justify-center">
          <Bell size={28} />
        </div>
      </header>

      <div className="space-y-3">
        {SAMPLE_NOTIFICATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} hoverable className="p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="label-md font-bold text-on-surface truncate">{item.title}</h4>
                  <span className="label-sm text-on-surface-variant/70 shrink-0">{item.time}</span>
                </div>
                <p className="body-md text-on-surface-variant mt-1">{item.message}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
