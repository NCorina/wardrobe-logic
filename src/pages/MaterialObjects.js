// 📘 MaterialObjects.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase"; // ✅ import auth
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

const MaterialObjects = () => {
  const [entries, setEntries] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // ✅ Check if the user is the creator (you)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "corinanicoara01@gmail.com") {
        setIsOwner(true);
      }
    });

    const q = query(collection(db, "materialObjects"), orderBy("createdAt", "desc"));
    const unsubscribeEntries = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEntries();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-serif text-rose-800 tracking-tight mb-8">
        Material Objects
      </h2>
      <p className="text-gray-600 mb-10 max-w-xl">
        A living installation of texture, memory, and feeling. Every entry is a moment. Every object is a portal to presence. Curated and written by the artist.
      </p>

      {isOwner && (
        <div className="flex justify-end mb-6">
          <Link
            to="/add"
            className="bg-rose-500 text-white text-sm px-4 py-2 rounded hover:bg-rose-600"
          >
            ➕ Add Material Object
          </Link>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-gray-500 italic">
          No entries yet. Begin your collection of beauty.
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
      
      {auth.currentUser?.email === "your@email.com" && (
        <Link
          to="/add"
          className="fixed bottom-6 right-6 bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-rose-600"
        >
          + Add
        </Link>
      )}
    </div>
  );
};

export default MaterialObjects;

