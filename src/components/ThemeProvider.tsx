"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const themes = {
  orange: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 500: '#f97316', 600: '#ea580c', 700: '#c2410c'
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8'
  },
  green: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 500: '#10b981', 600: '#059669', 700: '#047857'
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c'
  },
  purple: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9'
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<keyof typeof themes>('orange');

  useEffect(() => {
    // Busca a cor inicial
    const fetchTheme = async () => {
      const { data } = await supabase.from('platform_settings').select('theme_color').eq('id', 1).single();
      if (data?.theme_color && themes[data.theme_color as keyof typeof themes]) {
        setTheme(data.theme_color as keyof typeof themes);
      }
    };
    fetchTheme();

    // Escuta mudanças em tempo real (quando você salvar no painel, muda na hora!)
    const channel = supabase.channel('theme_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings' }, (payload) => {
        if (payload.new.theme_color && themes[payload.new.theme_color as keyof typeof themes]) {
          setTheme(payload.new.theme_color as keyof typeof themes);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const colors = themes[theme] || themes.orange;

  return (
    <>
      {/* Este bloco CSS injetado substitui as cores padrão do Tailwind dinamicamente */}
      <style>{`
        :root {
          --theme-50: ${colors[50]};
          --theme-100: ${colors[100]};
          --theme-200: ${colors[200]};
          --theme-500: ${colors[500]};
          --theme-600: ${colors[600]};
          --theme-700: ${colors[700]};
        }
        .bg-orange-50 { background-color: var(--theme-50) !important; }
        .bg-orange-100 { background-color: var(--theme-100) !important; }
        .bg-orange-200 { background-color: var(--theme-200) !important; }
        .bg-orange-500 { background-color: var(--theme-500) !important; }
        .bg-orange-600 { background-color: var(--theme-600) !important; }
        
        .text-orange-500 { color: var(--theme-500) !important; }
        .text-orange-600 { color: var(--theme-600) !important; }
        .text-orange-700 { color: var(--theme-700) !important; }
        
        .border-orange-100 { border-color: var(--theme-100) !important; }
        .border-orange-200 { border-color: var(--theme-200) !important; }
        .border-orange-500 { border-color: var(--theme-500) !important; }
        
        .ring-orange-500 { --tw-ring-color: var(--theme-500) !important; }
        .shadow-orange-100 { --tw-shadow-color: var(--theme-100) !important; --tw-shadow: var(--tw-shadow-colored) !important; }
        
        /* Estados de Hover (quando passa o mouse) */
        .hover\\:bg-orange-50:hover { background-color: var(--theme-50) !important; }
        .hover\\:bg-orange-100:hover { background-color: var(--theme-100) !important; }
        .hover\\:bg-orange-500:hover { background-color: var(--theme-500) !important; }
        .hover\\:bg-orange-600:hover { background-color: var(--theme-600) !important; }
        .hover\\:text-orange-500:hover { color: var(--theme-500) !important; }
        .hover\\:text-orange-600:hover { color: var(--theme-600) !important; }
        .hover\\:border-orange-500:hover { border-color: var(--theme-500) !important; }
      `}</style>
      {children}
    </>
  );
};