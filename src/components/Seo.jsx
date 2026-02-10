import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_TITLE = 'RongRani | Handmade Gifts in Bangladesh';
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
  const { language } = useLanguage();

  const baseUrl = (import.meta?.env?.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const canonical = normalizeUrl(baseUrl, path || '/');
  const metaTitle = title || DEFAULT_TITLE;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const imageUrl =
    resolveImageUrl(baseUrl, image) || normalizeUrl(baseUrl, '/Chirkut-Ghor-logo-1.png');

  const htmlLang = language === 'bn' ? 'bn' : 'en';
  const ogLocale = language === 'bn' ? 'bn_BD' : 'en_BD';

  return (
    <Helmet htmlAttributes={{ lang: htmlLang }}>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content="RongRani" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:country-name" content="Bangladesh" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${metaTitle} - RongRani`} />
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
