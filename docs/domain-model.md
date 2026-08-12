# Domain Model

This document describes the conceptual domain model for the Green Beans local produce exchange platform. It identifies the core entities, their key attributes, and the relationships between them.

---

## Entities

### User
A person who registers on the platform to share or receive produce.

| Attribute | Description |
|-----------|-------------|
| Name | Display name visible to other users |
| Email | Unique email used for login and communication |
| Password | Hashed credentials for authentication |
| Profile Photo | Optional avatar image |

### Community
A group of users organized around a shared interest or geographic area for exchanging produce.

| Attribute | Description |
|-----------|-------------|
| Name | Community display name |
| Privacy Setting | Public (open join) or Private (requires approval or invite) |

### Membership
The relationship between a User and a Community, including what role they hold.

| Attribute | Description |
|-----------|-------------|
| Role | Member, Moderator, or Admin |
| Date Joined | When the user became a member |

### Invitation
A request sent by a community admin to invite someone to join a private community.

| Attribute | Description |
|-----------|-------------|
| Recipient Email | Email address of the invited person |
| Status | Pending, Accepted, Expired, or Revoked |
| Sent Date | When the invitation was created |
| Expiration Date | When the invitation expires |

### Listing
A post offering surplus produce or food items for exchange within a community.

| Attribute | Description |
|-----------|-------------|
| Name | Produce or item name |
| Description | Details about the item |
| Category | Type of produce (e.g., Vegetables, Fruits, Herbs, Dairy, Baked Goods) |
| Quantity | Amount available |
| Status | Available, Reserved, Completed, or Closed |
| Expiration Date | When the item expires or should be picked up by |
| Date Posted | When the listing was created |
| Pickup Location | Where the item can be collected |

### Photo
An image associated with a listing or user profile.

| Attribute | Description |
|-----------|-------------|
| Image Link | URL or path to the stored image |

### Claim Request
A request from a user to claim some or all of a listed item.

| Attribute | Description |
|-----------|-------------|
| Quantity Requested | How much the claimant wants |
| Status | Pending, Approved, Declined, Canceled, or Completed |
| Request Date | When the claim was submitted |
| Closed Date | When the claim reached a final state |

### Message Thread
A conversation between a claimant and a listing owner, linked to a specific claim request.

| Attribute | Description |
|-----------|-------------|
| (linked to Claim Request) | Each thread is tied to one claim |

### Message
An individual message within a thread.

| Attribute | Description |
|-----------|-------------|
| Content | Text body of the message |
| Timestamp | When the message was sent |

### Notification
An alert delivered to a user about activity relevant to them.

| Attribute | Description |
|-----------|-------------|
| Content | Description of what happened |
| Type | Message, claim status change, community event, etc. |
| Timestamp | When the notification was generated |
| Read Status | Whether the user has seen it |

### Review
Feedback left by one user about another after a completed exchange.

| Attribute | Description |
|-----------|-------------|
| Rating | 1 to 5 stars |
| Comment | Optional written feedback |
| Review Date | When the review was submitted |

---

## Relationships

```
┌──────────┐          ┌─────────────┐          ┌───────────┐
│   User   │──creates──▶│   Listing   │◀─belongs─to─│ Community │
└──────────┘          └─────────────┘          └───────────┘
     │                       │                       ▲
     │                       │                       │
     ├──joins─(Membership)───┼───────────────────────┘
     │                       │
     │                       ▼
     │               ┌──────────────┐
     ├──submits──────▶│Claim Request │
     │               └──────────────┘
     │                       │
     │                       ├──has──▶ Message Thread ──contains──▶ Messages
     │                       │
     │                       └──unlocks──▶ Review
     │
     ├──receives──▶ Notifications
     │
     └──sends──▶ Invitations
```

### Relationship Descriptions

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Community | Many-to-Many (via Membership) | A user can belong to many communities; a community has many members |
| User → Listing | One-to-Many | A user creates zero or more listings |
| Community → Listing | One-to-Many | A listing belongs to exactly one community |
| Listing → Photo | One-to-Many | A listing can have multiple photos |
| User → Photo | One-to-One (optional) | A user has at most one profile photo |
| User → Claim Request | One-to-Many | A user (claimant) submits zero or more claim requests |
| Listing → Claim Request | One-to-Many | A listing can receive multiple claim requests |
| Claim Request → Message Thread | One-to-One | Each claim request has exactly one message thread |
| Message Thread → Message | One-to-Many | A thread contains one or more messages |
| User → Message | One-to-Many | A user sends messages within threads |
| Claim Request → Review | One-to-Many (max 2) | Each completed claim can have up to two reviews (one from each participant) |
| User → Review | One-to-Many | A user can be the reviewer or the reviewed |
| User → Notification | One-to-Many | A user receives zero or more notifications |
| Community → Invitation | One-to-Many | A community can have many outgoing invitations |
| User → Invitation | One-to-Many | An admin sends invitations on behalf of a community |

---

## Aggregate Boundaries

These groupings represent closely related entities that are typically managed together:

### User Aggregate
- User
- Profile Photo

### Community Aggregate
- Community
- Membership
- Invitation

### Listing Aggregate
- Listing
- Listing Photos

### Exchange Aggregate
- Claim Request
- Message Thread
- Messages
- Review

### Notification (standalone)
- Notification

---

## Status Lifecycles

### Listing Status
```
Available → Reserved → Completed
    │           │
    │           └──→ Available (when linked claim is canceled)
    │
    └──→ Closed
```

### Claim Request Status
```
Pending → Approved → Completed
   │         │
   │         └──→ Canceled
   │
   ├──→ Declined
   │
   └──→ Canceled
```

### Invitation Status
```
Pending → Accepted
   │
   ├──→ Expired
   │
   └──→ Revoked
```

---

## Domain Rules

1. **One listing, one community.** A listing always belongs to exactly one community.
2. **Membership required to list.** A user must be a member of a community to create listings in it.
3. **Cannot claim own listing.** A user cannot submit a claim request for their own listing.
4. **Quantity guard.** Approving a claim deducts from available quantity; the system prevents approvals that would exceed remaining inventory.
5. **One review per participant per exchange.** Each user involved in a completed exchange can leave at most one review.
6. **Message thread per claim.** Each claim request has exactly one associated message thread for coordination.
7. **Invitation expiration.** Invitations have a time limit and become invalid after expiration.
8. **Admin-only moderation.** Only community admins can remove listings, kick users, or ban members within their community.
9. **Cancellation restores quantity.** When a claim is canceled, any reserved quantity is returned to the listing's available inventory.
