import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collectionGroup, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { db } from "../firebase";
import MemberName from "../components/MemberName";

const ALL = "all";

function ownerIdFromDocument(document) {
  return document.ref.parent.parent?.id || "unknown";
}

export default function MasterWardrobeLibrary({ user }) {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [ownerId, setOwnerId] = useState(ALL);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const loadPieces = async () => {
      try {
        const publicPiecesQuery = query(
          collectionGroup(db, "wardrobe"),
          where("isPublic", "==", true)
        );
        const snapshot = await getDocs(publicPiecesQuery);
        const loadedPieces = snapshot.docs.map((document) => ({
            id: document.id,
            ownerId: ownerIdFromDocument(document),
            ...document.data(),
          }));

        setPieces(
          loadedPieces.map((piece) => ({
            ...piece,
            contributorName:
              piece.contributorName || piece.pseudonym || "",
          }))
        );
      } catch (loadError) {
        console.error("Unable to load the wardrobe library", loadError);
        setError("We could not open the library right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPieces();
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(pieces.map((piece) => piece.category).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [pieces]
  );

  const contributors = useMemo(() => {
    const contributorMap = new Map();
    pieces.forEach((piece) => {
      if (!contributorMap.has(piece.ownerId)) {
        contributorMap.set(
          piece.ownerId,
          piece.contributorName || (piece.isFounderPiece ? "Founder" : "Community member")
        );
      }
    });
    return [...contributorMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [pieces]);

  const filteredPieces = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return pieces.filter((piece) => {
      if (view === "founder" && !piece.isFounderPiece) return false;
      if (view === "mine" && (!user || piece.ownerId !== user.uid)) return false;
      if (category !== ALL && piece.category !== category) return false;
      if (ownerId !== ALL && piece.ownerId !== ownerId) return false;

      if (normalizedSearch) {
        const searchableText = [
          piece.name,
          piece.category,
          piece.brand,
          piece.inspiration,
          ...(piece.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(normalizedSearch)) return false;
      }

      return true;
    });
  }, [pieces, view, category, ownerId, search, user]);

  const selectView = (nextView) => {
    setView(nextView);
    setOwnerId(ALL);
  };

  const deletePiece = async (event, piece) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user || piece.ownerId !== user.uid) return;
    if (!window.confirm(`Delete “${piece.name}”? This cannot be undone.`)) return;

    setDeletingId(piece.id);
    try {
      if (piece.imageUrl) {
        try {
          await deleteObject(ref(getStorage(), piece.imageUrl));
        } catch (storageError) {
          if (storageError.code !== "storage/object-not-found") throw storageError;
        }
      }

      await deleteDoc(doc(db, "users", user.uid, "wardrobe", piece.id));
      setPieces((currentPieces) =>
        currentPieces.filter(
          (currentPiece) =>
            currentPiece.id !== piece.id || currentPiece.ownerId !== piece.ownerId
        )
      );
    } catch (deleteError) {
      console.error("Unable to delete wardrobe piece", deleteError);
      alert("We couldn't delete this piece. Please try again.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5efe9] text-stone-800">
      <section className="border-b border-stone-300 bg-[#ebe0d7] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-rose-700">
            One piece. Many interpretations.
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-stone-900 md:text-6xl">
            The Wardrobe Library
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
            A shared collection of clothes people genuinely love—and all the ways
            they make those pieces their own.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap gap-2" aria-label="Library views">
          {[
            [ALL, "All pieces"],
            ["founder", "Founding wardrobe"],
            ["mine", "My library"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => selectView(value)}
              disabled={value === "mine" && !user}
              className={`border px-5 py-2 text-sm transition ${
                view === value
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-400 bg-transparent text-stone-700 hover:border-stone-900"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-10 grid gap-4 border-y border-stone-300 py-6 md:grid-cols-3">
          <label className="text-xs uppercase tracking-widest text-stone-500">
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Dress, jacket, silk…"
              className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm normal-case tracking-normal text-stone-800 outline-none focus:border-rose-600"
            />
          </label>

          <label className="text-xs uppercase tracking-widest text-stone-500">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm normal-case tracking-normal text-stone-800 outline-none focus:border-rose-600"
            >
              <option value={ALL}>All categories</option>
              {categories.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs uppercase tracking-widest text-stone-500">
            Contributor
            <select
              value={ownerId}
              onChange={(event) => {
                setOwnerId(event.target.value);
                setView(ALL);
              }}
              className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm normal-case tracking-normal text-stone-800 outline-none focus:border-rose-600"
            >
              <option value={ALL}>Everyone</option>
              {contributors.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="py-20 text-center text-stone-500">Opening the library…</p>}
        {error && <p className="py-20 text-center text-red-700">{error}</p>}

        {!loading && !error && filteredPieces.length === 0 && (
          <div className="border border-dashed border-stone-400 px-6 py-20 text-center">
            <h2 className="text-2xl text-stone-800">No loved pieces here yet.</h2>
            <p className="mt-2 text-sm text-stone-500">
              Try another filter, or share a piece from your wardrobe.
            </p>
          </div>
        )}

        {!loading && !error && filteredPieces.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPieces.map((piece) => (
              <article key={`${piece.ownerId}-${piece.id}`} className="group">
                <Link to={`/community-style/${encodeURIComponent(piece.name)}`}>
                  <div className="aspect-[4/5] overflow-hidden bg-stone-200">
                    {piece.imageUrl ? (
                      <img
                        src={piece.imageUrl}
                        alt={piece.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-500">
                        Photograph coming soon
                      </div>
                    )}
                  </div>
                  <div className="border-b border-stone-300 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-medium text-stone-900">{piece.name}</h2>
                        <p className="mt-1 text-xs uppercase tracking-widest text-stone-500">
                          {piece.category || "Loved piece"}
                        </p>
                      </div>
                      {piece.isFounderPiece && (
                        <span className="shrink-0 bg-rose-100 px-2 py-1 text-[10px] uppercase tracking-wider text-rose-800">
                          Founding piece
                        </span>
                      )}
                    </div>
                    {piece.inspiration && (
                      <p className="mt-3 line-clamp-2 text-sm italic leading-6 text-stone-600">
                        “{piece.inspiration}”
                      </p>
                    )}
                    <p className="mt-3 text-xs text-stone-500">
                      Shared by{" "}
                      <MemberName
                        userId={piece.ownerId}
                        linkToProfile
                        fallback={
                          piece.contributorName ||
                          (piece.isFounderPiece ? "the founder" : "Style lover")
                        }
                      />
                    </p>
                    {user && piece.ownerId === user.uid && (
                      <button
                        type="button"
                        onClick={(event) => deletePiece(event, piece)}
                        disabled={deletingId === piece.id}
                        className="mt-4 border border-red-300 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === piece.id ? "Deleting…" : "Delete my piece"}
                      </button>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
