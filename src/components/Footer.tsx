import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AUTO<span className="text-orange-500">BID</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              A plataforma líder em leilões de veículos online. Transparência, segurança e as melhores oportunidades do mercado automotivo.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="hover:text-orange-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-orange-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-orange-500 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auctions" className="hover:text-orange-500 transition-colors">Leilões Ativos</Link></li>
              <li><Link to="/how-it-works" className="hover:text-orange-500 transition-colors">Como Funciona</Link></li>
              <li><Link to="/help" className="hover:text-orange-500 transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacidade</Link></li>
              <li><Link to="/rules" className="hover:text-orange-500 transition-colors">Regras do Leilão</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-orange-500" />
                contato@autobid.com.br
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-orange-500" />
                0800 123 4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-500" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} AutoBid Leilões. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
