// src/pages/EditMoodPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EditMoodPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchMood = async () => {
      const ref = doc(db, "moodDrops", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFormData(snap.data());
      } else {
        alert("Mood not found");
        navigate("/");
      }
    };
    fetchMood();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "moodDrops", id), formData);
    alert("Mood updated!");
    navigate("/curator-panel");
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto py-10 px-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-md font-serif">
      <h2 className="text-2xl text-rose-700 mb-4">Edit Mood Drop</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="pieceName"
          value={formData.pieceName || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Piece name"
        />
        <textarea
          name="scrapbookNote"
          value={formData.scrapbookNote || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Scrapbook note"
        />
        <button
          type="submit"
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
