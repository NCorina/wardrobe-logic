import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export function useStylistReputation(userId) {
  const [ratings, setRatings] = useState([]);
  const [helpRecords, setHelpRecords] = useState([]);

  useEffect(() => {
    if (!userId) return undefined;
    const unsubscribeRatings = onSnapshot(
      query(collection(db, "styleRatings"), where("ratedUserId", "==", userId)),
      (snapshot) =>
        setRatings(
          snapshot.docs
            .map((item) => item.data())
            .filter((rating) => rating.ratingType === "stylist")
        )
    );
    const unsubscribeHelp = onSnapshot(
      query(collection(db, "styleHelp"), where("helperId", "==", userId)),
      (snapshot) => setHelpRecords(snapshot.docs.map((item) => item.data()))
    );
    return () => {
      unsubscribeRatings();
      unsubscribeHelp();
    };
  }, [userId]);

  return useMemo(() => {
    const peopleHelped = new Set(helpRecords.map((record) => record.helpedUserId)).size;
    const average = ratings.length
      ? ratings.reduce((total, rating) => total + Number(rating.score || 0), 0) /
        ratings.length
      : 0;
    const badges = [];
    if (peopleHelped >= 1) badges.push("First Assist");
    if (peopleHelped >= 3) badges.push("Helpful Stylist");
    if (peopleHelped >= 10) badges.push("Style Mentor");
    if (ratings.length >= 3 && average >= 4.5) badges.push("Community Favorite");
    return { average, ratingCount: ratings.length, peopleHelped, badges };
  }, [ratings, helpRecords]);
}

export function StylistReputation({ userId, compact = false }) {
  const reputation = useStylistReputation(userId);

  return (
    <div className={compact ? "mt-2" : "mt-3 border-l-2 border-rose-200 pl-3"}>
      <p className="text-xs text-stone-500">
        {reputation.ratingCount
          ? `${reputation.average.toFixed(1)} / 5 · ${reputation.ratingCount} helpful-response ${
              reputation.ratingCount === 1 ? "rating" : "ratings"
            }`
          : "New stylist"}
        {` · ${reputation.peopleHelped} ${
          reputation.peopleHelped === 1 ? "person" : "people"
        } helped`}
      </p>
      {reputation.badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {reputation.badges.map((badge) => (
            <span
              key={badge}
              className="bg-rose-100 px-2 py-1 text-[10px] uppercase tracking-wider text-rose-800"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function FollowStylistButton({ currentUser, stylistId, stylistName }) {
  const [following, setFollowing] = useState(false);
  const [followedByStylist, setFollowedByStylist] = useState(false);
  const [saving, setSaving] = useState(false);
  const followId = currentUser && stylistId ? `${currentUser.uid}_${stylistId}` : "";

  useEffect(() => {
    if (!followId) return undefined;
    return onSnapshot(doc(db, "styleFollows", followId), (snapshot) => {
      setFollowing(snapshot.exists());
    });
  }, [followId]);

  useEffect(() => {
    if (!currentUser || !stylistId) return undefined;
    return onSnapshot(
      doc(db, "styleFollows", `${stylistId}_${currentUser.uid}`),
      (snapshot) => setFollowedByStylist(snapshot.exists())
    );
  }, [currentUser, stylistId]);

  if (!currentUser || !stylistId || currentUser.uid === stylistId) return null;

  const toggleFollow = async () => {
    setSaving(true);
    try {
      const followReference = doc(db, "styleFollows", followId);
      if (following) {
        await deleteDoc(followReference);
      } else {
        const profileSnapshot = await getDoc(doc(db, "users", currentUser.uid));
        const followerName = profileSnapshot.exists()
          ? profileSnapshot.data().name || ""
          : "";
        await setDoc(followReference, {
          followerId: currentUser.uid,
          followerName: followerName || currentUser.displayName || "Style lover",
          followedId: stylistId,
          followedName: stylistName || "Style lover",
          createdAt: serverTimestamp(),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={saving}
      className="mt-3 border border-rose-300 px-3 py-2 text-xs text-rose-800 hover:bg-rose-50 disabled:opacity-50"
    >
      {saving
        ? "Saving…"
        : following && followedByStylist
          ? "Style friends · Unfollow"
          : following
            ? "Following · Unfollow"
            : followedByStylist
              ? "Follow back"
              : "Follow stylist"}
    </button>
  );
}

export function ReciprocalHelpBadge({ requesterId, responderId }) {
  const [reciprocal, setReciprocal] = useState(false);

  useEffect(() => {
    if (!requesterId || !responderId) return undefined;
    return onSnapshot(
      query(collection(db, "styleHelp"), where("helperId", "==", requesterId)),
      (snapshot) => {
        setReciprocal(
          snapshot.docs.some((item) => item.data().helpedUserId === responderId)
        );
      }
    );
  }, [requesterId, responderId]);

  if (!reciprocal) return null;
  return (
    <p className="mt-3 text-xs font-medium text-rose-700">
      ↔ Reciprocal help — this requester has helped this stylist before
    </p>
  );
}
