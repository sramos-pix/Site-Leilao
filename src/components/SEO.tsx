import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = 'AutoBid - Leilões de Veículos',
  description = 'A melhor plataforma de leilões de veículos. Encontre carros, motos e caminhões com os melhores preços do mercado.',
  keywords = 'leilão de carros, leilão de motos, leilão de veículos, comprar carro barato, autobid',
  image = '/og-image.jpg', // You should add a default OG image to your public folder
  url = 'https://autobid.com.br',
  type = 'website',
}: SEOProps) {
  const siteTitle = title.includes('AutoBid') ? title : `${title} | AutoBid`;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
