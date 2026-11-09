import React from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, CreditCard } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenCustomizer: () => void;
  onOpenTracker: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenCustomizer,
  onOpenTracker,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800" id="contactos">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#FF6B00] text-black flex items-center justify-center font-black font-display text-lg">
                Q
              </span>
              <span className="text-xl font-black font-display text-white uppercase tracking-tight">
                Quieto <span className="text-[#FF6B00]">Angola</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Gráfica digital de referência em Luanda especializada na personalização de T-shirts, vestuário de trabalho e brindes corporativos. Qualidade industrial, estamparia DTF e entrega em todo o território nacional.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p><strong>NIF:</strong> 5418293021 · Registo Comercial de Luanda</p>
              <p><strong>Certificação:</strong> Empresa Parceira Autorizada EMIS</p>
            </div>
          </div>

          {/* Col 2: Serviços & Estúdio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              Personalização
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>
                <button onClick={onOpenCustomizer} className="hover:text-white transition-colors">
                  Estúdio 3D em Tempo Real
                </button>
              </li>
              <li>
                <a href="#catalogo" onClick={() => onNavigateSection('catalogo')} className="hover:text-white transition-colors">
                  T-shirts & Polos Piquet
                </a>
              </li>
              <li>
                <a href="#catalogo" onClick={() => onNavigateSection('catalogo')} className="hover:text-white transition-colors">
                  Brindes Executivos de Luxo
                </a>
              </li>
              <li>
                <a href="#catalogo" onClick={() => onNavigateSection('catalogo')} className="hover:text-white transition-colors">
                  Canecas & Copos Stanley
                </a>
              </li>
              <li>
                <a href="#catalogo" onClick={() => onNavigateSection('catalogo')} className="hover:text-white transition-colors">
                  Sacolas de Pano Cru & Eventos
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Apoio & Ferramentas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              Ferramentas
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); onNavigateSection('portfolio'); }} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Portfólio de Brindes & Frota</span>
                  <span className="text-[10px] text-[#FF6B00]">★</span>
                </a>
              </li>
              <li>
                <a href="#orcamento-rapido" onClick={() => onNavigateSection('orcamento-rapido')} className="hover:text-white transition-colors">
                  Calculadora de Orçamento
                </a>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-white transition-colors">
                  Rastrear Estado do Pedido
                </button>
              </li>
              <li>
                <a href="#orcamento-rapido" onClick={() => onNavigateSection('orcamento-rapido')} className="hover:text-white transition-colors">
                  Emissão de Proforma AGT
                </a>
              </li>
              {onOpenAdmin && (
                <li>
                  <button onClick={onOpenAdmin} className="text-[#FF6B00] hover:underline font-semibold flex items-center gap-1">
                    <span>🔒 Área de Gestão / Admin</span>
                  </button>
                </li>
              )}
              <li>
                <a href="https://wa.me/244923000000" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Atendimento WhatsApp Oficial
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contactos Luanda */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              Instalações & Contactos
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span>Via Expressa, Km 14, Talatona, Luanda, Angola</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>+244 923 000 000 / 940 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>comercial@quietoangola.ao</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span>Seg a Sex: 08h-18h | Sáb: 08h-13h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Métodos de Pagamento Angolanos:</span>
            <span className="text-white font-semibold">Multicaixa Express</span>
            <span>·</span>
            <span className="text-white font-semibold">Referência EMIS</span>
            <span>·</span>
            <span className="text-white font-semibold">TPA Móvel Luanda</span>
            <span>·</span>
            <span className="text-white font-semibold">BAI / BFA</span>
          </div>

          <div>
            © 2026 Quieto Angola, Lda. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};
