# User Stories

For detailed step-by-step interaction flows (main paths, error paths, preconditions, and postconditions), see [Use Cases](use-cases.md).

---

## Jolie

### 1. Join a Public Community
**As a** user interested in local crop exchanges, **I want to** join a community, **so that** I can view and participate in food sharing opportunities near me.

**Acceptance Criteria:**
- User can search for a community and select an option to join.
- The user becomes a member of the selected community and can view community listings and posts.
- Any logged-in user can join a public community. Banned users cannot rejoin the same community.

### 2. Request Access to a Private Community
**As a** user, **I want to** request access to a private community, **so that** I can participate in food sharing within a trusted group.

**Acceptance Criteria:**
- User can submit a join request for a private community.
- The join request is sent to the community administrator and the user sees a "pending approval" status.
- Logged-in users can request access to private communities. Only community admins can approve or reject join requests.

### 3. Admin Approves or Rejects Join Requests
**As a** community administrator, **I want to** approve or reject users who request to join a private community, **so that** I can control who participates.

**Acceptance Criteria:**
- Admin can view pending join requests and select "approve" or "reject."
- Approved users become members of the community, while rejected users do not gain access. Users receive a notification of the decision.
- Only community admins can approve or reject private community join requests.

### 4. Message Listing Owner as Claimant
**As a** user claiming a food item, **I want to** message the listing owner, **so that** I can coordinate pickup details.

**Acceptance Criteria:**
- User can open a message thread from a listing.
- The claimant and listing owner can send and receive messages in a shared conversation thread.
- Only the claimant and listing owner can access the message thread.

### 5. Listing Owner Receives Messages with Listing Context
**As a** listing owner, **I want to** receive messages from users with the listing info, **so that** I know which listing they are referencing and can answer questions and coordinate food pickups.

**Acceptance Criteria:**
- Listing owner receives message notifications when a claimant sends a message.
- The listing owner can view and reply to the message in the conversation thread with the listing information automatically pinned to the top.
- Listing owners can only message users connected to their own listings or their claims.

### 6. View All Messages in One Inbox
**As a** user, **I want to** view all of my message conversations in one inbox, **so that** I can easily manage communication.

**Acceptance Criteria:**
- User can navigate to an inbox page that displays all active and past message threads.
- The inbox displays conversation participants, related listing title, most recent message preview, timestamp, and unread message status.
- Users can only view message threads they are a participant in.

### 7. Post in Community Discussion Board
**As a** community member, **I want to** post messages and/or announcements in a community discussion board, **so that** I can share updates and communicate with other members.

**Acceptance Criteria:**
- Community members can create posts or announcements within a community page.
- The post appears on the community discussion board and is visible to the members of that community.
- Only community members can post on the discussion board. Admins can remove inappropriate posts. Banned users cannot post or view the community page.

---

## Kayla

### 1. Send Invite Links to a Private Community
**As a** community host, **I want to** send invite-only links to trusted people, **so that** I can control who joins my food-sharing community.

**Acceptance Criteria:**
- A community member or admin can send an invitation by entering the recipient's email address.
- The invited person receives an invitation link or code.
- Only community hosts or admins can generate invite links.

### 2. Accept an Invitation to a Private Community
**As an** invited user, **I want to** accept an invitation to a private community, **so that** I can join without needing to search for or request access.

**Acceptance Criteria:**
- User can open an invite-only link and join the related community.
- The user becomes a member of the community and can view its listings and community page.
- Only users with a valid invite link can join an invite-only community.

### 3. Message Owner with Quantity Interest
**As a** user interested in a listing, **I want to** message the listing owner with the quantity I am interested in, **so that** we can coordinate the exchange manually.

**Acceptance Criteria:**
- User can start a private message from a listing and include the quantity they are interested in receiving.
- The listing owner receives a message connected to the listing with the requested quantity included.
- Only logged-in community members can message listing owners. Users cannot message themselves about their own listings.

### 4. Mark a Listing as Reserved
**As a** listing owner, **I want to** mark a listing as reserved after coordinating through messages, **so that** other users know the item may no longer be available.

**Acceptance Criteria:**
- Listing owner can change a listing status from "Available" to "Reserved."
- The listing is labeled as reserved and is visually separated from fully available listings.
- Only the listing owner can mark their own listing as reserved.

### 5. Update Remaining Quantity
**As a** listing owner, **I want to** manually update the remaining quantity of my listing, **so that** the listing stays accurate after I arrange exchanges.

**Acceptance Criteria:**
- Listing owner can edit the remaining quantity on an active listing.
- Updated quantity is displayed on the listing page.
- Only the listing owner can update the quantity of their listing.

### 6. Personal Dashboard
**As a** user, **I want** a personal dashboard showing my active listings, messages, and reserved items, **so that** I can manage my food exchanges in one place.

**Acceptance Criteria:**
- User can view a dashboard with sections for active listings, reserved listings, messages, and past closed listings.
- The dashboard shows the user's current activity and available actions.
- Users can only view their own dashboard information.

### 7. Manage Community Member Roles
**As a** community admin, **I want to** manage member roles within my community, **so that** trusted users can help moderate and maintain the community page.

**Acceptance Criteria:**
- Community admin can assign or remove roles such as member, moderator, or admin.
- User permissions update based on the assigned role.
- Only community admins can manage roles.

---

## Victor

### 1. View Listing History
**As a** user who consistently has a surplus of produce, **I want to** see a comprehensive history of my previous listings, **so that** I may gauge how much and what I am overpurchasing or overproducing over time.

**Acceptance Criteria:**
- User can navigate to a "listing history" section of their profile.
- A list of all previous and current exchanges displays the produce, date exchanged, quantity, and status (accepted, cancelled, completed, etc.).
- Users cannot access other users' listing history. Admins can access all users' listing history.

### 2. Remove Bad-Faith Users and Listings
**As the** administrator of a community, **I want to** remove bad-faith users and/or listings, **so that** I can keep the community page friendly and helpful.

**Acceptance Criteria:**
- Admins can select a user's listing with a "remove" option or a user's account with a "kick" or "ban" option.
- Removed posts are no longer shared with the community and kicked members no longer have access to that specific community page. Users receive a notification if a listing they posted is removed or if they have been kicked.
- Only admins can perform these actions. Regular users cannot remove other users' posts or ban other users.

### 3. Leave a Review After Exchange
**As a** user who consistently exchanges produce, **I want to** leave a rating or review for the other user, **so that** I can provide feedback and help build trust within the community.

**Acceptance Criteria:**
- Users can submit a rating (1-5 stars) and an optional written review after a produce exchange has been completed.
- The review appears on the recipient's profile and their rating is updated.
- Only users who participated in the completed exchange may leave a review. Users may only submit one review per completed exchange.

### 4. Receive Exchange Status Notifications
**As a** user who is part of an exchange, **I want to** receive notifications for events such as cancellations, acceptances, denials, etc., **so that** I can be kept up to date with important status updates.

**Acceptance Criteria:**
- The system automatically generates notifications when an exchange request is cancelled, accepted, or denied.
- A notification appears in the user's notification center.
- Users may only receive notifications related to their own listings and claims.

### 5. Prevent Over-Approving Quantity
**As a** user who has created a listing, **I want to** ensure that accepted requests do not exceed the quantity of produce I have, **so that** I do not accidentally accept requests for produce I don't have.

**Acceptance Criteria:**
- The system automatically tracks available quantity and prevents approvals that would exceed the remaining inventory.
- Remaining quantity is updated after each approved request and users cannot approve requests exceeding available inventory.
- Only listing owners can approve requests for their listings.

### 6. View Freshness and Expiration Information
**As a** user who consistently exchanges produce, **I want to** be aware of how long produce has been off the shelves, **so that** I do not accidentally exchange for produce that has gone bad.

**Acceptance Criteria:**
- Listings display the posting date and any expiration or harvest date information provided by listing owner.
- Users can view freshness information directly on the listing page before submitting a claim.
- All users may view expiration information for public listings. Only listing owners can edit expiration information.

### 7. Cancel an Exchange Request
**As a** user who has submitted a request for a produce exchange, **I want to** cancel the exchange before pickup, **so that** I can withdraw if my plans change.

**Acceptance Criteria:**
- Users can cancel pending or approved requests before the exchange is marked as completed.
- Request status changes to "Canceled" and any reserved inventory amount is returned to the available quantity.
- Users may only cancel their own requests. Listing owners cannot cancel requests on behalf of claimants but may reject pending requests.

---

## Jiyeon

### 1. Create an Account
**As a** new user, **I want to** create an account using my email and password, **so that** I can create and view food listings.

**Acceptance Criteria:**
- User can register an account by providing a valid email address and password.
- A new account is created and the user is logged in and redirected to the homepage.
- Any visitor can register for an account. Only registered users can access authenticated features.

### 2. Reset a Forgotten Password
**As a** user who has forgotten my password, **I want to** securely reset my password, **so that** I can regain access to my account.

**Acceptance Criteria:**
- User can request a password reset link using their registered email address.
- User receives a password reset link and can create a new password.
- Only account owners with access to the registered email can reset the password.

### 3. Update Profile Information
**As a** registered user, **I want to** update my profile information, **so that** other community members can identify and connect with me.

**Acceptance Criteria:**
- User can modify profile information such as display name, location, and profile picture.
- Updated profile information is saved and visible to other users.
- Users can only edit their own profile information.

### 4. Create a Food Listing
**As a** user with surplus produce, **I want to** create a food listing with relevant details and photos, **so that** others can view and claim my items.

**Acceptance Criteria:**
- User can create a listing including produce name, category, quantity, expiration date, pickup information, and photos.
- The listing is published and visible to other users.
- Only logged-in users can create listings.

### 5. Edit or Delete a Listing
**As a** user who has created a listing, **I want to** edit or delete my listing, **so that** the information remains accurate and up to date.

**Acceptance Criteria:**
- Listing owners can modify or remove their existing listings.
- Updated listing information is displayed, or the listing is removed from public view.
- Only the listing owner can edit or delete their listings.

### 6. Search Listings by Category or Keyword
**As a** user looking for produce, **I want to** search listings by food category or keyword, **so that** I can quickly find the items I need.

**Acceptance Criteria:**
- User can enter keywords or select categories to filter food listings.
- Matching listings are displayed based on the search criteria.
- All logged-in users can browse and search listings within their communities.

### 7. Message a Listing Owner
**As a** user interested in a listing, **I want to** privately message the listing owner, **so that** I can arrange pickup details and request a specific quantity of the item.

**Acceptance Criteria:**
- User can open a private message thread from a food listing and send messages to the listing owner.
- Both users can send and receive messages within the conversation thread.
- Only users involved in the conversation can view and participate in the message thread.

---

## Personas

### 1. College Student — Oliver Lee
- **Demographics:** Male, 21, College Student, Part-time employment.
- **Background:** Oliver lives off campus and has a limited budget while attending college as a full-time student. Rising grocery prices make it difficult for him to afford fresh foods. He actively looks for affordable ways to access food.
- **Goals:** Find available food near campus and reduce monthly food expenses.
- **Values:** Affordability.
- **Technology:** Uses a smartphone as his primary device, and frequently uses mobile apps for transportation and communication.
- **Pain Points:** Grocery costs take a large portion of his budget and transportation options are limited.

### 2. Home Gardener — Lily Chen
- **Demographics:** Female, 71, Retired.
- **Background:** She maintains a large backyard garden and frequently harvests more fruits and vegetables than she can consume. Rather than letting the food spoil, she wants an easy way to share excess produce with others in her community.
- **Goals:** Reduce food waste from her garden, find local community members who can use her surplus produce.
- **Values:** Reducing unnecessary waste.
- **Technology:** Uses an iPhone and iPad daily. Comfortable using social media like Facebook. Prefers simple and easy-to-navigate applications.
- **Pain Points:** Excess spoils before she can give it away, existing platforms are not designed for food sharing.

### 3. Community Nonprofit Volunteer — Rose Johnson
- **Demographics:** 34, Female, Non-Profit Volunteer.
- **Background:** Rose coordinates local sustainability initiatives and frequently organizes community events. She wants to build stronger neighborhood connections and reduce food waste, seeing it as an opportunity to help both the environment and families.
- **Goals:** Build an active food sharing community, encourage participation among locals, promote sustainability practices using community messaging boards.
- **Values:** Community engagement, sustainability.
- **Technology:** Uses a laptop and smartphone daily, familiar with social media and community management tools.
- **Pain Points:** Community information is spread across multiple platforms, moderating large groups can be difficult.

### 4. Food Pantry Coordinator — Glen Kim
- **Demographics:** 42, Male, Food Pantry Coordinator.
- **Background:** Glen manages a local food pantry that serves hundreds of families each month. His job involves finding reliable sources of donated food. He is interested in using technology to connect food donors directly with organizations that can quickly redistribute food to those in need.
- **Goals:** Identify available food donations before they expire, connect with local food donors and community groups.
- **Values:** Community service, food security.
- **Technology:** Uses a desktop computer at work and smartphone in the field, regularly uses email, spreadsheets and volunteer management software.
- **Pain Points:** Food donations are advertised through scattered information sources, limited staff makes it difficult to monitor multiple donation sources.

---

## Roles and Permissions

### Visitor (not logged in)
- Can view public landing page, about page, sign up, login, and forgot password pages
- Cannot create listings, message owners, join communities, post discussions, leave reviews, or access a personal dashboard

### Registered User (logged in)
- Can manage their profile, browse listings, search communities, request to join private communities, join public communities, and create listings within communities they belong to
- Can only edit their own profile and view their own dashboard, messages, notifications, and exchange history

### Community Member
- A registered user who belongs to a specific community
- Can view that community's listings and posts, create listings within that community, participate in community discussion, and message listing owners
- Membership is per-community — the frontend checks membership status before showing community-specific actions

### Listing Owner
- The user who created a specific listing
- Can edit or delete their own listings, update remaining quantity, mark as reserved, close a listing, and manage conversations connected to their listings
- Owner-only actions appear on Listing Details, Manage Listing, Message Thread, Dashboard, and History pages only when the current user owns the listing

### Community Admin
- A community member with management permissions for a specific community
- Can approve or reject join requests, invite members, manage member roles, remove inappropriate posts, remove bad-faith listings, and kick or ban users from that community
- Admin controls only appear for users with admin permissions in that specific community

---

## Community Access Flow

| State | Description |
|-------|-------------|
| Join Community | Public communities — user clicks to join immediately |
| Request to Join | Private communities — user submits a request for admin review |
| Pending Approval | Submitted requests awaiting admin decision |
| Accept Invite | Valid invitations — user clicks to join directly |
| Already Joined | Existing members |
| Locked/Restricted | No access or banned |

---

## Exchange and Listing Status Lifecycle

| Status | Description |
|--------|-------------|
| Available | Listing published with quantity remaining |
| Reserved | Owner agreed to hold some/all of the item after messaging |
| Picked Up | Physical exchange happened; unlocks finalization step |
| Completed | Exchange fully finished; appears in history; unlocks "Leave Review" |
| Denied | Owner rejected a request |
| Canceled | Claimant canceled before pickup; reserved quantity returns to available |
| Closed | Owner removed listing or no longer wants to share; no new messages or claims |

Same status labels are used across Listing Cards, Listing Details, Message Thread, Dashboard, Exchange History, Leave Review, and Notifications. Each status has a matching badge style.
