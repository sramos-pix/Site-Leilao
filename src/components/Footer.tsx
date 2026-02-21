"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Gavel, Instagram, Facebook, Twitter, MapPin, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-orange-500">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
                <Gavel size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                AUTO<span className="text-orange-500">BID</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-6 max-w-sm">
              Plataforma oficial de leilões de veículos. Garantimos total transparência, segurança jurídica e as melhores oportunidades do mercado automotivo nacional.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-slate-800 p-2.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="bg-slate-800 p-2.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><Facebook size={18} /></a>
              <a href="#" className="bg-slate-800 p-2.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><Twitter size={18} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Plataforma</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/auctions" className="hover:text-orange-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Leilões Ativos</Link></li>
              <li><Link to="/vehicles" className="hover:text-orange-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Todos os Veículos</Link></li>
              <li><Link to="/how-it-works" className="hover:text-orange-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Como Funciona</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Termos e Condições</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/edital" className="hover:text-orange-500 transition-colors">Regras do Edital</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Atendimento</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">0800 123 4567</p>
                  <p className="text-[10px] uppercase">Seg a Sex, 09h às 18h</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="font-bold text-white break-all">contato@autobid.com.br</p>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">Av. Paulista, 1000 - Bela Vista<br/>São Paulo - SP, 01310-100</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Leiloeiro Oficial Registrado</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-300">João Silva Leiloeiro</strong> - JUCESP Nº 1234<br/>
                AutoBid Leilões S.A. - CNPJ: 12.345.678/0001-90<br/>
                © {new Date().getFullYear()} Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="https://i.ibb.co/rf1Bk2N9/leilao-seguro.png" alt="Leilão Seguro" className="h-10 object-contain" />
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-white">SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;