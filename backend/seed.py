"""
Seed script — populates the database with mock data for development/testing.

Usage:
    cd backend
    python seed.py

This will INSERT rows into the database configured in .env.
Run it once on a fresh database. Running it again will fail on duplicate primary keys.
"""

from datetime import datetime, date, timezone

from database import get_db
from models import (
    User, Photo, Community, Membership, Listing, ListingPhoto,
    ClaimRequest, MessageThread, Message, Notification, CommunityPost, JoinRequest,
)
from core.auth import hash_password


def seed():
    db = next(get_db())

    try:
        # ------------------------------------------------------------------
        # Photos
        # ------------------------------------------------------------------
        photos = [
            Photo(photo_id=1, image_link="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"),
            Photo(photo_id=2, image_link="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"),
            Photo(photo_id=3, image_link="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"),
            Photo(photo_id=5, image_link="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"),
            Photo(photo_id=6, image_link="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"),
            Photo(photo_id=7, image_link="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"),
            # Community banners
            Photo(photo_id=10, image_link="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=300&fit=crop"),
            Photo(photo_id=11, image_link="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=300&fit=crop"),
            Photo(photo_id=12, image_link="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=300&fit=crop"),
            Photo(photo_id=13, image_link="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=300&fit=crop"),
            Photo(photo_id=14, image_link="https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&h=300&fit=crop"),
            Photo(photo_id=15, image_link="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop"),
            # Listing photos
            Photo(photo_id=101, image_link="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop"),
            Photo(photo_id=102, image_link="https://images.unsplash.com/photo-1563252722-6434563a985d?w=400&h=300&fit=crop"),
            Photo(photo_id=103, image_link="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop"),
            Photo(photo_id=104, image_link="https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=300&fit=crop"),
            Photo(photo_id=105, image_link="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop"),
            Photo(photo_id=106, image_link="https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=300&fit=crop"),
            Photo(photo_id=107, image_link="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop"),
            Photo(photo_id=108, image_link="https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=400&h=300&fit=crop"),
            Photo(photo_id=109, image_link="https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&h=300&fit=crop"),
            Photo(photo_id=110, image_link="https://images.unsplash.com/photo-1527325678964-54921661f888?w=400&h=300&fit=crop"),
            Photo(photo_id=111, image_link="https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=400&h=300&fit=crop"),
            Photo(photo_id=112, image_link="https://images.unsplash.com/photo-1569762404472-026308ba6b64?w=400&h=300&fit=crop"),
            Photo(photo_id=113, image_link="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop"),
        ]
        db.add_all(photos)
        db.flush()

        # ------------------------------------------------------------------
        # Users (all passwords: "password123")
        # ------------------------------------------------------------------
        default_pw = hash_password("password123")
        users = [
            User(user_id=1, name="Lily Chen", email="lily@example.com", password_hash=default_pw, profile_photo_id=1, location="Mānoa Valley"),
            User(user_id=2, name="Oliver Lee", email="oliver@example.com", password_hash=default_pw, profile_photo_id=2, location="UH Mānoa"),
            User(user_id=3, name="Rose Johnson", email="rose@example.com", password_hash=default_pw, profile_photo_id=3, location="Mānoa"),
            User(user_id=4, name="Glen Kim", email="glen@example.com", password_hash=default_pw, profile_photo_id=None, location="Northside"),
            User(user_id=5, name="Malia Nakamura", email="malia@example.com", password_hash=default_pw, profile_photo_id=5, location="Kailua"),
            User(user_id=6, name="Keoni Tavares", email="keoni@example.com", password_hash=default_pw, profile_photo_id=6, location="Hawaiʻi Kai"),
            User(user_id=7, name="Aiko Yamamoto", email="aiko@example.com", password_hash=default_pw, profile_photo_id=7, location="Kaimukī"),
        ]
        db.add_all(users)
        db.flush()

        # ------------------------------------------------------------------
        # Communities
        # ------------------------------------------------------------------
        communities = [
            Community(community_id=1, name="Mānoa Valley Garden Share", is_private=False, description="Neighbors in Mānoa Valley sharing backyard garden produce. From East Mānoa Road to Woodlawn — if you grow it, share it!", location="Mānoa Valley", guidelines="Be respectful. Only share food you'd eat yourself.", banner_photo_id=10),
            Community(community_id=2, name="UH Mānoa Food Exchange", is_private=False, description="Students and faculty at UH Mānoa sharing surplus food on campus. Reduce waste, save money, eat fresh.", location="UH Mānoa Campus", guidelines="Label allergens. Pick up on time.", banner_photo_id=11),
            Community(community_id=3, name="Northside Pantry Network", is_private=True, description="A private group for food pantry coordinators and volunteers to share donation availability.", location="Northside", guidelines="Members only. Coordinate pickups in advance.", banner_photo_id=12),
            Community(community_id=4, name="Kailua Neighborhood Exchange", is_private=False, description="Kailua residents sharing fresh produce, baked goods, and pantry items. From Lanikai to Enchanted Lake.", location="Kailua", guidelines="Be kind, share freely, and pick up when you say you will.", banner_photo_id=13),
            Community(community_id=5, name="Hawaiʻi Kai Growers Co-op", is_private=False, description="Backyard gardeners in Hawaiʻi Kai sharing tropical fruits, veggies, and herbs. Marinas to Portlock.", location="Hawaiʻi Kai", guidelines="Organic preferred. Label everything clearly.", banner_photo_id=14),
            Community(community_id=6, name="Kaimukī Community Kitchen", is_private=False, description="Home cooks and bakers in Kaimukī sharing surplus meals, baked goods, and preserves with neighbors.", location="Kaimukī", guidelines="List all ingredients and allergens. Keep things fresh.", banner_photo_id=15),
        ]
        db.add_all(communities)
        db.flush()

        # ------------------------------------------------------------------
        # Memberships
        # ------------------------------------------------------------------
        memberships = [
            Membership(user_id=1, community_id=1, role="admin", date_joined=datetime(2026, 1, 15, tzinfo=timezone.utc)),
            Membership(user_id=3, community_id=1, role="member", date_joined=datetime(2026, 2, 20, tzinfo=timezone.utc)),
            Membership(user_id=2, community_id=1, role="member", date_joined=datetime(2026, 3, 10, tzinfo=timezone.utc)),
            Membership(user_id=1, community_id=2, role="member", date_joined=datetime(2026, 2, 1, tzinfo=timezone.utc)),
            Membership(user_id=2, community_id=2, role="member", date_joined=datetime(2026, 2, 5, tzinfo=timezone.utc)),
            Membership(user_id=3, community_id=2, role="admin", date_joined=datetime(2026, 1, 20, tzinfo=timezone.utc)),
            Membership(user_id=4, community_id=3, role="admin", date_joined=datetime(2026, 1, 1, tzinfo=timezone.utc)),
            Membership(user_id=1, community_id=3, role="member", date_joined=datetime(2026, 3, 15, tzinfo=timezone.utc)),
            Membership(user_id=5, community_id=4, role="admin", date_joined=datetime(2026, 1, 10, tzinfo=timezone.utc)),
            Membership(user_id=1, community_id=4, role="member", date_joined=datetime(2026, 4, 1, tzinfo=timezone.utc)),
            Membership(user_id=6, community_id=5, role="admin", date_joined=datetime(2026, 2, 1, tzinfo=timezone.utc)),
            Membership(user_id=5, community_id=5, role="member", date_joined=datetime(2026, 3, 1, tzinfo=timezone.utc)),
            Membership(user_id=7, community_id=6, role="admin", date_joined=datetime(2026, 1, 25, tzinfo=timezone.utc)),
            Membership(user_id=3, community_id=6, role="member", date_joined=datetime(2026, 2, 15, tzinfo=timezone.utc)),
        ]
        db.add_all(memberships)
        db.flush()

        # ------------------------------------------------------------------
        # Listings
        # ------------------------------------------------------------------
        listings = [
            Listing(listing_id=1, user_id=1, community_id=1, name="Fresh Tomatoes", description="Heirloom tomatoes from my backyard garden. Mixed sizes, all ripe and ready to eat. Great for salads or sandwiches.", quantity=8, unit="lbs", category="Vegetables", status="available", expiration_date=date(2026, 7, 6), date_posted=datetime(2026, 7, 1, tzinfo=timezone.utc), pickup_location="2845 Oahu Ave, front porch"),
            Listing(listing_id=2, user_id=1, community_id=1, name="Organic Zucchini", description="Overgrown zucchini from the garden. Various sizes. Perfect for baking zucchini bread or grilling.", quantity=5, unit="pieces", category="Vegetables", status="available", expiration_date=date(2026, 7, 3), date_posted=datetime(2026, 6, 30, tzinfo=timezone.utc), pickup_location="2845 Oahu Ave, side gate"),
            Listing(listing_id=3, user_id=3, community_id=2, name="Sourdough Bread Loaves", description="Baked fresh this morning. I made too many and want to share before they go stale. No nuts or dairy.", quantity=3, unit="loaves", category="Baked Goods", status="available", expiration_date=date(2026, 7, 4), date_posted=datetime(2026, 7, 2, tzinfo=timezone.utc), pickup_location="Campus Center, Room 104"),
            Listing(listing_id=4, user_id=2, community_id=2, name="Fresh Basil Bunches", description="Homegrown basil, very fragrant. Great for pesto, pasta, or caprese salad.", quantity=4, unit="bunches", category="Herbs", status="available", expiration_date=date(2026, 7, 5), date_posted=datetime(2026, 7, 1, tzinfo=timezone.utc), pickup_location="Hale Aloha, buzz #302"),
            Listing(listing_id=5, user_id=4, community_id=3, name="Canned Vegetables Assortment", description="Donated canned goods from a local drive. Corn, green beans, and diced tomatoes. All within expiration.", quantity=12, unit="cans", category="Pantry Items", status="available", expiration_date=date(2027, 3, 15), date_posted=datetime(2026, 7, 1, tzinfo=timezone.utc), pickup_location="Northside Community Center, back entrance"),
            Listing(listing_id=6, user_id=3, community_id=1, name="Meyer Lemons", description="From my backyard lemon tree. Thin-skinned and sweeter than store-bought. Great for cooking or lemonade.", quantity=10, unit="pieces", category="Fruits", status="reserved", expiration_date=date(2026, 7, 8), date_posted=datetime(2026, 6, 29, tzinfo=timezone.utc), pickup_location="3142 Woodlawn Dr, front steps"),
            Listing(listing_id=7, user_id=1, community_id=1, name="Strawberry Jam", description="Homemade strawberry jam from this season's harvest. Sealed jars, no preservatives.", quantity=6, unit="jars", category="Pantry Items", status="completed", expiration_date=date(2026, 12, 1), date_posted=datetime(2026, 6, 20, tzinfo=timezone.utc), pickup_location="2845 Oahu Ave, front porch"),
            Listing(listing_id=8, user_id=5, community_id=4, name="Lilikoi (Passion Fruit)", description="Fresh lilikoi from my backyard vine. Sweet and tangy — great for juice, desserts, or eating fresh. Picked this morning.", quantity=15, unit="pieces", category="Fruits", status="available", expiration_date=date(2026, 7, 7), date_posted=datetime(2026, 7, 2, tzinfo=timezone.utc), pickup_location="342 Kawailoa Rd, Kailua, front lanai"),
            Listing(listing_id=9, user_id=5, community_id=4, name="Fresh Papayas", description="Ripe solo papayas from my tree. Two large ones ready to eat now, one still slightly green.", quantity=3, unit="pieces", category="Fruits", status="available", expiration_date=date(2026, 7, 5), date_posted=datetime(2026, 7, 1, tzinfo=timezone.utc), pickup_location="342 Kawailoa Rd, Kailua, front lanai"),
            Listing(listing_id=10, user_id=6, community_id=5, name="Dragon Fruit", description="White-fleshed dragon fruit from my garden. Beautiful and refreshing. Great in smoothies or fruit bowls.", quantity=4, unit="pieces", category="Fruits", status="available", expiration_date=date(2026, 7, 6), date_posted=datetime(2026, 7, 2, tzinfo=timezone.utc), pickup_location="7012 Kalanianaʻole Hwy, gate code #4455"),
            Listing(listing_id=11, user_id=6, community_id=5, name="Thai Basil & Mint Bundle", description="Big bunch of Thai basil and mint from the garden. Perfect for pho, curries, or mojitos.", quantity=3, unit="bunches", category="Herbs", status="available", expiration_date=date(2026, 7, 3), date_posted=datetime(2026, 7, 1, tzinfo=timezone.utc), pickup_location="7012 Kalanianaʻole Hwy, gate code #4455"),
            Listing(listing_id=12, user_id=7, community_id=6, name="Banana Bread Loaves", description="Made with local apple bananas. Moist, not too sweet. Wrapped and ready to go. Contains eggs and flour.", quantity=4, unit="loaves", category="Baked Goods", status="available", expiration_date=date(2026, 7, 5), date_posted=datetime(2026, 7, 2, tzinfo=timezone.utc), pickup_location="1128 12th Ave, Kaimukī, side door"),
            Listing(listing_id=13, user_id=7, community_id=6, name="Pickled Mango", description="Homemade pickled green mango — li hing style. Sealed mason jars, good for weeks.", quantity=5, unit="jars", category="Pantry Items", status="available", expiration_date=date(2026, 8, 1), date_posted=datetime(2026, 7, 1, tzinfo=timezone.utc), pickup_location="1128 12th Ave, Kaimukī, side door"),
        ]
        db.add_all(listings)
        db.flush()

        # ------------------------------------------------------------------
        # Listing Photos (link listings to their photos)
        # ------------------------------------------------------------------
        listing_photos = [
            ListingPhoto(listing_id=1, photo_id=101),
            ListingPhoto(listing_id=2, photo_id=102),
            ListingPhoto(listing_id=3, photo_id=103),
            ListingPhoto(listing_id=4, photo_id=104),
            ListingPhoto(listing_id=5, photo_id=105),
            ListingPhoto(listing_id=6, photo_id=106),
            ListingPhoto(listing_id=7, photo_id=107),
            ListingPhoto(listing_id=8, photo_id=108),
            ListingPhoto(listing_id=9, photo_id=109),
            ListingPhoto(listing_id=10, photo_id=110),
            ListingPhoto(listing_id=11, photo_id=111),
            ListingPhoto(listing_id=12, photo_id=112),
            ListingPhoto(listing_id=13, photo_id=113),
        ]
        db.add_all(listing_photos)
        db.flush()

        # ------------------------------------------------------------------
        # Claim Requests + Message Threads
        # ------------------------------------------------------------------
        # Thread for claim 1
        thread1 = MessageThread(thread_id=1, claim_request_id=1)
        thread2 = MessageThread(thread_id=2, claim_request_id=2)
        thread3 = MessageThread(thread_id=3, claim_request_id=3)
        db.add_all([thread1, thread2, thread3])
        db.flush()

        claims = [
            ClaimRequest(request_id=1, listing_id=1, requester_user_id=2, message_thread_id=1, quantity_requested=3, status="requested", request_date=datetime(2026, 7, 2, 10, 30, tzinfo=timezone.utc)),
            ClaimRequest(request_id=2, listing_id=6, requester_user_id=2, message_thread_id=2, quantity_requested=5, status="approved", request_date=datetime(2026, 7, 1, 14, 0, tzinfo=timezone.utc)),
            ClaimRequest(request_id=3, listing_id=7, requester_user_id=4, message_thread_id=3, quantity_requested=2, status="completed", request_date=datetime(2026, 6, 21, 9, 0, tzinfo=timezone.utc), closed_date=datetime(2026, 6, 23, 16, 0, tzinfo=timezone.utc)),
        ]
        db.add_all(claims)
        db.flush()

        # ------------------------------------------------------------------
        # Messages
        # ------------------------------------------------------------------
        messages = [
            Message(message_id=1, thread_id=1, sender_user_id=2, content="Hi! I'd love to pick up 3 lbs of tomatoes. Are they still available?", timestamp=datetime(2026, 7, 1, 10, 30, tzinfo=timezone.utc)),
            Message(message_id=2, thread_id=1, sender_user_id=1, content="Yes, still available! I'm usually home in the afternoons. Does tomorrow around 3pm work?", timestamp=datetime(2026, 7, 1, 11, 15, tzinfo=timezone.utc)),
            Message(message_id=3, thread_id=1, sender_user_id=2, content="That works perfectly. I'll come by around 3. Thanks so much!", timestamp=datetime(2026, 7, 1, 11, 45, tzinfo=timezone.utc)),
            Message(message_id=4, thread_id=1, sender_user_id=1, content="Sounds good! I'll leave them on the front porch in a bag. See you then 🍅", timestamp=datetime(2026, 7, 1, 12, 0, tzinfo=timezone.utc)),
            Message(message_id=9, thread_id=2, sender_user_id=2, content="Hey Rose! Could I grab 5 of the Meyer lemons? I want to make lemonade this weekend.", timestamp=datetime(2026, 7, 1, 14, 0, tzinfo=timezone.utc)),
            Message(message_id=10, thread_id=2, sender_user_id=3, content="Of course! They're really juicy this year. Can you pick up Saturday morning?", timestamp=datetime(2026, 7, 1, 14, 30, tzinfo=timezone.utc)),
            Message(message_id=11, thread_id=2, sender_user_id=2, content="Saturday morning works. What time?", timestamp=datetime(2026, 7, 1, 15, 0, tzinfo=timezone.utc)),
            Message(message_id=12, thread_id=2, sender_user_id=3, content="How about 10am? I'll have them in a bag by the front steps at 3142 Woodlawn Dr.", timestamp=datetime(2026, 7, 1, 15, 15, tzinfo=timezone.utc)),
            Message(message_id=17, thread_id=3, sender_user_id=4, content="Hi Lily, I'd like 2 jars of strawberry jam for the food pantry. Is that possible?", timestamp=datetime(2026, 6, 21, 9, 0, tzinfo=timezone.utc)),
            Message(message_id=18, thread_id=3, sender_user_id=1, content="Absolutely! Happy to help the pantry. I can have them ready this afternoon.", timestamp=datetime(2026, 6, 21, 9, 30, tzinfo=timezone.utc)),
            Message(message_id=19, thread_id=3, sender_user_id=4, content="Wonderful. I'll swing by around 4pm. Thank you so much!", timestamp=datetime(2026, 6, 21, 10, 0, tzinfo=timezone.utc)),
            Message(message_id=20, thread_id=3, sender_user_id=1, content="No problem at all! The pantry does great work. Front porch as usual.", timestamp=datetime(2026, 6, 21, 10, 15, tzinfo=timezone.utc)),
        ]
        db.add_all(messages)
        db.flush()

        # ------------------------------------------------------------------
        # Notifications
        # ------------------------------------------------------------------
        notifications = [
            Notification(notification_id=1, user_id=1, claim_request_id=1, content="Oliver Lee requested 3 lbs of your Fresh Tomatoes listing.", timestamp=datetime(2026, 7, 2, 10, 30, tzinfo=timezone.utc), is_read=False, type="claim"),
            Notification(notification_id=2, user_id=1, content="Your Organic Zucchini listing is expiring tomorrow. Update or close it before it expires.", timestamp=datetime(2026, 7, 2, 8, 0, tzinfo=timezone.utc), is_read=False, type="listing"),
            Notification(notification_id=3, user_id=1, content="Glen Kim left a 5-star review on your Strawberry Jam exchange.", timestamp=datetime(2026, 6, 24, 10, 0, tzinfo=timezone.utc), is_read=True, type="listing"),
            Notification(notification_id=4, user_id=1, content="Rose Johnson joined Mānoa Valley Garden Share.", timestamp=datetime(2026, 7, 1, 8, 0, tzinfo=timezone.utc), is_read=True, type="community"),
            Notification(notification_id=5, user_id=1, message_id=1, content="You have a new message from Oliver Lee about Fresh Tomatoes.", timestamp=datetime(2026, 7, 2, 11, 45, tzinfo=timezone.utc), is_read=False, type="message"),
            Notification(notification_id=6, user_id=2, claim_request_id=2, content="Your request for Meyer Lemons has been approved!", timestamp=datetime(2026, 7, 1, 15, 0, tzinfo=timezone.utc), is_read=False, type="claim"),
        ]
        db.add_all(notifications)
        db.flush()

        # ------------------------------------------------------------------
        # Community Posts
        # ------------------------------------------------------------------
        posts = [
            CommunityPost(post_id=1, community_id=1, user_id=1, content="Just planted a new row of cherry tomatoes! Should have extras to share in about 3 weeks. 🍅", timestamp=datetime(2026, 7, 1, 8, 0, tzinfo=timezone.utc)),
            CommunityPost(post_id=2, community_id=1, user_id=3, content="Reminder: if you're picking up produce from someone's porch, please text them when you arrive and take only what was agreed upon.", timestamp=datetime(2026, 6, 30, 14, 0, tzinfo=timezone.utc)),
            CommunityPost(post_id=3, community_id=2, user_id=2, content="Anyone have extra herbs? I'm making pesto this weekend and could use some basil or parsley.", timestamp=datetime(2026, 7, 2, 9, 30, tzinfo=timezone.utc)),
            CommunityPost(post_id=4, community_id=2, user_id=3, content="Welcome to all the new members this week! Check out the listings tab to see what's available.", timestamp=datetime(2026, 7, 1, 10, 0, tzinfo=timezone.utc)),
            CommunityPost(post_id=5, community_id=3, user_id=4, content="We received a large canned goods donation this morning. Listing it now — first come, first served for pantry volunteers.", timestamp=datetime(2026, 7, 1, 7, 0, tzinfo=timezone.utc)),
            CommunityPost(post_id=6, community_id=4, user_id=5, content="My lilikoi vine is going crazy this season! I'll be posting batches every few days. Feel free to claim as much as you need 🌺", timestamp=datetime(2026, 7, 2, 7, 30, tzinfo=timezone.utc)),
            CommunityPost(post_id=7, community_id=5, user_id=6, content="Heads up: dragon fruit season is in full swing. If anyone else in Hawaiʻi Kai has extra, post it here.", timestamp=datetime(2026, 7, 1, 16, 0, tzinfo=timezone.utc)),
            CommunityPost(post_id=8, community_id=6, user_id=7, content="Baking banana bread tomorrow morning with local apple bananas. Planning to make 6 loaves — will post whatever I don't keep.", timestamp=datetime(2026, 7, 1, 20, 0, tzinfo=timezone.utc)),
        ]
        db.add_all(posts)
        db.flush()

        # ------------------------------------------------------------------
        # Join Requests
        # ------------------------------------------------------------------
        join_requests = [
            JoinRequest(request_id=1, community_id=3, user_id=2, status="pending", request_date=datetime(2026, 7, 1, tzinfo=timezone.utc)),
            JoinRequest(request_id=2, community_id=3, user_id=3, status="pending", request_date=datetime(2026, 6, 30, tzinfo=timezone.utc)),
        ]
        db.add_all(join_requests)

        # ------------------------------------------------------------------
        # Commit everything
        # ------------------------------------------------------------------
        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   - {len(users)} users (password: password123)")
        print(f"   - {len(communities)} communities")
        print(f"   - {len(memberships)} memberships")
        print(f"   - {len(listings)} listings")
        print(f"   - {len(claims)} claims")
        print(f"   - {len(messages)} messages across 3 threads")
        print(f"   - {len(notifications)} notifications")
        print(f"   - {len(posts)} community posts")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
