import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

const NavBar = ({ user }) => {
  const CURATOR_EMAIL = "corinanicoara01@gmail.com";

  return (
    <nav className="bg-rose-600 text-white p-4 shadow">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Title */}
        <div className="text-2xl font-bold tracking-wide">
          <Link to="/" className="hover:text-rose-200">
            Wardrobe-Logic
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4 items-center text-sm">
          {/* Public Links */}
          
          <Link to="/community-style" className="hover:text-rose-200">
            Community Styling
          </Link>
          <Link
  to="/bookmarks"
  className="text-sm text-rose-700 hover:text-rose-900 transition px-3"
>
   Saved Looks
</Link>


          {/* Logged-In User Links */}
          {user ? (
            <>
              <Link to="/wardrobe" className="hover:text-rose-200">
                My Wardrobe
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="hover:text-rose-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-rose-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
