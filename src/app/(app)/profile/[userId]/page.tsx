"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Award, Pencil, CalendarDays, HeartHandshake, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { db } from "@/lib/db/local-db";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NearbyPostCard } from "@/features/nearby/components/NearbyPostCard";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { startDirectConversation } from "@/features/messaging";
import { formatDate } from "@/lib/utils/format";
import type { User as UserProfile, NearbyPostWithUser, HelpProfileWithUser } from "@/lib/db/types";
import type { TrustLevel } from "@/types/domain";

function trustLevelFor(score: number | null): TrustLevel {
  if (!score || score <= 0) return "new";
  if (score >= 100) return "verified";
  if (score >= 60) return "trusted";
  if (score >= 30) return "basic";
  return "new";
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: me } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<NearbyPostWithUser[]>([]);
  const [helpProfile, setHelpProfile] = useState<HelpProfileWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  const load = useCallback(async () => {
    const [u, allPosts, helpProfiles] = await Promise.all([
      db.getUser(userId),
      db.getNearbyPosts(),
      db.getHelpProfiles(),
    ]);
    if (u) {
      setProfile(u);
      setPosts(allPosts.filter((p) => p.user_id === userId));
      setHelpProfile(helpProfiles.find((h) => h.user_id === userId) ?? null);
    }
    setLoading(false);
  }, [userId]);

  // Initial state is already `true`; load() flips it off after the fetch.
  // Deferred through a microtask so setState never runs synchronously.
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    const refresh = () => void load();
    window.addEventListener("local-db-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("local-db-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [load]);

  const isMe = me?.id === userId;

  const handleMessage = async () => {
    if (!me || messaging) return;
    setMessaging(true);
    const conversationId = await startDirectConversation(me.id, userId);
    setMessaging(false);
    if (conversationId) router.push(`/messages?c=${conversationId}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-8 soft-card-shadow flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<User size={28} />}
          title="Neighbour not found"
          description="This profile may have been removed or the link is incorrect."
          actionLabel="Back to Home"
          onAction={() => router.push("/home")}
        />
      </div>
    );
  }

  const firstName = profile.full_name?.split(" ")[0] || "Neighbour";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 label-md font-bold text-primary hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Profile header card */}
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest soft-card-shadow p-6 md:p-8 flex flex-col items-center md:items-start md:flex-row gap-6">
        <Avatar src={profile.avatar_url} fallback={profile.full_name} size="xl" className="shrink-0" />

        <div className="flex-1 text-center md:text-left space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h2 className="headline-lg text-on-surface font-extrabold">{profile.full_name}</h2>
            <TrustBadge level={trustLevelFor(profile.neighbour_score)} />
          </div>
          <p className="body-md text-on-surface-variant flex items-center justify-center md:justify-start gap-1 font-medium">
            <MapPin size={16} className="text-secondary" />
            {profile.neighbourhood || "Neighbourhood not set"}
          </p>
          <p className="body-md text-on-surface-variant max-w-xl">
            {profile.bio || "Active community member on Aas-Paas."}
          </p>

          <div className="pt-1 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant label-sm font-semibold">
              <Award size={14} /> Score: {profile.neighbour_score || 0}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container label-sm font-semibold">
              <CalendarDays size={14} /> Member since {formatDate(profile.created_at, "MMM yyyy")}
            </span>
            {helpProfile && (
              <Badge variant="help">
                <HeartHandshake size={14} /> Offers {helpProfile.category}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {isMe ? (
          <Button
            variant="outline"
            size="lg"
            className="flex-1 hover-lift"
            leftIcon={<Pencil size={18} />}
            onClick={() => router.push("/profile")}
          >
            Edit My Profile
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="flex-1 hover-lift"
            leftIcon={<MessageCircle size={18} />}
            onClick={handleMessage}
            isLoading={messaging}
          >
            Message
          </Button>
        )}
      </div>

      {/* Community updates */}
      <section aria-label={`Posts by ${firstName}`}>
        <h3 className="headline-md font-bold text-on-surface mb-3">
          Community updates by {firstName}
        </h3>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-outline-variant/50 bg-surface-container-low/50 p-8 text-center">
            <p className="body-md text-on-surface-variant">
              {firstName} hasn&apos;t shared any updates yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <NearbyPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
