import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, MessageCircle, Heart, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NearbyPostWithUser } from "@/lib/db/types";

interface AuthorBlockProps {
  avatar: string;
  name: string;
  createdAt: string;
  hoverClass?: string;
}

function AuthorBlock({ avatar, name, createdAt, hoverClass }: AuthorBlockProps) {
  return (
    <>
      <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center text-base shrink-0 overflow-hidden border border-outline-variant/40">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`label-md font-bold text-on-surface ${hoverClass || ""} transition-colors`}>
            {name}
          </span>
          <span className="label-sm text-on-surface-variant/70 shrink-0">
            · {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5 label-sm text-on-surface-variant">
          <MapPin size={12} className="text-secondary" />
          <span>Indiranagar · 300m away</span>
        </div>
      </div>
    </>
  );
}

interface NearbyPostCardProps {
  post: NearbyPostWithUser;
}

export function NearbyPostCard({ post }: NearbyPostCardProps) {
  const [likes, setLikes] = useState(12);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const authorName = post.user?.full_name || "Neighbour";

  return (
    <Card hoverable className="p-6 overflow-hidden">
      <div className="flex items-start justify-between">
        {post.user ? (
          <Link
            href={`/profile/${post.user.id}`}
            className="flex items-center gap-3 group min-w-0"
          >
            <AuthorBlock
              avatar={post.user.avatar_url}
              name={authorName}
              createdAt={post.created_at}
              hoverClass="group-hover:text-primary"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <AuthorBlock
              avatar=""
              name={authorName}
              createdAt={post.created_at}
            />
          </div>
        )}

        <Badge variant="nearby" className="shrink-0">
          {post.category}
        </Badge>
      </div>

      <div className="mt-4">
        <p className="body-md text-on-surface whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {post.images && post.images.length > 0 && (
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr' }}>
          {post.images.map((image, i) => (
            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden bg-surface-container-high">
              <img
                src={image}
                alt="Post attachment"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-outline-variant/20 pt-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 label-sm font-semibold transition-colors ${
              isLiked ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <Heart size={18} className={isLiked ? "fill-primary" : ""} />
            <span>{likes} Likes</span>
          </button>
          <Link
            href={`/nearby/${post.id}`}
            className="flex items-center gap-1.5 label-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <MessageCircle size={18} />
            <span>Respond</span>
          </Link>
        </div>
        <button className="flex items-center gap-1.5 label-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
          <Share2 size={18} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </Card>
  );
}
