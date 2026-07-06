export interface User {
  user_id: number;
  name: string;
  email: string;
  profile_photo_id: number | null;
  profile_photo_url: string | null;
  location?: string;
  rating?: number;
}

export interface Community {
  community_id: number;
  name: string;
  is_private: boolean;
  description?: string;
  member_count?: number;
  banner_url?: string;
}

export interface Listing {
  listing_id: number;
  user_id: number;
  community_id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  status: "available" | "reserved" | "expiring-soon" | "picked-up" | "completed" | "closed";
  expiration_date: string;
  date_posted: string;
  pickup_location: string;
  photo_url: string;
}

export interface ClaimRequest {
  request_id: number;
  listing_id: number;
  requester_user_id: number;
  quantity_requested: number;
  status: "pending" | "approved" | "denied" | "canceled" | "completed";
  request_date: string;
  closed_date: string | null;
}

export interface Message {
  message_id: number;
  thread_id: number;
  sender_user_id: number;
  content: string;
  timestamp: string;
}

export interface MessageThread {
  thread_id: number;
  claim_request_id: number;
  listing_id: number;
  participant_ids: [number, number];
  messages: Message[];
}

export interface Notification {
  notification_id: number;
  user_id: number;
  content: string;
  timestamp: string;
  is_read: boolean;
  type: "message" | "claim" | "community" | "listing";
}

export interface CommunityPost {
  post_id: number;
  community_id: number;
  user_id: number;
  content: string;
  timestamp: string;
}

export interface Membership {
  user_id: number;
  community_id: number;
  role: "member" | "admin";
  date_joined: string;
}

export interface JoinRequest {
  request_id: number;
  community_id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected";
  request_date: string;
}
