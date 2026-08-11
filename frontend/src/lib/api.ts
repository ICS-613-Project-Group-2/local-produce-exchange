const API_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "greenbeans_access_token";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// stores the access token after a successful login or registration
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// removes the stored access token, logging the user out
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

// sends a request to the backend API, attaching the auth token and JSON headers automatically
// returns the parsed JSON response body; throws an ApiError if the response status is not ok
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

  // no body to parse on a 204 No Content response
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  // surfaces the backend's error detail message, if any, when the request fails
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
  review_count: number;
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

export interface ClaimHistoryResponse {
  request_id: number;
  listing_id: number | null;
  listing_name: string;
  listing_photo_url: string | null;
  quantity_requested: number;
  status: string | null;
  request_date: string | null;
  closed_date: string | null;
  role: "owner" | "claimant";
  other_user_id: number | null;
  other_user_name: string | null;
  can_review: boolean;
  already_reviewed: boolean;
}

export interface CommunityResponse {
  community_id: number;
  name: string;
  description: string;
  location: string;
  guidelines: string;
  is_private: boolean | null;
  member_count: number;
  banner_url: string | null;
  my_role: string | null;
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
  invite_link: string;
}

export interface InvitationPreview {
  community_id: number;
  community_name: string;
  community_description: string;
  inviter_name: string | null;
  email: string;
  status: string | null;
  expiration_date: string | null;
  is_expired: boolean;
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
  claim_status: string | null;
  listing_id: number | null;
  participant_ids: number[];
  messages: MessageResponse[];
}

export interface PhotoResponse {
  photo_id: number;
  image_link: string;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string | null;
}

export interface ReviewResponse {
  review_id: number;
  claim_request_id: number | null;
  reviewer_user_id: number | null;
  reviewer_name: string | null;
  reviewed_user_id: number | null;
  rating: number;
  comment: string | null;
  review_date: string | null;
}

export interface UserReviewsResponse {
  average_rating: number | null;
  review_count: number;
  reviews: ReviewResponse[];
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
  banner_photo_id?: number | null;
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

// invites a user by email to a community
// returns an InvitationResponse whose invite_link is the shareable URL to send/copy to the invitee
export function inviteToCommunity(
  communityId: number,
  email: string
): Promise<InvitationResponse> {
  return apiFetch<InvitationResponse>(`/v1/communities/${communityId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// looks up an invitation by its token, for the invite landing page
// returns an InvitationPreview with the community and inviter details
export function getInvitationPreview(token: string): Promise<InvitationPreview> {
  return apiFetch<InvitationPreview>(`/v1/invitations/${token}`);
}

// accepts an invitation by its token, joining the current user to its community
// returns a MembershipResponse with the new membership's details
export function acceptInvitation(token: string): Promise<MembershipResponse> {
  return apiFetch<MembershipResponse>(`/v1/invitations/${token}/accept`, {
    method: "POST",
  });
}

// declines an invitation by its token
export function declineInvitation(token: string): Promise<void> {
  return apiFetch<void>(`/v1/invitations/${token}/decline`, {
    method: "POST",
  });
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

// logs in with an email and password
// returns a TokenResponse with the access token to store for authenticated requests
export function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/v1/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// retrieves the currently logged-in user
// returns the User object for the account tied to the stored access token
export function getMe(): Promise<User> {
  return apiFetch<User>("/v1/me");
}

// lists only the current user's own listings
export function getMyListings(): Promise<ListingResponse[]> {
  return apiFetch<ListingResponse[]>("/v1/me/listings");
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
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/approve`, { method: "PUT" });
}

export function declineClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/decline`, { method: "PUT" });
}

export function cancelClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/cancel`, { method: "PUT" });
}

export function pickupClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/pickup`, { method: "PUT" });
}

export function completeClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/complete`, { method: "PUT" });
}

// lists every claim the current user is involved in, as either requester or listing owner
export function listMyClaims(): Promise<ClaimHistoryResponse[]> {
  return apiFetch<ClaimHistoryResponse[]>("/v1/claims/mine");
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

// submits a review of the other participant on a completed exchange
export function createReview(claimId: number, payload: CreateReviewPayload): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>(`/v1/claims/${claimId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// retrieves the reviews a user has received, along with their average rating
export function getUserReviews(userId: number): Promise<UserReviewsResponse> {
  return apiFetch<UserReviewsResponse>(`/v1/users/${userId}/reviews`);
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

// ---------------------------------------------------------------------------
// Inbox (list all message threads for the current user)
// ---------------------------------------------------------------------------

export function getMyThreads(): Promise<MessageThreadResponse[]> {
  return apiFetch<MessageThreadResponse[]>("/v1/me/threads");
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface UpdateProfilePayload {
  name?: string;
  location?: string;
  profile_photo_id?: number | null;
}

export function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  return apiFetch<User>("/v1/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface NotificationResponse {
  notification_id: number;
  user_id: number | null;
  message_id: number | null;
  claim_request_id: number | null;
  content: string;
  timestamp: string | null;
  is_read: boolean;
  type: string | null;
}

export function getMyNotifications(): Promise<NotificationResponse[]> {
  return apiFetch<NotificationResponse[]>("/v1/me/notifications");
}

export function markNotificationRead(notificationId: number): Promise<NotificationResponse> {
  return apiFetch<NotificationResponse>(`/v1/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>("/v1/me/notifications/read-all", {
    method: "PUT",
  });
}

// ---------------------------------------------------------------------------
// Community Members
// ---------------------------------------------------------------------------

export function getCommunityMembers(communityId: number): Promise<MembershipResponse[]> {
  return apiFetch<MembershipResponse[]>(`/v1/communities/${communityId}/members`);
}

// promotes a regular member to moderator; only the community owner can do this
export function promoteMember(communityId: number, userId: number): Promise<MembershipResponse> {
  return apiFetch<MembershipResponse>(`/v1/communities/${communityId}/members/${userId}/promote`, {
    method: "PUT",
  });
}

// demotes a moderator back to a regular member; only the community owner can do this
export function demoteMember(communityId: number, userId: number): Promise<MembershipResponse> {
  return apiFetch<MembershipResponse>(`/v1/communities/${communityId}/members/${userId}/demote`, {
    method: "PUT",
  });
}

// removes a member from the community; owners can remove members and moderators,
// moderators can only remove regular members
export function removeCommunityMember(communityId: number, userId: number): Promise<void> {
  return apiFetch<void>(`/v1/communities/${communityId}/members/${userId}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Community Posts
// ---------------------------------------------------------------------------

export interface CommunityPostResponse {
  post_id: number;
  community_id: number;
  user_id: number;
  content: string;
  timestamp: string | null;
}

export function getCommunityPosts(communityId: number): Promise<CommunityPostResponse[]> {
  return apiFetch<CommunityPostResponse[]>(`/v1/communities/${communityId}/posts`);
}

export function createCommunityPost(
  communityId: number,
  content: string
): Promise<CommunityPostResponse> {
  return apiFetch<CommunityPostResponse>(`/v1/communities/${communityId}/posts`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// ---------------------------------------------------------------------------
// Join Requests
// ---------------------------------------------------------------------------

export interface JoinRequestResponse {
  request_id: number;
  community_id: number;
  user_id: number;
  status: string | null;
  request_date: string | null;
}

export function getJoinRequests(communityId: number): Promise<JoinRequestResponse[]> {
  return apiFetch<JoinRequestResponse[]>(`/v1/communities/${communityId}/join-requests`);
}

export function approveJoinRequest(
  communityId: number,
  requestId: number
): Promise<JoinRequestResponse> {
  return apiFetch<JoinRequestResponse>(
    `/v1/communities/${communityId}/join-requests/${requestId}/approve`,
    { method: "PUT" }
  );
}

export function rejectJoinRequest(
  communityId: number,
  requestId: number
): Promise<JoinRequestResponse> {
  return apiFetch<JoinRequestResponse>(
    `/v1/communities/${communityId}/join-requests/${requestId}/reject`,
    { method: "PUT" }
  );
}

// ---------------------------------------------------------------------------
// User lookup (for displaying names in threads, history, etc.)
// ---------------------------------------------------------------------------

export function getUser(userId: number): Promise<User> {
  return apiFetch<User>(`/v1/users/${userId}`);
}
