import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div
      className="min-h-screen relative"
    
    >
      {/* 🌸 Warm Overlay */}
      <div className="absolute inset-0 bg-rose-100 bg-opacity-30 backdrop-blur-sm"></div>

      <div className="relative z-10 flex items-center justify-center h-full px-6 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-rose-800 mb-6 leading-snug">
            Give Your Wardrobe the Attention It Deserves
          </h1>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            A space where getting dressed becomes a return to yourself.
            Where clothing is seen, not consumed.
            Where your wardrobe begins to breathe.
          </p>

          <div className="space-y-4 text-sm text-gray-600 mb-10 leading-relaxed">
            <p>Reflect on the pieces you already love.</p>
            <p>Style with intention, not urgency.</p>
            <p>Share as a form of presence, not performance.</p>
          </div>

          <Link
            to="/login"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full shadow hover:bg-rose-700 transition"
          >
            Enter Your Wardrobe
          </Link>

          <p className="mt-6 text-xs text-gray-500 italic">
            This isn’t about having more. It’s about noticing more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
