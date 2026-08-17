// 📘 BookOfPresence.js — Your Public Zine Gallery
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const BookOfPresence = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "zinePages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-serif text-rose-800 tracking-tight mb-8">
        The Now Zine
      </h2>

      {entries.length === 0 ? (
        <p className="text-gray-500 italic">
          No pages yet. Begin your zine with presence.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {entries.map((entry) => (
            <Link
              to={`/entry/${entry.id}`}
              key={entry.id}
              className="block bg-white shadow-md border border-rose-100 p-3 hover:shadow-xl transition-all"
            >
              <div className="mb-2">
                <img
                  src={entry.imageURL}
                  alt={entry.title}
                  className="w-full object-contain max-h-72 border border-gray-200"
                />
              </div>
              <h3 className="text-lg font-serif text-rose-700 mb-1">
                {entry.title}
              </h3>
              <p className="text-xs text-gray-600 italic">
                {entry.inspiration.slice(0, 60)}...
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookOfPresence;
