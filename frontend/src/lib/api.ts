const API_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "greenbeans_access_token";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Base fetch utility
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!options.body || typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && (data.detail as string)) || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Types — aligned with backend Pydantic schemas
// ---------------------------------------------------------------------------

export interface User {
  user_id: number;
  name: string;
  email: string;
  profile_photo_id: number | null;
  profile_photo_url: string | null;
  location: string | null;
  rating: number | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ListingResponse {
  listing_id: number;
  user_id: number | null;
  community_id: number | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  status: string | null;
  expiration_date: string | null;
  date_posted: string | null;
  pickup_location: string | null;
  category: string | null;
  photo_url: string | null;
}

export interface ClaimResponse {
  request_id: number;
  listing_id: number | null;
  requester_user_id: number | null;
  quantity_requested: number;
  status: string | null;
  request_date: string | null;
  closed_date: string | null;
}

export interface CommunityResponse {
  community_id: number;
  name: string;
  description: string;
  location: string;
  guidelines: string;
  is_private: boolean;
  member_count: number;
  banner_url: string | null;
}

export interface CommunitiesListResponse {
  my_communities: CommunityResponse[];
  public_communities: CommunityResponse[];
}

export interface MembershipResponse {
  user_id: number;
  community_id: number;
  role: string | null;
  date_joined: string | null;
}

export interface InvitationResponse {
  invitation_id: number;
  community_id: number | null;
  sender_user_id: number | null;
  email: string;
  status: string | null;
  sent_date: string | null;
  expiration_date: string | null;
}

export interface MessageResponse {
  message_id: number;
  thread_id: number;
  sender_user_id: number | null;
  content: string;
  timestamp: string | null;
}

export interface MessageThreadResponse {
  thread_id: number;
  claim_request_id: number | null;
  listing_id: number | null;
  participant_ids: number[];
  messages: MessageResponse[];
}

export interface PhotoResponse {
  photo_id: number;
  image_link: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerUser(payload: RegisterPayload): Promise<User> {
  return apiFetch<User>("/v1/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/v1/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/v1/me");
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export interface CreateListingPayload {
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  expiration_date?: string;
  pickup_location?: string;
  category?: string;
  community_id?: number;
  photo_id?: number;
}

export interface UpdateListingPayload {
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  category?: string;
  expiration_date?: string;
  pickup_location?: string;
}

export function browseListings(params?: {
  community_id?: number;
  category?: string;
  status?: string;
  search?: string;
}): Promise<ListingResponse[]> {
  const searchParams = new URLSearchParams();
  if (params?.community_id) searchParams.set("community_id", String(params.community_id));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.status) searchParams.set("status_filter", params.status);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return apiFetch<ListingResponse[]>(`/v1/listings${qs ? `?${qs}` : ""}`);
}

export function getListing(listingId: number): Promise<ListingResponse> {
  return apiFetch<ListingResponse>(`/v1/listings/${listingId}`);
}

export function createListing(payload: CreateListingPayload): Promise<ListingResponse> {
  return apiFetch<ListingResponse>("/v1/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateListing(
  listingId: number,
  payload: UpdateListingPayload
): Promise<ListingResponse> {
  return apiFetch<ListingResponse>(`/v1/listings/${listingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteListing(listingId: number): Promise<void> {
  return apiFetch<void>(`/v1/listings/${listingId}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function uploadPhoto(file: File): Promise<PhotoResponse> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/v1/photos`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && (data.detail as string)) || `Upload failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return data as PhotoResponse;
}

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

export interface CreateCommunityPayload {
  name: string;
  description: string;
  location: string;
  guidelines: string;
  is_private: boolean;
}

export function listCommunities(search?: string): Promise<CommunitiesListResponse> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<CommunitiesListResponse>(`/v1/communities${params}`);
}

export function getCommunity(communityId: number): Promise<CommunityResponse> {
  return apiFetch<CommunityResponse>(`/v1/communities/${communityId}`);
}

export function createCommunity(payload: CreateCommunityPayload): Promise<CommunityResponse> {
  return apiFetch<CommunityResponse>("/v1/communities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCommunity(
  communityId: number,
  payload: CreateCommunityPayload
): Promise<CommunityResponse> {
  return apiFetch<CommunityResponse>(`/v1/communities/${communityId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function joinCommunity(communityId: number): Promise<MembershipResponse> {
  return apiFetch<MembershipResponse>(`/v1/communities/${communityId}/join`, {
    method: "POST",
  });
}

export function leaveCommunity(communityId: number): Promise<void> {
  return apiFetch<void>(`/v1/communities/${communityId}/leave`, {
    method: "POST",
  });
}

export function inviteToCommunity(
  communityId: number,
  email: string
): Promise<InvitationResponse> {
  return apiFetch<InvitationResponse>(`/v1/communities/${communityId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export function getClaimsForListing(listingId: number): Promise<ClaimResponse[]> {
  return apiFetch<ClaimResponse[]>(`/v1/listings/${listingId}/claims`);
}

export function createClaim(
  listingId: number,
  quantityRequested: number
): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/listings/${listingId}/claims`, {
    method: "POST",
    body: JSON.stringify({ quantity_requested: quantityRequested }),
  });
}

export function approveClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/approve`, {
    method: "PUT",
  });
}

export function declineClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/decline`, {
    method: "PUT",
  });
}

export function cancelClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/cancel`, {
    method: "PUT",
  });
}

export function pickupClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/pickup`, {
    method: "PUT",
  });
}

export function completeClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/complete`, {
    method: "PUT",
  });
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function getThread(claimId: number): Promise<MessageThreadResponse> {
  return apiFetch<MessageThreadResponse>(`/v1/claims/${claimId}/thread`);
}

export function sendMessage(claimId: number, content: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/v1/claims/${claimId}/thread/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
