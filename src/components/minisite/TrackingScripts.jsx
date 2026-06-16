import { useEffect } from 'react';

export default function TrackingScripts({ integrations }) {
  const gaId = integrations?.googleAnalyticsId?.trim();
  const pixelId = integrations?.facebookPixelId?.trim();
  const hotjarId = integrations?.hotjarId?.trim();

  useEffect(() => {
    if (!gaId && !pixelId && !hotjarId) return undefined;

    const scripts = [];

    if (gaId) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(gaScript);
      scripts.push(gaScript);

      const gaInit = document.createElement('script');
      gaInit.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, '')}');`;
      document.head.appendChild(gaInit);
      scripts.push(gaInit);
    }

    if (pixelId) {
      const fbInit = document.createElement('script');
      fbInit.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId.replace(/'/g, '')}');fbq('track','PageView');`;
      document.head.appendChild(fbInit);
      scripts.push(fbInit);
    }

    if (hotjarId) {
      const hjInit = document.createElement('script');
      hjInit.textContent = `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${hotjarId.replace(/\D/g, '')},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
      document.head.appendChild(hjInit);
      scripts.push(hjInit);
    }

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [gaId, pixelId, hotjarId]);

  return null;
}
