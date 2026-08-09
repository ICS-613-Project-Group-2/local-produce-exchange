import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import "./About.css";

export default function About() {
  return (
    <div className="about">
      {/* Hero */}
      <section className="about__hero">
        <div className="about__hero-content">
          <h1>About Green Beans</h1>
          <p className="about__tagline">Share fresh food with your local community</p>
        </div>
      </section>

      {/* Mission */}
      <section className="about__section page-container">
        <h2>Our Mission</h2>
        <p>
          Green Beans is a local food exchange platform that helps people share surplus produce and food items within their communities. We exist to reduce food waste, help neighbors connect, and make fresh food easier to find and share — all through a simple, community-driven platform.
        </p>
      </section>

      {/* Impact Stats */}
      <section className="about__section about__section--alt">
        <div className="page-container">
          <div className="about__stats">
            <div className="about__stat">
              <span className="about__stat-number">42</span>
              <span className="about__stat-label">Active Communities</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">300+</span>
              <span className="about__stat-label">Listings Shared</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">1,200 lbs</span>
              <span className="about__stat-label">Food Exchanged</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">500+</span>
              <span className="about__stat-label">Community Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="about__section page-container">
        <h2>Why It Matters</h2>
        <p>
          Fresh food often goes unused when people don't have an easy way to share it with others nearby. Green Beans connects people who have surplus with those who can use it.
        </p>
      </section>

      {/* Who Uses Green Beans */}
      <section className="about__section about__section--alt">
        <div className="page-container">
          <h2>Who Uses Green Beans?</h2>
          <div className="about__personas">
            <Card variant="warm">
              <CardBody>
                <div className="about__persona">
                  <span className="about__persona-icon">🎓</span>
                  <h3>Oliver — College Student</h3>
                  <p>"I search for free produce near campus to save on groceries. Green Beans helps me find fresh food from people in my community."</p>
                </div>
              </CardBody>
            </Card>
            <Card variant="warm">
              <CardBody>
                <div className="about__persona">
                  <span className="about__persona-icon">🌱</span>
                  <h3>Lily — Home Gardener</h3>
                  <p>"My garden produces way more than I can eat. Green Beans lets me share my extra tomatoes and herbs before they spoil."</p>
                </div>
              </CardBody>
            </Card>
            <Card variant="warm">
              <CardBody>
                <div className="about__persona">
                  <span className="about__persona-icon">🤝</span>
                  <h3>Rose — Community Volunteer</h3>
                  <p>"I organize food-sharing events in my neighborhood. Green Beans gives me a platform to connect donors with families."</p>
                </div>
              </CardBody>
            </Card>
            <Card variant="warm">
              <CardBody>
                <div className="about__persona">
                  <span className="about__persona-icon">🏪</span>
                  <h3>Glen — Pantry Coordinator</h3>
                  <p>"I manage a food pantry and need to find donations quickly. Green Beans helps me connect with local growers before food expires."</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about__section page-container">
        <h2>How It Works</h2>
        <div className="about__steps">
          <div className="about__step">
            <span className="about__step-number">1</span>
            <h3>Join a Community</h3>
            <p>Find a local food-sharing group — public or private — near you.</p>
          </div>
          <div className="about__step">
            <span className="about__step-number">2</span>
            <h3>Browse or Post Listings</h3>
            <p>Search for available food or share your own surplus produce with photos and details.</p>
          </div>
          <div className="about__step">
            <span className="about__step-number">3</span>
            <h3>Claim & Message</h3>
            <p>Submit a claim request for the quantity you want, then message the owner to coordinate pickup.</p>
          </div>
          <div className="about__step">
            <span className="about__step-number">4</span>
            <h3>Pick Up & Review</h3>
            <p>Arrange pickup directly, complete the exchange, and leave a review to build trust.</p>
          </div>
        </div>
      </section>

      {/* Freshness */}
      <section className="about__section about__section--alt">
        <div className="page-container">
          <h2>Freshness First</h2>
          <p>
            Every listing shows freshness information so you can make informed decisions before requesting food. Our system highlights items that are expiring soon to help them get shared before they go to waste.
          </p>
          <div className="about__freshness-details">
            <div className="about__freshness-item">
              <span>📅</span>
              <span>Posting date — when the item was listed</span>
            </div>
            <div className="about__freshness-item">
              <span>⏰</span>
              <span>Expiration date — when the item should be used by</span>
            </div>
            <div className="about__freshness-item">
              <span>⚠️</span>
              <span>"Expiring Soon" badge — highlights items close to their date</span>
            </div>
            <div className="about__freshness-item">
              <span>❓</span>
              <span>"Date not available" — shown when no date is provided</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="about__section page-container">
        <h2>What You Can Do on Green Beans</h2>
        <div className="about__features">
          <div className="about__feature">📸 Post listings with photos and pickup details</div>
          <div className="about__feature">🔍 Search and browse available food by category</div>
          <div className="about__feature">💬 Message listing owners to coordinate exchanges</div>
          <div className="about__feature">🏘️ Join public or private communities</div>
          <div className="about__feature">📅 View freshness and expiration information</div>
          <div className="about__feature">⭐ Leave reviews after completed exchanges</div>
          <div className="about__feature">📋 Track your listing history and past exchanges</div>
          <div className="about__feature">🔔 Get notified about claims, messages, and updates</div>
          <div className="about__feature">👥 Create and manage your own food-sharing community</div>
        </div>
      </section>

      {/* Community Safety */}
      <section className="about__section about__section--alt">
        <div className="page-container">
          <h2>Community Safety & Trust</h2>
          <p>Green Beans is designed to keep food-sharing organized and safe.</p>
          <div className="about__safety-grid">
            <div className="about__safety-item">
              <span className="about__safety-icon">🔒</span>
              <h3>Private Communities</h3>
              <p>Create invite-only groups for trusted members</p>
            </div>
            <div className="about__safety-item">
              <span className="about__safety-icon">🛡️</span>
              <h3>Admin Moderation</h3>
              <p>Admins can manage members, approve requests, and remove bad-faith content</p>
            </div>
            <div className="about__safety-item">
              <span className="about__safety-icon">🚩</span>
              <h3>Report Listings</h3>
              <p>Flag inappropriate or misleading content for admin review</p>
            </div>
            <div className="about__safety-item">
              <span className="about__safety-icon">⭐</span>
              <h3>Reviews & Ratings</h3>
              <p>Build trust through feedback after completed exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Not a Store */}
      <section className="about__section page-container">
        <h2>Not a Store. A Community.</h2>
        <p>
          Green Beans is not a traditional marketplace. There's no shopping cart, no checkout, and no delivery. Users coordinate exchanges directly through messages — keeping things simple, flexible, and community-based.
        </p>
      </section>

      {/* Team */}
      <section className="about__section about__section--alt">
        <div className="page-container">
          <h2>Built By</h2>
          <p className="about__team-intro">Green Beans was designed and developed by:</p>
          <div className="about__team">
            <div className="about__team-member">Jolie</div>
            <div className="about__team-member">Kayla-Marie</div>
            <div className="about__team-member">Victor</div>
            <div className="about__team-member">Jiyeon</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about__cta">
        <h2>Ready to share fresh food with your community?</h2>
        <div className="about__cta-actions">
          <Link to="/signup">
            <Button variant="primary" size="lg">Sign Up</Button>
          </Link>
          <Link to="/browse">
            <Button variant="secondary" size="lg">Browse Listings</Button>
          </Link>
          <Link to="/communities">
            <Button variant="outline" size="lg">Find a Community</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
