// src/pages/MoodDropPage.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function MoodDropPage() {
  const [latestMood, setLatestMood] = useState(null);

  useEffect(() => {
    const fetchLatestMood = async () => {
      const q = query(collection(db, "moodDrops"), orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) setLatestMood(data[0]);
    };
    fetchLatestMood();
  }, []);

  if (!latestMood) return <p className="text-center py-10">Loading latest mood...</p>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-serif text-gray-800 bg-fixed bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('/background-fabric.jpg')" }}>
      <div className="mb-16 text-center bg-white/10 p-6">
        <h1 className="text-5xl text-rose-700 font-bold mb-2">{latestMood.moodTitle}</h1>
        <p className="italic text-sm text-gray-500">Category: {latestMood.category}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-10 mb-12">
        {latestMood.pieceImages?.map((img, idx) => (
          <div
            key={idx}
            className="relative w-80 h-[24rem] flex flex-col justify-end items-center shadow-xl transition transform hover:scale-[1.01]"
            style={{
              backgroundColor: "white",
              maskImage: "url('/curly-polaroid-mask.svg')",
              WebkitMaskImage: "url('/curly-polaroid-mask.svg')",
              maskSize: "cover",
              WebkitMaskSize: "cover",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat"
            }}
          >
            <img
              src={img}
              alt={`Polaroid ${idx + 1}`}
              className="absolute top-0 left-0 w-full h-[85%] object-cover"
              style={{ borderRadius: "6px" }}
            />
            <div className="text-[11px] italic text-gray-600 mb-3 mt-[85%] px-2">{latestMood.moodTitle}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/60 p-6 rounded-xl shadow">
        <h2 className="text-xl text-rose-600 mb-2">Scrapbook</h2>
        <p className="whitespace-pre-line text-[15px] text-gray-800 leading-relaxed">{latestMood.scrapbookNote}</p>
      </div>
    </div>
  );
}
