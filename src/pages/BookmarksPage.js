// BookmarksPage.js — shows all bookmarked shared items with count and nav link
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function BookmarksPage({ user }) {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchBookmarks = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setBookmarks(data.bookmarks || []);
      }
    };
    fetchBookmarks();
  }, [user]);

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/fabric-588884_1280.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-rose-100 bg-opacity-30 backdrop-blur-sm"></div>

      <div className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-rose-800">
            Your Saved Looks
          </h1>
          <Link
            to="/community-style"
            className="text-sm text-rose-600 underline hover:text-rose-800"
          >
            ← Back to Community
          </Link>
        </div>

        {bookmarks.length === 0 ? (
          <p className="text-center text-sm text-gray-500 italic">
            You haven't bookmarked any looks yet.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {bookmarks.map((item, index) => (
              <div
                key={index}
                className="relative shadow-md border border-neutral-300 bg-gradient-to-br from-white via-neutral-100 to-neutral-200 p-3 w-60 hover:shadow-lg transition"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full object-cover aspect-[3/4] border border-neutral-200"
                    style={{ borderRadius: "0.25rem" }}
                  />
                )}
                <div className="mt-2 text-center">
                  <Link
                    to={`/community-style/${encodeURIComponent(item.name)}`}
                    className="text-sm font-medium text-rose-700 underline hover:text-rose-900 transition"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-neutral-500 italic mt-1">Bookmarked</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
