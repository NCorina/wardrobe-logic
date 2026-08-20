import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-[#f8f1ec] text-stone-800">
      <section className="border-b border-rose-200 bg-gradient-to-b from-rose-100 to-[#f8f1ec] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-rose-700">
            Real clothes. Real bodies. Real style.
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight text-stone-900 md:text-6xl">
            Love what you wear—and help someone else love getting dressed.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600 md:text-xl">
            Wardrobe Logics is a body-positive style community where you can get
            fresh ideas for clothes you already own, share your styling talent,
            and find style friends who understand your taste.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="bg-rose-700 px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-800"
            >
              Join the style community
            </Link>
            <Link
              to="/style-requests"
              className="border border-stone-500 bg-white px-7 py-3 text-sm font-medium text-stone-800 transition hover:border-rose-700 hover:text-rose-700"
            >
              Explore style requests
            </Link>
          </div>

          <p className="mt-5 text-sm text-stone-500">
            No perfect body, designer wardrobe, or styling expertise required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="border border-stone-300 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Ask</p>
            <h2 className="mt-3 text-2xl font-medium text-stone-900">
              Get unstuck with a piece you own
            </h2>
            <p className="mt-4 leading-7 text-stone-600">
              Share one loved—or challenging—piece and ask the community how they
              would wear it. Get ideas shaped around your style, comfort, and life.
            </p>
          </article>

          <article className="border border-stone-300 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Share</p>
            <h2 className="mt-3 text-2xl font-medium text-stone-900">
              Turn your style instinct into help
            </h2>
            <p className="mt-4 leading-7 text-stone-600">
              If styling comes naturally to you, respond with combinations,
              encouragement, and practical ideas that help another person feel good.
            </p>
          </article>

          <article className="border border-stone-300 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Connect</p>
            <h2 className="mt-3 text-2xl font-medium text-stone-900">
              Find your style people
            </h2>
            <p className="mt-4 leading-7 text-stone-600">
              Discover people who own the same or similar pieces, appreciate your
              aesthetic, and make fashion feel creative, welcoming, and social.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-stone-900 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-200">
            One piece. Many possibilities.
          </p>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Style is not a body type. It is a way of expressing who you are.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-300">
            Celebrate the clothes you genuinely love, see how others make them their
            own, and pass your creativity forward.
          </p>
          <Link
            to="/library"
            className="mt-8 inline-block bg-rose-600 px-7 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Browse the wardrobe library
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
