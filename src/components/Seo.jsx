import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'Chirkut Ghor | Handmade Gifts in Bangladesh';
const DEFAULT_DESCRIPTION =
  'Handmade gifts, surprise boxes, jewelry, flowers, and decor with fast delivery across Bangladesh.';

const normalizeUrl = (baseUrl, path) => {
  if (!path) {
    return baseUrl;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }

  return `${baseUrl}/${path}`;
};

const resolveImageUrl = (baseUrl, image) => {
  if (!image) {
    return '';
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return normalizeUrl(baseUrl, image);
};

const Seo = ({ title, description, path, image, noIndex = false, schema }) => {
  const baseUrl = (import.meta?.env?.VITE_SITE_URL || 'https://your-domain.com').replace(/\/+$/, '');
  const canonical = normalizeUrl(baseUrl, path || '/');
  const metaTitle = title || DEFAULT_TITLE;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const imageUrl =
    resolveImageUrl(baseUrl, image) || normalizeUrl(baseUrl, '/Chirkut-Ghor-logo-1.png');

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content="Chirkut Ghor" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      {schema ? (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      ) : null}
    </Helmet>
  );
};

export default Seo;
