import { User, NearbyPost, HelpProfile, HelpRequest } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: "user_1",
    email: "priya.sharma@example.com",
    full_name: "Priya Sharma",
    avatar_url: "",
    bio: "Love helping out in the neighbourhood. Baking enthusiast.",
    neighbourhood: "Bandra West",
    location_radius: 5,
    neighbour_score: 120,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user_2",
    email: "rahul.verma@example.com",
    full_name: "Rahul Verma",
    avatar_url: "",
    bio: "Electrician by profession. Happy to help with minor fixes.",
    neighbourhood: "Andheri East",
    location_radius: 10,
    neighbour_score: 350,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_NEARBY_POSTS: NearbyPost[] = [
  {
    id: "post_1",
    user_id: "user_1",
    content: "Has anyone seen a small brown indie dog near Carter Road? Wearing a red collar.",
    category: "Lost & Found",
    images: [],
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post_2",
    user_id: "user_2",
    content: "Water supply will be cut off tomorrow between 10 AM and 2 PM due to maintenance.",
    category: "Alert",
    images: [],
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_HELP_PROFILES: HelpProfile[] = [
  {
    id: "help_1",
    user_id: "user_2",
    category: "Electrical",
    description: "I can fix fans, lights, and minor wiring issues for free on weekends.",
    is_verified: true,
    rating: 4.8,
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_HELP_REQUESTS: HelpRequest[] = [
  {
    id: "req_1",
    user_id: "user_1",
    title: "Need a ladder for 1 hour",
    description: "I need to clean my overhead fan. Does anyone have a 6ft ladder I can borrow today?",
    category: "Tools",
    status: "open",
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  }
];
