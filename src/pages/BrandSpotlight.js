// src/pages/CommunityStyle.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collectionGroup,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

export default function CommunityStyle() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityStyles = async () => {
      try {
        const q = query(
          collectionGroup(db, "wardrobe"),
          where("shared", "==", true)
        );
        const sharedItemsSnapshot = await getDocs(q);
        const allEntries = [];

        for (const itemDoc of sharedItemsSnapshot.docs) {
          const item = itemDoc.data();
          const itemId = itemDoc.id;
          const userId = itemDoc.ref.parent.parent.id;

          // Now find stylingEntries where itemId matches
          const stylingQuery = query(
            collection(db, "stylingEntries"),
            where("itemId", "==", itemId)
          );

          const stylingSnapshot = await getDocs(stylingQuery);
          stylingSnapshot.forEach((entryDoc) => {
            allEntries.push({
              id: entryDoc.id,
              ...entryDoc.data(),
              itemName: item.name,
              itemImage: item.imageUrl,
              userId,
            });
          });
        }

        setEntries(allEntries);
      } catch (err) {
        console.error("Error loading community styles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityStyles();
  }, []);

  if (loading) return <p className="p-4">Loading shared styles...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-rose-700 mb-4">Community Styling Inspiration</h2>
      <p className="text-sm text-gray-600 italic mb-6">
        A celebration of personal expression. See how others have styled pieces similar to your own.
      </p>

      {entries.length === 0 ? (
        <p className="text-gray-500">No shared styling entries found yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border shadow-sm p-3 rounded-lg">
              <div className="aspect-w-3 aspect-h-4 mb-2 overflow-hidden border">
                <img
                  src={entry.photoURL}
                  alt="styled look"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-rose-800">{entry.itemName}</p>
              <p className="text-sm italic text-gray-600">{entry.caption}</p>
              <p className="text-xs text-rose-500">Inspired by: {entry.inspiredBy}</p>
              <p className="text-xs text-gray-500">Mood: {entry.mood}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
