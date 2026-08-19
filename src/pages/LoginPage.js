// src/pages/LoginPage.js
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const cleanName = displayName.trim();
        await updateProfile(credential.user, { displayName: cleanName });
        await Promise.all([
          setDoc(doc(db, "users", credential.user.uid), {
            name: cleanName,
            email: credential.user.email,
          }, { merge: true }),
          setDoc(doc(db, "publicProfiles", credential.user.uid), {
            displayName: cleanName,
          }, { merge: true }),
        ]);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/wardrobe");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);
      const googleName = credential.user.displayName || "Style lover";
      await Promise.all([
        setDoc(doc(db, "users", credential.user.uid), {
          name: googleName,
          email: credential.user.email,
        }, { merge: true }),
        setDoc(doc(db, "publicProfiles", credential.user.uid), {
          displayName: googleName,
        }, { merge: true }),
      ]);
      navigate("/wardrobe");
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setMessage("Enter your email address first, then select Forgot password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("If an account exists for this email, a password-reset link is on its way.");
    } catch (error) {
      console.error("Password reset failed", error);
      setMessage("We could not send the reset email. Check the address and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-rose-800 mb-6 text-center">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={40}
              className="w-full border border-gray-300 p-2 rounded"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />

          <button
            type="submit"
            className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600"
          >
            {isSignup ? "Sign Up" : "Log In"}
          </button>

          {!isSignup && (
            <button
              type="button"
              onClick={handlePasswordReset}
              className="w-full text-sm text-rose-700 underline hover:text-rose-900"
            >
              Forgot password?
            </button>
          )}
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600" role="status">
            {message}
          </p>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 py-2 rounded hover:bg-gray-100 text-sm"
          >
            🌸 Continue with Google
          </button>
        </div>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="text-rose-600 underline cursor-pointer"
          >
            {isSignup ? "Log in" : "Create one"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
