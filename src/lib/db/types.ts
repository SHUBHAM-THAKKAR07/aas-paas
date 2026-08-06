// src/lib/db/types.ts

export type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  neighbourhood: string;
  location_radius: number;
  neighbour_score: number;
  created_at: string;
  updated_at: string;
};

export type NearbyPost = {
  id: string;
  user_id: string;
  content: string;
  category: string; // 'Alert' | 'Event' | 'Lost & Found' | 'Recommendation' | 'Other'
  images: string[];
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type HelpProfile = {
  id: string;
  user_id: string;
  category: string; // 'Plumbing' | 'Electrical' | 'Tuition' | 'Cooking' | 'Pet Care' | 'Other'
  description: string;
  is_verified: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type HelpRequest = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string; // 'Tools' | 'Medical' | 'Food' | 'Errands' | 'Other'
  status: 'open' | 'resolved';
  expires_at: string;
  created_at: string;
  updated_at: string;
};

// Joined types for UI
export type NearbyPostWithUser = NearbyPost & { user: User };
export type HelpProfileWithUser = HelpProfile & { user: User };
export type HelpRequestWithUser = HelpRequest & { user: User };
