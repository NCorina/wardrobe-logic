// src/pages/EntryDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const EntryDetail = () => {
  const { itemId } = useParams();
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      const docRef = doc(db, "journalEntries", itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEntry(docSnap.data());
      } else {
        console.log("No such entry!");
      }
    };

    fetchEntry();
  }, [itemId]);

  if (!entry) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white/70 backdrop-blur-sm rounded shadow">
      <h2 className="text-3xl font-serif text-rose-700 mb-2">{entry.title}</h2>
      <p className="text-sm text-gray-500 italic mb-4">
        {entry.tags?.join(", ")} — {new Date(entry.createdAt?.seconds * 1000).toLocaleString()}
      </p>
      {entry.imageURL && (
        <img
          src={entry.imageURL}
          alt="Journal visual"
          className="w-full object-contain max-h-[400px] rounded mb-4"
        />
      )}
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {entry.content}
      </div>
    </div>
  );
};

export default EntryDetail;
