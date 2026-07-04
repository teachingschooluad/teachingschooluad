import React, { useEffect, useRef } from 'react';

export default function AdSenseBanner({
  client = 'ca-pub-6158041650593302', // Ganti dengan Client ID Anda
  slot = '1234567890',              // Ganti dengan Ad Slot ID Anda
  format = 'auto',
  responsive = 'true',
  style = { display: 'block', minHeight: '90px' }
}) {
  const adRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Hindari push berulang kali pada saat re-render (terutama di React Strict Mode)
    if (!initialized.current && window) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  return (
    <div className="ads-container" style={{ margin: '16px 0', textAlign: 'center' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
