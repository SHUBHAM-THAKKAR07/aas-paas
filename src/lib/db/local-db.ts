import { User, NearbyPost, HelpProfile, HelpRequest } from "./types";
import { MOCK_USERS, MOCK_NEARBY_POSTS, MOCK_HELP_PROFILES, MOCK_HELP_REQUESTS } from "./mock-data";

const STORAGE_KEY = "aas_paas_local_db";

interface DatabaseSchema {
  users: User[];
  nearby_posts: NearbyPost[];
  help_profiles: HelpProfile[];
  help_requests: HelpRequest[];
}

class LocalDatabase {
  private isClient = typeof window !== "undefined";

  private getDB(): DatabaseSchema {
    if (!this.isClient) return this.getInitialDB();
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initial = this.getInitialDB();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data) as DatabaseSchema;
  }

  private saveDB(db: DatabaseSchema) {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Dispatch event so other components can re-render if needed
    window.dispatchEvent(new Event("local-db-changed"));
  }

  private getInitialDB(): DatabaseSchema {
    return {
      users: MOCK_USERS,
      nearby_posts: MOCK_NEARBY_POSTS,
      help_profiles: MOCK_HELP_PROFILES,
      help_requests: MOCK_HELP_REQUESTS,
    };
  }

  public reset() {
    if (!this.isClient) return;
    localStorage.removeItem(STORAGE_KEY);
    this.getDB(); // Re-initialize
    window.dispatchEvent(new Event("local-db-changed"));
  }

  // --- Users ---
  public async getUser(id: string): Promise<User | undefined> {
    return this.getDB().users.find((u) => u.id === id);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    return this.getDB().users.find((u) => u.email === email);
  }

  public async createUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    const db = this.getDB();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    this.saveDB(db);
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const db = this.getDB();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates, updated_at: new Date().toISOString() };
    this.saveDB(db);
    return db.users[index];
  }

  // --- Nearby Posts ---
  public async getNearbyPosts(): Promise<(NearbyPost & { user: User })[]> {
    const db = this.getDB();
    return db.nearby_posts
      .map((post) => {
        const user = db.users.find((u) => u.id === post.user_id)!;
        return { ...post, user };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async createNearbyPost(post: Omit<NearbyPost, "id" | "created_at" | "updated_at">): Promise<NearbyPost> {
    const db = this.getDB();
    const newPost: NearbyPost = {
      ...post,
      id: `post_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.nearby_posts.push(newPost);
    this.saveDB(db);
    return newPost;
  }

  // --- Help Profiles ---
  public async getHelpProfiles(): Promise<(HelpProfile & { user: User })[]> {
    const db = this.getDB();
    return db.help_profiles
      .map((profile) => {
        const user = db.users.find((u) => u.id === profile.user_id)!;
        return { ...profile, user };
      })
      .sort((a, b) => b.rating - a.rating);
  }

  public async createHelpProfile(profile: Omit<HelpProfile, "id" | "created_at" | "updated_at" | "is_verified" | "rating">): Promise<HelpProfile> {
    const db = this.getDB();
    const newProfile: HelpProfile = {
      ...profile,
      id: `help_${Date.now()}`,
      is_verified: false,
      rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.help_profiles.push(newProfile);
    this.saveDB(db);
    return newProfile;
  }

  // --- Help Requests ---
  public async getHelpRequests(): Promise<(HelpRequest & { user: User })[]> {
    const db = this.getDB();
    return db.help_requests
      .map((req) => {
        const user = db.users.find((u) => u.id === req.user_id)!;
        return { ...req, user };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async createHelpRequest(request: Omit<HelpRequest, "id" | "created_at" | "updated_at" | "status">): Promise<HelpRequest> {
    const db = this.getDB();
    const newRequest: HelpRequest = {
      ...request,
      id: `req_${Date.now()}`,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.help_requests.push(newRequest);
    this.saveDB(db);
    return newRequest;
  }
}

export const db = new LocalDatabase();
