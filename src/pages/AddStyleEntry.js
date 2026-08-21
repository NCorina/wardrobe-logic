import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";

export default function AddStyleEntry() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState("");
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDoc(doc(db, "users", user.uid, "wardrobe", itemId));
      if (snapshot.exists()) setItem({ id: snapshot.id, ...snapshot.data() });
    };
    loadItem();
  }, [itemId]);
  const handleUpload = async (event) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user || !photo || !item) {
      return;
    }

    if (photo.size > 5 * 1024 * 1024) {
      window.alert("Please choose an image smaller than 5 MB.");
      return;
    }

    setSubmitting(true);

    try {
      const photoReference = ref(
        storage,
        `stylingPhotos/${user.uid}/${Date.now()}_${photo.name}`
      );

      await uploadBytes(photoReference, photo);
      const photoURL = await getDownloadURL(photoReference);

      const userSnapshot = await getDoc(doc(db, "users", user.uid));
      const userData = userSnapshot.exists() ? userSnapshot.data() : {};

      await addDoc(collection(db, "stylingEntries"), {
        itemId,
        pieceName: item.name,
        pieceImageUrl: item.imageUrl || "",
        userId: user.uid,
        userName: userData.name || user.displayName || "Style lover",
        photoURL,
        caption: caption.trim(),
        occasion: occasion.trim(),
        mood: mood.trim(),
        shared: true,
        createdAt: serverTimestamp(),
      });

      navigate(`/item/${itemId}`);
    } catch (error) {
      console.error("Style sharing failed:", error);

      window.alert(
        `We couldn't share this style: ${
          error?.code || error?.message || "Unknown error"
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (!item) {
    return <main className="min-h-screen bg-[#f8f3ef] p-12 text-center">Opening your piece…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8f3ef] px-6 py-14 text-stone-800">
      <div className="mx-auto max-w-3xl">
        <Link to={`/item/${itemId}`} className="text-sm text-rose-700 underline">
          ← Back to {item.name}
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-rose-700">Share your styling talent</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Show how you styled it</h1>
        <p className="mt-4 max-w-2xl leading-7 text-stone-600">
          Share a real outfit built around this piece so someone else can discover a
          new way to wear something they love.
        </p>

        <form onSubmit={handleUpload} className="mt-10 space-y-6 bg-white p-6 md:p-10">
          <div className="grid gap-5 sm:grid-cols-[140px_1fr] sm:items-center">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="aspect-[4/5] w-full object-cover" />
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500">Centerpiece</p>
              <h2 className="mt-2 text-2xl text-stone-900">{item.name}</h2>
            </div>
          </div>

          <section className="border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-medium text-stone-800">Your comfort comes first</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Show the complete outfit, a cropped look, or only the details you want.
              Your face never needs to be visible.
            </p>
            <p className="mt-2 text-xs leading-5 text-rose-800">
              This styled photograph will be public in Wardrobe Logics.
            </p>
          </section>

          <label className="block text-sm font-medium text-stone-700">
            Styled-look photograph
            <input
              type="file"
              accept="image/*"
              required
              onChange={(event) => setPhoto(event.target.files[0] || null)}
              className="mt-2 block w-full border border-stone-300 p-3"
            />
            <span className="mt-1 block text-xs font-normal text-stone-500">Maximum 5 MB</span>
          </label>

          <label className="block text-sm font-medium text-stone-700">
            What made this combination work? <span className="font-normal text-stone-500">(optional)</span>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="For example: I balanced the volume of the dress with fitted boots and repeated the warm color in the bag."
              className="mt-2 w-full border border-stone-300 px-4 py-3 leading-6"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <input value={occasion} onChange={(event) => setOccasion(event.target.value)} maxLength={60} placeholder="Occasion (optional)" className="border border-stone-300 px-4 py-3 text-sm" />
            <input value={mood} onChange={(event) => setMood(event.target.value)} maxLength={60} placeholder="Mood or aesthetic (optional)" className="border border-stone-300 px-4 py-3 text-sm" />
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-rose-700 px-6 py-3 text-white hover:bg-rose-800 disabled:opacity-50">
            {submitting ? "Sharing your look…" : "Share how I styled it"}
          </button>
        </form>
      </div>
    </main>
  );
}
