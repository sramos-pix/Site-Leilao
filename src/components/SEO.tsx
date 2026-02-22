import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

export function SEO({
  title = 'AutoBid - Leilões de Veículos',
  description = 'A melhor plataforma de leilões de veículos. Encontre carros, motos e caminhões com os melhores preços do mercado. Participe de leilões online com segurança.',
  keywords = 'leilão de carros, leilão de motos, leilão de veículos, comprar carro barato, autobid, leilão online, carros recuperados, leilão de frota, carros seminovos',
  image = '/og-image.jpg',
  url,
  type = 'website',
  schema,
}: SEOProps) {
  const siteTitle = title.includes('AutoBid') ? title : `${title} | AutoBid`;
  
  // Pega a URL atual dinamicamente se não for passada
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://autobid.com.br');

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL - Evita conteúdo duplicado no Google */}
      <link rel="canonical" href={currentUrl} />

      {/* Structured Data (JSON-LD) - Essencial para o Google entender o conteúdo */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
