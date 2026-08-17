// Updated CommunityStyle page to only display clickable item names
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collectionGroup,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function CommunityStyle() {
  const [sharedItems, setSharedItems] = useState([]);

  useEffect(() => {
    const fetchSharedItems = async () => {
      const q = query(collectionGroup(db, "wardrobe"), where("isPublic", "==", true));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Remove duplicates by item name
      const uniqueNames = new Set();
      const uniqueItems = [];
      for (const item of items) {
        if (!uniqueNames.has(item.name)) {
          uniqueItems.push(item);
          uniqueNames.add(item.name);
        }
      }

      setSharedItems(uniqueItems);
    };
    fetchSharedItems();
  }, []);

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
      {/* Warm overlay */}
      <div className="absolute inset-0 bg-rose-100 bg-opacity-30 backdrop-blur-sm"></div>

      <div className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-rose-800 mb-6 leading-snug">
            A Space to Witness How Others Express Presence Through Style
          </h1>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Share your styling entries and wardrobe reflections.
            Be inspired by the quiet beauty of how others get dressed with intention.
          </p>

          <div className="space-y-4 text-sm text-gray-600 mb-10 leading-relaxed">
            <p>Contribute your favorite styled pieces.</p>
            <p>See how others wear the same item differently.</p>
            <p>Let your clothing be part of a shared visual meditation.</p>
          </div>

          <p className="mt-6 text-xs text-gray-500 italic">
            Share and be inspired.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sharedItems.map((item) => (
            <Link
              to={`/community-style/${encodeURIComponent(item.name)}`}
              key={item.name}
              className="text-center p-4 bg-white bg-opacity-70 shadow-md border border-neutral-200 hover:shadow-lg transition rounded"
            >
              <p className="text-rose-700 font-medium underline hover:text-rose-900 transition">
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}