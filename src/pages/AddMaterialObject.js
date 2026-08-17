// AddMaterialObject.js — Create a new curated entry
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const AddMaterialObject = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !title) {
      alert("Please add an image and title.");
      return;
    }

    try {
      setSubmitting(true);
      const user = auth.currentUser;
      const imageRef = ref(storage, `materialObjects/${user.uid}/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      const imageURL = await getDownloadURL(imageRef);

      await addDoc(collection(db, "materialObjects"), {
        title,
        inspiration,
        imageURL,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err) {
      console.error("Error adding object:", err);
      alert("Failed to add material object.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-serif text-rose-700 mb-4">Add a New Object</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full border p-2"
          required
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
          required
        />
        <textarea
          placeholder="Write a poetic ode, a memory, or a reflection..."
          value={inspiration}
          onChange={(e) => setInspiration(e.target.value)}
          className="w-full border p-2 h-40"
        />
        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded"
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Entry"}
        </button>
      </form>
    </div>
  );
};

export default AddMaterialObject;
