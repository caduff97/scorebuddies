import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// Configure these via build-time env vars (.env):
//   REACT_APP_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//   REACT_APP_ADSENSE_SLOT=XXXXXXXXXX
// When the client id is absent, this component renders nothing, so the app
// stays clean until AdSense is approved and configured.
const ADSENSE_CLIENT = process.env.REACT_APP_ADSENSE_CLIENT || '';
const AD_SLOT = process.env.REACT_APP_ADSENSE_SLOT || '';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AdBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || dismissed) return;

    const scriptId = 'adsbygoogle-js';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }

    if (!pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* AdSense not ready yet; it retries on next render. */
      }
    }
  }, [dismissed]);

  if (!ADSENSE_CLIENT || dismissed) return null;

  return (
    <div className="relative bg-gray-100 border-b border-gray-200 print:hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 50 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss ad"
        className="absolute top-1 right-1 bg-white/70 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default AdBanner;
