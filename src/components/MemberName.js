import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

export default function MemberName({
  userId,
  fallback = "Style lover",
  linkToProfile = false,
  className = "",
}) {
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return undefined;
    return onSnapshot(doc(db, "publicProfiles", userId), (snapshot) => {
      setDisplayName(snapshot.exists() ? snapshot.data().displayName || "" : "");
    });
  }, [userId]);

  const name = displayName || fallback || "Style lover";

  if (linkToProfile && userId) {
    const openProfile = (event) => {
      event.preventDefault();
      event.stopPropagation();
      navigate(`/members/${userId}`);
    };

    return (
      <span
        role="link"
        tabIndex={0}
        onClick={openProfile}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") openProfile(event);
        }}
        className={`cursor-pointer ${
          className || "font-medium text-rose-700 underline hover:text-rose-900"
        }`}
      >
        {name}
      </span>
    );
  }

  return <>{name}</>;
}
