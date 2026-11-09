import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Catalog } from './components/Catalog';
import { LiveCustomizer } from './components/LiveCustomizer';
import { InstantQuoteCalculator } from './components/InstantQuoteCalculator';
import { GallerySection } from './components/GallerySection';
import { CartDrawer } from './components/CartDrawer';
import { PaymentModal } from './components/PaymentModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { InvoicePDFModal } from './components/InvoicePDFModal';
import { Footer } from './components/Footer';
import { CartItem, OrderRecord, PrintTechnique, Product, BannerSlide, GalleryItem } from './types';
import { PRODUCTS, DEFAULT_CUSTOMIZER_PRODUCT } from './data/products';
import { FullWidthBanner } from './components/FullWidthBanner';
import { INITIAL_BANNER_SLIDES } from './data/bannerSlides';
import { INITIAL_GALLERY_ITEMS } from './data/galleryItems';
import { 
  loadStoredProducts, 
  saveStoredProducts, 
  loadStoredOrders, 
  saveStoredOrders, 
  loadStoredBannerSlides, 
  saveStoredBannerSlides,
  loadStoredGalleryItems,
  saveStoredGalleryItems,
  clearStoredProducts
} from './utils/dbStorage';
import {
  subscribeToProducts,
  syncProductToCloud,
  removeProductFromCloud,
  clearAllProductsFromCloud,
  subscribeToBannerSlides,
  syncAllSlidesToCloud,
  subscribeToGallery,
  syncGalleryItemToCloud,
  removeGalleryItemFromCloud,
  syncAllGalleryItemsToCloud,
  subscribeToOrders,
  syncOrderToCloud
} from './services/cloudSync';
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Settings,
  FileText,
  Lock,
  Printer,
  Box,
  Layers,
  FileCheck
} from 'lucide-react';

const INITIAL_MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'QA-2026-8941',
    date: '30/10/2026',
    customerName: 'Manuel Domingos / BFA Luanda',
    customerPhone: '+244 923 456 789',
    customerEmail: 'manuel.domingos@bfa.ao',
    customerAddress: 'Talatona, Edifício Kilamba, 4º Andar',
    customerProvince: 'Luanda (Entrega Direta no Dia)',
    isCompany: true,
    companyName: 'Banco de Fomento Angola (BFA)',
    nif: '5401928341',
    items: [
      {
        id: 'mock-1',
        product: DEFAULT_CUSTOMIZER_PRODUCT,
        quantity: 50,
        selectedColor: { name: 'Preto Intenso', hex: '#121212' },
        selectedSize: 'L',
        technique: 'dtf',
        unitPrice: 4200,
        totalPrice: 210000
      },
      {
        id: 'mock-2',
        product: {
          ...DEFAULT_CUSTOMIZER_PRODUCT,
          id: 'caneca-ceramica-base',
          name: 'Caneca Personalizada Cerâmica',
          basePrice: 3500
        },
        quantity: 25,
        selectedColor: { name: 'Preto Intenso', hex: '#121212' },
        technique: 'sublimacao',
        unitPrice: 3500,
        totalPrice: 87500
      }
    ],
    subtotal: 297500,
    discount: 15000,
    shippingFee: 0,
    tax: 41650,
    totalAmount: 324150,
    paymentMethod: 'mcx',
    paymentStatus: 'aprovado',
    trackingStep: 3,
    mcxPhone: '923 456 789'
  },
  {
    id: 'QA-2026-8942',
    date: '29/10/2026',
    customerName: 'Dra. Luísa Gaspar / Unitel Angola',
    customerPhone: '+244 940 112 233',
    customerEmail: 'eventos@unitel.ao',
    customerAddress: 'Rua Rainha Ginga, Baixa de Luanda',
    customerProvince: 'Luanda (Entrega Direta no Dia)',
    isCompany: true,
    companyName: 'Unitel S.A.',
    nif: '5402819230',
    items: [
      {
        id: 'mock-3',
        product: {
          ...DEFAULT_CUSTOMIZER_PRODUCT,
          id: 'kit-executivo-base',
          name: 'Kit Executivo Especial',
          basePrice: 32000
        },
        quantity: 10,
        selectedColor: { name: 'Preto Matte & Ouro', hex: '#1C1917' },
        technique: 'laser',
        unitPrice: 32000,
        totalPrice: 320000
      }
    ],
    subtotal: 320000,
    discount: 0,
    shippingFee: 0,
    tax: 44800,
    totalAmount: 364800,
    paymentMethod: 'referencia',
    paymentStatus: 'pendente',
    trackingStep: 1,
    paymentReference: {
      entity: '00428',
      reference: '928341850',
      expiryDate: '48 horas'
    }
  }
];

export default function App() {
  // Flag to avoid overwriting IndexedDB before initial load finishes
  const [isHydrated, setIsHydrated] = useState(false);

  // Fast initial bootstrap from localStorage, later hydrated and synchronized with IndexedDB
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const isZeroed = localStorage.getItem('quieto_catalog_zeroed_v2');
        if (!isZeroed) {
          localStorage.removeItem('quieto_products_v1');
          localStorage.setItem('quieto_products_v2', JSON.stringify([]));
          localStorage.setItem('quieto_catalog_zeroed_v2', 'true');
          return [];
        }
        const saved = localStorage.getItem('quieto_products_v2');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Initial localStorage parse error', e);
    }
    return [];
  });


  // Orders state
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('quieto_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Initial orders parse error', e);
    }
    return INITIAL_MOCK_ORDERS;
  });

  // Dynamic Banner slides state
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('quieto_banner_slides_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Initial banner slides parse error', e);
    }
    return INITIAL_BANNER_SLIDES;
  });

  // Dynamic Portfolio / Gallery items state (persists across refreshes)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('quieto_gallery_items_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Initial gallery items parse error', e);
    }
    return INITIAL_GALLERY_ITEMS;
  });

  // Cloud Synchronization state across PC & Mobile
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Mount: Hydrate local cache, then attach live Firebase real-time listeners
  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      try {
        const [dbProds, dbOrds, dbSlides, dbGallery] = await Promise.all([
          loadStoredProducts(PRODUCTS),
          loadStoredOrders(INITIAL_MOCK_ORDERS),
          loadStoredBannerSlides(INITIAL_BANNER_SLIDES),
          loadStoredGalleryItems(INITIAL_GALLERY_ITEMS)
        ]);

        if (isMounted) {
          if (dbProds && Array.isArray(dbProds)) {
            setProducts(dbProds);
          }
          if (dbOrds && Array.isArray(dbOrds) && dbOrds.length > 0) {
            setOrders(dbOrds);
          }
          if (dbSlides && Array.isArray(dbSlides) && dbSlides.length > 0) {
            setBannerSlides(dbSlides);
          }
          if (dbGallery && Array.isArray(dbGallery) && dbGallery.length > 0) {
            setGalleryItems(dbGallery);
          }
        }
      } catch (err) {
        console.warn('Local hydration notice:', err);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }
    hydrate();

    // Attach real-time cloud synchronization listeners across PC & Phone
    const unsubProducts = subscribeToProducts((cloudProds) => {
      if (isMounted) {
        setProducts(cloudProds);
        saveStoredProducts(cloudProds);
        setIsCloudSynced(true);
      }
    });

    const unsubSlides = subscribeToBannerSlides((cloudSlides) => {
      if (isMounted) {
        if (cloudSlides.length > 0) {
          setBannerSlides(cloudSlides);
          saveStoredBannerSlides(cloudSlides);
        } else {
          // Cloud has no slides yet, seed defaults to cloud
          syncAllSlidesToCloud(INITIAL_BANNER_SLIDES).catch(() => {});
        }
        setIsCloudSynced(true);
      }
    });

    const unsubGallery = subscribeToGallery((cloudItems) => {
      if (isMounted) {
        if (cloudItems.length > 0) {
          setGalleryItems(cloudItems);
          saveStoredGalleryItems(cloudItems);
        } else {
          // Cloud has no portfolio items yet, seed defaults to cloud
          syncAllGalleryItemsToCloud(INITIAL_GALLERY_ITEMS).catch(() => {});
        }
        setIsCloudSynced(true);
      }
    });

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (isMounted) {
        if (cloudOrders.length > 0) {
          setOrders(cloudOrders);
          saveStoredOrders(cloudOrders);
        }
        setIsCloudSynced(true);
      }
    });

    return () => {
      isMounted = false;
      unsubProducts();
      unsubSlides();
      unsubGallery();
      unsubOrders();
    };
  }, []);

  // Persist products whenever they change (ONLY after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveStoredProducts(products);
  }, [products, isHydrated]);

  // Persist orders whenever they change (ONLY after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveStoredOrders(orders);
  }, [orders, isHydrated]);

  // Persist banner slides whenever they change (ONLY after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveStoredBannerSlides(bannerSlides);
  }, [bannerSlides, isHydrated]);

  // Persist gallery items whenever they change (ONLY after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveStoredGalleryItems(galleryItems);
  }, [galleryItems, isHydrated]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerProductId, setCustomizerProductId] = useState('tshirt-algodao-premium');
  
  // Instant quote preselection
  const [quoteProductId, setQuoteProductId] = useState('tshirt-algodao-premium');
  const [quoteQuantity, setQuoteQuantity] = useState(50);
  const [quoteTechnique, setQuoteTechnique] = useState<PrintTechnique>('dtf');

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  
  // Admin & Invoice modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => 
        item.product.id === newItem.product.id && 
        item.selectedColor.hex === newItem.selectedColor.hex &&
        item.selectedSize === newItem.selectedSize &&
        !item.customDesign && !newItem.customDesign
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        updated[existingIdx].totalPrice = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
    setIsCustomizerOpen(false);
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: qty,
          totalPrice: qty * item.unitPrice
        };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Smooth scroll
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'topo') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetId = (sectionId === 'galeria' || sectionId === 'portfolio')
      ? (document.getElementById('portfolio') ? 'portfolio' : 'galeria')
      : sectionId;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCustomizerWithProduct = (productId: string) => {
    setCustomizerProductId(productId);
    setIsCustomizerOpen(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleOpenQuoteWithProduct = (productId: string, qty: number) => {
    setQuoteProductId(productId);
    setQuoteQuantity(qty);
    handleNavigateSection('orcamento-rapido');
  };

  const handleProceedToPayment = () => {
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handleOrderSuccess = (order: OrderRecord) => {
    setOrders(prev => [order, ...prev]);
    setCartItems([]);
    syncOrderToCloud(order).catch(err => console.warn('Cloud order sync error:', err));
  };

  // Gallery / Portfólio Admin Operations (Real-time Cloud Sync across PC & Phone)
  const handleAddGalleryItem = (item: GalleryItem) => {
    setGalleryItems(prev => {
      const next = [item, ...prev];
      saveStoredGalleryItems(next);
      return next;
    });
    syncGalleryItemToCloud(item).catch(err => console.warn('Cloud gallery sync error:', err));
  };

  const handleAddMultipleGalleryItems = (newItems: GalleryItem[]) => {
    setGalleryItems(prev => {
      const next = [...newItems, ...prev];
      saveStoredGalleryItems(next);
      return next;
    });
    syncAllGalleryItemsToCloud(newItems).catch(err => console.warn('Cloud batch gallery sync error:', err));
  };

  const handleDeleteGalleryItem = (itemId: string) => {
    setGalleryItems(prev => {
      const next = prev.filter(i => i.id !== itemId);
      saveStoredGalleryItems(next);
      return next;
    });
    removeGalleryItemFromCloud(itemId).catch(err => console.warn('Cloud gallery remove error:', err));
  };

  // Product Admin Operations (Real-time Cloud Sync across PC & Phone)
  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      saveStoredProducts(next);
      return next;
    });
    syncProductToCloud(updated).catch(err => console.warn('Cloud product update sync error:', err));
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => {
      const next = [newProd, ...prev];
      saveStoredProducts(next);
      return next;
    });
    syncProductToCloud(newProd).catch(err => console.warn('Cloud product add sync error:', err));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== productId);
      saveStoredProducts(next);
      return next;
    });
    removeProductFromCloud(productId).catch(err => console.warn('Cloud product delete sync error:', err));
  };

  const handleClearCatalog = () => {
    setProducts([]);
    clearStoredProducts();
    clearAllProductsFromCloud().catch(err => console.warn('Cloud clear catalog error:', err));
  };

  const handleUpdateBannerSlides = (slides: BannerSlide[]) => {
    setBannerSlides(slides);
    saveStoredBannerSlides(slides);
    syncAllSlidesToCloud(slides).catch(err => console.warn('Cloud slides sync error:', err));
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'pendente' | 'aprovado' | 'em_analise', step: number) => {
    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, paymentStatus: status, trackingStep: step } : o);
      saveStoredOrders(next);
      const target = next.find(o => o.id === orderId);
      if (target) {
        syncOrderToCloud(target).catch(err => console.warn('Cloud order status update error:', err));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#121212] flex flex-col font-sans selection:bg-[#FF6B00] selection:text-black">
      {/* Top Bar Contract Navigation */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        portfolioCount={galleryItems.length}
        isCloudSynced={isCloudSynced}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomizer={() => {
          setIsCustomizerOpen(true);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Edge-to-Edge Dynamic Animated Portfolio Banner */}
      <FullWidthBanner
        slides={bannerSlides}
        onOpenCustomizer={() => {
          setIsCustomizerOpen(true);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onScrollToQuote={() => handleNavigateSection('orcamento-rapido')}
        onScrollToCatalog={() => handleNavigateSection('catalogo')}
        onScrollToGallery={() => handleNavigateSection('portfolio')}
        onScrollToPortfolio={() => handleNavigateSection('portfolio')}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
      />

      {/* Technical Standards & Industrial Commitment Strip */}
      <div className="bg-[#FAFBFB] border-b border-stone-200/90 py-5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <span className="font-mono text-xs font-bold text-[#FF6B00] pt-0.5">01</span>
            <div>
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-tight">Produção Gráfica Própria</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">Atelier em Luanda com DTF têxtil, bordados industriais e gravação a laser.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="font-mono text-xs font-bold text-[#FF6B00] pt-0.5">02</span>
            <div>
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-tight">Facturação Certificada AGT</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">Emissão formal com NIF empresarial e orçamentos pró-forma imediatos.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="font-mono text-xs font-bold text-[#FF6B00] pt-0.5">03</span>
            <div>
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-tight">Pagamento Multicaixa Directo</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">Multicaixa Express (MCX) e referência bancária em Kwanzas (Kz).</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="font-mono text-xs font-bold text-[#FF6B00] pt-0.5">04</span>
            <div>
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-tight">Logística em Luanda & Províncias</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">Frota de entrega direta na capital e expedição com Guia de Transporte.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Real-time Studio Customizer */}
        <section className="py-10 max-w-7xl mx-auto px-6" id="personalizador">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#FF6B00] uppercase block mb-1">
                Atelier Digital · Simulação 3D em Tempo Real
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-stone-950">
                Prova Gráfica Digital & Amostra em 360°
              </h2>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                Aplica o teu logotipo ou identidade corporativa sobre a peça, seleciona as cores exatas e gira o modelo 3D com o rato para validar o acabamento antes da produção.
              </p>
            </div>

            <button
              onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white text-xs font-bold text-slate-800 rounded-xl transition-colors self-start md:self-auto"
            >
              {isCustomizerOpen ? 'Ocultar Estúdio' : 'Abrir Estúdio Completo'}
            </button>
          </div>

          {isCustomizerOpen && (
            <LiveCustomizer
              products={products}
              initialProductId={customizerProductId}
              onAddToCart={handleAddToCart}
              onRequestQuote={(pId, qty, tech) => {
                setQuoteProductId(pId);
                setQuoteQuantity(qty);
                setQuoteTechnique(tech);
                handleNavigateSection('orcamento-rapido');
              }}
              onClose={() => setIsCustomizerOpen(false)}
            />
          )}
        </section>

        {/* Online Catalog (Receives dynamic products from Admin!) */}
        <Catalog
          products={products}
          onAddToCart={handleAddToCart}
          onOpenCustomizerWithProduct={handleOpenCustomizerWithProduct}
          onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
          onOpenAdmin={() => setIsAdminLoginOpen(true)}
        />

        {/* Official Brindes & Portfolio Showcase Gallery */}
        <GallerySection
          items={galleryItems}
          onOpenAdmin={() => setIsAdminLoginOpen(true)}
          onOpenCustomizer={() => {
            setIsCustomizerOpen(true);
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          onScrollToQuote={(itemTitle) => {
            handleNavigateSection('orcamento-rapido');
          }}
        />

        {/* Instant Quote Proforma Calculator (Receives dynamic products) */}
        <section className="py-8 bg-slate-100/60 border-y border-slate-200">
          <InstantQuoteCalculator
            products={products}
            initialProductId={quoteProductId}
            initialQuantity={quoteQuantity}
            initialTechnique={quoteTechnique}
            onProceedToOrder={(pId, qty, tech) => {
              handleOpenCustomizerWithProduct(pId);
            }}
          />
        </section>

        {/* Industrial Standards & Technical Capacity in Luanda */}
        <section className="py-16 max-w-7xl mx-auto px-6 border-t border-stone-200/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block mb-1">
                Capacidade Técnica & Padrões da Oficina
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-stone-950">
                Infraestrutura Gráfica & Produção em Luanda
              </h2>
              <p className="text-xs text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
                Operamos com maquinário profissional próprio para assegurar precisão cromática, solidez de lavagem e prazos rigorosos para encomendas empresariais.
              </p>
            </div>

            {/* Industrial Stats Strip */}
            <div className="flex items-center gap-6 text-xs text-stone-600 border-l-2 border-[#FF6B00] pl-4 shrink-0">
              <div>
                <span className="text-lg font-black text-stone-950 block font-display tabular-nums">+2.500</span>
                <span className="text-[11px] text-stone-500">Peças / Dia</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <span className="text-lg font-black text-stone-950 block font-display tabular-nums">1440 DPI</span>
                <span className="text-[11px] text-stone-500">Resolução DTF</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <span className="text-lg font-black text-stone-950 block font-display tabular-nums">18 Prov.</span>
                <span className="text-[11px] text-stone-500">Expedição</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-900 mb-3">
                  <Printer className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <h3 className="font-bold text-sm text-stone-950 mb-2">
                  Maquinaria & Técnicas de Impressão
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Estamparia DTF industrial com tintas de alta elasticidade têxtil, carrosséis de serigrafia para grandes tiragens, bordados digitais multifio e corte/gravação a laser para metais, madeira e acrílico.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                Equipamentos: Epson SureColor · Tajima 12C · Laser CO2
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-900 mb-3">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-sm text-stone-950 mb-2">
                  Conformidade Fiscal & Faturação AGT
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Processo comercial totalmente legalizado. Emissão imediata de Facturas Pró-forma para aprovação em tesouraria, Facturas Comerciais certificadas com NIF e Guias de Transporte para circulação interprovincial.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                NIF Registado · Software de Faturação Homologado AGT
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-900 mb-3">
                  <Truck className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <h3 className="font-bold text-sm text-stone-950 mb-2">
                  Logística Integrada & Frota Própria
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Carrinhas de distribuição dedicadas para entregas diretas em escritórios, armazéns e recintos de eventos em Luanda. Embalamento industrial reforçado com separação por tamanhos e guias de remessa.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                Entregas: Talatona · Baixa · Viana · Cacuaco · Províncias
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleProceedToPayment}
      />

      {/* Payment & Checkout Modal */}
      {isPaymentOpen && (
        <PaymentModal
          items={cartItems}
          onClose={() => setIsPaymentOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Tracker Modal */}
      {isTrackerOpen && (
        <OrderTrackerModal
          onClose={() => setIsTrackerOpen(false)}
          recentOrders={orders}
        />
      )}

      {/* Admin Login Modal (PIN check) */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminPanelOpen(true);
          }}
        />
      )}

      {/* Admin Management Dashboard */}
      {isAdminPanelOpen && (
        <AdminPanel
          products={products}
          orders={orders}
          bannerSlides={bannerSlides}
          galleryItems={galleryItems}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onClearCatalog={handleClearCatalog}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateBannerSlides={handleUpdateBannerSlides}
          onAddGalleryItem={handleAddGalleryItem}
          onAddMultipleGalleryItems={handleAddMultipleGalleryItems}
          onDeleteGalleryItem={handleDeleteGalleryItem}
          onOpenInvoiceModal={(order) => setSelectedInvoiceOrder(order)}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

      {/* Official AGT PDF Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoicePDFModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Footer with admin access link */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenCustomizer={() => {
          setIsCustomizerOpen(true);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
      />
    </div>
  );
}
