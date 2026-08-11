const API_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "greenbeans_access_token";

// ---------------------------------------------------------------------------
// ----------------------------- HELPER METHODS ------------------------------
// ---------------------------------------------------------------------------

// reads the stored access token
// returns the token string if one is stored, or null if the user is logged out
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

// error type thrown for any non-2xx API response, carrying the HTTP status code alongside the message
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
  headers.set("Content-Type", "application/json");
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
// ---------------------------------- CLAIMS ----------------------------------
// ---------------------------------------------------------------------------

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

// approves a requested claim; only the listing owner can do this
export function approveClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/approve`, { method: "PUT" });
}

// declines a requested claim; only the listing owner can do this
export function declineClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/decline`, { method: "PUT" });
}

// cancels a requested or approved claim; the requester or the listing owner can do this
export function cancelClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/cancel`, { method: "PUT" });
}

// marks an approved claim as picked up once the handoff has happened
export function pickupClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/pickup`, { method: "PUT" });
}

// marks a picked-up claim as completed
// unlocks the "Leave Review" action for both participants
export function completeClaim(claimId: number): Promise<ClaimResponse> {
  return apiFetch<ClaimResponse>(`/v1/claims/${claimId}/complete`, { method: "PUT" });
}

// lists every claim the current user is involved in, as either requester or listing owner
// returns a list of ClaimHistoryResponse objects for the exchange history page
export function listMyClaims(): Promise<ClaimHistoryResponse[]> {
  return apiFetch<ClaimHistoryResponse[]>("/v1/claims/mine");
}

// ---------------------------------------------------------------------------
// ---------------------------------- REVIEWS ---------------------------------
// ---------------------------------------------------------------------------

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

// submits a review of the other participant on a completed exchange
// returns a ReviewResponse with the new review's details
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
// -------------------------------- COMMUNITIES -------------------------------
// ---------------------------------------------------------------------------

export interface CreateCommunityPayload {
  name: string;
  description: string;
  location: string;
  guidelines: string;
  is_private: boolean;
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

export interface MembershipResponse {
  user_id: number;
  community_id: number;
  role: string | null;
  date_joined: string | null;
}

export interface CommunityMemberResponse {
  user_id: number;
  name: string;
  profile_photo_url: string | null;
  role: string | null;
  date_joined: string | null;
}

// lists communities the current user is a member of, plus public communities they are not in
// returns a CommunitiesListResponse split into my_communities and public_communities
export function listCommunities(search?: string): Promise<CommunitiesListResponse> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<CommunitiesListResponse>(`/v1/communities${query}`);
}

// retrieves a single community by ID
// returns a CommunityResponse with the community's details
export function getCommunity(communityId: number): Promise<CommunityResponse> {
  return apiFetch<CommunityResponse>(`/v1/communities/${communityId}`);
}

// creates a new community with the current user as its owner
// returns a CommunityResponse with the new community's details
export function createCommunity(payload: CreateCommunityPayload): Promise<CommunityResponse> {
  return apiFetch<CommunityResponse>("/v1/communities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// invites a user by email to a community
// returns an InvitationResponse with the details of the invitation
export function inviteToCommunity(
  communityId: number,
  email: string
): Promise<InvitationResponse> {
  return apiFetch<InvitationResponse>(`/v1/communities/${communityId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// joins a public community, or requests to join a private one, as the current user
// returns a MembershipResponse with the new membership's details
export function joinCommunity(communityId: number): Promise<MembershipResponse> {
  return apiFetch<MembershipResponse>(`/v1/communities/${communityId}/join`, {
    method: "POST",
  });
}

// leaves a community the current user is a member of
export function leaveCommunity(communityId: number): Promise<void> {
  return apiFetch<void>(`/v1/communities/${communityId}/leave`, {
    method: "POST",
  });
}

// lists the members of a community, including each member's profile photo and role
// returns a list of CommunityMemberResponse objects, ordered by role (owner/moderator first) then name
export function listCommunityMembers(communityId: number): Promise<CommunityMemberResponse[]> {
  return apiFetch<CommunityMemberResponse[]>(`/v1/communities/${communityId}/members`);
}

// promotes or demotes a member between "member" and "moderator"; the community owner's role can't be changed
// returns a CommunityMemberResponse with the member's updated role
export function updateMemberRole(
  communityId: number,
  userId: number,
  role: "member" | "moderator"
): Promise<CommunityMemberResponse> {
  return apiFetch<CommunityMemberResponse>(`/v1/communities/${communityId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

// removes a member from a community; the community owner cannot be removed
export function removeMember(communityId: number, userId: number): Promise<void> {
  return apiFetch<void>(`/v1/communities/${communityId}/members/${userId}`, {
    method: "DELETE",
  });
}

// looks up an invitation by its token, for the invite landing page
// does not require the viewer to be logged in
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
// ------------------------------------ AUTH ----------------------------------
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

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  profile_photo_id: number | null;
  profile_photo_url: string | null;
  rating: number | null;
  review_count: number;
}

// registers a new user account
// returns the created User object
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
