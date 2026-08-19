// Updated WardrobeLibrary with clean, more technological photo layout (no rounded corners)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

export default function WardrobeLibrary({ user }) {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users", user.uid, "wardrobe"),
      (snapshot) => {
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsData);
      }
    );
    return () => unsub();
  }, [user.uid]);

  const addItem = async () => {
    if (!newItemName) return;

    let imageUrl = "";

    if (imageFile) {
      const storage = getStorage();
      const imageRef = ref(
        storage,
        `wardrobeImages/${user.uid}/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const profileSnapshot = await getDoc(doc(db, "users", user.uid));
    const profileName = profileSnapshot.exists() ? profileSnapshot.data().name : "";

    await addDoc(collection(db, "users", user.uid, "wardrobe"), {
      name: newItemName,
      imageUrl,
      contributorName: profileName || user.displayName || "Style lover",
      category: category.trim(),
      createdAt: new Date(),
      isPublic: false,
      isFounderPiece: user.email === "corinanicoara01@gmail.com",
    });

    setNewItemName("");
    setImageFile(null);
    setCategory("");
  };

  const deleteItem = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return;

    setDeletingId(item.id);
    try {
      if (item.imageUrl) {
        try {
          await deleteObject(ref(getStorage(), item.imageUrl));
        } catch (storageError) {
          if (storageError.code !== "storage/object-not-found") throw storageError;
        }
      }
      await deleteDoc(doc(db, "users", user.uid, "wardrobe", item.id));
    } catch (error) {
      console.error("Unable to delete wardrobe piece", error);
      alert("We couldn't delete this piece. Please try again.");
    } finally {
      setDeletingId("");
    }
  };

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
        <h2 className="text-4xl text-center text-rose-800 font-semibold mb-4">
          Your Wardrobe Library
        </h2>
        <p className="text-center text-gray-700 mb-10 text-sm italic">
          A quiet space to honor the clothes you already love.
        </p>

        {items.length === 0 ? (
          <p className="text-center text-gray-600 mb-8">
            Your wardrobe is empty. Add your first piece below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center items-start mb-10">
            {items.map((item) => (
              <Link to={`/item/${item.id}`} key={item.id}>
                <div className="relative shadow-md border border-neutral-300 bg-gradient-to-br from-white via-neutral-100 to-neutral-200 p-3 w-60 hover:shadow-lg transition">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full object-cover aspect-[3/4] border border-neutral-200"
                      style={{ borderRadius: "0.25rem" }} // subtle corner radius instead of fully rounded
                    />
                  )}
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-medium text-rose-700 truncate">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={(event) => deleteItem(event, item)}
                      disabled={deletingId === item.id}
                      className="mt-2 text-xs text-neutral-500 underline hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === item.id ? "Deleting…" : "Delete piece"}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="relative w-full flex justify-center mt-12">
          <div className="text-center max-w-md w-full">
            <h4 className="text-md text-rose-700 font-medium mb-2">+ Add a New Piece</h4>
            <div className="space-y-3">
              <input
                placeholder="Name (e.g. Silk Camisole)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 bg-white bg-opacity-70 rounded-full text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
              />
              <input
                placeholder="Category (e.g. Dress, Jacket, Skirt)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 bg-white bg-opacity-70 rounded-full text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-neutral-300 bg-white bg-opacity-70 rounded-full text-sm shadow-sm"
              />
              <button
                onClick={addItem}
                className="px-6 py-2 bg-rose-600 text-white rounded-full text-sm font-medium hover:bg-rose-700 transition"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
