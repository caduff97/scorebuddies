import React from 'react';

const Privacy: React.FC = () => (
  <div className="min-h-screen bg-gray-100 py-10 px-4">
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 text-gray-700 text-sm leading-relaxed">
      <a href="/" className="text-primary-600 hover:underline text-sm">
        &larr; Back to ScoreBuddies
      </a>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-4">Privacy Policy</h1>

      <p className="mb-3">
        ScoreBuddies is a simple scorekeeping app. We keep data collection to a
        minimum.
      </p>

      <h2 className="font-semibold text-gray-900 mt-5 mb-2">What we store</h2>
      <p className="mb-3">
        Your game data (player names and scores) is stored only in your own
        browser (localStorage). It is not sent to us, except when you choose to
        share a live scoreboard. In that case, the current scores are relayed to
        the people you share the link with.
      </p>

      <h2 className="font-semibold text-gray-900 mt-5 mb-2">Analytics</h2>
      <p className="mb-3">
        We use privacy-friendly, aggregate traffic analytics (via Cloudflare)
        that do not identify you personally.
      </p>

      <h2 className="font-semibold text-gray-900 mt-5 mb-2">Advertising</h2>
      <p className="mb-3">
        We may show ads from Google AdSense. Google and its partners may use
        cookies or device identifiers to serve and measure ads. Learn more and
        manage your choices at{' '}
        <a
          className="text-primary-600 hover:underline"
          href="https://policies.google.com/technologies/ads"
        >
          Google&apos;s ad policies
        </a>
        .
      </p>

      <h2 className="font-semibold text-gray-900 mt-5 mb-2">Contact</h2>
      <p className="mb-3">
        Questions? Email{' '}
        <a className="text-primary-600 hover:underline" href="mailto:carlos@carlosef.com">
          carlos@carlosef.com
        </a>
        .
      </p>

      <p className="text-xs text-gray-400 mt-6">Last updated: November 2026.</p>
    </div>
  </div>
);

export default Privacy;
