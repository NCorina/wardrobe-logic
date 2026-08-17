// src/pages/AddJournalEntry.js
import React, { useState } from "react";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const AddJournalEntry = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    let imageUrl = "";
    if (image) {
      const imageRef = ref(storage, `journalImages/${user.uid}/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    await addDoc(collection(db, "journalEntries"), {
      userId: user.uid,
      title,
      content,
      tags: tags.split(",").map((tag) => tag.trim().toLowerCase()),
      imageUrl,
      createdAt: serverTimestamp(),
    });

    navigate("/journal");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl mb-4 font-serif text-rose-700">New Journal Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
          required
        />
        <textarea
          placeholder="What are you noticing? Feeling? Loving today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 min-h-[150px]"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated, e.g. nature, music, stillness)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border p-2"
        />
        <button
          type="submit"
          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
        >
          Add Entry
        </button>
      </form>
    </div>
  );
};

export default AddJournalEntry;
