import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";
import {
  FollowStylistButton,
  ReciprocalHelpBadge,
  StyleFriendInviteButton,
  StylistReputation,
} from "../components/StylistReputation";
import MemberName from "../components/MemberName";

function RatingForm({ title, onSubmit, existingRating }) {
  const [score, setScore] = useState(existingRating?.score || 5);
  const [saving, setSaving] = useState(false);

  const saveRating = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onSubmit(Number(score));
    setSaving(false);
  };

  return (
    <form onSubmit={saveRating} className="mt-5 border-t border-stone-200 pt-4">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-600">{title}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={score}
          onChange={(event) => setScore(event.target.value)}
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label="Rating"
        >
          <option value={5}>5 — Excellent experience</option>
          <option value={4}>4 — Very good experience</option>
          <option value={3}>3 — Good experience</option>
          <option value={2}>2 — Disappointing experience</option>
          <option value={1}>1 — Poor experience</option>
        </select>
        <button
          type="submit"
          disabled={saving}
          className="bg-stone-800 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : existingRating ? "Update review" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
export default function StyleRequestDetailPage({ user }) {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [responses, setResponses] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [responseImage, setResponseImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const loadRequest = async () => {
      const snapshot = await getDoc(doc(db, "styleRequests", requestId));
      if (snapshot.exists()) setRequest({ id: snapshot.id, ...snapshot.data() });
    };
    loadRequest();

    const responsesQuery = query(
      collection(db, "styleRequests", requestId, "responses"),
      orderBy("createdAt", "asc")
    );
    const unsubscribeResponses = onSnapshot(responsesQuery, (snapshot) => {
      setResponses(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    });

    const ratingsQuery = query(
      collection(db, "styleRatings"),
      where("requestId", "==", requestId)
    );
    const unsubscribeRatings = onSnapshot(ratingsQuery, (snapshot) => {
      setRatings(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    });

    return () => {
      unsubscribeResponses();
      unsubscribeRatings();
    };
  }, [requestId]);

  const submitResponse = async (event) => {
    event.preventDefault();
    if (!user || !responseText.trim()) return;
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (responseImage) {
        const imageReference = ref(
          storage,
          `styleRequestResponses/${requestId}/${user.uid}/${Date.now()}_${responseImage.name}`
        );
        await uploadBytes(imageReference, responseImage);
        imageUrl = await getDownloadURL(imageReference);
      }

      const profileSnapshot = await getDoc(doc(db, "users", user.uid));
      const profileName = profileSnapshot.exists() ? profileSnapshot.data().name : "";

      await addDoc(collection(db, "styleRequests", requestId, "responses"), {
        userId: user.uid,
        responderName: profileName || user.displayName || "Style lover",
        text: responseText.trim(),
        imageUrl,
        helpful: false,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "styleRequests", requestId), {
        responseCount: increment(1),
      });
      setResponseText("");
      setResponseImage(null);
    } catch (error) {
      console.error("Could not post response", error);
      alert("We could not post your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (response) => {
    if (!user || user.uid !== request.createdBy) return;
    await Promise.all([
      updateDoc(doc(db, "styleRequests", requestId), {
        helpfulResponseId: response.id,
        status: "answered",
      }),
      updateDoc(doc(db, "styleRequests", requestId, "responses", response.id), {
        helpful: true,
      }),
      setDoc(doc(db, "styleHelp", requestId), {
        requestId,
        responseId: response.id,
        helperId: response.userId,
        helperName: response.responderName || "Style lover",
        helpedUserId: request.createdBy,
        helpedUserName: request.creatorName || "Style lover",
        createdAt: serverTimestamp(),
      }),
    ]);
    setRequest((current) => ({
      ...current,
      helpfulResponseId: response.id,
      status: "answered",
    }));
  };

  const saveRating = async ({ ratedUserId, responseId = null, ratingType, score }) => {
    const ratingId = `${requestId}_${ratingType}_${responseId || "request"}_${user.uid}`;
    await setDoc(doc(db, "styleRatings", ratingId), {
      requestId,
      responseId,
      ratingType,
      ratedUserId,
      raterId: user.uid,
      score,
      createdAt: serverTimestamp(),
    });
  };

  const ratingFor = (ratingType, responseId = null) =>
    ratings.find(
      (rating) =>
        rating.raterId === user?.uid &&
        rating.ratingType === ratingType &&
        (rating.responseId || null) === responseId
    );

  if (!request) {
    return <main className="min-h-screen bg-[#f8f3ef] p-10 text-center">Opening request…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8f3ef] px-6 py-12 text-stone-800">
      <div className="mx-auto max-w-5xl">
        <Link to="/style-requests" className="text-sm text-rose-700 underline">
          ← All styling requests
        </Link>

        <section className="mt-8 grid gap-8 border-b border-stone-300 pb-12 md:grid-cols-2">
          <div className="space-y-5">
            <figure>
              <div className="aspect-[4/5] bg-stone-200">
                {request.pieceImageUrl && (
                  <img
                    src={request.pieceImageUrl}
                    alt={request.pieceName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <figcaption className="mt-2 text-xs uppercase tracking-wider text-stone-500">
                The wardrobe piece
              </figcaption>
            </figure>
            {request.wearingPhotoUrl && (
              <figure>
                <img
                  src={request.wearingPhotoUrl}
                  alt={`${request.pieceName} worn by the requester`}
                  className="max-h-[560px] w-full bg-stone-200 object-contain"
                />
                <figcaption className="mt-2 text-xs uppercase tracking-wider text-stone-500">
                  Optional fit photograph shared by the requester
                </figcaption>
              </figure>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-700">
              Style this with me
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900">{request.pieceName}</h1>
            {request.pieceCategory && (
              <p className="mt-2 text-xs uppercase tracking-widest text-stone-500">
                {request.pieceCategory}
              </p>
            )}
            <blockquote className="mt-8 border-l-2 border-rose-300 pl-5 text-lg leading-8 text-stone-700">
              {request.prompt}
            </blockquote>
            {request.fitContext && (
              <div className="mt-5 bg-white p-5">
                <p className="text-xs uppercase tracking-wider text-rose-700">
                  Fit and comfort context
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-700">{request.fitContext}</p>
              </div>
            )}
            <p className="mt-6 text-sm text-stone-500">
              Asked by{" "}
              <MemberName
                userId={request.createdBy}
                fallback={request.creatorName}
                linkToProfile
              />
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-rose-700">Community ideas</p>
              <h2 className="mt-2 text-3xl text-stone-900">Ways to make it your own</h2>
            </div>
            <span className="text-sm text-stone-500">{responses.length} responses</span>
          </div>

          <div className="mt-8 space-y-6">
            {responses.map((response) => (
              <article
                key={response.id}
                className={`grid gap-5 border p-5 md:grid-cols-[180px_1fr] ${
                  request.helpfulResponseId === response.id
                    ? "border-rose-400 bg-rose-50"
                    : "border-stone-300 bg-white"
                }`}
              >
                {response.imageUrl ? (
                  <img
                    src={response.imageUrl}
                    alt={`Styling idea by ${response.responderName}`}
                    className="h-56 w-full object-cover md:h-48"
                  />
                ) : (
                  <div className="hidden h-48 bg-stone-100 md:block" />
                )}
                <div className="flex flex-col justify-center">
                  <p className="leading-7 text-stone-700">{response.text}</p>
                  <p className="mt-4 text-xs text-stone-500">
                    Suggested by{" "}
                    <MemberName
                      userId={response.userId}
                      fallback={response.responderName}
                      linkToProfile
                    />
                  </p>
                  <StylistReputation userId={response.userId} />
                  <ReciprocalHelpBadge
                    requesterId={request.createdBy}
                    responderId={response.userId}
                  />
                  <FollowStylistButton
                    currentUser={user}
                    stylistId={response.userId}
                    stylistName={response.responderName}
                  />
                  <StyleFriendInviteButton
                    currentUser={user}
                    otherUserId={response.userId}
                    otherUserName={response.responderName}
                  />
                  {request.helpfulResponseId === response.id && (
                    <span className="mt-3 text-xs uppercase tracking-widest text-rose-700">
                      This inspired the requester
                    </span>
                  )}
                  {user?.uid === request.createdBy && !request.helpfulResponseId && (
                    <button
                      type="button"
                      onClick={() => markHelpful(response)}
                      className="mt-4 self-start text-sm text-rose-700 underline"
                    >
                      This helped me
                    </button>
                  )}
                  {user?.uid === request.createdBy && user.uid !== response.userId && (
                    <RatingForm
                      title="Review this response for usefulness, care, and effort"
                      existingRating={ratingFor("stylist", response.id)}
                      onSubmit={(score) =>
                        saveRating({
                          ratedUserId: response.userId,
                          responseId: response.id,
                          ratingType: "stylist",
                          score,
                        })
                      }
                    />
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 border-t border-stone-300 pt-10">
            {user &&
              user.uid !== request.createdBy &&
              responses.some((response) => response.userId === user.uid) && (
                <div className="mb-8 max-w-2xl bg-rose-50 p-6">
                  <RatingForm
                    title="Review the request experience for clarity, kindness, and respect"
                    existingRating={ratingFor("requester", null)}
                    onSubmit={(score) =>
                      saveRating({
                        ratedUserId: request.createdBy,
                        ratingType: "requester",
                        score,
                      })
                    }
                  />
                </div>
              )}
            {user ? (
              user.uid === request.createdBy ? (
                <p className="text-sm italic text-stone-500">
                  This is your request. Mark the response that most inspired you.
                </p>
              ) : (
                <div className="max-w-2xl">
                  {responses.some((response) => response.userId === user.uid) && (
                    <div className="mb-6 bg-rose-50 p-5">
                      <p className="text-sm text-stone-700">
                        You have exchanged styling help with {request.creatorName || "this member"}.
                      </p>
                      <StyleFriendInviteButton
                        currentUser={user}
                        otherUserId={request.createdBy}
                        otherUserName={request.creatorName}
                      />
                    </div>
                  )}
                <form onSubmit={submitResponse} className="space-y-5 bg-white p-6">
                  <h3 className="text-2xl text-stone-900">Share a styling idea</h3>
                  <textarea
                    value={responseText}
                    onChange={(event) => setResponseText(event.target.value)}
                    required
                    maxLength={700}
                    rows={5}
                    placeholder="Describe how you would style this piece and why the combination works…"
                    className="w-full border border-stone-300 px-4 py-3 leading-6"
                  />
                  <label className="block text-sm text-stone-600">
                    Add a look photograph (optional)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setResponseImage(event.target.files[0] || null)}
                      className="mt-2 block w-full border border-stone-300 p-3"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-stone-900 px-6 py-3 text-white hover:bg-rose-800 disabled:opacity-50"
                  >
                    {submitting ? "Sharing…" : "Share my styling idea"}
                  </button>
                </form>
                </div>
              )
            ) : (
              <Link to="/login" className="text-rose-700 underline">
                Sign in to respond to this styling request.
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
