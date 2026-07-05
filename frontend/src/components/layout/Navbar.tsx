import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">🌱</span>
          <span className="navbar__name">Green Beans</span>
        </Link>

        <ul className="navbar__links">
          {isLoggedIn ? (
            <>
              <li>
                <NavLink to="/browse" className="navbar__link">
                  Browse
                </NavLink>
              </li>
              <li>
                <NavLink to="/communities" className="navbar__link">
                  Communities
                </NavLink>
              </li>
              <li>
                <NavLink to="/listings/new" className="navbar__link">
                  Post Listing
                </NavLink>
              </li>
              <li>
                <NavLink to="/messages" className="navbar__link">
                  Messages
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="navbar__link">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className="navbar__link">
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/notifications" className="navbar__link navbar__link--icon" aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/about" className="navbar__link">
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className="navbar__link">
                  Log In
                </NavLink>
              </li>
              <li>
                <NavLink to="/signup" className="navbar__link navbar__link--emphasis">
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
