# Use Cases

This document describes the primary use case flows for the Green Beans local produce exchange platform. Each use case defines the actor, preconditions, main flow (happy path), alternative/error flows, and postconditions.

---

## UC-1: Join a Public Community

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. User is not already a member of the community. |
| **Trigger** | User navigates to a public community page and clicks "Join Community." |

**Main Flow:**
1. User opens the Communities page.
2. User searches or browses available communities.
3. User selects a public community.
4. User clicks "Join Community."
5. System adds the user as a member.
6. System displays community listings and posts to the user.

**Alternative/Error Flows:**
- If the user is already a member, the system displays "You are already a member of this community."
- If the user is banned from the community, the system prevents joining and displays an access-denied message.

**Postconditions:** User is a member of the community and can view listings, posts, and member-only actions.

---

## UC-2: Request Access to a Private Community

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. Community is private. User does not already have a pending request. |
| **Trigger** | User clicks "Request to Join" on a private community page. |

**Main Flow:**
1. User opens a private community page.
2. User clicks "Request to Join."
3. System records the join request.
4. Community admin receives a notification.
5. User sees a "Pending Approval" status.

**Alternative/Error Flows:**
- If the user already has a pending request, the system displays "Request already pending."
- If the community no longer exists or the request fails to process, the user is notified and no membership changes are made.

**Postconditions:** A join request is pending admin review.

---

## UC-3: Admin Approves or Rejects Join Request

| Field | Description |
|-------|-------------|
| **Actor** | Community Admin |
| **Preconditions** | Admin is logged in and has admin permissions for the community. Pending join requests exist. |
| **Trigger** | Admin opens the community management page and views pending requests. |

**Main Flow:**
1. Admin opens the community management page.
2. Admin views pending join requests.
3. Admin selects "Approve" or "Reject" for a request.
4. System updates membership status.
5. User receives a notification of the decision.

**Alternative/Error Flows:**
- If the request has already been handled, no changes are made and the admin is notified.
- If the system fails to update, no changes are made and the admin sees an error.

**Postconditions:** Approved users become community members. Rejected users do not gain access.

---

## UC-4: Send and Receive Messages (Claim Context)

| Field | Description |
|-------|-------------|
| **Actor** | Claimant (message sender), Listing Owner (message receiver) |
| **Preconditions** | Both users are logged in. A listing exists and is active. |
| **Trigger** | Claimant clicks "Message Owner" on a listing page. |

**Main Flow:**
1. Claimant opens a listing page.
2. Claimant clicks "Message Owner."
3. Message thread opens with listing information pinned at the top.
4. Claimant enters a message (optionally including desired quantity).
5. System sends the message.
6. Listing owner receives a notification.
7. Listing owner opens inbox, selects the conversation, and replies.

**Alternative/Error Flows:**
- If the message fails to send, the system displays "Message failed to send."
- If the listing is no longer active, the system prevents new messages and displays "Listing is no longer active."
- If the quantity entered exceeds available quantity, the system displays a warning before sending.

**Postconditions:** Both users can view and reply in the shared message thread.

---

## UC-5: View All Messages in Inbox

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. |
| **Trigger** | User navigates to the Inbox page. |

**Main Flow:**
1. User opens the inbox.
2. System loads all conversations involving the user.
3. Inbox displays conversation participants, related listing title, most recent message preview, timestamp, and unread status.
4. User selects a conversation.
5. Full message thread is displayed.

**Alternative/Error Flows:**
- If the user has no messages, inbox displays "No messages."
- If messages fail to load, system displays an error message.

**Postconditions:** User can view and manage all their message conversations.

---

## UC-6: Post in Community Discussion Board

| Field | Description |
|-------|-------------|
| **Actor** | Community Member |
| **Preconditions** | User is logged in and is a member of the community. |
| **Trigger** | User clicks "Create Post" on a community page. |

**Main Flow:**
1. User opens a community page.
2. User selects "Create Post."
3. User enters message content.
4. User submits the post.
5. System publishes the post on the community discussion board.

**Alternative/Error Flows:**
- If the post content is empty, the system displays "Post cannot be empty."
- If the server fails, the user is notified and the post is not published.
- Admins can remove inappropriate posts.

**Postconditions:** The post is visible to all community members.

---

## UC-7: Send Invite to Private Community

| Field | Description |
|-------|-------------|
| **Actor** | Community Admin / Host |
| **Preconditions** | Actor has admin permissions for the community. |
| **Trigger** | Admin opens community settings and selects "Invite Member." |

**Main Flow:**
1. Admin opens community settings.
2. Admin selects "Invite Member."
3. Admin enters invitee email or copies the invite link.
4. System creates the invitation record.
5. Invited user receives or uses the link.

**Alternative/Error Flows:**
- If the email is invalid or the user is already a member, the system displays an error and does not send a duplicate invite.

**Postconditions:** An invitation is created and available for the recipient to accept.

---

## UC-8: Accept an Invitation to a Private Community

| Field | Description |
|-------|-------------|
| **Actor** | Invited User |
| **Preconditions** | User has a valid, unexpired invitation link. |
| **Trigger** | User opens the invite link. |

**Main Flow:**
1. User opens the invite link.
2. System validates the invitation.
3. User is added as a community member.
4. User can view community listings and page.

**Alternative/Error Flows:**
- If the invitation is expired, invalid, or already used, the system displays an error and does not add the user.

**Postconditions:** User is a member of the private community.

---

## UC-9: Create a Food Listing

| Field | Description |
|-------|-------------|
| **Actor** | Community Member |
| **Preconditions** | User is logged in and is a member of the target community. |
| **Trigger** | User selects "Create Listing." |

**Main Flow:**
1. User selects "Create Listing."
2. User enters listing details: name, category, quantity, expiration date, pickup information, and photos.
3. User submits the listing.
4. System validates input.
5. Listing is published and visible to community members.

**Alternative/Error Flows:**
- If required fields are missing, the system displays validation errors.
- If image upload fails, the system notifies the user and prevents submission until resolved.

**Postconditions:** A new listing is visible within the community.

---

## UC-10: Edit or Delete a Listing

| Field | Description |
|-------|-------------|
| **Actor** | Listing Owner |
| **Preconditions** | User is logged in and owns the listing. |
| **Trigger** | User opens one of their listings and selects "Edit" or "Delete." |

**Main Flow:**
1. User opens one of their listings.
2. User selects "Edit" or "Delete."
3. User confirms the action.
4. System updates or removes the listing.

**Alternative/Error Flows:**
- If the listing no longer exists, the system displays an error.
- If the update fails, no changes are saved and the user is notified.

**Postconditions:** Listing is updated or removed from public view.

---

## UC-11: Mark a Listing as Reserved

| Field | Description |
|-------|-------------|
| **Actor** | Listing Owner |
| **Preconditions** | User owns the listing. Listing status is "Available." |
| **Trigger** | Owner selects "Mark as Reserved" on their listing or approves a claim request. |

**Main Flow:**
1. Owner opens their dashboard or listing management page.
2. Owner views incoming requests or listing actions.
3. Owner approves a request or marks the listing as reserved.
4. System updates listing status to "Reserved."
5. Claimant receives a notification.

**Alternative/Error Flows:**
- If the listing has already been deleted or closed, the system displays an error and makes no changes.

**Postconditions:** Listing status is "Reserved" and visually distinguished from available listings.

---

## UC-12: Update Remaining Quantity

| Field | Description |
|-------|-------------|
| **Actor** | Listing Owner |
| **Preconditions** | User owns the listing. Listing is active. |
| **Trigger** | Owner selects "Edit Quantity" on their listing. |

**Main Flow:**
1. Owner opens their listing.
2. Owner selects edit quantity.
3. Owner enters the updated amount.
4. Owner saves changes.
5. System updates the listing quantity.

**Alternative/Error Flows:**
- If the quantity is negative or invalid, the system displays a validation error.
- If the quantity is set to zero, the system prompts the owner to mark the listing as unavailable or closed.

**Postconditions:** Updated quantity is displayed on the listing page.

---

## UC-13: Search Listings by Category or Keyword

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. |
| **Trigger** | User enters a keyword or selects a category filter on the Browse Listings page. |

**Main Flow:**
1. User enters a keyword or selects a category.
2. User submits the search.
3. System retrieves matching listings.
4. Results are displayed.

**Alternative/Error Flows:**
- If no listings match, the system displays "No listings found."
- If listings fail to load, the system displays an error with a retry option.

**Postconditions:** Matching listings are displayed to the user.

---

## UC-14: Submit a Claim Request

| Field | Description |
|-------|-------------|
| **Actor** | Registered User (Claimant) |
| **Preconditions** | User is logged in. Listing is available. User is a member of the listing's community. |
| **Trigger** | User submits a claim request for a listing. |

**Main Flow:**
1. User opens a listing.
2. User specifies the desired quantity.
3. User submits the claim request.
4. System records the request.
5. Listing owner receives a notification.

**Alternative/Error Flows:**
- If requested quantity exceeds available quantity, the system displays a warning.
- If the listing is no longer available, the system prevents the request.

**Postconditions:** Claim request is recorded with "Pending" status.

---

## UC-15: Approve or Decline a Claim Request

| Field | Description |
|-------|-------------|
| **Actor** | Listing Owner |
| **Preconditions** | Owner is logged in. A pending claim request exists for their listing. |
| **Trigger** | Owner views a pending claim on their dashboard and selects "Approve" or "Decline." |

**Main Flow:**
1. Owner opens their dashboard.
2. Owner views pending claim requests.
3. Owner selects "Approve" or "Decline."
4. System updates claim status.
5. If approved, system deducts the requested quantity from available inventory.
6. Claimant receives a notification.

**Alternative/Error Flows:**
- If approving would exceed available inventory, system displays "Insufficient quantity available."
- If the claim has already been handled, no changes are made.

**Postconditions:** Claim is approved (quantity deducted) or declined. Claimant is notified.

---

## UC-16: Cancel a Claim Request

| Field | Description |
|-------|-------------|
| **Actor** | Claimant |
| **Preconditions** | User has a pending or approved claim that has not been completed. |
| **Trigger** | User navigates to their open requests and clicks "Cancel Request." |

**Main Flow:**
1. User navigates to open requests.
2. User selects the active request.
3. User clicks "Cancel Request."
4. System updates request status to "Canceled."
5. Any reserved quantity is returned to available inventory.
6. Listing owner receives a notification.

**Alternative/Error Flows:**
- If the exchange has already been completed, the system displays an error and prevents cancellation.

**Postconditions:** Request is canceled. Reserved quantity is restored.

---

## UC-17: Leave a Review After Exchange

| Field | Description |
|-------|-------------|
| **Actor** | Registered User (participant in a completed exchange) |
| **Preconditions** | Exchange is marked as completed. User participated in the exchange. User has not already submitted a review for this exchange. |
| **Trigger** | User navigates to exchange history and selects "Leave Review." |

**Main Flow:**
1. User navigates to exchange history.
2. User selects a completed exchange.
3. User clicks "Leave Review."
4. User submits a rating (1-5 stars) and optional written comment.
5. System saves the review.
6. Review appears on the recipient's profile.

**Alternative/Error Flows:**
- If the user already submitted a review for this exchange, the system displays "Review already submitted."
- If the review cannot be saved, an error is displayed and the user may retry.

**Postconditions:** Review is saved and visible on the reviewed user's profile.

---

## UC-18: Receive Exchange Status Notifications

| Field | Description |
|-------|-------------|
| **Actor** | Registered User (listing owner or claimant) |
| **Preconditions** | User is part of an active exchange. |
| **Trigger** | Exchange status changes (approved, declined, canceled, completed). |

**Main Flow:**
1. Exchange status changes.
2. System generates a notification.
3. Notification appears in the user's notification center.
4. User views the notification.

**Alternative/Error Flows:**
- If notification delivery fails, the notification remains queued and is retried.

**Postconditions:** User is informed of the status change.

---

## UC-19: View Listing History

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. |
| **Trigger** | User navigates to the "Listing History" section. |

**Main Flow:**
1. User opens the listing history page.
2. System loads all previous and current exchanges for the user (with pagination).
3. Each entry displays produce name, date, quantity, counterparty, and status.
4. User browses the list.

**Alternative/Error Flows:**
- If the user has no previous listings, the page displays "No previous listings."
- If the server fails to fetch data, an error message is shown.

**Postconditions:** User can review their exchange history.

---

## UC-20: Remove Bad-Faith Users and Listings (Admin Moderation)

| Field | Description |
|-------|-------------|
| **Actor** | Community Admin |
| **Preconditions** | Admin is logged in with admin permissions for the community. |
| **Trigger** | Admin selects a listing to remove or a user to kick/ban. |

**Main Flow:**
1. Admin selects a user's listing with "Remove" or a user's account with "Kick"/"Ban."
2. Admin confirms the action via a confirmation modal.
3. System removes the listing or revokes the user's community access.
4. Affected user receives a notification.

**Alternative/Error Flows:**
- If the listing has already been removed or the user already kicked, the system displays an appropriate message.
- If the system fails to update, no changes are made and the admin is notified.

**Postconditions:** Removed listings are no longer visible. Kicked/banned users lose community access.

---

## UC-21: Create an Account

| Field | Description |
|-------|-------------|
| **Actor** | Visitor (not logged in) |
| **Preconditions** | User does not have an existing account with the same email. |
| **Trigger** | User opens the registration page. |

**Main Flow:**
1. User opens the registration page.
2. User enters email and password.
3. User submits the registration form.
4. System validates input.
5. Account is created.
6. User is logged in and redirected to the homepage.

**Alternative/Error Flows:**
- If the email is already registered, the system displays "Email already exists."
- If required fields are missing or invalid, the system displays validation errors.

**Postconditions:** A new account exists and the user is authenticated.

---

## UC-22: Reset a Forgotten Password

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User has an existing account. |
| **Trigger** | User selects "Forgot Password" on the login page. |

**Main Flow:**
1. User selects "Forgot Password."
2. User enters their registered email.
3. System sends a password reset link.
4. User opens the link.
5. User enters a new password.
6. System updates the password.
7. User can log in with new credentials.

**Alternative/Error Flows:**
- If the email is not associated with an account, the system displays an error.
- If the reset link has expired, the system prompts the user to request a new link.

**Postconditions:** Password is updated and user can log in.

---

## UC-23: Update Profile Information

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. |
| **Trigger** | User opens profile settings and edits their information. |

**Main Flow:**
1. User opens profile settings.
2. User edits display name, location, or profile picture.
3. User clicks "Save."
4. System validates the data.
5. Profile is updated and changes are visible.

**Alternative/Error Flows:**
- If required fields are missing or invalid, the system displays validation errors.

**Postconditions:** Updated profile information is saved and visible to others.

---

## UC-24: View Personal Dashboard

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. |
| **Trigger** | User navigates to the Dashboard page. |

**Main Flow:**
1. User logs in and opens the dashboard.
2. System loads active listings, reserved listings, recent messages, pending requests, and past closed listings.
3. User selects an item to manage.

**Alternative/Error Flows:**
- If the user has no listings or messages, the dashboard displays empty-state messages.
- If dashboard data fails to load, the system displays an error.

**Postconditions:** User can view and manage their current activity.

---

## UC-25: Manage Community Member Roles

| Field | Description |
|-------|-------------|
| **Actor** | Community Admin |
| **Preconditions** | Admin is logged in with admin permissions for the community. |
| **Trigger** | Admin opens the community management page and selects a member. |

**Main Flow:**
1. Admin opens the community management page.
2. Admin selects a member.
3. Admin changes the member's role (member, moderator, admin).
4. Admin confirms the update.
5. System updates the member's permissions.

**Alternative/Error Flows:**
- If the selected user is no longer a member, the system displays an error.
- If an admin attempts to remove their own only-admin role, the system prevents the action.

**Postconditions:** Member's role and permissions are updated.

---

## UC-26: Report a Listing or User

| Field | Description |
|-------|-------------|
| **Actor** | Registered User |
| **Preconditions** | User is logged in. |
| **Trigger** | User clicks "Report" on a listing or user profile. |

**Main Flow:**
1. User selects "Report" on a listing page or user profile.
2. System displays a report form with reason options (fraudulent, unsafe, misleading, expired, inappropriate).
3. User selects a reason and optionally adds a comment.
4. User submits the report.
5. System records the report for admin review.

**Alternative/Error Flows:**
- If submission fails, the system notifies the user and allows retry.

**Postconditions:** Report is recorded and available for community admin review.
