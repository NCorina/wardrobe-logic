import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Firebase imports for modular SDK v9+
import { getAnalytics, logEvent } from "firebase/analytics";

import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute"; // ⬅️ New

import LoginPage from "./pages/LoginPage";
import CuratedDisplay from "./pages/CuratedDisplay";
import SingleCurationPage from "./pages/SingleCurationPage";
import EditCurationPage from "./pages/EditCurationPage";
import LandingPage from "./pages/LandingPage";
import WardrobeLibrary from "./pages/WardrobeLibrary";
import ItemDetailPage from "./pages/ItemDetailPage";
import CommunityStyle from "./pages/CommunityStyle";
import CommunityItemDetailPage from "./pages/CommunityItemDetailPage";
import BookmarksPage from "./pages/BookmarksPage";

const CURATOR_EMAIL = "corinanicoara01@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Initialize Firebase Analytics for v9+ (modular SDK)
    const analytics = getAnalytics(); // Get the analytics instance
    logEvent(analytics, 'page_view', { page: window.location.pathname }); // Log page view

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Router>
        <NavBar user={user} />
        <div>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/curated" element={<CuratedDisplay />} />
            <Route path="/curation/:id" element={<SingleCurationPage />} />
            <Route path="/curation/:id/edit" element={<EditCurationPage />} />
            <Route path="/community-style" element={<CommunityStyle />} />
            <Route path="/community-style/:itemName" element={<CommunityItemDetailPage user={user} />} />

            {/* 🧵 Protected Routes */}
            <Route
              path="/wardrobe"
              element={
                <PrivateRoute user={user}>
                  <WardrobeLibrary user={user} />
                </PrivateRoute>
              }
            />
            <Route
              path="/item/:itemId"
              element={
                <PrivateRoute user={user}>
                  <ItemDetailPage user={user} />
                </PrivateRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <PrivateRoute user={user}>
                  <BookmarksPage user={user} />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
