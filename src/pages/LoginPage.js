// src/pages/LoginPage.js
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, provider);
      navigate("/wardrobe");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-rose-800 mb-6 text-center">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>

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
