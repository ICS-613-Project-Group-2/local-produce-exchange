# Frontend Design Documentation

## Architecture
- **Framework:** React with TypeScript
- **Structure:** Component-based, organized by feature

## Directory Layout
```
frontend/
├── components/       # Generic reusable pieces
│   ├── ui/           # Buttons, inputs, cards, modals
│   ├── layout/       # Headers, footers, sidebars, grids
│   └── feedback/     # Toasts, alerts, loaders, error states
├── features/         # Reusable components tied to app features
│   ├── listings/
│   ├── communities/
│   ├── messages/
│   ├── notifications/
│   ├── dashboard/
│   ├── profile/
│   ├── reviews/
│   └── auth/
├── pages/            # Full screens built from components
├── styles/
│   ├── theme.css     # Design tokens and variables
│   └── global.css    # Resets and base styles
└── data/             # API clients, constants, types
```

## Brand Personality
Green Beans feels community-focused, friendly, local, fresh, simple, trustworthy, and neighborly. The site should feel like a polished farmers market: welcoming, easy to use, colorful enough to feel fresh, but clean and organized enough for listings, messages, communities, forms, and dashboards. Avoid looking corporate, plain, or like a shopping site. Emphasize sharing, freshness, community connection, and reducing food waste.

## Color Palette (Polished Farmers Market)

### Primary
| Token | Value | Usage |
|-------|-------|-------|
| Primary | #2E7D32 | Leaf green — main brand, primary actions, nav |
| Primary dark | #1B5E20 | Deep green |
| Primary hover | #256B2B | Darker leaf green |
| Primary light | #E8F5E9 | Pale green backgrounds |
| Primary softer | #F1FAF3 | Very pale green |

### Secondary
| Token | Value | Usage |
|-------|-------|-------|
| Secondary | #F9C74F | Sunflower yellow — secondary actions, highlights |
| Secondary hover | #F2B705 | Deeper market yellow |
| Secondary soft | #FFF3C4 | Pale yellow |

### Accent
| Token | Value | Usage |
|-------|-------|-------|
| Accent | #F9844A | Market orange — freshness alerts, expiring-soon |
| Accent dark | #C95B21 | Burnt orange |
| Accent soft | #FFE1D2 | Pale orange |

### Backgrounds & Surfaces
| Token | Value |
|-------|-------|
| Background | #FFFDF7 (soft cream) |
| Background warm | #FFF7E8 (warm cream) |
| Background alt | #F7F2E8 (market beige) |
| Surface | #FFFFFF |
| Surface warm | #FFFCF5 |

### Text & Borders
| Token | Value |
|-------|-------|
| Text | #2D2A26 (warm charcoal) |
| Muted text | #78716C (warm gray) |
| Border | #E5E0D8 (warm light) |

### System
| Token | Value |
|-------|-------|
| Success | #2E7D32 |
| Warning | #F59E0B |
| Error | #DC2626 |
| Info | #2563EB |

## Typography
- **Font:** Nunito Sans (alternate: Inter)
- Hero title: 40px bold
- Page title: 32px bold
- Section heading: 28px bold
- Card title: 18px semibold
- Body: 16px regular
- Label: 14px semibold
- Helper text: 14px regular
- Badge: 12px semibold

Keep text clean and spacious. Use headings, cards, icons, and short paragraphs for scannability.

## Layout
- Max width: 1200px
- Desktop padding: 32px
- Grid: 12-column desktop, 6-column tablet, 1-column mobile
- Breakpoints: mobile 0–639px, tablet 640–1023px, desktop 1024+
- Use soft section backgrounds, white/warm-white cards, and subtle spacing for visual hierarchy
- Border radius: 16px (cards), 10–12px (inputs/buttons), images match card style
- Shadows: soft and subtle

### Spacing Scale
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

## Design Principles
- Desktop web application (primary target)
- Accessible (WCAG 2.1 AA)
- Consistent spacing and typography via design tokens in `theme.css`
- Every page should look like part of the same product
- All colors, spacing, typography, radius, and shadows from shared theme variables — no hard-coded values

## Status Badges
Always use both color and a text label. Never color alone.

| Status | Background | Text Color |
|--------|-----------|------------|
| Available | Pale green | Dark green |
| Reserved | Pale yellow | Dark amber |
| Expiring Soon | Pale orange | Burnt orange |
| Closed | Light gray | Dark gray |
| Pending | Pale blue | Blue |
| Completed | Pale green | Green |
| Canceled | Pale red | Red |
| Error | Red | Red + explanation |

## Components

### Buttons
| Variant | Style | Usage |
|---------|-------|-------|
| Primary | Green bg, white text | Create Listing, Join, Submit, Save |
| Secondary | Yellow bg, dark text | Browse, View, Learn More |
| Accent | Orange bg, dark text | Freshness/expiration callouts (sparingly) |
| Outline | White bg, green border/text | Cancel, Back, Edit, View Details |
| Danger | Red bg, white text | Delete, Remove, Ban, Cancel Request |

All buttons have hover, active, focus, disabled, and loading states.

### Cards
White/warm-white background, warm border, 16px radius, consistent padding, subtle shadow. Listing cards include: image (4:3), title, quantity, location, freshness/expiration, status badge, action button.

### Navigation
- Green top bar with clear links, active state, hover states
- Logo (leaf/produce icon) top-left
- **Logged out:** About, Log In, Sign Up (no access to Browse, Communities, or authenticated pages)
- **Logged in:** Browse, Communities, Post Listing, Messages, Dashboard, Profile, notification icon
- Post Listing action slightly emphasized

### Inputs
Visible labels, rounded corners, placeholder text, helper text, strong focus states. Errors appear near the related field.

### Empty States
Friendly with simple illustrations (baskets, leaves, produce icons). Explain what happened and provide a next action.

### Modals
Use for destructive confirmations (delete, remove, ban, cancel). Title states the action, body explains consequences. Danger button for destructive action, outline/secondary for cancel.

## App-Specific Components
- ListingCard, ListingDetailHeader
- CommunityCard, CommunityBanner
- MessagePreview, MessageBubble
- NotificationItem
- ProfileSummaryCard, ReviewCard
- DashboardSummaryCard
- EmptyState, FormAlert, StatusBadge
- SearchBar, FilterChip, Modal

## Images & Icons
- Produce images: bright, natural, consistently cropped, rounded
- Listing cards: 4:3 image ratio
- Community banners: wide and warm
- Profile photos: circular
- Fallback image when no photo uploaded
- Icons: simple, friendly, consistent style (leaf, basket, chat bubble, people, map pin, clock, crate, bell)

## Form & Validation
- Visible labels, required fields marked clearly
- Error messages near the field, specific and readable
- One primary action button per form; cancel/back use outline/secondary
- Success = green alert, warning = yellow/orange, error = red
- All alerts use color + text

## Data Display
- Cards for visual browsing (listings, communities, messages)
- Tables only for structured comparison (history, admin)
- Pagination, filters, or "Load more" for long lists
- Timestamps use consistent formatting

## Content & Writing Style
Friendly, simple, direct. Community-centered, not technical or transactional.
- "Message Owner" not "Submit Inquiry"
- "No listings found. Try another category." not "Query returned zero results."
- "Join Community" not "Continue"
- Error messages explain the issue and how to fix it

## Accessibility
- 4.5:1 contrast ratio minimum for normal text (WCAG 2.2)
- Never use color alone for status
- Every field has a visible label, every image has alt text
- Clear hover, disabled, active, and keyboard focus states on all interactive elements
- Dark text on yellow/orange buttons unless background is dark enough for white text
- Error messages: specific, visible, near the related field

## Pages

### Landing/Home Page ⚡ Priority
*First page users see, explains what the app does*

> **Access:** This page has two versions. Logged-out users see the marketing/intro landing page. Logged-in users see a separate personalized version or are redirected to their dashboard.

**Logged-out version:**
- The landing page should be the first page users see when they open Green Beans. It should quickly explain that the site is a local food exchange platform where people can share surplus produce, browse available food, join communities, and coordinate exchanges. The tone should feel welcoming, fresh, simple, and community-focused.
- The top hero section should include the Green Beans name or logo, a short tagline such as "Share fresh food with your local community," and a clear description of the platform. This section should include strong call-to-action buttons such as "Sign Up" and "Learn More." A bright produce, farmers market, or community garden image would help support the Farmers Market theme.
- A featured listings section should show sample produce cards so users understand what listings look like. Each card should include a produce image, item name, quantity, pickup area, expiration or harvest date, and a status badge such as "Available," "Reserved," or "Expiring Soon." This section should highlight freshness and expiration information because the project focuses on reducing waste before food goes unused.
- The page should include a simple "How It Works" section that explains the main user flow. Users can join a community, browse available listings, message the listing owner, and coordinate the exchange. This section can use short cards or icons to make the process easy to understand.
- The landing page should also preview the community feature. This section can show a few sample community cards with a community name, short description, public/private badge, member count, and a button such as "Join" or "Request to Join." This helps show that the app supports both public and private food-sharing groups.
- A trust and purpose section should explain that Green Beans is not a regular shopping marketplace. It is focused on local sharing, trading, and community exchange. Users coordinate through direct messages instead of automated checkout, which keeps the platform simple and community-based.
- The page should end with a final call-to-action encouraging users to get started. Suggested text could be "Ready to share fresh food with your community?" followed by buttons like "Sign Up" and "Learn More." Visually, the page should use the Farmers Market theme with green navigation, yellow or orange accents, white listing cards, a soft cream background, rounded buttons, and bright natural-looking produce images.

**Logged-in version:**
- Logged-in users should see a personalized home page or be redirected to their dashboard. This version does not need the marketing hero or "How It Works" sections. Instead it can show a summary of the user's activity, quick links to their communities, recent or expiring-soon listings from their communities, and actions like "Create a Listing" or "Browse Listings."

### About Page
*What your site is, why it exists, who it helps, and how users can participate*

- The About page should introduce Green Beans as a local food exchange platform that helps users share surplus produce and food items within their communities. The page should quickly communicate the purpose of the site: reducing food waste, helping neighbors connect, and making fresh food easier to find and share. The tone should feel friendly, trustworthy, simple, and community-focused.
- The top of the page should include a hero section with the title "About Green Beans," a short tagline such as "Share fresh food with your local community," and a bright image or illustration of produce, a garden, farmers market, or neighbors exchanging food. This section can also include call-to-action buttons such as "Browse Listings," "Join a Community," or "Create a Listing" so users immediately know what they can do next.
- The page should include a short mission section explaining why Green Beans exists. This section should mention that users can post surplus produce, browse available food, join communities, and coordinate exchanges through direct messages. The mission should emphasize that the platform is designed to help reduce food waste while supporting local sharing and community connection.
- A "Why It Matters" section should explain the problem the app solves. It can describe how fresh food often goes unused when people do not have an easy way to share it with others nearby. This section should connect the app to different user groups, such as home gardeners with extra produce, students looking for affordable fresh food, nonprofit volunteers organizing community support, pantry coordinators looking for donations, and neighbors who want to help reduce waste.
- The About page should also explain how the app works in a simple way. A short "How It Works" section can show the basic flow: users join a community, browse or search food listings, message the listing owner, and coordinate the exchange. This section should be easy to scan and can use small icons or simple cards to make the process feel approachable.
- A feature summary section should highlight the main things users can do on the site. This can include posting produce listings with photos and pickup details, searching and browsing available food, messaging listing owners, joining public or private communities, viewing freshness and expiration information, and leaving reviews after completed exchanges. These features should be shown as simple cards with short descriptions.
- The page should make it clear that Green Beans is not a traditional store or buy/sell marketplace. A short section can explain that the site is focused on sharing, trading, and local exchange. Users coordinate exchanges directly through messages, which keeps the process flexible and community-based.
- The About page should also include a short section about community safety and trust. This can explain that communities may be public or private and that community admins can manage members, approve requests, send invite links, moderate posts, and remove bad-faith users or listings. This section helps users understand that the app is designed to support safe and organized community sharing.
- A freshness section should explain that listings can show posting dates, harvest dates, expiration dates, or a "date not available" message. This helps users make informed decisions before requesting food and supports the project goal of reducing waste before produce goes bad.
- The page should end with a final call-to-action, such as "Ready to share fresh food with your community?" followed by buttons like "Browse Listings," "Join a Community," or "Create a Listing." Visually, the page should use the Farmers Market theme with green as the main color, yellow or orange accents, white cards, a soft cream background, rounded buttons, bright natural produce images, and a clean layout.

### Sign Up Page
*Register with email and password, and be redirected to homepage after account creation*

- The sign up page should allow new users to create a Green Beans account so they can access the main features of the site, including creating food listings, messaging listing owners, joining communities, and managing their profile. The page should feel simple, welcoming, and trustworthy so that users understand registration is quick and easy.
- The page should include a clear heading such as "Create your Green Beans account" and a short description explaining that signing up lets users share produce, browse local food listings, and connect with their community. The design should use the Farmers Market theme with a soft cream background, a white form card, green primary button, and small produce or community illustration.
- The form should include fields for email address, password, and confirm password. Each field should have a visible label, helpful placeholder text, and validation messages for missing or invalid information. The page should also include a primary "Create Account" button and a link for users who already have an account, such as "Already have an account? Log in."
- The mockup should show at least one error or validation state. Examples include "Email already exists," "Please enter a valid email address," or "Passwords do not match." These messages should appear close to the related field and use clear language so users know how to fix the problem.
- After successful registration, the user should be redirected to the homepage or dashboard. The mockup can show a small success message such as "Account created successfully" or include a note that the user is taken to the main site after creating an account.
- The page should stay uncluttered and accessible. Since Green Beans is meant for community members with different technology comfort levels, the layout should be easy to scan, with large input fields, readable text, clear button states, and enough spacing between form elements.

### Login Page
*Users can access authenticated features; create listings, messages, dashboard, profile*

- The login page should allow returning users to access their Green Beans account and continue using the main features of the site, including browsing their dashboard, creating or editing listings, messaging other users, joining communities, and managing their profile. The page should feel simple, secure, and welcoming.
- The page should include a clear heading such as "Welcome back to Green Beans" and a short description reminding users that they can sign in to share produce, view messages, and manage their community exchanges. The design should follow the Farmers Market theme with a soft cream background, a white login card, green primary button, and small produce or community illustration.
- The form should include fields for email address and password. Each field should have a visible label, clear placeholder text, and enough spacing for readability. The page should include a primary "Log In" button, a "Forgot Password?" link, and a link for new users such as "Don't have an account? Sign up."
- The mockup should show at least one error state. Examples include "Incorrect email or password," "Email is required," or "Password is required." Error messages should appear near the form and use clear language so users know what went wrong.
- After a successful login, the user should be redirected to the homepage or dashboard. The mockup can include a note showing that users are taken to their dashboard after signing in, where they can view active listings, messages, reserved items, and past activity.
- The page should remain clean and accessible. Inputs and buttons should be large enough to use comfortably, the text should be easy to read, and the visual design should avoid clutter so users can log in quickly.

### Forgot Password / Reset Password Page

> **TODO:** No backend endpoint exists for password reset. Decide: build as placeholder pages or skip entirely? Backend would need `POST /v1/forgot-password` and `POST /v1/reset-password`.
- The Forgot Password and Reset Password flow should help users regain access to their Green Beans account if they cannot remember their password. This does not need to be a major standalone feature page, but it should be included as part of the login and account access flow.
- The first screen should be a "Forgot Password" page or modal linked from the Login page. It should include a heading such as "Reset your password," a short explanation, an email input field, and a primary button labeled "Send Reset Link." The design should match the Login and Sign Up pages with a soft cream background, white form card, green button, and simple Farmers Market styling.
- The page should show clear success and error states. After a user submits their email, the mockup can show a message such as "Check your email for a password reset link." Error examples can include "Email is required," "No account found with that email," or "Something went wrong. Please try again."
- The second screen should be a "Create New Password" page. It should include fields for "New Password" and "Confirm New Password," along with a primary button labeled "Update Password." The mockup should also show possible validation messages such as "Passwords do not match" or "Reset link expired."
- After the password is successfully updated, the user should see a success message or be redirected back to the Login page. Since this is a support flow, the layout should stay simple, accessible, and focused only on helping the user recover their account.

### Browse Listings / Search Results Page ⚡ Priority
*See listings by keyword or category*

> **TODO:** Search filters are placeholder. Update filter options once the team decides which filters to support.
> **Note:** This page shows listings grouped by community, pulling from all communities the user belongs to. Search applies across all communities. Requires login.
> **Note:** Closed listings should not appear on this page. If a listing becomes closed while displayed, it should update on the next response.
> **Note:** Each listing card should include a community label so users know which community it belongs to.

- The Browse Listings page should help users quickly find available produce or food items in their communities. This page should focus on search, filtering, and easy scanning so users can compare listings and decide which items they want to view in more detail.
- The top of the page should include a clear heading such as "Browse Listings" and a short description explaining that users can search for available food shared by local community members. Below the heading, include a large search bar with placeholder text such as "Search for produce, categories, or communities." The search area can also include filter options for category, pickup area, expiration date, availability status, and quantity.
- The main content should show listing cards in a grid or list layout. Each card should include a produce image, item name, category, quantity available, pickup area, expiration or harvest date, and a status badge such as "Available," "Reserved," "Closed," or "Expiring Soon." Each listing card should also include a "View Details" button so users can open the full listing page.
- The page should make freshness information easy to notice. Listings that are close to expiring can be visually highlighted with an "Expiring Soon" badge or placed in a featured section. This supports the goal of helping food get shared before it goes unused.
- The page should include useful empty and error states. If no listings match the search, the page should show a message such as "No listings found" with a suggestion to adjust the search or filters. If listings fail to load, the page should show a clear error message and a button to try again.
- The layout should be easy to use. On desktop, filters can appear in a sidebar or horizontal filter bar, with listing cards displayed in a multi-column grid. The visual style should follow the Farmers Market theme with a soft cream background, white cards, green buttons, yellow/orange status accents, rounded corners, and bright natural produce images.

### Listing Details Page
*All information about one food item*

> **TODO:** Do we want to allow multiple images per listing? The database supports it (listing_photos join table), but need to decide on the UI treatment (carousel, gallery, single hero image, etc.).
> **TODO:** Claim request vs "Message Owner" flow — The API has a formal claim system (`POST /v1/listings/{listing_id}/claims` with approve/decline/cancel) and messaging is tied to claims (`GET /v1/claims/{claim_id}/thread`). Decide: (A) user submits a claim request with quantity, then messaging opens within that claim context, or (B) user messages first, claim is created behind the scenes?
> **TODO:** Partial exchange logic — How should exchange status be updated and remaining quantity adjusted after a partial exchange? (e.g., listing has 10, claim approved for 3 — does quantity drop to 7 and stay "Available"?)
> **TODO:** Quantity measurement — How do we measure produce quantity? Weight is not discrete unless constrained. If using individual count (bunches, heads, pieces), how do we account for size differences? Should this be communicated in the listing description, or is a separate step needed in the claiming process?

> **Decided:** User submits a formal claim request with quantity (Option A), then messaging opens within that claim context. System deducts approved quantity from available inventory automatically. If approving would exceed available, system blocks it. Quantity is integer + freeform unit text. Size differences are communicated in the listing description.

- The Listing Details page should show all important information about one produce or food listing so users can decide whether they want to message the owner and coordinate an exchange. This page should be clear, trustworthy, and easy to scan, especially because users need to understand the item's quantity, freshness, pickup information, and availability before taking action.
- The top of the page should include a large produce image, the listing title, and a status badge such as "Available," "Reserved," "Closed," or "Expiring Soon." Near the title, the page should show the category, quantity available, posting date, expiration date, harvest date if provided, and a freshness message such as "Expires in 2 days" or "Date not available." Freshness and expiration details should be visually noticeable because the project focuses on reducing food waste before items go bad.
- The main listing information should include a short description, pickup area, pickup window, storage conditions, and any notes from the owner. This section should help users understand what the item is, where it can be picked up, and whether the pickup timing works for them. The layout can use separate information cards or clearly divided sections so the page does not feel crowded.
- The page should include an owner information card with the owner's display name, profile picture, general location, and rating if available. This helps build trust before the user starts a conversation. The card should include a primary action button labeled "Message Owner" so users can open a private message thread connected to the listing.
- When messaging the owner, the page should allow the user to include the quantity they are interested in. The mockup can show a small quantity input or a message preview area with a warning state if the requested amount is greater than the available quantity. If the listing is no longer active, the page should disable the message button and show a message such as "Listing is no longer active."
- The page should also show clear error or edge states. Examples include missing expiration information, invalid date information, unavailable listing status, or a failed message attempt. These messages should be simple and placed near the action or information they relate to.
- The layout should follow the Farmers Market theme with a soft cream background, white content cards, green primary buttons, yellow or orange freshness badges, rounded corners, and bright natural produce images. On desktop, the image and main details can sit side by side.

### Create Listing Page ⚡ Priority
*Users with surplus produce need to create a listing with details and photos*

> **TODO:** Pickup window, storage conditions, and harvest date are mentioned in this page description but don't exist in the database schema. Decide: add these fields to the schema, or remove from the page description?
> **TODO:** Specify what item details are exactly necessary when creating a listing — quantity and units (custom text or preset options like "lbs," "bunches," "pieces"?), dietary restrictions, allergens, etc. Which fields are required vs optional?

> **Decided:** All listing fields are required to publish: name, category, quantity, unit, expiration date, pickup location, photo, and community. Quantity is an integer field paired with a freeform text unit field (e.g., "5" + "lbs" or "3" + "bunches"). This lets users describe quantity in whatever unit makes sense for their item.

- The Create Listing page should allow logged-in users to post surplus produce or food items so other community members can view and request them. This page should feel simple and guided, since users need to enter enough information for others to understand the item, freshness, quantity, and pickup details.
- The top of the page should include a heading such as "Create a Listing" and a short description explaining that users can share extra produce with their local community. The page should use a clear form layout with sections for basic item details, freshness information, pickup details, photos, and final review before publishing.
- The form should include fields for produce name, category, quantity, unit, description, expiration date, harvest date if available, pickup area, pickup window, and storage conditions. These fields help make each listing useful and trustworthy because users need to know what is available, how much is available, when it should be used by, and how pickup will work.
- The page should include a photo upload area where users can add one or more images of the produce. The mockup can show an upload box, image preview thumbnails, and an error state such as "Image upload failed" or "Please upload a valid image." If no image is uploaded, the listing can use a simple fallback image.
- The page should include a community selector if users belong to multiple communities. This allows the user to choose where the listing will appear. The mockup can show a dropdown labeled "Choose Community" with public or private community options.
- The page should show validation and error states for required information. Examples include "Produce name is required," "Quantity must be greater than zero," "Expiration date is invalid," or "Pickup window is required." These messages should appear near the related form field so users can fix the issue easily.
- At the bottom of the page, include a primary button labeled "Publish Listing" and a secondary button such as "Cancel" or "Save Draft" if your team wants that option. After the listing is successfully published, the user should be taken to the listing details page or dashboard, with a success message such as "Listing published successfully."
- The visual style should follow the Farmers Market theme with a soft cream background, a white form card, green primary button, light gray input borders, rounded corners, and small produce-related icons.

### Edit Listing / Manage Listing Page ⚡ Priority

> **TODO:** Should users be able to manually change the listing status, or should it be automatic based on the remaining quantity and the state of existing requests?
- The Edit Listing or Manage Listing page should allow listing owners to update, manage, or remove their existing produce listings. This page should be accessible from the user dashboard, listing details page, or listing history area, and should only be available to the owner of the listing.
- The page should look similar to the Create Listing page, but the form fields should already be filled in with the current listing information. Users should be able to edit the produce name, category, quantity, unit, description, expiration date, harvest date, pickup area, pickup window, storage conditions, photos, and community placement if allowed.
- The page should include listing management actions in addition to normal editing. The owner should be able to save changes, update the remaining quantity, mark the listing as reserved, mark the listing as closed, or delete the listing. These actions help keep the listing accurate after the owner coordinates an exchange through messages.
- The mockup should show status controls clearly. For example, the current status can appear near the top of the page as a badge such as "Available," "Reserved," or "Closed." The owner can use buttons or a dropdown to change the status. If the listing is closed, the form can show limited editing options or a message explaining that the listing is no longer active.
- The page should include validation and error states. Examples include "Quantity must be greater than zero," "Expiration date is invalid," "Listing no longer exists," or "Changes could not be saved." If the quantity is changed to zero, the page should prompt the owner to mark the listing as closed or unavailable.
- The delete option should use a confirmation modal before removing the listing. The modal should ask the user to confirm the action with text such as "Are you sure you want to delete this listing?" and include a danger button labeled "Delete Listing" plus a secondary "Cancel" button. This prevents users from accidentally removing a listing.
- After the user saves changes, the page should show a success message such as "Listing updated successfully" and return the user to the listing details page or dashboard. If the user deletes the listing, the app should return them to the dashboard or listing history page.
- The visual style should follow the Farmers Market theme with a soft cream background, white form cards, green save buttons, red delete buttons, rounded corners, light gray input borders, and clear status badges.

### Messages / Inbox Page ⚡ Priority
*Private messaging to coordinate exchanges*

- The Messages or Inbox page should allow users to view and manage all of their conversations in one place. This page is important because Green Beans uses direct messaging to coordinate produce exchanges, ask questions, confirm pickup details, and communicate about specific listings.
- The page should include a clear heading such as "Messages" or "Inbox" and a short description explaining that users can view conversations related to their listings, requests, and exchanges. The layout should make it easy for users to scan recent conversations and quickly open the one they need.
- Each message preview should show the other participant's name, the related listing title, a short preview of the most recent message, the timestamp, and an unread message indicator if applicable. Including the listing title is important so users know which produce item the conversation is about without opening every thread.
- On desktop, the mockup can use a two-column layout with the conversation list on the left and the selected message thread on the right.
- The page should include empty and error states. If the user has no messages, show a friendly message such as "No messages yet" with a suggestion to browse listings or message a listing owner. If messages fail to load, show a clear error message such as "Messages could not be loaded" with a button to try again.
- The page should only show conversations the user is allowed to access. Since private messages are between the listing owner and the interested user, the mockup should avoid showing messages from unrelated users or communities.
- The visual style should follow the Farmers Market theme with a soft cream background, white message cards, green accents for active or selected conversations, orange or yellow unread indicators, rounded corners, and clear spacing.

### Message Thread Page ⚡ Priority
*Users coordinate pickup details manually*

> **TODO:** Claim request vs "Message Owner" flow also affects this page. Messaging is tied to claims in the API (`GET /v1/claims/{claim_id}/thread`). The thread should show claim context (quantity requested, status). Decide how status updates (approve/decline/cancel) are surfaced here.
> **TODO:** Should the request quantity be editable once a claim request has been accepted by the lister? This could seem unfair to other users and/or cause problems with user expectations.

- The Message Thread page should allow two users to communicate directly about a specific produce or food listing. This page is important because Green Beans uses direct messages to coordinate pickup details, ask questions, discuss requested quantities, and complete exchanges manually.
- The top of the page should show the related listing information so both users know which item the conversation is about. This pinned listing section can include the produce name, small image, quantity available, requested quantity if provided, pickup area, freshness or expiration date, and current status such as "Available," "Reserved," or "Closed."
- The main area of the page should show the conversation between the listing owner and the interested user. Messages should appear in chat bubbles with the sender's name or profile image, message text, and timestamp. The current user's messages can appear aligned to one side, while the other user's messages appear on the opposite side.
- The bottom of the page should include a message input area where the user can type and send a new message. The input should have a clear placeholder such as "Write a message…" and a green "Send" button. If the user is starting the conversation from a listing, the page can also include a quantity field so they can say how much of the item they are interested in receiving.
- The page should include clear action and status controls when needed. For listing owners, the thread can show quick actions such as "Mark Reserved," "Update Quantity," or "Mark Closed" after they coordinate with the other user. For claimants, the thread can show the current request status and any related updates.
- The mockup should show error and edge states. If a message fails to send, the page should show a message such as "Message failed to send" with an option to try again. If the listing is no longer active, the message input should be disabled and the page should show "Listing is no longer active." If the conversation fails to load, the page should show a clear loading error.
- The page should only be accessible to the two users involved in the conversation. The design should make the conversation feel private, organized, and connected to the listing. Visually, it should follow the Farmers Market theme with a soft cream background, white message area, green accents, rounded chat bubbles, orange or yellow status highlights, and clear spacing.

### User Dashboard Page
*Personal dashboard showing active listings, messages, reserved items, and past closed listings*

> **TODO:** "Reserved items" — Decide: does this mean the user's outgoing approved claims, listings they own that are marked reserved, or both?

- The User Dashboard page should serve as the main control center for a logged-in user. It should help users quickly manage their Green Beans activity, including active listings, reserved items, recent messages, and past closed listings. This page should feel organized, personal, and easy to scan.
- The top of the page should include a greeting or page title such as "My Dashboard" or "Welcome back," along with a short summary of the user's current activity. This area can include small overview cards showing counts for active listings, unread messages, reserved items, pending requests, or completed exchanges.
- The dashboard should include a section for the user's active listings. Each listing preview should show the produce name, image, quantity available, expiration or harvest date, current status, and quick actions such as "View," "Edit," "Update Quantity," or "Mark Closed." This helps listing owners keep their shared food information accurate and up to date.
- The page should include a section for reserved or pending items. This section can show listings that the user is interested in or items that have been marked as reserved after messaging. Each item should show the listing title, status, related user, pickup information if available, and an action such as "View Thread" or "Cancel Request."
- A recent messages section should show the latest conversations related to listings or exchanges. Each message preview should include the other user's name, related listing title, short message preview, timestamp, and unread indicator. This helps users quickly continue conversations without opening the full inbox first.
- The dashboard should also include a past activity or listing history section. This can show closed, completed, or canceled exchanges with the produce name, date, quantity, and status. Completed exchanges can include an option to leave a review if the user has not already submitted one.
- The page should include useful empty and error states. If the user has no active listings, the dashboard can show a friendly message such as "You have not created any listings yet" with a button to "Create a Listing." If there are no messages, it can show "No messages yet." If dashboard data fails to load, the page should show a clear error message and a button to try again.
- The visual style should follow the Farmers Market theme with a soft cream background, white dashboard cards, green action buttons, yellow or orange status highlights, rounded corners, and bright produce images. On desktop, the dashboard can use a multi-column layout with summary cards across the top.

### Profile Page / Profile Settings
*Users need to manage profile information such as display name, location, and profile picture. Reviews and ratings can also appear after completed exchanges*

- The Profile Page should let users view and manage their Green Beans identity. It should help other community members recognize who they are, where they are generally located, and whether they are trustworthy to exchange with. The page can have two views: a public profile that other users can see and a private settings area that only the account owner can edit.
- The public profile view should include the user's profile picture, display name, general location, rating, reviews, and recent activity. It can also show active listings, completed exchanges, and community memberships if the team wants those details visible. This helps users feel more comfortable before messaging someone about a produce exchange.
- The Profile Settings section should allow users to update their display name, location, profile picture, and optional bio. The form should include clear labels, placeholder text, validation messages, and a green "Save Changes" button. Users should only be able to edit their own profile information.
- The page should include a profile picture upload area with a circular image preview, upload button, and error message if the image fails to upload. If no image is provided, the page can show a simple default avatar that still matches the Farmers Market theme.
- A reviews section should show feedback from completed exchanges. Each review can include the reviewer's name, star rating, short comment, and review date. If the user has no reviews yet, the page should show a friendly empty state such as "No reviews yet."
- The profile page can also include a listing history or activity section showing past and current exchanges. Each item should show the produce name, date, quantity, and status, such as completed, canceled, reserved, or closed. Completed exchanges can include a "Leave Review" button if the user has not reviewed the other participant yet.
- The mockup should include success and error states. After saving changes, the page can show "Profile updated successfully." If the update fails, it should show "Profile could not be updated. Please try again." The layout should follow the Farmers Market theme with a soft cream background, white profile cards, green buttons, rounded profile images, light borders, and clear spacing.

### Listing History / Exchange History Page
*See previous and current exchanges with produce, date exchanged, quantity, and status*

- The Listing History or Exchange History page should allow users to view a record of their past and current produce exchanges. This page helps users keep track of what they have shared, requested, reserved, completed, canceled, or closed over time.
- The top of the page should include a heading such as "Listing History" or "Exchange History" with a short description explaining that users can review their previous and current food-sharing activity. The page can also include filter tabs such as "All," "Active," "Reserved," "Completed," "Canceled," and "Closed" so users can quickly find the type of exchange they are looking for.
- The main content should show a list or table of exchange records. Each item should include the produce name, image if available, date posted or exchanged, quantity, related user, community, and status. Status badges should make it easy to identify whether an item is available, reserved, completed, canceled, or closed.
- The page should include actions for relevant history items. For active or reserved listings, users can have options such as "View Details," "Open Message Thread," or "Manage Listing." For completed exchanges, users can have a "Leave Review" button if they have not already submitted a review for that exchange.
- The mockup should include an empty state for users who do not have any previous listings or exchanges. A message such as "No previous listings yet" can appear with a button to "Create a Listing" or "Browse Listings." The page should also include an error state, such as "History could not be loaded. Please try again," if the system fails to retrieve the data.
- The layout should be easy to scan on both desktop and mobile. On desktop, the history can appear as a table or structured list with columns for item, date, quantity, status, and action.
- The visual style should follow the Farmers Market theme with a soft cream background, white history cards or table rows, green action buttons, rounded corners, light borders, and clear status badges. The page should feel organized and useful, helping users understand their food-sharing activity without feeling crowded.

### Leave Review Page or Modal
*Reviews help build trust after exchanges, can be a modal or popup*

> **TODO:** Reviews — who can review whom? The schema has `reviewer_user_id` and `reviewed_user_id` on a claim request. Decide: can both parties (lister and claimer) review each other, or only the claimer reviews the lister?

- The Leave Review page or modal should allow users to submit feedback after a produce exchange has been completed. This feature helps build trust between community members by showing ratings and comments on user profiles.
- This feature can be designed as a modal instead of a full page because it is a short action connected to exchange history or listing history. Users can open it by clicking a "Leave Review" button next to a completed exchange. The modal should clearly show who the user is reviewing and which exchange the review is connected to.
- The review form should include a star rating from 1 to 5 and an optional written comment box. The page or modal can include a short prompt such as "How was your exchange?" to make the action feel simple and friendly. The form should also include a green "Submit Review" button and a secondary "Cancel" button.
- The mockup should show validation and edge states. If the user tries to submit without selecting a rating, the modal can show "Please select a rating." If the user already reviewed that exchange, the page should show "Review already submitted." If the review cannot be saved, it should show "Review could not be saved. Please try again."
- After a successful submission, the user should see a confirmation message such as "Review submitted successfully." The review should then appear on the other user's profile with the rating, optional comment, reviewer name, and review date.
- The design should follow the Farmers Market theme with a white modal card, soft cream overlay or background, green submit button, rounded corners, clear star icons, and simple spacing.

### Communities Page
*Users need to browse, search, join public communities, and request access to private communities*

> **TODO:** Search filters are placeholder. Update filter options once the team decides which filters to support.
> **Note:** Requires login. Logged-out users cannot access this page. Supports both public (join freely) and private (request or invite required) communities.

- The Communities page should allow users to browse, search, and join local food-sharing communities. This page helps users find groups where they can view listings, participate in discussions, and connect with people sharing produce or food nearby.
- The top of the page should include a heading such as "Communities" or "Find a Community," along with a short description explaining that users can join public communities or request access to private ones. A search bar should let users search by community name, location, or topic, and filters can help separate public communities, private communities, and communities the user has already joined.
- The main content should show community cards in a grid or list layout. Each card should include the community name, short description, general location, member count, public or private badge, and a button such as "Join," "Request to Join," "View Community," or "Already Joined." This makes it clear what action the user can take for each community.
- The page should show different states for different types of communities. Public communities can have a "Join" button, private communities can have a "Request to Join" button, communities with an existing request can show "Pending Approval," and communities the user already belongs to can show "Already Joined" or "View Community."
- The page should include an option to create a new community if that feature is available to users. This can appear as a green "Create Community" button near the top of the page or as a card within the community list. This supports the project feature where users can create or host their own public or private communities.
- The mockup should include empty and error states. If no communities match the search, the page can show "No communities found" with a suggestion to adjust the search or create a community. If community data fails to load, the page should show a clear error message such as "Communities could not be loaded. Please try again."
- The visual style should follow the Farmers Market theme with a soft cream background, white community cards, green action buttons, yellow or orange highlights, rounded corners, and friendly community icons or banner images. On desktop, community cards can appear in a grid.

### Community Detail Page
*Browse listings within a community and where admins can manage the community; for a private community, show a locked version with request to join button*

> **TODO:** Community posts/announcements — No `posts` table or API endpoint exists in the backend. Decide: keep as a planned future feature, or remove posts/announcements from this page description?

- The Community Detail page should show information about one specific food-sharing community and allow members to view community activity, listings, posts, and available actions. This page should help users understand what the community is, whether they have access to it, and how they can participate.
- The top of the page should include a community header with the community name, short description, general location, member count, and a public or private badge. It can also include a banner image or simple community icon that matches the Farmers Market theme. If the user is not a member, the page should show a clear action button such as "Join Community" for public communities or "Request to Join" for private communities.
- For members, the page should show community listings so users can browse food or produce shared within that group. Listing cards can include the produce image, item name, quantity, pickup area, expiration or harvest date, and status badge. A button such as "Create Listing in this Community" can allow members to post directly to that community.
- The page should also include a community discussion or announcements section. Members should be able to view posts, updates, or announcements from other members or admins. If posting is allowed, the page can include a "Create Post" button or a simple post input area. Empty posts should show a validation message such as "Post cannot be empty."
- The page should show different access states depending on the user's relationship to the community. A non-member viewing a private community should see limited information and a "Request to Join" button. A user with a pending request should see a "Pending Approval" status. A banned or removed user should not be able to view or post in the community.
- For community admins, the page should include management actions such as "Manage Members," "Invite Member," "Review Join Requests," or "Community Settings." Admins should also be able to remove inappropriate posts or listings when needed. These admin controls should be visible only to users with the correct role.
- The mockup should include useful empty and error states. If the community has no listings yet, the page can show "No listings in this community yet" with a button to create a listing. If there are no posts, it can show "No community posts yet." If the community fails to load or no longer exists, the page should show a clear error message.
- The visual style should follow the Farmers Market theme with a soft cream background, white content cards, green action buttons, yellow or orange status badges, rounded corners, and friendly community or produce imagery. On desktop, the page can use tabs or sections for "Listings," "Posts," and "Members."

### Create Community Page ⚡ Priority
*Users creating or hosting their own community*

- The Create Community page should allow a logged-in user to create a new food-sharing community where members can post listings, view community activity, and coordinate local exchanges. This page should feel simple and guided because the user needs to define the community's name, purpose, location, privacy level, and basic rules before creating it.
- The top of the page should include a heading such as "Create a Community" and a short description explaining that users can start a public or private group for sharing produce and food items with trusted local members. The page should use a clean form layout with sections for community details, privacy settings, rules, and optional invite setup.
- The form should include fields for community name, description, general location or area, community image or banner, and optional community guidelines. The description should help users understand what the group is for, such as a neighborhood garden group, campus food-sharing group, nonprofit donation group, or local pantry support group.
- The page should include a clear privacy setting for choosing whether the community is public or private. A public community can be joined by logged-in users, while a private community should require a join request or invite link. The mockup should make this choice very clear because public and private communities have different access rules.
- If the user chooses a private community, the page can show optional invite settings. This can include an email field to invite trusted members, a "Generate Invite Link" option, or a note explaining that invitations can also be sent later from Community Settings. This supports the invite-only community flow without making the page too crowded.
- The page should include validation and error states. Examples include "Community name is required," "Description is required," "Please choose a privacy setting," "Invalid email address," or "Community could not be created. Please try again." These messages should appear near the related form field so users can fix the issue easily.
- After the community is successfully created, the user should see a success message such as "Community created successfully" and be taken to the new Community Detail page. The creator should automatically have an admin or host role so they can manage members, invite users, review join requests, and update community settings.
- The visual style should follow the Farmers Market theme with a soft cream background, a white form card, green primary button, light gray input borders, rounded corners, and a friendly community or produce image.

### Community Admin / Manage Members Page ⚡ Priority
*Admins need to manage members, roles, join requests, and remove bad-faith users/listings*

- The Community Admin or Manage Members page should allow community admins to manage membership, roles, join requests, invitations, and moderation for a specific community. This page should only be accessible to users with the correct admin permissions, and it should make clear which actions are available to admins versus regular members.
- The top of the page should include the community name, a short description, and admin navigation tabs such as "Members," "Join Requests," "Invitations," "Listings," "Posts," and "Settings." This helps organize the different admin tasks without making the page feel crowded.
- The Members section should show a list or table of current community members. Each row should include the member's name, profile image, role, join date, and available actions. Admins should be able to change roles such as member, moderator, or admin if those roles are included in the project scope. The mockup should also show a warning or disabled state if an admin tries to remove the only remaining admin.
- The Join Requests section should show pending requests from users who want access to a private community. Each request should include the user's name, general location, request date, and buttons to "Approve" or "Reject." After a decision is made, the user should receive a notification and the request status should update.
- The Invitations section should allow admins or community hosts to invite trusted people to join the community. This section can include an email input field, a "Send Invite" button, and an option to generate or copy an invite link. The mockup should show error states for invalid emails, expired invitations, or users who are already members.
- The Moderation section should allow admins to manage community listings and posts. Admins should be able to remove inappropriate posts, remove bad-faith listings, or kick/ban users from the community when necessary. These actions should use confirmation modals so admins do not accidentally remove content or members.
- The page should include useful success, error, and empty states. Examples include "No pending join requests," "Member role updated," "User has already been removed," "Listing has already been removed," or "Changes could not be saved. Please try again." These states should help admins understand what happened after each action.
- The visual style should follow the Farmers Market theme with a soft cream background, white admin cards or tables, green action buttons, red danger buttons for removal actions, yellow or orange warning badges, rounded corners, and clear spacing. On desktop, tables can be used for members and requests.

### Notifications Page ⚡ Priority
*Accepted, denied, canceled, removed listings, kicked members, and other exchange status changes*

- The Notifications page should give users one place to view important updates related to their Green Beans activity. This page should help users stay informed about messages, community requests, listing updates, exchange status changes, canceled requests, reviews, and admin actions.
- The top of the page should include a heading such as "Notifications" and a short description explaining that users can review recent updates about their listings, communities, and exchanges. The page can include filter tabs such as "All," "Messages," "Listings," "Communities," and "Exchanges" so users can quickly find the type of update they are looking for.
- Each notification item should show a short message, timestamp, notification type, and related listing or community if applicable. Examples include "You have a new message about Fresh Tomatoes," "Your request to join Garden Share is pending," "Your community request was approved," "Your listing was marked reserved," or "A request was canceled." Unread notifications should be visually different from read notifications.
- The page should allow users to open the related item from each notification. For example, a message notification should link to the message thread, a listing notification should link to the listing details or dashboard, and a community notification should link to the community page or admin review area.
- The mockup should include notification states for read, unread, empty, and error situations. If the user has no notifications, the page can show "No notifications yet" with a short message explaining that updates will appear here. If notifications fail to load, the page should show "Notifications could not be loaded. Please try again."
- The page can also include simple actions such as "Mark all as read," "Clear notification," or "View details." These actions should be optional and should not make the page too complex. The main goal is to help users notice important updates and navigate to the related part of the app.
- The visual style should follow the Farmers Market theme with a soft cream background, white notification cards, green icons or action links, yellow or orange unread indicators, red accents for canceled or removed items, rounded corners, and clear spacing.

## State Management
<!-- Define approach: Context, Redux, Zustand, etc. -->

## Routing
<!-- Define route structure -->


