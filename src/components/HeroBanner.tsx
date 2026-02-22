"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const HeroBanner = () => {
  const [banner, setBanner] = useState({ url: '', link: '', active: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('banner_url, banner_link, banner_active')
          .single();

        if (data && !error) {
          setBanner({
            url: data.banner_url || '',
            link: data.banner_link || '',
            active: data.banner_active || false
          });
        }
      } catch (error) {
        console.error("Erro ao carregar banner:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanner();
  }, []);

  // Se estiver carregando, se o banner estiver inativo, ou se não tiver imagem, não renderiza nada.
  if (loading || !banner.active || !banner.url) return null;

  const BannerImage = () => (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-[16/9] sm:aspect-[21/9] md:aspect-[4/1] bg-slate-100 group">
        <img
          src={banner.url}
          alt="Banner Promocional"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </div>
  );

  // Se tiver link, envolve a imagem com a tag <a> para ficar clicável
  if (banner.link) {
    return (
      <a 
        href={banner.link} 
        target={banner.link.startsWith('http') ? "_blank" : "_self"} 
        rel="noopener noreferrer" 
        className="block"
      >
        <BannerImage />
      </a>
    );
  }

  // Se não tiver link, mostra só a imagem
  return <BannerImage />;
};

export default HeroBanner;