import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ItemDetail({ user }) {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedText, setEditedText] = useState("");
  const [editedPseudonym, setEditedPseudonym] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [editedCategory, setEditedCategory] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      const itemRef = doc(db, "users", user.uid, "wardrobe", itemId);
      const itemSnap = await getDoc(itemRef);
      if (itemSnap.exists()) {
        const data = itemSnap.data();
        setItem({ id: itemSnap.id, ...data });
        setEditedName(data.name || "");
        setEditedText(data.inspiration || "");
        setEditedPseudonym(data.pseudonym || "");
        setEditedCategory(data.category || "");
      }
    };
    fetchItem();
  }, [user.uid, itemId]);

  const deleteItem = async () => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;
    const itemRef = doc(db, "users", user.uid, "wardrobe", itemId);
    await deleteDoc(itemRef);
    navigate("/wardrobe");
  };

  const saveEdits = async () => {
    let imageUrl = item.imageUrl;
    if (newImageFile) {
      const storage = getStorage();
      const imageRef = ref(storage, `wardrobeImages/${user.uid}/${Date.now()}_${newImageFile.name}`);
      await uploadBytes(imageRef, newImageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const itemRef = doc(db, "users", user.uid, "wardrobe", itemId);
    await updateDoc(itemRef, {
      name: editedName,
      inspiration: editedText,
      imageUrl,
      pseudonym: editedPseudonym,
      category: editedCategory.trim(),
      isFounderPiece:
        item.isFounderPiece || user.email === "corinanicoara01@gmail.com",
    });
    setItem(prev => ({
      ...prev,
      name: editedName,
      inspiration: editedText,
      imageUrl,
      pseudonym: editedPseudonym,
      category: editedCategory.trim(),
      isFounderPiece:
        prev.isFounderPiece || user.email === "corinanicoara01@gmail.com",
    }));
    setEditing(false);
    setNewImageFile(null);
  };

  const toggleShare = async () => {
    const itemRef = doc(db, "users", user.uid, "wardrobe", itemId);
    await updateDoc(itemRef, { isPublic: !item.isPublic });
    setItem(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  if (!item) return <div className="p-10">Loading...</div>;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/fabric-588884_1280.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-rose-100 bg-opacity-60 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex justify-between items-start mb-6">
          <div className="w-full">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full border border-neutral-300 p-2 rounded text-sm"
                  placeholder="Item name"
                />
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full border border-neutral-300 p-2 rounded text-sm"
                  placeholder="Reflection or inspiration"
                />
                <input
                  type="text"
                  value={editedPseudonym}
                  onChange={(e) => setEditedPseudonym(e.target.value)}
                  className="w-full border border-neutral-300 p-2 rounded text-sm"
                  placeholder="Name or pseudonym (optional)"
                />
                <input
                  type="text"
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="w-full border border-neutral-300 p-2 rounded text-sm"
                  placeholder="Category (e.g. Dress, Jacket, Skirt)"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImageFile(e.target.files[0])}
                  className="w-full text-sm"
                />
                <button
                  onClick={saveEdits}
                  className="mt-2 bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 transition"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-semibold text-rose-800 mb-2">{item.name}</h1>
                <p className="italic text-sm text-neutral-700 mb-2">{item.inspiration}</p>
                <p className="text-xs text-neutral-500 italic mb-4">
                  {item.pseudonym ? `Shared as ${item.pseudonym}` : "Private name"}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-neutral-500 underline"
                >
                  Edit
                </button>
              </>
            )}
          </div>

          <button
            onClick={deleteItem}
            className="text-xs text-neutral-400 underline hover:text-red-500"
          >
            Delete
          </button>
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative transform rotate-1 shadow-xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-100 to-neutral-200 p-3 rounded-xl w-72">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full object-cover aspect-[3/4] border border-neutral-300"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={toggleShare}
            className="text-sm text-rose-600 underline hover:text-rose-800"
          >
            {item.isPublic ? "Unshare from Community" : "Share for Inspiration"}
          </button>
        </div>
      </div>
    </div>
  );
}
