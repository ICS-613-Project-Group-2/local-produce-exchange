# User Stories

## Jolie

### 1. Join a Public Community
**As a** user interested in local crop exchanges, **I want to** join a community, **so that** I can view and participate in food sharing opportunities near me.

**Acceptance Criteria:**
- **Specific Behavior:** User can search for a community and select an option to join.
- **Observable Result:** The user becomes a member of the selected community and can view community listings and posts.
- **Normal Path:** User opens the "communities" page -> searches or browses available communities -> user selects a community -> user clicks "join" -> system adds user to the community.
- **Edge/Error Paths:** If the user is already a member, the system displays a "you are already a member of this community" message.
- **Permission Rules:** Any logged-in user can request to join a public community. Banned users cannot rejoin the same community.

### 2. Request Access to a Private Community
**As a** user, **I want to** request access to a private community, **so that** I can participate in food sharing within a trusted group.

**Acceptance Criteria:**
- **Specific Behavior:** User can submit a join request for a private community.
- **Observable Result:** The join request is sent to the community administrator and the user sees a "pending approval" status.
- **Normal Path:** User opens a private community page -> user clicks "request to join" -> system records request and admin receives a notification -> user sees pending status.
- **Edge/Error Paths:** If the user already has a pending request, the system displays a "request already pending" message. If the community no longer exists or the request fails to process, the user is notified and no membership changes are made.
- **Permission Rules:** Logged-in users can request access to private communities. Only community admins can approve or reject join requests.

### 3. Admin Approves or Rejects Join Requests
**As a** community administrator, **I want to** approve or reject users who request to join a private community, **so that** I can control who participates.

**Acceptance Criteria:**
- **Specific Behavior:** Admin can view pending join requests and select "approve" or "reject".
- **Observable Result:** Approved users become members of the community, while rejected users do not gain access. Users receive a notification of the decision.
- **Normal Path:** Admin opens the community management page -> admin views pending join requests -> admin selects approve or reject -> system updates membership status -> user is notified.
- **Edge/Error Paths:** If a request has already been handled or the system fails to update the membership status, no changes are made and the admin is notified.
- **Permission Rules:** Only community admins can approve or reject private community join requests.

### 4. Message Listing Owner as Claimant
**As a** user claiming a food item, **I want to** message the listing owner, **so that** I can coordinate pickup details.

**Acceptance Criteria:**
- **Specific Behavior:** User can open a message thread from a listing.
- **Observable Result:** The claimant and listing owner can send and receive messages in a shared conversation thread.
- **Normal Path:** User presses the "message" button on a listing page -> message thread opens -> user sends a message -> owner receives the message.
- **Edge/Error Paths:** If the message fails to send, the system displays "message failed". If the listing is no longer active, the system prevents new messages and displays "listing is no longer active" message.
- **Permission Rules:** Only claimant and listing owner can access the message thread.

### 5. Listing Owner Receives Messages with Listing Context
**As a** listing owner, **I want to** receive messages from users with the listing info, **so that** I know which listing they are referencing and can answer questions and coordinate food pickups.

**Acceptance Criteria:**
- **Specific Behavior:** Listing owner receives message notifications when a claimant sends a message.
- **Observable Result:** The listing owner can view and reply to the message in the conversation thread with the listing information automatically pinned to the top.
- **Normal Path:** Claimant sends a message -> system notifies listing owner -> owner opens inbox -> owner selects the conversation -> the listing information is pinned to the top of the thread -> owner replies.
- **Edge/Error Paths:** If claimant's account has been removed or banned, message thread is disabled. If the system cannot load the conversation, an error message is displayed.
- **Permission Rules:** Listing owners can only message users connected to their own listings or their claims.

### 6. View All Messages in One Inbox
**As a** user, **I want to** view all of my message conversations in one inbox, **so that** I can easily manage communication.

**Acceptance Criteria:**
- **Specific Behavior:** User can navigate to an inbox page that displays all active and past message threads.
- **Observable Result:** The inbox displays conversation participants, related listing title, most recent message preview, timestamp, and unread message status.
- **Normal Path:** User opens the inbox -> system loads all conversations involving that user -> user selects a conversation -> full message thread is displayed.
- **Edge/Error Paths:** If user has no messages, inbox displays "no messages". If messages fail to load, system displays an error message.
- **Permission Rules:** Users can only view message threads they are a participant in.

### 7. Post in Community Discussion Board
**As a** community member, **I want to** post messages and/or announcements in a community discussion board.

**Acceptance Criteria:**
- **Specific Behavior:** Community members can create posts or announcements within a community page.
- **Observable Result:** The post appears on the community discussion board and is visible to the members of that community.
- **Normal Path:** User opens community page -> user selects "create post" -> user enters message content -> user submits post -> system displays post on discussion board.
- **Edge/Error Paths:** If the post is empty, the system displays "post cannot be empty" message. If server fails to post, the user is notified and the post is not published.
- **Permission Rules:** Only community members can post on the discussion board. Admins can remove inappropriate posts. Banned users cannot post or view the community page.

---

## Kayla

### 1. Send Invite Links to a Private Community
**As a** community host, **I want to** send invite-only links to trusted people, **so that** I can control who joins my food-sharing community.

**Acceptance Criteria:**
- **Specific Behavior:** A community member or admin can send an invitation by entering the recipient's email address.
- **Observable Result:** The invited person receives an invitation link or code.
- **Normal Path:** Admin opens community settings -> selects "Invite Member" -> enters invitee email or copies invite link -> system creates invitation -> invited user receives or uses the link.
- **Edge/Error Paths:** If the email is invalid or the user is already a member, the system displays an error message and does not send a duplicate invite.
- **Permission Rules:** Only community hosts or admins can generate invite links.

### 2. Accept an Invitation to a Private Community
**As an** invited user, **I want to** accept an invitation to a private community, **so that** I can join without needing to search for or request access.

**Acceptance Criteria:**
- **Specific Behavior:** User can open an invite-only link and join the related community.
- **Observable Result:** The user becomes a member of the community and can view its listings and community page.
- **Edge/Error Paths:** If the invitation is expired, invalid, or already used, the system displays an error message and does not add the user.
- **Permission Rules:** Only users with a valid invite link can join an invite-only community.

### 3. Message Owner with Quantity Interest
**As a** user interested in a listing, **I want to** message the listing owner with the quantity I am interested in, **so that** we can coordinate the exchange manually.

**Acceptance Criteria:**
- **Specific Behavior:** User can start a private message from a listing and include the quantity they are interested in receiving.
- **Observable Result:** The listing owner receives a message connected to the listing with the requested quantity included.
- **Normal Path:** User opens listing -> selects "Message Owner" -> enters message and desired quantity -> sends message -> owner receives message in their inbox.
- **Edge/Error Paths:** If the quantity entered is greater than the listed available quantity, the system displays a warning before sending. If the message fails, the system displays "Message failed to send."
- **Permission Rules:** Only logged-in community members can message listing owners. Users cannot message themselves about their own listings.

### 4. Mark a Listing as Reserved
**As a** listing owner, **I want to** mark a listing as reserved after coordinating through messages, **so that** other users know the item may no longer be available.

**Acceptance Criteria:**
- **Specific Behavior:** Listing owner can change a listing status from "Available" to "Reserved."
- **Observable Result:** The listing is labeled as reserved and is visually separated from fully available listings.
- **Normal Path:** Owner opens dashboard -> views incoming requests -> selects approve or deny -> system updates request status -> claimant receives notification.
- **Edge/Error Paths:** If the listing has already been deleted or closed, the system displays an error message and makes no changes.
- **Permission Rules:** Only the listing owner can mark their own listing as reserved.

### 5. Update Remaining Quantity
**As a** listing owner, **I want to** manually update the remaining quantity of my listing, **so that** the listing stays accurate after I arrange exchanges.

**Acceptance Criteria:**
- **Specific Behavior:** Listing owner can edit the remaining quantity on an active listing.
- **Observable Result:** Updated quantity is displayed on the listing page.
- **Normal Path:** Owner opens their listing -> selects edit quantity -> enters updated amount -> saves changes -> system updates the listing.
- **Edge/Error Paths:** If the quantity entered is negative or invalid, the system displays a validation error. If the quantity is changed to zero, the system prompts the owner to mark the listing as unavailable or closed.
- **Permission Rules:** Only the listing owner can update the quantity of their listing.

### 6. Personal Dashboard
**As a** user, **I want** a personal dashboard showing my active listings, messages, and reserved items, **so that** I can manage my food exchanges in one place.

**Acceptance Criteria:**
- **Specific Behavior:** User can view a dashboard with sections for active listings, reserved listings, messages, and past closed listings.
- **Observable Result:** The dashboard shows the user's current activity and available actions.
- **Normal Path:** User logs in -> opens dashboard -> system loads active listings, reserved listings, recent messages, and closed listings -> user selects an item to manage.
- **Edge/Error Paths:** If the user has no listings or messages, the dashboard displays an empty-state message. If dashboard data fails to load, the system displays an error message.
- **Permission Rules:** Users can only view their own dashboard information.

### 7. Manage Community Member Roles
**As a** community admin, **I want to** manage member roles within my community, **so that** trusted users can help moderate and maintain the community page.

**Acceptance Criteria:**
- **Specific Behavior:** Community admin can assign or remove roles such as member, moderator, or admin.
- **Observable Result:** User permissions update based on the assigned role.
- **Normal Path:** Admin opens community management page -> selects a member -> changes role -> confirms update -> system updates the member's permissions.
- **Edge/Error Paths:** If the selected user is no longer a member, the system displays an error message. If an admin attempts to remove their own only-admin role, the system prevents the action.
- **Permission Rules:** Only community admins can manage roles.

---

## Victor

### 1. View Listing History
**As a** user who consistently has a surplus of produce, **I want to** see a comprehensive history of my previous listings, **so that** I may gauge how much and what I am overpurchasing or overproducing over time.

**Acceptance Criteria:**
- **Specific Behavior:** User can navigate to a "listing history" section of their profile.
- **Observable Result:** A list of all previous and current exchanges that display the produce, date exchanged, quantity, and status (accepted, cancelled, completed, etc.).
- **Normal Path:** User opens the "listing history" page -> all previous exchanges for that user are loaded (with pagination) -> user can browse through the list of entries.
- **Edge/Error Paths:** If the user has no previous listings, a page with the text "no previous listings" will show. If the server fails to fetch the data from the database, an error message will show.
- **Permission Rules:** Users cannot access other users' listing history, admins can access all users' listing history.

### 2. Remove Bad-Faith Users and Listings
**As the** administrator of a community, **I want to** remove bad-faith users and/or listings, **so that** I can keep the community page friendly and helpful.

**Acceptance Criteria:**
- **Specific Behavior:** Admins can select a user's listing with a "remove" option or a user's account with a "kick" or "ban" option.
- **Observable Result:** Removed posts are no longer shared with the community and kicked members no longer have access to that specific community page. Users will receive a notification if a listing they posted is removed or if they have been kicked from a community.
- **Normal Path:** Admin selects user listing/account -> admin confirms the removal of a post/kicking of a member -> system updates available listings/user permissions.
- **Edge/Error Paths:** If an admin attempts to remove a listing that has already been removed or kick a user that has already been kicked, a message displays saying "listing has already been removed"/"user has already been kicked". If the system fails to properly update, no changes are made and the admin is notified.
- **Permission Rules:** Users cannot remove other users' posts or ban other users. Only admins can perform these actions.

### 3. Leave a Review After Exchange
**As a** user who consistently exchanges produce, **I want to** leave a rating or review for the other user, **so that** I can provide feedback and help build trust within the community.

**Acceptance Criteria:**
- **Specific Behavior:** Users can submit a rating (1-5 stars) and an optional written review after a produce exchange has been completed.
- **Observable Result:** The review appears on the recipient's profile and their rating is updated.
- **Normal Path:** Exchange is marked as completed -> user navigates to exchange history -> user selects "Leave Review" -> user submits rating and comments -> review is saved and displayed on the other user's profile.
- **Edge/Error Paths:** If the user already submitted a review for that exchange, the system displays "Review already submitted" message. If review cannot be saved, error message is displayed and user may try again.
- **Permission Rules:** Only users who participated in the completed exchange may leave a review. Users may only submit one review per completed exchange.

### 4. Receive Exchange Status Notifications
**As a** user who is part of an exchange, **I want to** receive notifications for events such as cancellations, acceptances, denials, etc., **so that** I can be kept up to date with important status updates.

**Acceptance Criteria:**
- **Specific Behavior:** The system automatically generates notifications when an exchange request is cancelled, accepted, or denied.
- **Observable Result:** A notification appears in the user's notification center and/or is sent through email.
- **Normal Path:** Exchange status changes -> system generates notification -> notification is delivered to user -> user views notification.
- **Edge/Error Paths:** If notification delivery fails, notification remains queued and is retried.
- **Permission Rules:** Users may only receive notifications related to their own listings and claims.

### 5. Prevent Over-Approving Quantity
**As a** user who has created a listing, **I want to** ensure that accepted requests do not exceed the quantity of produce I have, **so that** I do not accidentally accept requests for produce I don't have.

**Acceptance Criteria:**
- **Specific Behavior:** The system automatically tracks available quantity and prevents approvals that would exceed the remaining inventory.
- **Observable Result:** Remaining quantity is updated after each approved request and users cannot approve requests exceeding available inventory.
- **Normal Path:** Listing owner creates listing with quantity -> claimant submits request -> listing owner approves a request -> system deducts approved quantity from available inventory -> updated quantity is displayed.
- **Edge/Error Paths:** If approving a request would exceed available inventory, system displays "insufficient quantity available" message.
- **Permission Rules:** Only listing owners can approve requests for their listings.

### 6. View Freshness and Expiration Information
**As a** user who consistently exchanges produce, **I want to** be aware of how long produce has been off the shelves, **so that** I do not accidentally exchange for produce that has gone bad.

**Acceptance Criteria:**
- **Specific Behavior:** Listings display the posting date and any expiration or harvest date information provided by listing owner.
- **Observable Result:** Users can view freshness information directly on the listing page before submitting a claim.
- **Normal Path:** User browses listings -> user selects a listing -> system displays posting date, expiration/harvest date -> user decides whether to submit claim.
- **Edge/Error Paths:** If no expiration information is provided, system displays "date not available" message. If date information is invalid, listing owner is prompted to correct it.
- **Permission Rules:** All users may view expiration information for public listings. Only listing owners can edit expiration information.

### 7. Cancel an Exchange Request
**As a** user who has submitted a request for a produce exchange, **I want to** cancel the exchange before pickup, **so that** I can withdraw if my plans change.

**Acceptance Criteria:**
- **Specific Behavior:** Users can cancel pending or approved requests before the exchange is marked as completed.
- **Observable Result:** Request status changes to "Canceled" and any reserved inventory amount is returned to the available quantity.
- **Normal Path:** User navigates to open requests -> user selects active request -> clicks cancel request -> system updates request status -> listing quantity is restored -> listing owner receives notification.
- **Edge/Error Paths:** If the exchange has already been completed, the system displays an error message.
- **Permission Rules:** Users may only cancel their own requests. Listing owners cannot cancel requests on behalf of claimants but may reject pending requests.

---

## Jiyeon

### 1. Create an Account
**As a** new user, **I want to** create an account using my email and password, **so that** I can create and view food listings.

**Acceptance Criteria:**
- **Specific Behavior:** User can register an account by providing a valid email address and password.
- **Observable Result:** A new account is created and the user is logged in and redirected to the homepage.
- **Normal Path:** User opens the registration page -> user enters email and password -> user submits registration form -> system validates input -> account is created -> user is logged in and redirected to homepage.
- **Edge/Error Paths:** If the email is already registered, the system displays "Email already exists." If required fields are missing or invalid, the system displays validation errors and prevents account creation.
- **Permission Rules:** Any visitor can register for an account. Only registered users can access authenticated features.

### 2. Reset a Forgotten Password
**As a** user who has forgotten my password, **I want to** securely reset my password, **so that** I can regain access to my account.

**Acceptance Criteria:**
- **Specific Behavior:** User can request a password reset link using their registered email address.
- **Observable Result:** User receives a password reset link and can create a new password.
- **Normal Path:** User selects "Forgot Password" -> user enters registered email -> system sends reset link -> user opens link -> user enters new password -> system updates password -> user can log in with new credentials.
- **Edge/Error Paths:** If the email is not associated with an account, the system displays an error message. If the reset link has expired, the system prompts the user to request a new link.
- **Permission Rules:** Only account owners with access to the registered email can reset the password.

### 3. Update Profile Information
**As a** registered user, **I want to** update my profile information, **so that** other community members can identify and connect with me.

**Acceptance Criteria:**
- **Specific Behavior:** User can modify profile information such as display name, location, and profile picture.
- **Observable Result:** Updated profile information is saved and visible to other users.
- **Normal Path:** User opens profile settings -> user edits profile information -> user clicks save -> system validates data -> profile is updated and displayed.
- **Edge/Error Paths:** If required fields are missing or invalid, the system displays validation errors and prevents updates.
- **Permission Rules:** Users can only edit their own profile information.

### 4. Create a Food Listing
**As a** user with surplus produce, **I want to** create a food listing with relevant details and photos, **so that** others can view and claim my items.

**Acceptance Criteria:**
- **Specific Behavior:** User can create a listing including produce name, category, quantity, expiration date, pickup information, and photos.
- **Observable Result:** The listing is published and visible to other users.
- **Normal Path:** User selects "Create Listing" -> user enters listing details and uploads photos -> user submits listing -> system validates information -> listing is published.
- **Edge/Error Paths:** If required fields are missing, the system displays validation errors. If image upload fails, the system notifies the user and prevents submission until resolved.
- **Permission Rules:** Only logged-in users can create listings.

### 5. Edit or Delete a Listing
**As a** user who has created a listing, **I want to** edit or delete my listing, **so that** the information remains accurate and up to date.

**Acceptance Criteria:**
- **Specific Behavior:** Listing owners can modify or remove their existing listings.
- **Observable Result:** Updated listing information is displayed, or the listing is removed from public view.
- **Normal Path:** User opens one of their listings -> user selects edit or delete -> user confirms action -> system updates or removes the listing.
- **Edge/Error Paths:** If the listing no longer exists, the system displays an error message. If the update fails, no changes are saved and the user is notified.
- **Permission Rules:** Only the listing owner can edit or delete their listings.

### 6. Search Listings by Category or Keyword
**As a** user looking for produce, **I want to** search listings by food category or keyword, **so that** I can quickly find the items I need.

**Acceptance Criteria:**
- **Specific Behavior:** User can enter keywords or select categories to filter food listings.
- **Observable Result:** Matching listings are displayed based on the search criteria.
- **Normal Path:** User enters a keyword or selects a category -> user submits search -> system retrieves matching listings -> search results are displayed.
- **Edge/Error Paths:** If no matching listings are found, the system displays "No listings found."
- **Permission Rules:** All logged-in users can browse and search listings within their communities.

### 7. Message a Listing Owner
**As a** user interested in a listing, **I want to** privately message the listing owner, **so that** I can arrange pickup details and request a specific quantity of the item.

**Acceptance Criteria:**
- **Specific Behavior:** User can open a private message thread from a food listing and send messages to the listing owner.
- **Observable Result:** Both users can send and receive messages within the conversation thread.
- **Normal Path:** User opens a listing -> user clicks "Message Owner" -> message thread opens -> user sends a message -> owner receives the message and can reply.
- **Edge/Error Paths:** If the listing is no longer active, the system prevents new messages and displays "Listing is no longer active." If the message fails to send, the system displays an error message.
- **Permission Rules:** Only users involved in the conversation can view and participate in the message thread.

---

## Personas

### 1. College Student — Oliver Lee
- **Demographics:** Male, 21, College Student, Part-time employment.
- **Background:** Oliver lives off campus and has a limited budget while attending college as a full-time student. Rising grocery prices make it difficult for him to afford fresh foods. He actively looks for affordable ways to access food.
- **Goals:** Find available food near campus and reduce monthly food expenses.
- **Values:** Affordability.
- **Technology:** Uses a smartphone as his primary device, and frequently uses mobile apps for transportation and communication.
- **Pain Points:** Grocery costs take a large portion of his budget and transportation options are limited.
- **Use Cases:** Searches and filters food listings, sends messages to listing owners to arrange pickup times.

### 2. Home Gardener — Lily Chen
- **Demographics:** Female, 71, Retired.
- **Background:** She maintains a large backyard garden and frequently harvests more fruits and vegetables than she can consume. Rather than letting the food spoil, she wants an easy way to share excess produce with others in her community.
- **Goals:** Reduce food waste from her garden, find local community members who can use her surplus produce.
- **Values:** Reducing unnecessary waste.
- **Technology:** Uses an iPhone and iPad daily. Comfortable using social media like Facebook. Prefers simple and easy-to-navigate applications.
- **Pain Points:** Excess spoils before she can give it away, existing platforms are not designed for food sharing.
- **Use Cases:** Creates food listings for excess produce, joins gardening and sustainability communities, communicates with claimants through the messaging system.

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
- **Use Cases:** Uses the search and filtering tools to find available food donations, communicates with donors through the message system, and uses community discussion boards to connect with donors and volunteers.

---

## Roles and Permissions

The Green Beans frontend uses a clear role and permission structure so that each page only shows actions the current user is allowed to take. For the initial version, the main roles are:

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

### Public Community
- Logged-in user sees "Join Community" button
- After joining, button changes to "View Community" or "Already Joined"
- User gains access to listings, posts, and member-only actions

### Private Community
- Logged-in user sees limited community info and "Request to Join" button
- After submitting, status changes to "Pending Approval"
- Community admins see the request in the admin page and can approve or reject
- Once approved, user becomes a member with full access

### Invite-Only Flow
- User with a valid invitation link can join without the request/approval process
- If invite is expired, invalid, or already used, the frontend shows a clear error message
- Banned users cannot rejoin or view restricted community content

### Access States
- "Join Community" — public communities
- "Request to Join" — private communities
- "Pending Approval" — submitted requests
- "Accept Invite" — valid invitations
- "Already Joined" — existing members
- Locked/restricted state — no access or banned

---

## Exchange and Listing Status Lifecycle

### Status Flow
1. **Available** — Listing published with quantity remaining. Visible in Browse, Community Detail, and Dashboard.
2. **Reserved** — Owner agreed to hold some/all of the item after messaging. Item may no longer be fully available.
3. **Picked Up** — Physical exchange happened. Unlocks finalization step.
4. **Completed** — Exchange fully finished. Appears in history. Unlocks "Leave Review" action.
5. **Denied** — Owner rejected a request.
6. **Canceled** — Claimant canceled before pickup. Reserved quantity returns to available.
7. **Closed** — Owner removed listing or no longer wants to share. No new messages or claims allowed.

### Rules
- Same status labels used across Listing Cards, Listing Details, Message Thread, Dashboard, Exchange History, Leave Review, and Notifications
- Each status has a matching badge style and clear button behavior

---

## Safety and Moderation

### Reporting
- Users can report a listing from the Listing Details page (fraudulent, unsafe, misleading, expired, inappropriate)
- Users can report or block another user from the Message Thread or Profile page
- Report form includes a reason field and optional comment

### Admin Moderation
- Community admins can review reported listings, remove inappropriate posts, remove bad-faith listings, and kick or ban users
- All destructive actions use confirmation modals

### Safety States
- "Report submitted"
- "This user has been blocked"
- "Listing removed"
- "User has been kicked from this community"
- "You no longer have access to this community"
- Banned users see an access-denied message instead of community content

---

## Frontend System Notes

### Search States
- Loading state while results are being retrieved
- "No listings found" when no results match
- Error message with retry option if listings fail to load
- Filters for first version: keyword, category, pickup area, expiration/freshness, availability status, quantity

### Image Upload
- Create Listing and Edit Listing pages show upload area, preview thumbnails, validation messages, and failure state
- Fallback image used when no photo is provided so layout does not break
- Backend storage decision determines the actual upload implementation

### Scope Control
- Use Community Member and Community Admin as the main roles for first version
- If Host or Moderator roles are kept, clearly define permissions before implementation
