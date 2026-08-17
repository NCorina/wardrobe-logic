import React, { useState } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const AddItemPage = () => {
  const [photo, setPhoto] = useState(null);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const navigate = useNavigate();
  const [isShared, setIsShared] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log("🔁 handleUpload clicked");
  
    try {
      const user = auth.currentUser;
  
      if (!user) {
        alert("You're not logged in.");
        return;
      }
  
      if (!photo) {
        alert("Please upload a photo.");
        return;
      }
  
      const photoRef = ref(storage, `wardrobePhotos/${user.uid}/${uuidv4()}`);
      await uploadBytes(photoRef, photo);
      const photoURL = await getDownloadURL(photoRef);
  
      await addDoc(collection(db, "wardrobe"), {
        userId: user.uid,
        brand,
        name,
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
        photoURL,
        shared: isShared,
        createdAt: serverTimestamp(),
      });
  
      console.log("🎉 Item saved to Firestore");
      alert("Item saved successfully!");
      navigate("/wardrobe");
    } catch (err) {
      console.error("🔥 Upload error:", err);
      alert("Something went wrong while saving your item.");
    }
  };
  

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl mb-4 font-serif text-rose-700">Add a Wardrobe Item</h2>
      <form onSubmit={handleUpload} className="space-y-4">
      <label className="flex items-center gap-2 mt-4 text-sm">
  <input
    type="checkbox"
    checked={isShared}
    onChange={(e) => setIsShared(e.target.checked)}
  />
  Share this item with the community
</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="w-full border p-2"
          required
        />
        <input
          type="text"
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="text"
          placeholder="Category (e.g. skirt, top)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border p-2"
        />
        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded w-full"
        >
          Save Item
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;
