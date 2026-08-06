"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db/local-db";
import { NearbyPostWithUser } from "@/lib/db/types";
import { useAuth } from "@/lib/auth/AuthContext";

export default function NearbyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<NearbyPostWithUser | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: "c1", author: "Rahul M.", text: "Thanks for sharing this update!", time: "10m ago" }
  ]);

  useEffect(() => {
    db.getNearbyPosts().then((posts) => {
      const found = posts.find((p) => p.id === id);
      if (found) setPost(found);
    });
  }, [id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        author: user?.full_name || "You",
        text: commentText,
        time: "Just now",
      },
    ]);
    setCommentText("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/nearby" className="inline-flex items-center gap-1.5 label-md font-bold text-primary hover:underline">
        <ArrowLeft size={18} /> Back to Nearby
      </Link>

      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center text-lg">
              {post?.user?.full_name?.charAt(0) || "P"}
            </div>
            <div>
              <h3 className="label-md font-bold text-on-surface">{post?.user?.full_name || "Priya M."}</h3>
              <p className="label-sm text-on-surface-variant flex items-center gap-1">
                <MapPin size={12} className="text-secondary" /> Indiranagar · 20m ago
              </p>
            </div>
          </div>
          <Badge variant="nearby">{post?.category || "General"}</Badge>
        </div>

        <p className="body-lg text-on-surface leading-relaxed">
          {post?.content || "Discussion and details regarding this neighbourhood update."}
        </p>

        {post?.images && post.images.length > 0 && (
          <div className="grid gap-2">
            {post.images.map((img, i) => (
              <img key={i} src={img} alt="Post media" className="w-full rounded-2xl object-cover max-h-80" />
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-outline-variant/20 space-y-4">
          <h4 className="headline-md font-bold text-on-surface">Responses ({comments.length})</h4>

          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="label-md font-bold text-on-surface">{c.author}</span>
                  <span className="label-sm text-on-surface-variant/70">{c.time}</span>
                </div>
                <p className="body-md text-on-surface-variant">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="space-y-3 pt-2">
            <Textarea
              rows={3}
              placeholder="Write a response or reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="md" className="hover-lift" rightIcon={<Send size={16} />}>
              Post Response
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
