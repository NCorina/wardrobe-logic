import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const REQUEST_TYPES = [
  ["casual", "Make it more casual"],
  ["dress_up", "Dress it up"],
  ["work", "Style it for work"],
  ["season", "Style it for a season"],
  ["color", "Find a color combination"],
  ["wear_again", "Help me wear it again"],
  ["open", "Ask my own question"],
];

export default function CreateStyleRequestPage({ user }) {
  const [searchParams] = useSearchParams();
  const [pieces, setPieces] = useState([]);
  const [pieceId, setPieceId] = useState(searchParams.get("piece") || "");
  const [requestType, setRequestType] = useState("wear_again");
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("similar");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPieces = async () => {
      const snapshot = await getDocs(collection(db, "users", user.uid, "wardrobe"));
      setPieces(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    };
    loadPieces();
  }, [user.uid]);

  const selectedPiece = useMemo(
    () => pieces.find((piece) => piece.id === pieceId),
    [pieces, pieceId]
  );

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!selectedPiece || !prompt.trim()) return;
    setSubmitting(true);
    try {
      const profileSnapshot = await getDoc(doc(db, "users", user.uid));
      const profileName = profileSnapshot.exists() ? profileSnapshot.data().name : "";
      const requestRef = await addDoc(collection(db, "styleRequests"), {
        createdBy: user.uid,
        creatorName: profileName || user.displayName || "Style lover",
        pieceId: selectedPiece.id,
        pieceOwnerId: user.uid,
        pieceName: selectedPiece.name,
        pieceImageUrl: selectedPiece.imageUrl || "",
        pieceCategory: selectedPiece.category || "",
        pieceTags: selectedPiece.tags || [],
        requestType,
        prompt: prompt.trim(),
        audience,
        status: "open",
        responseCount: 0,
        helpfulResponseId: null,
        createdAt: serverTimestamp(),
      });
      navigate(`/style-requests/${requestRef.id}`);
    } catch (error) {
      console.error("Could not create request", error);
      alert("We could not post your request. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f3ef] px-6 py-14 text-stone-800">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Style this with me</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Ask about one loved piece</h1>
        <p className="mt-4 leading-7 text-stone-600">
          Choose something from your wardrobe and tell the community what kind of
          inspiration would be useful.
        </p>

        {pieces.length === 0 ? (
          <div className="mt-10 border border-dashed border-stone-400 p-10 text-center">
            Add a piece to My Wardrobe before creating a styling request.
          </div>
        ) : (
          <form onSubmit={submitRequest} className="mt-10 space-y-8 bg-white p-6 md:p-10">
            <label className="block text-sm font-medium text-stone-700">
              Which piece are we styling?
              <select
                value={pieceId}
                onChange={(event) => setPieceId(event.target.value)}
                required
                className="mt-2 w-full border border-stone-300 bg-white px-4 py-3"
              >
                <option value="">Choose a piece</option>
                {pieces.map((piece) => (
                  <option key={piece.id} value={piece.id}>
                    {piece.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedPiece?.imageUrl && (
              <img
                src={selectedPiece.imageUrl}
                alt={selectedPiece.name}
                className="max-h-80 w-full object-cover"
              />
            )}

            <label className="block text-sm font-medium text-stone-700">
              What kind of help would you like?
              <select
                value={requestType}
                onChange={(event) => setRequestType(event.target.value)}
                className="mt-2 w-full border border-stone-300 bg-white px-4 py-3"
              >
                {REQUEST_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-stone-700">
              Your styling question
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                required
                maxLength={500}
                rows={5}
                placeholder="How could I wear this dress in early fall without making it feel too formal?"
                className="mt-2 w-full border border-stone-300 px-4 py-3 leading-6"
              />
              <span className="mt-1 block text-right text-xs text-stone-400">
                {prompt.length}/500
              </span>
            </label>

            <label className="block text-sm font-medium text-stone-700">
              Who should this be matched with?
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="mt-2 w-full border border-stone-300 bg-white px-4 py-3"
              >
                <option value="similar">People with the same or similar pieces</option>
                <option value="everyone">Everyone</option>
                <option value="connections">My style connections</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-stone-900 px-6 py-3 text-white hover:bg-rose-800 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Invite the community to style it"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
