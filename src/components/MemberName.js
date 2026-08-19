import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function MemberName({ userId, fallback = "Style lover" }) {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!userId) return undefined;
    return onSnapshot(doc(db, "publicProfiles", userId), (snapshot) => {
      setDisplayName(snapshot.exists() ? snapshot.data().displayName || "" : "");
    });
  }, [userId]);

  return <>{displayName || fallback}</>;
}
