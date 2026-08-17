// src/pages/AddStyleEntry.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc, 
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const AddStyleEntry = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState("");
  const [inspiredBy, setInspiredBy] = useState("");
  const [mood, setMood] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !photo) return;
  
    const photoRef = ref(storage, `stylingPhotos/${user.uid}/${uuidv4()}`);
    await uploadBytes(photoRef, photo);
    const photoURL = await getDownloadURL(photoRef);
  
    // 👉 Get user profile info from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
  
    await addDoc(collection(db, "stylingEntries"), {
      itemId,
      userId: user.uid,
      userName: userData.name || "Anonymous",
      location: userData.location || "Unknown",
      photoURL,
      caption,
      inspiredBy,
      mood,
      shared: true,
      createdAt: serverTimestamp()
    });
  
    alert("Style entry added!");
    navigate(`/item/${itemId}`);
  };
  
  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl mb-4">Style This Piece</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} required />
        <textarea
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border p-2"
        />
        <input
          type="text"
          placeholder="Inspired by (e.g. a book, movie, person)"
          value={inspiredBy}
          onChange={(e) => setInspiredBy(e.target.value)}
          className="w-full border p-2"
        />
        <input
          type="text"
          placeholder="Mood or vibe (e.g. cozy, feminine)"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full border p-2"
        />
        <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600">Add Entry</button>
      </form>
    </div>
  );
};

export default AddStyleEntry;
