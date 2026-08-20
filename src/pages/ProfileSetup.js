// src/pages/ProfileSetup.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [styleBio, setStyleBio] = useState("");
  const [styleSpecialties, setStyleSpecialties] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setName(data.name || "");
        setLocation(data.location || "");
      }
      const publicProfileSnap = await getDoc(doc(db, "publicProfiles", user.uid));
      if (publicProfileSnap.exists()) {
        const publicData = publicProfileSnap.data();
        setStyleBio(publicData.styleBio || "");
        setStyleSpecialties(
          Array.isArray(publicData.styleSpecialties)
            ? publicData.styleSpecialties.join(", ")
            : publicData.styleSpecialties || ""
        );
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      name,
      location,
      email: user.email,
    }, { merge: true });
    await setDoc(doc(db, "publicProfiles", user.uid), {
      displayName: name.trim(),
      styleBio: styleBio.trim(),
      styleSpecialties: styleSpecialties
        .split(",")
        .map((specialty) => specialty.trim().toLowerCase())
        .filter(Boolean),
    }, { merge: true });
    await updateProfile(user, { displayName: name.trim() });

    alert("Profile updated!");
    navigate("/wardrobe");
  };

  if (loading) return <p className="p-4">Loading profile...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4 text-rose-700">Set Up Your Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
          maxLength={40}
        />
        <input
          type="text"
          placeholder="Where are you from?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <div className="border-t border-stone-200 pt-4">
          <p className="mb-3 text-sm font-medium text-stone-700">Public style profile</p>
          <p className="mb-3 text-xs leading-5 text-stone-500">
            Your display name, style introduction, and specialties are public.
            Your email and location are never shown on this profile.
          </p>
          <textarea
            placeholder="A short introduction to your style or the kind of help you enjoy giving"
            value={styleBio}
            onChange={(e) => setStyleBio(e.target.value)}
            maxLength={240}
            rows={4}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Style specialties, separated by commas"
            value={styleSpecialties}
            onChange={(e) => setStyleSpecialties(e.target.value)}
            maxLength={160}
            className="mt-3 w-full border p-2 rounded"
          />
          <p className="mt-1 text-xs text-stone-500">
            For example: color, vintage, petite proportions, workwear, layering
          </p>
        </div>
        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded w-full"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
