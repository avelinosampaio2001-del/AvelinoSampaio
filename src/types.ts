export type ProductCategory = 
  | 'todos'
  | 'vestuario'
  | 'brindes_executivos'
  | 'bebidas_termicos'
  | 'eventos_sacolas'
  | 'tecnologia';

export type PrintTechnique = 
  | 'dtf'
  | 'serigrafia'
  | 'bordado'
  | 'sublimacao'
  | 'laser';

export interface TechniqueInfo {
  id: PrintTechnique;
  name: string;
  description: string;
  pricePerUnit: number; // in Kz
  recommendedFor: string;
  minQty: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  basePrice: number; // Kwanza (Kz)
  image: string;
  description: string;
  minOrder: number;
  availableColors: { name: string; hex: string; class: string }[];
  availableSizes?: string[];
  supportedTechniques: PrintTechnique[];
  allowCustomizer: boolean;
  leadTimeDays: number;
  featured?: boolean;
}

export interface TextElement {
  id: string;
  text: string;
  font: string;
  color: string;
  fontSize: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number;
}

export interface GraphicElement {
  id: string;
  src: string;
  label: string;
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

export interface SideDesign {
  textElements: TextElement[];
  graphics: GraphicElement[];
}

export interface CustomDesign {
  productId: string;
  productName: string;
  color: { name: string; hex: string };
  size?: string;
  technique: PrintTechnique;
  quantity: number;
  front: SideDesign;
  back: SideDesign;
  customPreviewUrl?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor: { name: string; hex: string };
  selectedSize?: string;
  technique: PrintTechnique;
  customDesign?: CustomDesign;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethodType = 'mcx' | 'referencia' | 'transferencia' | 'tpa';

export interface OrderRecord {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerProvince: string;
  isCompany: boolean;
  companyName?: string;
  nif?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'pendente' | 'aprovado' | 'em_analise';
  trackingStep: number; // 0 to 5
  paymentReference?: {
    entity: string;
    reference: string;
    expiryDate: string;
  };
  mcxPhone?: string;
  proofFileName?: string;
}

export interface BannerSlide {
  id: string;
  image: string;
  tagline: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaAction?: 'customizer' | 'quote' | 'catalog';
  active?: boolean;
}

export type GalleryCategoryType = 'textil' | 'brindes' | 'papelaria' | 'epi' | 'frotas';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategoryType;
  categoryLabel: string;
  image: string;
  technique: string;
  description: string;
  client: string;
  minQuantity: number;
}
