import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import MemberName from "../components/MemberName";

const REQUEST_LABELS = {
  casual: "Make it more casual",
  dress_up: "Dress it up",
  work: "Style it for work",
  season: "Style it for a season",
  color: "Find a color combination",
  wear_again: "Help me wear it again",
  open: "Open styling question",
};

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).toLowerCase());
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

function requestMatchesWardrobe(request, signals) {
  const categoryMatch =
    request.pieceCategory &&
    signals.categories.has(request.pieceCategory.toLowerCase());
  const tagMatch = normalizeTags(request.pieceTags).some((tag) =>
    signals.tags.has(tag)
  );
  return Boolean(categoryMatch || tagMatch);
}

export default function StyleRequestsPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [myPieces, setMyPieces] = useState([]);
  const [matchingOnly, setMatchingOnly] = useState(false);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestsQuery = query(
      collection(db, "styleRequests"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      requestsQuery,
      (snapshot) => {
        setRequests(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Could not load styling requests", error);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!user) {
      setMyPieces([]);
      return undefined;
    }
    return onSnapshot(
      collection(db, "users", user.uid, "wardrobe"),
      (snapshot) => {
        setMyPieces(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      }
    );
  }, [user]);

  const wardrobeSignals = useMemo(() => {
    const categories = new Set();
    const tags = new Set();
    myPieces.forEach((piece) => {
      if (piece.category) categories.add(piece.category.toLowerCase());
      normalizeTags(piece.tags).forEach((tag) => tags.add(tag));
    });
    return { categories, tags };
  }, [myPieces]);

  const visibleRequests = useMemo(
    () =>
      requests.filter((request) => {
        if (status !== "all" && request.status !== status) return false;
        if (!matchingOnly) return true;
        return requestMatchesWardrobe(request, wardrobeSignals);
      }),
    [requests, status, matchingOnly, wardrobeSignals]
  );

  return (
    <main className="min-h-screen bg-[#f8f3ef] text-stone-800">
      <section className="border-b border-stone-300 bg-rose-100 px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Community styling</p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900 md:text-6xl">
              Style this with me
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-stone-600">
              Ask for ideas centered on a piece you own, or help someone who loves
              something similar.
            </p>
          </div>
          {user ? (
            <Link
              to="/style-requests/new"
              className="inline-flex justify-center bg-stone-900 px-6 py-3 text-sm text-white hover:bg-rose-800"
            >
              Ask a styling question
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex justify-center border border-stone-900 px-6 py-3 text-sm text-stone-900"
            >
              Sign in to participate
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-stone-300 pb-6">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="border border-stone-300 bg-white px-4 py-2 text-sm"
          >
            <option value="open">Open requests</option>
            <option value="answered">Answered requests</option>
            <option value="all">All requests</option>
          </select>
          {user && (
            <label className="flex items-center gap-2 border border-stone-300 bg-white px-4 py-2 text-sm">
              <input
                type="checkbox"
                checked={matchingOnly}
                onChange={(event) => setMatchingOnly(event.target.checked)}
              />
              Matches my wardrobe
            </label>
          )}
        </div>

        {loading && <p className="py-20 text-center text-stone-500">Finding requests…</p>}

        {!loading && visibleRequests.length === 0 && (
          <div className="border border-dashed border-stone-400 px-6 py-20 text-center">
            <h2 className="text-2xl text-stone-800">No matching requests yet.</h2>
            <p className="mt-2 text-sm text-stone-500">
              Be the first to ask the community to style a loved piece.
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleRequests.map((request) => (
            <article key={request.id} className="border border-stone-300 bg-white">
              <Link to={`/style-requests/${request.id}`}>
                <div className="aspect-[4/3] bg-stone-100">
                  {request.pieceImageUrl ? (
                    <img
                      src={request.pieceImageUrl}
                      alt={request.pieceName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-stone-400">
                      Loved piece
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-rose-700">
                    {REQUEST_LABELS[request.requestType] || REQUEST_LABELS.open}
                  </p>
                  {user && request.createdBy !== user.uid && requestMatchesWardrobe(request, wardrobeSignals) && (
                    <span className="mt-3 inline-block bg-rose-100 px-2 py-1 text-[10px] uppercase tracking-wider text-rose-800">
                      Your wardrobes overlap
                    </span>
                  )}
                  <h2 className="mt-2 text-xl text-stone-900">{request.pieceName}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                    {request.prompt}
                  </p>
                  <div className="mt-5 flex justify-between text-xs text-stone-500">
                    <span>
                      Asked by{" "}
                      <MemberName userId={request.createdBy} fallback={request.creatorName} />
                    </span>
                    <span>{request.responseCount || 0} responses</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
