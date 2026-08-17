// 📦 Imports
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const EditEntry = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const docRef = doc(db, "stylingEntries", entryId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setEntry(snap.data());
        }
      } catch (err) {
        console.error("Failed to fetch entry", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [entryId]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this style entry?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "stylingEntries", entryId));
      alert("Entry deleted.");
      navigate(-1); // Go back
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete entry.");
    }
  };

  if (loading) return <p className="p-4">Loading entry...</p>;
  if (!entry) return <p className="p-4 text-red-500">Entry not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Edit Style Entry</h2>
      <p className="text-gray-600 mb-4">Editing entry ID: {entryId}</p>

      {/* Entry preview */}
      <img
        src={entry.photoURL}
        alt="style preview"
        className="w-full max-w-md object-contain rounded mb-4"
      />

      <p className="text-sm text-gray-700 mb-1 italic">Caption: {entry.caption}</p>
      <p className="text-sm text-gray-500 mb-1">Inspired by: {entry.inspiredBy}</p>
      <p className="text-sm text-gray-500 mb-3">Mood: {entry.mood}</p>

      <button
        onClick={handleDelete}
        className="mt-4 text-sm text-red-500 underline hover:text-red-700"
      >
        🗑 Delete This Entry
      </button>
    </div>
  );
};

export default EditEntry;
