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
  // FormData bodies (file uploads) need the browser to set their own multipart boundary,
  // so only force JSON for plain object bodies
  if (!(options.body instanceof FormData)) {
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
// ----------------------------- LISTINGS & PHOTOS ---------------------------
// ---------------------------------------------------------------------------

export interface CreateListingPayload {
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  expiration_date?: string | null;
  pickup_location?: string | null;
  category?: string | null;
  community_id?: number | null;
  photo_id?: number | null;
}

export interface ListingUpdatePayload {
  name?: string;
  description?: string | null;
  quantity?: number;
  unit?: string | null;
  status?: string | null;
  category?: string | null;
  expiration_date?: string | null;
  pickup_location?: string | null;
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

export interface PhotoResponse {
  photo_id: number;
  image_link: string;
}

// uploads an image file for use on a listing
// returns a PhotoResponse with the new photo's ID (to attach to a listing) and its public URL
export function uploadPhoto(file: File): Promise<PhotoResponse> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch<PhotoResponse>("/v1/photos", {
    method: "POST",
    body,
  });
}

// creates a new listing for the current user
// returns a ListingResponse with the new listing's details
export function createListing(payload: CreateListingPayload): Promise<ListingResponse> {
  return apiFetch<ListingResponse>("/v1/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// lists listings with optional filtering by community, category, status, and search term
// returns a list of ListingResponse objects matching the filters
export function listListings(params?: {
  community_id?: number;
  category?: string;
  status_filter?: string;
  search?: string;
}): Promise<ListingResponse[]> {
  const query = new URLSearchParams();

  // builds a query string from only the params that were actually provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
  }
  const queryString = query.toString();
  return apiFetch<ListingResponse[]>(`/v1/listings${queryString ? `?${queryString}` : ""}`);
}

// retrieves a single listing by ID
// returns a ListingResponse with the listing's details
export function getListing(listingId: number): Promise<ListingResponse> {
  return apiFetch<ListingResponse>(`/v1/listings/${listingId}`);
}

// updates a listing owned by the current user
// returns a ListingResponse with the updated listing's details
export function updateListing(
  listingId: number,
  payload: ListingUpdatePayload
): Promise<ListingResponse> {
  return apiFetch<ListingResponse>(`/v1/listings/${listingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// deletes a listing owned by the current user
export function deleteListing(listingId: number): Promise<void> {
  return apiFetch<void>(`/v1/listings/${listingId}`, {
    method: "DELETE",
  });
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

// leaves a community the current user is a member of
export function leaveCommunity(communityId: number): Promise<void> {
  return apiFetch<void>(`/v1/communities/${communityId}/leave`, {
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
