// src/pages/ProfileSetup.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
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
