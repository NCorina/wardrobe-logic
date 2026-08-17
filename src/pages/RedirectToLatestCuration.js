import React, { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function ViewLatestCuration() {
  const [latestCuration, setLatestCuration] = useState(null);

  useEffect(() => {
    const fetchLatestCuration = async () => {
      const q = query(collection(db, "basePieces"), orderBy("createdAt", "desc"), limit(1)); // Query for the latest curation
      const snapshot = await getDocs(q);
      const latest = snapshot.docs[0]; // Get the first (latest) document

      if (latest) {
        setLatestCuration(latest.data());
      }
    };

    fetchLatestCuration();
  }, []);

  if (!latestCuration) return <p className="text-center py-10">Loading latest curation...</p>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-serif text-gray-800">
      <h1 className="text-4xl text-rose-700 font-bold text-center mb-12">Latest Curated Fashion Piece</h1>

      <div className="relative w-full h-[28rem] flex flex-col justify-end items-center shadow-xl">
        <img
          src={latestCuration.pieceImages?.[0]}  // Make sure you are accessing the correct field
          alt={latestCuration.moodTitle}
          className="absolute top-0 left-0 w-full h-[85%] object-cover rounded"
        />
        <div className="text-[12px] italic text-gray-600 mb-3 mt-[85%] px-2">{latestCuration.moodTitle}</div>
      </div>

      <div>
        <p className="text-lg">{latestCuration.scrapbookNote}</p>
        {/* Add any other content you want to display for this latest curation */}
      </div>
    </div>
  );
}
