// src/components/Auth.js
import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import laundryImage from "../assets/laundry.jpg"; // ✅ Make sure this path is correct

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${laundryImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: 30,
          borderRadius: 12,
          maxWidth: 400,
          width: "90%",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>
          {isNewUser ? "Create Account" : "Log In"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginBottom: 20 }}
          />
          <button type="submit" style={{ width: "100%", padding: 10 }}>
            {isNewUser ? "Sign Up" : "Log In"}
          </button>
        </form>
        <br />
        <button onClick={handleGoogleLogin} style={{ width: "100%", padding: 10 }}>
          Continue with Google
        </button>
        <br />
        <br />
        <button onClick={() => setIsNewUser(!isNewUser)} style={{ fontSize: "0.9rem", textDecoration: "underline" }}>
          {isNewUser ? "Already have an account?" : "Create a new account"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
