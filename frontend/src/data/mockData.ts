import type { User, Community, Listing, ClaimRequest, Notification, MessageThread, CommunityPost, Membership, JoinRequest } from "./types";

export const mockUsers: User[] = [
  {
    user_id: 1,
    name: "Lily Chen",
    email: "lily@example.com",
    profile_photo_id: 1,
    profile_photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    location: "Mānoa Valley",
    rating: 4.8,
  },
  {
    user_id: 2,
    name: "Oliver Lee",
    email: "oliver@example.com",
    profile_photo_id: 2,
    profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    location: "UH Mānoa",
    rating: 4.5,
  },
  {
    user_id: 3,
    name: "Rose Johnson",
    email: "rose@example.com",
    profile_photo_id: 3,
    profile_photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    location: "Mānoa",
    rating: 4.9,
  },
  {
    user_id: 4,
    name: "Glen Kim",
    email: "glen@example.com",
    profile_photo_id: null,
    profile_photo_url: null,
    location: "Northside",
    rating: 4.7,
  },
  {
    user_id: 5,
    name: "Malia Nakamura",
    email: "malia@example.com",
    profile_photo_id: 5,
    profile_photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    location: "Kailua",
    rating: 4.9,
  },
  {
    user_id: 6,
    name: "Keoni Tavares",
    email: "keoni@example.com",
    profile_photo_id: 6,
    profile_photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    location: "Hawaiʻi Kai",
    rating: 4.6,
  },
  {
    user_id: 7,
    name: "Aiko Yamamoto",
    email: "aiko@example.com",
    profile_photo_id: 7,
    profile_photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    location: "Kaimukī",
    rating: 4.8,
  },
];

export const mockCommunities: Community[] = [
  {
    community_id: 1,
    name: "Mānoa Valley Garden Share",
    is_private: false,
    description: "Neighbors in Mānoa Valley sharing backyard garden produce. From East Mānoa Road to Woodlawn — if you grow it, share it!",
    member_count: 42,
    banner_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=300&fit=crop",
  },
  {
    community_id: 2,
    name: "UH Mānoa Food Exchange",
    is_private: false,
    description: "Students and faculty at UH Mānoa sharing surplus food on campus. Reduce waste, save money, eat fresh.",
    member_count: 128,
    banner_url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=300&fit=crop",
  },
  {
    community_id: 3,
    name: "Northside Pantry Network",
    is_private: true,
    description: "A private group for food pantry coordinators and volunteers to share donation availability.",
    member_count: 15,
    banner_url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=300&fit=crop",
  },
  {
    community_id: 4,
    name: "Kailua Neighborhood Exchange",
    is_private: false,
    description: "Kailua residents sharing fresh produce, baked goods, and pantry items. From Lanikai to Enchanted Lake.",
    member_count: 67,
    banner_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=300&fit=crop",
  },
  {
    community_id: 5,
    name: "Hawaiʻi Kai Growers Co-op",
    is_private: false,
    description: "Backyard gardeners in Hawaiʻi Kai sharing tropical fruits, veggies, and herbs. Marinas to Portlock.",
    member_count: 34,
    banner_url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&h=300&fit=crop",
  },
  {
    community_id: 6,
    name: "Kaimukī Community Kitchen",
    is_private: false,
    description: "Home cooks and bakers in Kaimukī sharing surplus meals, baked goods, and preserves with neighbors.",
    member_count: 51,
    banner_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop",
  },
];

export const mockListings: Listing[] = [
  {
    listing_id: 1,
    user_id: 1,
    community_id: 1,
    name: "Fresh Tomatoes",
    description: "Heirloom tomatoes from my backyard garden. Mixed sizes, all ripe and ready to eat. Great for salads or sandwiches.",
    quantity: 8,
    unit: "lbs",
    category: "Vegetables",
    status: "available",
    expiration_date: "2026-07-06",
    date_posted: "2026-07-01",
    pickup_location: "2845 Oahu Ave, front porch",
    photo_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
  },
  {
    listing_id: 2,
    user_id: 1,
    community_id: 1,
    name: "Organic Zucchini",
    description: "Overgrown zucchini from the garden. Various sizes. Perfect for baking zucchini bread or grilling.",
    quantity: 5,
    unit: "pieces",
    category: "Vegetables",
    status: "expiring-soon",
    expiration_date: "2026-07-03",
    date_posted: "2026-06-30",
    pickup_location: "2845 Oahu Ave, side gate",
    photo_url: "https://images.unsplash.com/photo-1563252722-6434563a985d?w=400&h=300&fit=crop",
  },
  {
    listing_id: 3,
    user_id: 3,
    community_id: 2,
    name: "Sourdough Bread Loaves",
    description: "Baked fresh this morning. I made too many and want to share before they go stale. No nuts or dairy.",
    quantity: 3,
    unit: "loaves",
    category: "Baked Goods",
    status: "available",
    expiration_date: "2026-07-04",
    date_posted: "2026-07-02",
    pickup_location: "Campus Center, Room 104",
    photo_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
  },
  {
    listing_id: 4,
    user_id: 2,
    community_id: 2,
    name: "Fresh Basil Bunches",
    description: "Homegrown basil, very fragrant. Great for pesto, pasta, or caprese salad.",
    quantity: 4,
    unit: "bunches",
    category: "Herbs",
    status: "available",
    expiration_date: "2026-07-05",
    date_posted: "2026-07-01",
    pickup_location: "Hale Aloha, buzz #302",
    photo_url: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=300&fit=crop",
  },
  {
    listing_id: 5,
    user_id: 4,
    community_id: 3,
    name: "Canned Vegetables Assortment",
    description: "Donated canned goods from a local drive. Corn, green beans, and diced tomatoes. All within expiration.",
    quantity: 12,
    unit: "cans",
    category: "Pantry Items",
    status: "available",
    expiration_date: "2027-03-15",
    date_posted: "2026-07-01",
    pickup_location: "Northside Community Center, back entrance",
    photo_url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop",
  },
  {
    listing_id: 6,
    user_id: 3,
    community_id: 1,
    name: "Meyer Lemons",
    description: "From my backyard lemon tree. Thin-skinned and sweeter than store-bought. Great for cooking or lemonade.",
    quantity: 10,
    unit: "pieces",
    category: "Fruits",
    status: "reserved",
    expiration_date: "2026-07-08",
    date_posted: "2026-06-29",
    pickup_location: "3142 Woodlawn Dr, front steps",
    photo_url: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=300&fit=crop",
  },
  {
    listing_id: 7,
    user_id: 1,
    community_id: 1,
    name: "Strawberry Jam",
    description: "Homemade strawberry jam from this season's harvest. Sealed jars, no preservatives.",
    quantity: 6,
    unit: "jars",
    category: "Pantry Items",
    status: "completed",
    expiration_date: "2026-12-01",
    date_posted: "2026-06-20",
    pickup_location: "2845 Oahu Ave, front porch",
    photo_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
  },
  {
    listing_id: 8,
    user_id: 5,
    community_id: 4,
    name: "Lilikoi (Passion Fruit)",
    description: "Fresh lilikoi from my backyard vine. Sweet and tangy — great for juice, desserts, or eating fresh. Picked this morning.",
    quantity: 15,
    unit: "pieces",
    category: "Fruits",
    status: "available",
    expiration_date: "2026-07-07",
    date_posted: "2026-07-02",
    pickup_location: "342 Kawailoa Rd, Kailua, front lanai",
    photo_url: "https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=400&h=300&fit=crop",
  },
  {
    listing_id: 9,
    user_id: 5,
    community_id: 4,
    name: "Fresh Papayas",
    description: "Ripe solo papayas from my tree. Two large ones ready to eat now, one still slightly green.",
    quantity: 3,
    unit: "pieces",
    category: "Fruits",
    status: "available",
    expiration_date: "2026-07-05",
    date_posted: "2026-07-01",
    pickup_location: "342 Kawailoa Rd, Kailua, front lanai",
    photo_url: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&h=300&fit=crop",
  },
  {
    listing_id: 10,
    user_id: 6,
    community_id: 5,
    name: "Dragon Fruit",
    description: "White-fleshed dragon fruit from my garden. Beautiful and refreshing. Great in smoothies or fruit bowls.",
    quantity: 4,
    unit: "pieces",
    category: "Fruits",
    status: "available",
    expiration_date: "2026-07-06",
    date_posted: "2026-07-02",
    pickup_location: "7012 Kalanianaʻole Hwy, gate code #4455",
    photo_url: "https://images.unsplash.com/photo-1527325678964-54921661f888?w=400&h=300&fit=crop",
  },
  {
    listing_id: 11,
    user_id: 6,
    community_id: 5,
    name: "Thai Basil & Mint Bundle",
    description: "Big bunch of Thai basil and mint from the garden. Perfect for pho, curries, or mojitos.",
    quantity: 3,
    unit: "bunches",
    category: "Herbs",
    status: "expiring-soon",
    expiration_date: "2026-07-03",
    date_posted: "2026-07-01",
    pickup_location: "7012 Kalanianaʻole Hwy, gate code #4455",
    photo_url: "https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=400&h=300&fit=crop",
  },
  {
    listing_id: 12,
    user_id: 7,
    community_id: 6,
    name: "Banana Bread Loaves",
    description: "Made with local apple bananas. Moist, not too sweet. Wrapped and ready to go. Contains eggs and flour.",
    quantity: 4,
    unit: "loaves",
    category: "Baked Goods",
    status: "available",
    expiration_date: "2026-07-05",
    date_posted: "2026-07-02",
    pickup_location: "1128 12th Ave, Kaimukī, side door",
    photo_url: "https://images.unsplash.com/photo-1569762404472-026308ba6b64?w=400&h=300&fit=crop",
  },
  {
    listing_id: 13,
    user_id: 7,
    community_id: 6,
    name: "Pickled Mango",
    description: "Homemade pickled green mango — li hing style. Sealed mason jars, good for weeks.",
    quantity: 5,
    unit: "jars",
    category: "Pantry Items",
    status: "available",
    expiration_date: "2026-08-01",
    date_posted: "2026-07-01",
    pickup_location: "1128 12th Ave, Kaimukī, side door",
    photo_url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop",
  },
];

export const mockClaimRequests: ClaimRequest[] = [
  {
    request_id: 1,
    listing_id: 1,
    requester_user_id: 2,
    quantity_requested: 3,
    status: "pending",
    request_date: "2026-07-02T10:30:00",
    closed_date: null,
  },
  {
    request_id: 2,
    listing_id: 6,
    requester_user_id: 2,
    quantity_requested: 5,
    status: "approved",
    request_date: "2026-07-01T14:00:00",
    closed_date: null,
  },
  {
    request_id: 3,
    listing_id: 7,
    requester_user_id: 4,
    quantity_requested: 2,
    status: "completed",
    request_date: "2026-06-21T09:00:00",
    closed_date: "2026-06-23T16:00:00",
  },
];

export const mockNotifications: Notification[] = [
  {
    notification_id: 1,
    user_id: 1,
    content: "Oliver Lee requested 3 lbs of your Fresh Tomatoes listing.",
    timestamp: "2026-07-02T10:30:00",
    is_read: false,
    type: "claim",
  },
  {
    notification_id: 2,
    user_id: 2,
    content: "Your request for Meyer Lemons has been approved!",
    timestamp: "2026-07-01T15:00:00",
    is_read: false,
    type: "claim",
  },
  {
    notification_id: 3,
    user_id: 1,
    content: "Glen Kim left a review on your completed exchange.",
    timestamp: "2026-06-24T10:00:00",
    is_read: true,
    type: "listing",
  },
  {
    notification_id: 4,
    user_id: 3,
    content: "A new member joined Neighborhood Garden Share.",
    timestamp: "2026-07-01T08:00:00",
    is_read: true,
    type: "community",
  },
];

export const mockPosts: CommunityPost[] = [
  {
    post_id: 1,
    community_id: 1,
    user_id: 1,
    content: "Just planted a new row of cherry tomatoes! Should have extras to share in about 3 weeks. 🍅",
    timestamp: "2026-07-01T08:00:00",
  },
  {
    post_id: 2,
    community_id: 1,
    user_id: 3,
    content: "Reminder: if you're picking up produce from someone's porch, please text them when you arrive and take only what was agreed upon. Let's keep things friendly!",
    timestamp: "2026-06-30T14:00:00",
  },
  {
    post_id: 3,
    community_id: 2,
    user_id: 2,
    content: "Anyone have extra herbs? I'm making pesto this weekend and could use some basil or parsley.",
    timestamp: "2026-07-02T09:30:00",
  },
  {
    post_id: 4,
    community_id: 2,
    user_id: 3,
    content: "Welcome to all the new members this week! Check out the listings tab to see what's available. Don't hesitate to post your own surplus.",
    timestamp: "2026-07-01T10:00:00",
  },
  {
    post_id: 5,
    community_id: 3,
    user_id: 4,
    content: "We received a large canned goods donation this morning. Listing it now — first come, first served for pantry volunteers.",
    timestamp: "2026-07-01T07:00:00",
  },
  {
    post_id: 6,
    community_id: 4,
    user_id: 5,
    content: "My lilikoi vine is going crazy this season! I'll be posting batches every few days. Feel free to claim as much as you need 🌺",
    timestamp: "2026-07-02T07:30:00",
  },
  {
    post_id: 7,
    community_id: 5,
    user_id: 6,
    content: "Heads up: dragon fruit season is in full swing. If anyone else in Hawaiʻi Kai has extra, post it here so we can share before they overripen.",
    timestamp: "2026-07-01T16:00:00",
  },
  {
    post_id: 8,
    community_id: 6,
    user_id: 7,
    content: "Baking banana bread tomorrow morning with local apple bananas. Planning to make 6 loaves — will post whatever I don't keep. First come, first served!",
    timestamp: "2026-07-01T20:00:00",
  },
];

export const mockMemberships: Membership[] = [
  { user_id: 1, community_id: 1, role: "admin", date_joined: "2026-01-15" },
  { user_id: 3, community_id: 1, role: "member", date_joined: "2026-02-20" },
  { user_id: 2, community_id: 1, role: "member", date_joined: "2026-03-10" },
  { user_id: 1, community_id: 2, role: "member", date_joined: "2026-02-01" },
  { user_id: 2, community_id: 2, role: "member", date_joined: "2026-02-05" },
  { user_id: 3, community_id: 2, role: "admin", date_joined: "2026-01-20" },
  { user_id: 4, community_id: 3, role: "admin", date_joined: "2026-01-01" },
  { user_id: 1, community_id: 3, role: "member", date_joined: "2026-03-15" },
  { user_id: 5, community_id: 4, role: "admin", date_joined: "2026-01-10" },
  { user_id: 1, community_id: 4, role: "member", date_joined: "2026-04-01" },
  { user_id: 6, community_id: 5, role: "admin", date_joined: "2026-02-01" },
  { user_id: 5, community_id: 5, role: "member", date_joined: "2026-03-01" },
  { user_id: 7, community_id: 6, role: "admin", date_joined: "2026-01-25" },
  { user_id: 3, community_id: 6, role: "member", date_joined: "2026-02-15" },
];

export const mockJoinRequests: JoinRequest[] = [
  { request_id: 1, community_id: 3, user_id: 2, status: "pending", request_date: "2026-07-01" },
  { request_id: 2, community_id: 3, user_id: 3, status: "pending", request_date: "2026-06-30" },
];

export const mockThreads: MessageThread[] = [
  {
    thread_id: 1,
    claim_request_id: 1,
    listing_id: 1,
    participant_ids: [1, 2],
    messages: [
      { message_id: 1, thread_id: 1, sender_user_id: 2, content: "Hi! I'd love to pick up 3 lbs of tomatoes. Are they still available?", timestamp: "2026-07-02T10:30:00" },
      { message_id: 2, thread_id: 1, sender_user_id: 1, content: "Yes, still available! I'm usually home in the afternoons. Does tomorrow around 3pm work?", timestamp: "2026-07-02T11:15:00" },
      { message_id: 3, thread_id: 1, sender_user_id: 2, content: "That works perfectly. I'll come by around 3. Thanks so much!", timestamp: "2026-07-02T11:45:00" },
      { message_id: 4, thread_id: 1, sender_user_id: 1, content: "Sounds good! I'll leave them on the front porch in a bag. See you then 🍅", timestamp: "2026-07-02T12:00:00" },
    ],
  },
  {
    thread_id: 2,
    claim_request_id: 2,
    listing_id: 6,
    participant_ids: [3, 2],
    messages: [
      { message_id: 5, thread_id: 2, sender_user_id: 2, content: "Hey Rose! Could I grab 5 of the Meyer lemons? I want to make lemonade this weekend.", timestamp: "2026-07-01T14:00:00" },
      { message_id: 6, thread_id: 2, sender_user_id: 3, content: "Of course! They're really juicy this year. Can you pick up Saturday morning?", timestamp: "2026-07-01T14:30:00" },
      { message_id: 7, thread_id: 2, sender_user_id: 2, content: "Saturday morning works. What time?", timestamp: "2026-07-01T15:00:00" },
      { message_id: 8, thread_id: 2, sender_user_id: 3, content: "How about 10am? I'll have them in a bag by the front steps at 3142 Woodlawn Dr.", timestamp: "2026-07-01T15:15:00" },
      { message_id: 9, thread_id: 2, sender_user_id: 2, content: "Perfect, see you then! Thanks 🍋", timestamp: "2026-07-01T15:20:00" },
    ],
  },
  {
    thread_id: 3,
    claim_request_id: 3,
    listing_id: 7,
    participant_ids: [1, 4],
    messages: [
      { message_id: 10, thread_id: 3, sender_user_id: 4, content: "Hi Lily, I'd like 2 jars of strawberry jam for the food pantry. Is that possible?", timestamp: "2026-06-21T09:00:00" },
      { message_id: 11, thread_id: 3, sender_user_id: 1, content: "Absolutely! Happy to help the pantry. I can have them ready this afternoon.", timestamp: "2026-06-21T09:30:00" },
      { message_id: 12, thread_id: 3, sender_user_id: 4, content: "Wonderful. I'll swing by around 4pm. Thank you so much!", timestamp: "2026-06-21T10:00:00" },
      { message_id: 13, thread_id: 3, sender_user_id: 1, content: "Picked up! Hope the pantry folks enjoy it. 🍓", timestamp: "2026-06-21T16:30:00" },
    ],
  },
];

// Helper to get related data
export function getUserById(id: number): User | undefined {
  return mockUsers.find((u) => u.user_id === id);
}

export function getCommunityById(id: number): Community | undefined {
  return mockCommunities.find((c) => c.community_id === id);
}

export function getListingById(id: number): Listing | undefined {
  return mockListings.find((l) => l.listing_id === id);
}

export function getListingsByCommunity(communityId: number): Listing[] {
  return mockListings.filter((l) => l.community_id === communityId);
}

export function getActiveListings(): Listing[] {
  return mockListings.filter((l) => l.status !== "closed" && l.status !== "completed");
}

export function getThreadById(id: number): MessageThread | undefined {
  return mockThreads.find((t) => t.thread_id === id);
}

export function getThreadsForUser(userId: number): MessageThread[] {
  return mockThreads.filter((t) => t.participant_ids.includes(userId));
}

export function getPostsByCommunity(communityId: number): CommunityPost[] {
  return mockPosts.filter((p) => p.community_id === communityId);
}

export function getMembersByCommunity(communityId: number): Membership[] {
  return mockMemberships.filter((m) => m.community_id === communityId);
}

export function getUserRole(userId: number, communityId: number): string | null {
  const membership = mockMemberships.find(
    (m) => m.user_id === userId && m.community_id === communityId
  );
  return membership ? membership.role : null;
}

export function getJoinRequestsByCommunity(communityId: number): JoinRequest[] {
  return mockJoinRequests.filter((r) => r.community_id === communityId && r.status === "pending");
}
