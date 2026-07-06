import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BrowseListings from "./pages/BrowseListings";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import CreateCommunity from "./pages/CreateCommunity";
import CommunityAdmin from "./pages/CommunityAdmin";
import Messages from "./pages/Messages";
import MessageThread from "./pages/MessageThread";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ListingHistory from "./pages/ListingHistory";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";

export default function App() {
  const { isLoggedIn, isLoading, logout } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing isLoggedIn={isLoggedIn} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Authenticated routes */}
        <Route path="/browse" element={<BrowseListings />} />
        <Route path="/listings/new" element={<CreateListing />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/listings/:id/edit" element={<EditListing />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/new" element={<CreateCommunity />} />
        <Route path="/communities/:id" element={<CommunityDetail />} />
        <Route path="/communities/:id/admin" element={<CommunityAdmin />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:threadId" element={<MessageThread />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<ListingHistory />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Dev tools */}
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
