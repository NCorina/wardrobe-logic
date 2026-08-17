// Updated CommunityItemDetailPage with contributor pseudonym support
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

export default function CommunityItemDetailPage({ user }) {
  const { itemName } = useParams();
  const [sharedItems, setSharedItems] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    const fetchSharedVersions = async () => {
      const q = query(
        collectionGroup(db, "wardrobe"),
        where("isPublic", "==", true),
        where("name", "==", itemName)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }));
      setSharedItems(items);
    };
    fetchSharedVersions();
  }, [itemName]);

  const handleBookmark = async (itemId, itemData) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      bookmarks: arrayUnion({ itemId, name: itemData.name, imageUrl: itemData.imageUrl })
    });
    setBookmarkedIds((prev) => [...prev, itemId]);
  };

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
        <h1 className="text-3xl md:text-4xl text-center font-semibold text-rose-800 mb-10">
          Ways People Styled: {decodeURIComponent(itemName)}
        </h1>

        {sharedItems.length === 0 ? (
          <p className="text-center text-sm text-gray-500 italic">
            No one has shared this item yet — be the first to inspire ✨
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {sharedItems.map((item) => (
              <div
                key={item.id}
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
                {item.inspiration && (
                  <p className="text-xs text-gray-600 italic mt-2">
                    "{item.inspiration}"
                  </p>
                )}

                <p className="mt-2 text-[11px] text-neutral-500 italic">
                  {item.pseudonym
                    ? `Shared by ${item.pseudonym}`
                    : "Shared by someone dressing with intention."}
                </p>

                <button
                  onClick={() => handleBookmark(item.id, item)}
                  className="mt-3 text-xs text-rose-600 underline hover:text-rose-800"
                  disabled={bookmarkedIds.includes(item.id)}
                >
                  {bookmarkedIds.includes(item.id) ? "Bookmarked" : "Bookmark this look"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
