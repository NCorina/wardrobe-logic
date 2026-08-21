import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-[#f8f1ec] text-stone-800">
      {/* Hero */}
      <section className="border-b border-rose-200 bg-gradient-to-b from-rose-100 to-[#f8f1ec] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-rose-700">
            Clothing appreciation · Personal style · Creative rewearing
          </p>

          <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight text-stone-900 md:text-6xl">
            Love your clothes longer. Develop a style that is yours.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-stone-600 md:text-xl">
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-stone-600 md:text-xl">
  Wardrobe Logics is a slow-fashion styling community centered on the
  clothes you already value. Curate your most-loved pieces, explore new
  ways to wear each centerpiece, and develop your personal style through
  shared interpretations and thoughtful advice.
</p>
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="bg-rose-700 px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-800"
            >
              Create my loved wardrobe
            </Link>

            <Link
              to="/library"
              className="border border-stone-500 bg-white px-7 py-3 text-sm font-medium text-stone-800 transition hover:border-rose-700 hover:text-rose-700"
            >
              Explore loved pieces
            </Link>
          </div>

          <p className="mt-5 text-sm text-stone-500">
            You do not need to catalog everything—only the pieces worth
            celebrating.
          </p>
        </div>
      </section>

      {/* One-piece philosophy */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-rose-700">
          One piece. Many possibilities.
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-stone-900 md:text-4xl">
          Every outfit begins with one centerpiece.
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-stone-600">
          Start with a piece you love—from a simple favorite to an extraordinary
          statement piece. See what different people build around it, or share
          your own interpretation.
        </p>
      </section>

      {/* Core value */}
      <section className="mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="border border-stone-300 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
              Appreciate
            </p>

            <h2 className="mt-3 text-2xl font-medium text-stone-900">
              Keep a wardrobe of pieces you love
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Photograph each piece beautifully by itself and record why it
              matters to you. Keep it private or add it to the public library
              when you want to show it off.
            </p>
          </article>

          <article className="border border-stone-300 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
              Interpret
            </p>

            <h2 className="mt-3 text-2xl font-medium text-stone-900">
              Show what you built around it
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Add styled photographs to a centerpiece and explore how other
              people wore the same or a similar piece. One garment can have many
              lives.
            </p>
          </article>

          <article className="border border-stone-300 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
              Connect
            </p>

            <h2 className="mt-3 text-2xl font-medium text-stone-900">
              Find people who understand your taste
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Meet people through shared pieces and styling sensibilities.
              Exchange inspiration, ask questions, and build style friendships
              around what you genuinely enjoy wearing.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-stone-900 px-6 py-16 text-white">
  <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-rose-200">
        Slow fashion through appreciation
      </p>

      <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
        New styling possibilities—not necessarily new clothes.
      </h2>
    </div>

    <div>
      <p className="text-lg leading-8 text-stone-300">
        The longer we look at, understand, and experiment with what we own,
        the more value our clothes can hold. Wardrobe Logics helps each loved
        piece become a starting point for creativity rather than something
        forgotten at the back of a wardrobe.
      </p>

      <p className="mt-5 leading-7 text-stone-400">
        See how others interpreted the same or a similar piece, revisit your
        own styling history, and build a clearer sense of what feels like you.
      </p>
    </div>
  </div>
</section>

      {/* Seeker and advisor */}
      <section className="border-y border-rose-200 bg-rose-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-rose-700">
              Participate your way
            </p>

            <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-4xl">
              Seek inspiration, share your eye for style—or do both.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
                Style seeker
              </p>

              <h3 className="mt-3 text-2xl font-medium text-stone-900">
                Reimagine a piece you already own
              </h3>

              <p className="mt-4 leading-7 text-stone-600">
                Ask how others would style your centerpiece, or discover someone
                with the exact or a similar piece and see how they made it their
                own.
              </p>

              <Link
                to="/style-requests"
                className="mt-6 inline-block font-medium text-rose-700 underline decoration-rose-300 underline-offset-4"
              >
                Browse style questions
              </Link>
            </article>

            <article className="bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
                Style advisor
              </p>

              <h3 className="mt-3 text-2xl font-medium text-stone-900">
                Turn your styling instinct into inspiration
              </h3>

              <p className="mt-4 leading-7 text-stone-600">
                Share how you styled pieces you love, respond to questions, and
                help someone see new possibilities—especially when you own
                something similar.
              </p>

              <Link
                to="/share-a-look"
                className="mt-6 inline-block font-medium text-rose-700 underline decoration-rose-300 underline-offset-4"
              >
                Share a styling interpretation
              </Link>
            </article>
          </div>

          <p className="mt-7 text-center text-sm text-stone-600">
            You never have to choose one role permanently. Move between seeking
            and sharing whenever you like.
          </p>
        </div>
      </section>

      {/* Body-positive promise */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-700">
          Your clothes. Your comfort. Your interpretation.
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-stone-900 md:text-4xl">
          Celebrate personal style without prescribing what anyone should wear.
        </h2>

        <p className="mx-auto mt-5 max-w-3xl leading-7 text-stone-600">
          Photograph a piece alone, share a complete outfit, crop the image, or
          keep your wardrobe private. Your body and face never need to be visible.
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-stone-900 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-200">
            More than an outfit feed
          </p>

          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Give the clothes you love more ways to be worn.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-300">
            Add one favorite piece, make it your centerpiece, and discover where
            shared taste can lead.
          </p>

          <Link
            to="/login"
            className="mt-8 inline-block bg-rose-600 px-7 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Add my first loved piece
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;