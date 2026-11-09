import { Product, PrintTechnique, TechniqueInfo } from '../types';

export const PRINT_TECHNIQUES: Record<PrintTechnique, TechniqueInfo> = {
  dtf: {
    id: 'dtf',
    name: 'DTF Têxtil (Direct-to-Film)',
    description: 'Impressão digital em alta definição sem limite de cores. Toque suave e alta resistência a lavagens.',
    pricePerUnit: 1200,
    recommendedFor: 'T-shirts, Hoodies, Polos e Sacolas de algodão',
    minQty: 1
  },
  serigrafia: {
    id: 'serigrafia',
    name: 'Serigrafia Tradicional',
    description: 'Ideal para tiragens médias e grandes (+25 unidades). Cores vivas e máxima durabilidade industrial.',
    pricePerUnit: 700,
    recommendedFor: 'Grandes eventos, uniformes e t-shirts corporativas',
    minQty: 25
  },
  bordado: {
    id: 'bordado',
    name: 'Bordado Computorizado HD',
    description: 'Acabamento executivo em relevo de luxo. Fios de alta resistência com matriz precisa.',
    pricePerUnit: 2500,
    recommendedFor: 'Polos, Bonés, Hoodies e Coletes',
    minQty: 10
  },
  sublimacao: {
    id: 'sublimacao',
    name: 'Sublimação Térmica',
    description: 'Fusão molecular direta na peça. Não racha e não desbota. Acabamento fotográfico.',
    pricePerUnit: 900,
    recommendedFor: 'Canecas de cerâmica, cordões e tecidos técnicos',
    minQty: 5
  },
  laser: {
    id: 'laser',
    name: 'Gravação Laser de Precisão',
    description: 'Gravação milimétrica permanente de logotipos e nomes em metal, madeira ou couro sintético.',
    pricePerUnit: 1500,
    recommendedFor: 'Garrafas térmicas, Kits executivos, canetas e porta-chaves',
    minQty: 5
  }
};

export const COLOR_OPTIONS = [
  { name: 'Preto Intenso', hex: '#121212', class: 'bg-[#121212]' },
  { name: 'Branco Puro', hex: '#FFFFFF', class: 'bg-white border border-slate-300' },
  { name: 'Laranja Quieto', hex: '#FF6B00', class: 'bg-[#FF6B00]' },
  { name: 'Azul Marinho Luanda', hex: '#1E293B', class: 'bg-[#1E293B]' },
  { name: 'Cinza Mescla', hex: '#64748B', class: 'bg-[#64748B]' },
  { name: 'Vermelho Benguela', hex: '#DC2626', class: 'bg-[#DC2626]' },
  { name: 'Verde Militar', hex: '#2E4F32', class: 'bg-[#2E4F32]' },
  { name: 'Amarelo Ouro', hex: '#EAB308', class: 'bg-[#EAB308]' }
];

export const DEFAULT_CUSTOMIZER_PRODUCT: Product = {
  id: 'modelo-base-personalizacao',
  name: 'T-shirt Algodão Base (Modelo 3D)',
  category: 'vestuario',
  categoryLabel: 'T-shirts & Vestuário',
  basePrice: 4850,
  image: '/assets/aistudio/Sem_t_tulo-1-15_614126e0.jpg',
  description: 'Modelo técnico de referência para simulação 3D no estúdio e orçamentos instantâneos. O catálogo principal foi zerado para inserção manual pelo administrador.',
  minOrder: 1,
  availableColors: COLOR_OPTIONS,
  availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  supportedTechniques: ['dtf', 'serigrafia', 'bordado'],
  allowCustomizer: true,
  leadTimeDays: 2,
  featured: true
};

// Database zerada a pedido do utilizador / administrador para inserção manual personalizada
export const PRODUCTS: Product[] = [];


export const ANGOLAN_PROVINCES = [
  { name: 'Luanda (Entrega Direta no Dia)', fee: 2500, time: '24-48 horas' },
  { name: 'Benguela / Lobito', fee: 5500, time: '2-3 dias' },
  { name: 'Huambo', fee: 6000, time: '2-3 dias' },
  { name: 'Huíla (Lubango)', fee: 6500, time: '3-4 dias' },
  { name: 'Cabinda', fee: 7500, time: '2-3 dias (Aéreo)' },
  { name: 'Cuanza Sul (Sumbe/Porto Amboim)', fee: 5000, time: '2 dias' },
  { name: 'Uíge', fee: 5500, time: '2-3 dias' },
  { name: 'Namibe', fee: 7000, time: '3-4 dias' },
  { name: 'Malanje', fee: 5500, time: '2-3 dias' },
  { name: 'Zaire (Soyo/Mbanza Kongo)', fee: 6500, time: '3 dias' }
];

export const VOLUME_DISCOUNTS = [
  { min: 1, max: 9, discount: 0, label: 'Preço Regular' },
  { min: 10, max: 49, discount: 0.10, label: '10% de Desconto' },
  { min: 50, max: 99, discount: 0.18, label: '18% de Desconto' },
  { min: 100, max: 499, discount: 0.25, label: '25% de Desconto' },
  { min: 500, max: 9999, discount: 0.35, label: '35% de Desconto Atacado' }
];

export function calculateVolumeDiscount(qty: number): number {
  const tier = VOLUME_DISCOUNTS.find(t => qty >= t.min && qty <= t.max);
  return tier ? tier.discount : 0.35;
}

export function formatKz(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + ' Kz';
}
