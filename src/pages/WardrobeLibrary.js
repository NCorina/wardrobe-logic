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
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [tags, setTags] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [uploading, setUploading] = useState(false);
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
    if (!category || !imageFile) {
      alert("Choose a category and add a photograph of the clothing piece.");
      return;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = "";
      const storage = getStorage();
      const imageRef = ref(
        storage,
        `wardrobeImages/${user.uid}/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);

      const profileSnapshot = await getDoc(doc(db, "users", user.uid));
      const profileName = profileSnapshot.exists() ? profileSnapshot.data().name : "";
      const itemName =
        newItemName.trim() || [color.trim(), category].filter(Boolean).join(" ");

      await addDoc(collection(db, "users", user.uid, "wardrobe"), {
        name: itemName,
        imageUrl,
        contributorName: profileName || user.displayName || "Style lover",
        category,
        brand: brand.trim(),
        color: color.trim(),
        material: material.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        inspiration: inspiration.trim(),
        createdAt: new Date(),
        isPublic: false,
        isFounderPiece: user.email === "corinanicoara01@gmail.com",
      });

      setNewItemName("");
      setImageFile(null);
      setCategory("");
      setBrand("");
      setColor("");
      setMaterial("");
      setTags("");
      setInspiration("");
    } catch (error) {
      console.error("Unable to add wardrobe piece", error);
      alert("We couldn't add this piece. Please try again.");
    } finally {
      setUploading(false);
    }
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
            <h4 className="text-2xl text-rose-800 font-medium mb-2">Add a piece you love</h4>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-700">
              Quick add · only a photograph and category are required
            </p>
            <p className="mb-4 text-sm leading-6 text-stone-600">
              Photograph the clothing piece itself—you never need to show your face
              or body. Lay it flat, place it on a hanger, or crop an existing photo.
            </p>
            <div className="mb-5 border border-rose-200 bg-white bg-opacity-70 p-4 text-left text-xs leading-5 text-stone-600">
              <p><strong>Private by default.</strong> This piece begins in your private wardrobe.</p>
              <p className="mt-1">It appears in the community only if you later choose to share it.</p>
              <p className="mt-1">Please use a photograph you took or have permission to use.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-left text-sm font-medium text-stone-700">
                Photograph of the piece
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImageFile(e.target.files[0] || null)}
                  className="mt-2 w-full px-4 py-2 border border-neutral-300 bg-white bg-opacity-70 rounded-full text-sm shadow-sm"
                />
                <span className="mt-1 block text-xs font-normal text-stone-500">
                  JPG, PNG, or another image format · maximum 5 MB
                </span>
              </label>
              <label className="block text-left text-sm font-medium text-stone-700">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="mt-2 w-full border border-neutral-300 bg-white bg-opacity-80 px-4 py-3 text-sm shadow-sm"
                >
                  <option value="">Choose one</option>
                  <option value="Dress">Dress</option>
                  <option value="Top">Top</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Sweater">Sweater</option>
                  <option value="Jacket">Jacket or coat</option>
                  <option value="Skirt">Skirt</option>
                  <option value="Trousers">Trousers or jeans</option>
                  <option value="Jumpsuit">Jumpsuit or set</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Bag">Bag</option>
                  <option value="Accessory">Accessory or jewelry</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block text-left text-sm font-medium text-stone-700">
                A name for your piece <span className="font-normal text-stone-500">(optional)</span>
                <input
                  placeholder="e.g. My red dinner dress"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  maxLength={80}
                  className="mt-2 w-full border border-neutral-300 bg-white bg-opacity-80 px-4 py-3 text-sm shadow-sm"
                />
                <span className="mt-1 block text-xs font-normal text-stone-500">
                  Skip this and we will use its color and category.
                </span>
              </label>

              <details className="border border-stone-300 bg-white bg-opacity-70 text-left">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-stone-700">
                  Add details for better matches — optional
                </summary>
                <div className="space-y-4 border-t border-stone-200 p-4">
                  <p className="text-xs leading-5 text-stone-500">
                    Add only what you know. These details help people find the same
                    piece or share more relevant styling ideas.
                  </p>
                  <input
                    placeholder="Brand (optional)"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    maxLength={60}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm"
                  />
                  <input
                    placeholder="Main color or pattern (optional)"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    maxLength={40}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm"
                  />
                  <input
                    placeholder="Material, if known (optional)"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    maxLength={50}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm"
                  />
                  <input
                    placeholder="Style words, separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    maxLength={120}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm"
                  />
                  <p className="-mt-2 text-xs text-stone-500">
                    For example: romantic, minimal, vintage, workwear
                  </p>
                  <textarea
                    placeholder="What do you love about this piece? (optional)"
                    value={inspiration}
                    onChange={(e) => setInspiration(e.target.value)}
                    maxLength={300}
                    rows={3}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
                  />
                </div>
              </details>
              <button
                onClick={addItem}
                disabled={uploading}
                className="w-full px-6 py-3 bg-rose-600 text-white rounded-full text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
              >
                {uploading ? "Adding your piece…" : "Add to my private wardrobe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
