import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  FollowStylistButton,
  StylistReputation,
} from "../components/StylistReputation";

function timestampValue(value) {
  return value?.seconds || 0;
}

export default function PublicStyleProfilePage({ user }) {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeProfile = onSnapshot(
      doc(db, "publicProfiles", userId),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      }
    );

    const unsubscribePieces = onSnapshot(
      query(
        collection(db, "users", userId, "wardrobe"),
        where("isPublic", "==", true)
      ),
      (snapshot) =>
        setPieces(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    );

    const unsubscribeResponses = onSnapshot(
      query(collectionGroup(db, "responses"), where("userId", "==", userId)),
      (snapshot) =>
        setResponses(
          snapshot.docs.map((item) => ({
            id: item.id,
            requestId: item.ref.parent.parent?.id,
            ...item.data(),
          }))
        )
    );

    return () => {
      unsubscribeProfile();
      unsubscribePieces();
      unsubscribeResponses();
    };
  }, [userId]);

  const recentResponses = useMemo(
    () =>
      [...responses]
        .sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt))
        .slice(0, 12),
    [responses]
  );

  if (loading) {
    return <main className="min-h-screen bg-[#f8f3ef] p-12 text-center">Opening style profile…</main>;
  }

  const displayName = profile?.displayName || "Style lover";

  return (
    <main className="min-h-screen bg-[#f8f3ef] text-stone-800">
      <section className="border-b border-stone-300 bg-rose-100 px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Public style profile</p>
          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-semibold text-stone-900 md:text-6xl">{displayName}</h1>
              {profile?.styleBio && (
                <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
                  {profile.styleBio}
                </p>
              )}
              {profile?.styleSpecialties?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.styleSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="bg-white px-3 py-2 text-xs uppercase tracking-wider text-rose-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
              <StylistReputation userId={userId} />
            </div>
            <div>
              {user?.uid === userId ? (
                <Link to="/profile" className="border border-stone-700 px-5 py-3 text-sm">
                  Edit my profile
                </Link>
              ) : (
                <FollowStylistButton
                  currentUser={user}
                  stylistId={userId}
                  stylistName={displayName}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-700">Their wardrobe perspective</p>
            <h2 className="mt-2 text-3xl text-stone-900">Pieces they have shared</h2>
          </div>
          <span className="text-sm text-stone-500">{pieces.length} public pieces</span>
        </div>
        {pieces.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pieces.map((piece) => (
              <article key={piece.id} className="border border-stone-300 bg-white">
                {piece.imageUrl && (
                  <img src={piece.imageUrl} alt={piece.name} className="aspect-[4/5] w-full object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-lg text-stone-900">{piece.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-stone-500">
                    {[piece.brand, piece.category, piece.color].filter(Boolean).join(" · ")}
                  </p>
                  {piece.inspiration && (
                    <p className="mt-3 text-sm italic leading-6 text-stone-600">“{piece.inspiration}”</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-stone-500">No public wardrobe pieces yet.</p>
        )}
      </section>

      <section className="border-t border-stone-300 bg-white px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-rose-700">How they help</p>
              <h2 className="mt-2 text-3xl text-stone-900">Recent styling ideas</h2>
            </div>
            <span className="text-sm text-stone-500">{responses.length} responses shared</span>
          </div>
          {recentResponses.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {recentResponses.map((response) => (
                <Link
                  key={`${response.requestId}-${response.id}`}
                  to={`/style-requests/${response.requestId}`}
                  className="border border-stone-300 p-5 hover:border-rose-400"
                >
                  {response.imageUrl && (
                    <img
                      src={response.imageUrl}
                      alt="Styling suggestion"
                      className="mb-4 h-56 w-full object-cover"
                    />
                  )}
                  <p className="line-clamp-4 leading-7 text-stone-700">{response.text}</p>
                  {response.helpful && (
                    <p className="mt-3 text-xs uppercase tracking-wider text-rose-700">
                      Marked helpful by the requester
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-stone-500">No styling responses yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
