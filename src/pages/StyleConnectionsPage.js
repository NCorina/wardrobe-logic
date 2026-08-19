import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { StylistReputation } from "../components/StylistReputation";

export default function StyleConnectionsPage({ user }) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const unsubscribeFollowing = onSnapshot(
      query(collection(db, "styleFollows"), where("followerId", "==", user.uid)),
      (snapshot) => setFollowing(snapshot.docs.map((item) => item.data()))
    );
    const unsubscribeFollowers = onSnapshot(
      query(collection(db, "styleFollows"), where("followedId", "==", user.uid)),
      (snapshot) => setFollowers(snapshot.docs.map((item) => item.data()))
    );
    return () => {
      unsubscribeFollowing();
      unsubscribeFollowers();
    };
  }, [user.uid]);

  const followerIds = useMemo(
    () => new Set(followers.map((connection) => connection.followerId)),
    [followers]
  );
  const friends = following.filter((connection) => followerIds.has(connection.followedId));
  const followingOnly = following.filter(
    (connection) => !followerIds.has(connection.followedId)
  );

  const ConnectionCard = ({ connection, friend = false }) => (
    <article className="border border-stone-300 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
        {friend ? "Style friend" : "Following"}
      </p>
      <h2 className="mt-2 text-xl text-stone-900">
        {connection.followedName || "Style lover"}
      </h2>
      <StylistReputation userId={connection.followedId} />
    </article>
  );

  return (
    <main className="min-h-screen bg-[#f8f3ef] px-6 py-14 text-stone-800">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Your community</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Style connections</h1>
        <p className="mt-4 max-w-2xl leading-7 text-stone-600">
          Follow people whose ideas inspire you. When you follow each other, you
          become style friends.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl text-stone-900">Style friends</h2>
          {friends.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {friends.map((connection) => (
                <ConnectionCard
                  key={connection.followedId}
                  connection={connection}
                  friend
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-500">
              Mutual follows will appear here as style friendships.
            </p>
          )}
        </section>

        <section className="mt-12 border-t border-stone-300 pt-10">
          <h2 className="text-2xl text-stone-900">Following</h2>
          {followingOnly.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {followingOnly.map((connection) => (
                <ConnectionCard key={connection.followedId} connection={connection} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-500">
              Follow a stylist from one of their responses to see them here.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
