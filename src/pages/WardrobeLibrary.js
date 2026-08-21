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
  const [isPublic, setIsPublic] = useState(false);
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
whyILoveIt: inspiration.trim(),
createdAt: new Date(),

 // Save both names for compatibility with existing pages
isPublic,
shared: isPublic,

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
      setIsPublic(false);
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
          A curated home for the pieces you genuinely love—and all the ways you make them your own.
        </p>

        <section className="mb-14 border border-stone-300 bg-white bg-opacity-85 p-6 md:p-10">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-700">Start with what you need today</p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-900">
              How would you like to participate?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              You do not have to choose one permanent role. Ask for help, share your
              styling eye, or move between both whenever you like.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="border border-rose-300 bg-rose-50 p-6 text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700">I want fresh ideas</p>
              <h3 className="mt-2 text-2xl text-stone-900">Get styling help</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Choose a piece you own, explain what feels difficult, and invite the
                community to suggest new combinations. A wearing photo is optional.
              </p>
              {items.length > 0 ? (
                <div>
                  <Link
                    to="/style-requests/new"
                    className="mt-5 inline-block bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-rose-800"
                  >
                    Ask for inspiration
                  </Link>
                  <Link
                    to="/style-requests?mode=mine"
                    className="mt-4 block text-sm text-rose-700 underline"
                  >
                    View my style questions
                  </Link>
                </div>
              ) : (
                <a
                  href="#add-piece"
                  className="mt-5 inline-block bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-rose-800"
                >
                  Add my first piece
                </a>
              )}
            </article>

            <article className="border border-stone-400 bg-stone-900 p-6 text-left text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-200">I have styling ideas</p>
              <h3 className="mt-2 text-2xl">Share styling talent</h3>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Help someone style a piece, or share a complete or cropped outfit
                showing how you made one of your own pieces work.
              </p>
              <Link
                to="/share-a-look"
                className="mt-5 inline-block bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700"
              >
                Choose one piece to style
              </Link>
              <Link
                to="/style-requests?mode=help"
                className="mt-4 block text-sm text-rose-200 underline hover:text-white"
              >
                Or browse style questions
              </Link>
            </article>
          </div>

          <p className="mt-6 text-center text-xs text-stone-500">
            Prefer to organize first? Continue to your private wardrobe below.
          </p>
        </section>

        {items.length === 0 ? (
          <p className="text-center text-gray-600 mb-8">
            Your wardrobe is empty. Add your first piece below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center items-start mb-10">
            {items.map((item) => (
              <article
                key={item.id}
                className="relative w-72 border border-neutral-300 bg-gradient-to-br from-white via-neutral-100 to-neutral-200 p-3 shadow-md transition hover:shadow-lg"
              >
                <Link to={`/item/${item.id}`} className="block">
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
                  </div>
                </Link>
                <div className="mt-4 grid gap-2 border-t border-neutral-200 pt-4">
                  <Link
                    to={`/item/${item.id}/style`}
                    className="bg-rose-700 px-3 py-2 text-center text-xs font-medium text-white hover:bg-rose-800"
                  >
                   Add my styling interpretation
                  </Link>
                  <Link
                    to={`/style-requests/new?piece=${item.id}`}
                    className="border border-stone-500 px-3 py-2 text-center text-xs font-medium text-stone-700 hover:border-rose-600 hover:text-rose-700"
                  >
                    Ask for styling help
                  </Link>
                  <Link
                    to={`/item/${item.id}`}
                    className="py-1 text-center text-xs text-stone-500 underline hover:text-rose-700"
                  >
                    View or edit piece
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => deleteItem(event, item)}
                    disabled={deletingId === item.id}
                    className="py-1 text-xs text-neutral-400 underline hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete piece"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div id="add-piece" className="relative w-full flex justify-center mt-12 scroll-mt-8">
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
 
                <fieldset className="border border-stone-300 bg-white bg-opacity-80 p-4 text-left">
  <legend className="px-2 text-sm font-medium text-stone-800">
    Who can see this piece?
  </legend>

  <div className="mt-2 space-y-3">
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="radio"
        name="pieceVisibility"
        checked={!isPublic}
        onChange={() => setIsPublic(false)}
        className="mt-1"
      />

      <span>
        <span className="block text-sm font-medium text-stone-800">
          Keep it private
        </span>
        <span className="mt-1 block text-xs leading-5 text-stone-500">
          Save it only in my personal Loved Wardrobe. I can share it later.
        </span>
      </span>
    </label>

    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="radio"
        name="pieceVisibility"
        checked={isPublic}
        onChange={() => setIsPublic(true)}
        className="mt-1"
      />

      <span>
        <span className="block text-sm font-medium text-stone-800">
          Add it to the public Loved Pieces Library
        </span>
        <span className="mt-1 block text-xs leading-5 text-stone-500">
          Let others appreciate this piece, discover your interpretations,
          and connect with you through similar style.
        </span>
      </span>
    </label>
  </div>
</fieldset>
      <button
  type="button"
  onClick={addItem}
  disabled={uploading}
  className="w-full bg-rose-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
>
  {uploading
    ? "Adding your loved piece…"
    : isPublic
      ? "Share in the Loved Pieces Library"
      : "Add to my private Loved Wardrobe"}
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
