import { Helmet } from 'react-helmet-async';
import {
  SEO_BASE_URL,
  SEO_DEFAULT_TITLE,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_IMAGE,
  toAbsoluteUrl,
} from '../../utils/seoConfig';

export default function SeoHead({
  titre,
  description,
  image = SEO_DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd = null,
  noIndex = false,
}) {
  const titreComplet = titre
    ? `${titre} | G-List`
    : SEO_DEFAULT_TITLE;

  const descriptionFinale = description || SEO_DEFAULT_DESCRIPTION;

  const urlComplete = url
    ? toAbsoluteUrl(url)
    : SEO_BASE_URL;

  const imageComplete = toAbsoluteUrl(image);

  return (
    <Helmet>
      <title>{titreComplet}</title>
      <meta name="description" content={descriptionFinale} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={urlComplete} />

      <meta property="og:title" content={titreComplet} />
      <meta property="og:description" content={descriptionFinale} />
      <meta property="og:image" content={imageComplete} />
      <meta property="og:url" content={urlComplete} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="G-List" />
      <meta property="og:locale" content="fr_GN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={titreComplet} />
      <meta name="twitter:description" content={descriptionFinale} />
      <meta name="twitter:image" content={imageComplete} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
