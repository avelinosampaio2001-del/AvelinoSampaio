import React, { useState } from 'react';
import { Product, OrderRecord, ProductCategory, PrintTechnique, BannerSlide, GalleryItem, GalleryCategoryType } from '../types';
import { formatKz, COLOR_OPTIONS, PRINT_TECHNIQUES, PRODUCTS } from '../data/products';
import { compressImageFile } from '../utils/imageCompressor';
import { saveStoredProducts, exportCatalogBackupJSON, saveStoredGalleryItems } from '../utils/dbStorage';
import { 
  Package, 
  FileText, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Search, 
  Filter, 
  Printer, 
  X, 
  TrendingUp,
  ShieldAlert,
  Save,
  Eye,
  RefreshCw,
  Sliders,
  ArrowUp,
  ArrowDown,
  Layers,
  Link as LinkIcon,
  Database,
  Download,
  UploadCloud,
  Images,
  Loader2
} from 'lucide-react';

export const QUIETO_PORTFOLIO_GALLERY = [
  { src: '/assets/aistudio/Sem_t_tulo-1-11_6438026a.jpg', label: 'Van de Entregas Quieto Angola', tagline: 'FROTA PRÓPRIA & LOGÍSTICA LUANDA' },
  { src: '/assets/aistudio/Sem_t_tulo-1-12_498dda17.jpg', label: 'Hoodie Quieto "Do planeamento à ação"', tagline: 'ESTAMPARIA TÊXTIL DTF & MOLETONS' },
  { src: '/assets/aistudio/Sem_t_tulo-1-09_cf4df66d.jpg', label: 'Papelaria Institucional & Caneca', tagline: 'IDENTIDADE CORPORATIVA DE PRESTÍGIO' },
  { src: '/assets/aistudio/Sem_t_tulo-1-14_06d57df6.jpg', label: 'Garrafa Térmica Quieto Inox', tagline: 'BRINDES TÉRMICOS & GRAVAÇÃO LASER' },
  { src: '/assets/aistudio/Sem_t_tulo-1-31_7ac8f463.jpg', label: 'Vestuário Industrial & Capacete AMP', tagline: 'VESTUÁRIO INDUSTRIAL & EPI ANGOLA' },
  { src: '/assets/aistudio/Sem_t_tulo-1-16_8d14977e.jpg', label: 'Fita de Crachá & Lanyard Quieto', tagline: 'EVENTOS, FEIRAS & CONFERÊNCIAS' },
  { src: '/assets/aistudio/Sem_t_tulo-1-15_614126e0.jpg', label: 'T-shirt Quieto 100% Algodão', tagline: 'VESTUÁRIO CORPORATIVO & UNIFORMES' },
  { src: '/assets/aistudio/Sem_t_tulo-1-10_eec9ffb8.jpg', label: 'Pasta de Arquivo Laranja Quieto', tagline: 'ORGANIZAÇÃO & EXPEDIENTE DE ESCRITÓRIO' },
  { src: '/assets/aistudio/Sem_t_tulo-1-23_5d74e6cc.jpg', label: 'Caneca & Sacola de Pano Retogrow', tagline: 'MERCHANDISING SUSTENTÁVEL & ECO-BAGS' },
  { src: '/assets/aistudio/Sem_t_tulo-1-28_54c0432a.jpg', label: 'PTP Peças Auto: T-shirt, Garrafa & Van', tagline: 'FROTAS & VESTUÁRIO DE OFICINA' },
  { src: '/assets/aistudio/Sem_t_tulo-1-30_ff9a44b0.jpg', label: 'CEFICS Brindes & Papelaria', tagline: 'INSTITUIÇÕES DE FORMAÇÃO & EDUCAÇÃO' },
  { src: '/assets/aistudio/Sem_t_tulo-1-32_9104e562.jpg', label: 'Capacetes de Segurança & Bonés AMP', tagline: 'EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL' },
  { src: '/assets/aistudio/Sem_t_tulo-1-33_5dbcd418.jpg', label: 'Autocolantes & Cartões de Visita', tagline: 'IMPRESSÃO GRÁFICA & AUTOCOLANTES' },
  { src: '/assets/aistudio/Sem_t_tulo-1-24_9233e6ee.jpg', label: 'Conjunto Executivo CEFICS Verde', tagline: 'KITS EXECUTIVOS PARA FORMAÇÃO' },
  { src: '/assets/aistudio/Sem_t_tulo-1-27_5354dea9.jpg', label: 'Agenda & Caneca PTP Vermelho', tagline: 'BRINDES AUTOMÓVEIS & PEÇAS' },
  { src: '/assets/aistudio/Sem_t_tulo-1-22_81aae5d1.jpg', label: 'T-shirt & Crachá Retogrow Verde', tagline: 'EVENTOS ECOLÓGICOS & AGRO' }
];

interface AdminPanelProps {
  products: Product[];
  orders: OrderRecord[];
  bannerSlides: BannerSlide[];
  galleryItems: GalleryItem[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onClearCatalog?: () => void;
  onUpdateOrderStatus: (orderId: string, status: 'pendente' | 'aprovado' | 'em_analise', trackingStep: number) => void;
  onUpdateBannerSlides: (slides: BannerSlide[]) => void;
  onAddGalleryItem: (item: GalleryItem) => void;
  onAddMultipleGalleryItems?: (items: GalleryItem[]) => void;
  onDeleteGalleryItem: (itemId: string) => void;
  onOpenInvoiceModal: (order: OrderRecord) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  bannerSlides,
  galleryItems,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onClearCatalog,
  onUpdateOrderStatus,
  onUpdateBannerSlides,
  onAddGalleryItem,
  onAddMultipleGalleryItems,
  onDeleteGalleryItem,
  onOpenInvoiceModal,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'banners' | 'produtos' | 'portfolio' | 'encomendas' | 'novo_produto'>('banners');
  const [searchProduct, setSearchProduct] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dedicated product image selector modal
  const [productImageSelectorModal, setProductImageSelectorModal] = useState<Product | null>(null);
  const [customProductImageUrl, setCustomProductImageUrl] = useState<string>('');

  // Edit banner slide state
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);

  // New banner slide form
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideTagline, setNewSlideTagline] = useState('');
  const [newSlideDescription, setNewSlideDescription] = useState('');
  const [newSlideImage, setNewSlideImage] = useState('');
  const [newSlideCtaText, setNewSlideCtaText] = useState('Personalizar Agora');
  const [newSlideCtaAction, setNewSlideCtaAction] = useState<'customizer' | 'quote' | 'catalog'>('customizer');

  // New portfolio item form state
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState<GalleryCategoryType>('textil');
  const [newGalTechnique, setNewGalTechnique] = useState('Estampa DTF Têxtil HD');
  const [newGalClient, setNewGalClient] = useState('Quieto Angola');
  const [newGalMinQty, setNewGalMinQty] = useState(1);
  const [newGalDescription, setNewGalDescription] = useState('');
  const [newGalImage, setNewGalImage] = useState('');
  const [searchPortfolio, setSearchPortfolio] = useState('');

  // Batch upload state for multiple portfolio photos
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentFileName?: string } | null>(null);
  const [batchCategory, setBatchCategory] = useState<GalleryCategoryType>('textil');
  const [batchClient, setBatchClient] = useState('Quieto Angola');
  const [batchTechnique, setBatchTechnique] = useState('Estampa DTF Têxtil HD');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('vestuario');
  const [newProdBasePrice, setNewProdBasePrice] = useState(5500);
  const [newProdMinOrder, setNewProdMinOrder] = useState(1);
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImage, setNewProdImage] = useState<string>('');
  const [newProdLeadTime, setNewProdLeadTime] = useState(3);
  const [newProdAllowCustomizer, setNewProdAllowCustomizer] = useState(true);

  // Quick metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'aprovado' ? o.totalAmount : 0), 0);
  const totalProductsCount = products.length;

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Quick price save
  const handleSaveInlinePrice = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const updated: Product = {
      ...prod,
      basePrice: Number(newPriceValue) || prod.basePrice
    };
    onUpdateProduct(updated);
    setEditingPriceId(null);
    showNotification(`Preço de "${prod.name}" alterado com sucesso para ${formatKz(updated.basePrice)}!`);
  };

  // Product Image upload with instant client-side canvas compression & IndexedDB persistence
  const handleProductImageUpload = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress to lightweight, high-fidelity JPEG ~35KB
      const dataUri = await compressImageFile(file, 700, 700, 0.82);
      const prod = products.find(p => p.id === productId);
      if (prod) {
        const updated: Product = { ...prod, image: dataUri };
        onUpdateProduct(updated);
        if (editingProduct?.id === productId) {
          setEditingProduct({ ...editingProduct, image: dataUri });
        }
        if (productImageSelectorModal?.id === productId) {
          setProductImageSelectorModal({ ...productImageSelectorModal, image: dataUri });
        }
        showNotification(`Nova foto de "${prod.name}" gravada com sucesso em memória permanente (IndexedDB)! Não desaparece ao atualizar a página.`);
      }
    } catch (err) {
      console.warn('Direct canvas compression error, attempting fallback reader:', err);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const raw = event.target?.result as string;
          const compressed = await compressImageFile(raw, 700, 700, 0.82);
          const prod = products.find(p => p.id === productId);
          if (prod) {
            const updated: Product = { ...prod, image: compressed };
            onUpdateProduct(updated);
            if (editingProduct?.id === productId) {
              setEditingProduct({ ...editingProduct, image: compressed });
            }
            if (productImageSelectorModal?.id === productId) {
              setProductImageSelectorModal({ ...productImageSelectorModal, image: compressed });
            }
            showNotification(`Nova foto de "${prod.name}" gravada com sucesso!`);
          }
        } catch (subErr) {
          console.error('Fallback compression failed', subErr);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      e.target.value = '';
    }
  };

  // Apply Portfolio image to product with path normalization
  const handleApplyPortfolioImageToProduct = (productId: string, imageSrc: string, label?: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const cleanSrc = imageSrc.startsWith('/public/') ? imageSrc.replace(/^\/public\//, '/') : imageSrc;
      const updated: Product = { ...prod, image: cleanSrc };
      onUpdateProduct(updated);
      if (editingProduct?.id === productId) {
        setEditingProduct({ ...editingProduct, image: cleanSrc });
      }
      if (productImageSelectorModal?.id === productId) {
        setProductImageSelectorModal({ ...productImageSelectorModal, image: cleanSrc });
      }
      showNotification(`Foto "${label || 'do Portfólio'}" aplicada e guardada com sucesso em memória permanente!`);
    }
  };

  // Apply custom URL to product
  const handleApplyUrlImageToProduct = (productId: string, url: string) => {
    if (!url.trim()) return;
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const cleanUrl = url.trim().startsWith('/public/') ? url.trim().replace(/^\/public\//, '/') : url.trim();
      const updated: Product = { ...prod, image: cleanUrl };
      onUpdateProduct(updated);
      if (editingProduct?.id === productId) {
        setEditingProduct({ ...editingProduct, image: cleanUrl });
      }
      if (productImageSelectorModal?.id === productId) {
        setProductImageSelectorModal({ ...productImageSelectorModal, image: cleanUrl });
      }
      setCustomProductImageUrl('');
      showNotification(`Link de imagem aplicado e guardado com sucesso a "${prod.name}"!`);
    }
  };

  // Export full catalog backup as JSON
  const handleDownloadBackup = () => {
    const jsonStr = exportCatalogBackupJSON(products);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quieto-angola-catalogo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Cópia de segurança do catálogo (JSON) descarregada com sucesso!');
  };

  // Import catalog backup from JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const importedList = parsed.products && Array.isArray(parsed.products) ? parsed.products : Array.isArray(parsed) ? parsed : null;
        if (importedList && importedList.length > 0) {
          importedList.forEach((p: Product) => onUpdateProduct(p));
          saveStoredProducts(importedList);
          showNotification(`Cópia restaurada com sucesso! ${importedList.length} artigos sincronizados.`);
        } else {
          alert('Ficheiro JSON com estrutura inválida.');
        }
      } catch (err) {
        alert('Erro ao processar ficheiro de backup JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Force Save All to IndexedDB
  const handleForceSave = () => {
    saveStoredProducts(products);
    showNotification('Base de dados IndexedDB sincronizada! Todas as alterações estão gravadas permanentemente no seu navegador.');
  };

  // Clear all products (Zero-out database)
  const handleClearAllProducts = () => {
    if (confirm('Atenção: Deseja realmente zerar todos os produtos do catálogo? Esta ação removerá todos os artigos para que possas cadastrar os teus produtos pessoalmente de raiz.')) {
      if (onClearCatalog) {
        onClearCatalog();
      }
      showNotification('Catálogo zerado com sucesso! Podes agora cadastrar os teus produtos.');
    }
  };

  // Banner slide image upload with compression
  const handleBannerImageUpload = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUri = await compressImageFile(file, 1200, 700, 0.85);
      const updated = bannerSlides.map(s => s.id === slideId ? { ...s, image: dataUri } : s);
      onUpdateBannerSlides(updated);
      showNotification('Imagem do banner substituída com sucesso em tempo real!');
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        const updated = bannerSlides.map(s => s.id === slideId ? { ...s, image: dataUri } : s);
        onUpdateBannerSlides(updated);
        showNotification('Imagem do banner substituída com sucesso em tempo real!');
      };
      reader.readAsDataURL(file);
    } finally {
      e.target.value = '';
    }
  };

  // Add slide from gallery
  const handleAddSlideFromGallery = (item: typeof QUIETO_PORTFOLIO_GALLERY[0]) => {
    const newSlide: BannerSlide = {
      id: `slide-${Date.now()}`,
      image: item.src,
      tagline: item.tagline,
      title: item.label,
      description: 'Produção gráfica e personalização de alta fidelidade em Luanda com a Quieto Angola.',
      ctaText: 'Personalizar Agora',
      ctaAction: 'customizer',
      active: true
    };
    onUpdateBannerSlides([...bannerSlides, newSlide]);
    showNotification(`Imagem "${item.label}" adicionada ao banner rotativo com sucesso!`);
  };

  // Create new banner slide from form
  const handleCreateBannerSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle.trim() || !newSlideImage) {
      alert('Por favor preencha o título e selecione uma imagem para o banner.');
      return;
    }

    const newSlide: BannerSlide = {
      id: `slide-${Date.now()}`,
      image: newSlideImage,
      tagline: newSlideTagline || 'QUIETO ANGOLA',
      title: newSlideTitle,
      description: newSlideDescription || 'Qualidade industrial, pontualidade e inovação gráfica em Angola.',
      ctaText: newSlideCtaText,
      ctaAction: newSlideCtaAction,
      active: true
    };

    onUpdateBannerSlides([...bannerSlides, newSlide]);
    showNotification('Novo slide publicado no banner com sucesso!');
    setNewSlideTitle('');
    setNewSlideTagline('');
    setNewSlideDescription('');
    setNewSlideImage('');
  };

  // Reorder slides
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...bannerSlides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    onUpdateBannerSlides(newSlides);
    showNotification('Ordem dos slides do banner atualizada!');
  };

  // Delete slide
  const handleDeleteSlide = (id: string) => {
    if (bannerSlides.length <= 1) {
      alert('O banner deve conter pelo menos 1 imagem ativa.');
      return;
    }
    const updated = bannerSlides.filter(s => s.id !== id);
    onUpdateBannerSlides(updated);
    showNotification('Slide removido do banner.');
  };

  // Toggle active
  const handleToggleSlideActive = (id: string) => {
    const updated = bannerSlides.map(s => s.id === id ? { ...s, active: !s.active } : s);
    onUpdateBannerSlides(updated);
  };

  // Batch upload handler for multiple portfolio images at once
  const handlePortfolioMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingBatch(true);
    setBatchProgress({ current: 0, total: fileList.length });

    const categoryLabels: Record<GalleryCategoryType, string> = {
      textil: 'Têxtil & Uniformes',
      brindes: 'Brindes Executivos',
      papelaria: 'Papelaria Corporativa',
      epi: 'Segurança & EPI',
      frotas: 'Frotas & Viaturas'
    };

    const newItems: GalleryItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setBatchProgress({
        current: i + 1,
        total: fileList.length,
        currentFileName: file.name
      });

      try {
        const compressedUri = await compressImageFile(file, 900, 700, 0.85);
        // Clean title from file name
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        const formattedTitle = rawName 
          ? (rawName.charAt(0).toUpperCase() + rawName.slice(1)) 
          : `Produção Quieto ${i + 1}`;

        const item: GalleryItem = {
          id: `gal-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          title: formattedTitle,
          category: batchCategory,
          categoryLabel: categoryLabels[batchCategory] || 'Produção Gráfica',
          image: compressedUri,
          technique: batchTechnique.trim() || 'DTF Têxtil HD',
          description: `Produção real personalizada realizada pela Quieto Angola (${formattedTitle}).`,
          client: batchClient.trim() || 'Quieto Angola',
          minQuantity: 1
        };
        newItems.push(item);
      } catch (err) {
        console.warn(`Erro ao processar ficheiro ${file.name}:`, err);
      }
    }

    if (newItems.length > 0) {
      if (onAddMultipleGalleryItems) {
        onAddMultipleGalleryItems(newItems);
      } else {
        newItems.forEach(item => onAddGalleryItem(item));
      }
      showNotification(`✓ ${newItems.length} fotografias carregadas e sincronizadas em tempo real no Portfólio!`);
    }

    setIsUploadingBatch(false);
    setBatchProgress(null);
    e.target.value = '';
  };

  // Single or multiple portfolio image upload
  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      handlePortfolioMultipleUpload(e);
      return;
    }

    const file = files[0];
    try {
      const dataUri = await compressImageFile(file, 900, 700, 0.85);
      setNewGalImage(dataUri);
      if (!newGalTitle.trim()) {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        if (rawName) {
          setNewGalTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));
        }
      }
      showNotification('Imagem carregada e comprimida com sucesso!');
    } catch (err) {
      console.warn('Erro ao comprimir imagem do portfólio', err);
    } finally {
      e.target.value = '';
    }
  };

  // Create new portfolio item
  const handleCreateGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim() || !newGalImage) {
      alert('Por favor preencha o título e selecione ou carregue uma imagem para o portfólio.');
      return;
    }

    const categoryLabels: Record<GalleryCategoryType, string> = {
      textil: 'Têxtil & Uniformes',
      brindes: 'Brindes Executivos',
      papelaria: 'Papelaria Corporativa',
      epi: 'Segurança & EPI',
      frotas: 'Frotas & Viaturas'
    };

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newGalTitle.trim(),
      category: newGalCategory,
      categoryLabel: categoryLabels[newGalCategory] || 'Brindes',
      image: newGalImage,
      technique: newGalTechnique.trim() || 'DTF Têxtil HD',
      description: newGalDescription.trim() || 'Produção de alta fidelidade gráfica pela Quieto Angola.',
      client: newGalClient.trim() || 'Quieto Angola',
      minQuantity: Number(newGalMinQty) || 1
    };

    onAddGalleryItem(newItem);
    showNotification(`Foto "${newItem.title}" adicionada com sucesso ao Portfólio!`);
    setNewGalTitle('');
    setNewGalDescription('');
    setNewGalImage('');
    setNewGalClient('Quieto Angola');
  };

  // Delete portfolio item with confirmation
  const handleDeletePortfolioItem = (item: GalleryItem) => {
    if (confirm(`Tem a certeza que deseja remover "${item.title}" do Portfólio oficial?`)) {
      onDeleteGalleryItem(item.id);
      showNotification(`Foto "${item.title}" removida do Portfólio com sucesso.`);
    }
  };

  // Create new product submission
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert('Por favor insere o nome do artigo.');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      categoryLabel: newProdCategory === 'vestuario' ? 'T-shirts & Vestuário' :
                     newProdCategory === 'brindes_executivos' ? 'Brindes Executivos' :
                     newProdCategory === 'bebidas_termicos' ? 'Bebidas & Térmicos' :
                     newProdCategory === 'eventos_sacolas' ? 'Eventos & Sacolas' : 'Tecnologia',
      basePrice: Number(newProdBasePrice),
      image: newProdImage || '/src/assets/images/tshirt_black_mockup_1793349863784.jpg',
      description: newProdDescription || 'Artigo gráfico de alta qualidade personalizável pela Quieto Angola.',
      minOrder: Number(newProdMinOrder) || 1,
      availableColors: COLOR_OPTIONS,
      availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
      supportedTechniques: ['dtf', 'serigrafia', 'bordado'],
      allowCustomizer: newProdAllowCustomizer,
      leadTimeDays: Number(newProdLeadTime) || 2,
      featured: true
    };

    onAddProduct(newProd);
    showNotification(`Produto "${newProd.name}" adicionado com sucesso ao site!`);
    setActiveTab('produtos');
    setNewProdName('');
    setNewProdDescription('');
    setNewProdImage('');
  };

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#FF6B00] text-black font-black flex items-center justify-center text-base">
              Q
            </span>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Painel de Gestão & Administração — Quieto Angola
              </h2>
              <p className="text-xs text-slate-400">
                Gestão dos Banners Dinâmicos, Catálogo em Tempo Real e Facturação AGT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Success notification banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Quick KPI Strip */}
        <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shrink-0">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Faturado Liquidado:</span>
            <span className="text-[#FF6B00] font-black text-sm tabular-nums font-display">{formatKz(totalRevenue)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Slides Ativos no Banner:</span>
            <span className="text-white font-bold text-sm tabular-nums">{bannerSlides.filter(s => s.active !== false).length} slides</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Artigos Ativos no Catálogo:</span>
            <span className="text-white font-bold text-sm tabular-nums">{totalProductsCount} artigos</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Fotos no Portfólio:</span>
            <span className="text-white font-bold text-sm tabular-nums">{galleryItems.length} fotos</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            {/* TAB: BANNERS DO TOPO */}
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'banners'
                  ? 'border-[#FF6B00] text-slate-950 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#FF6B00]" />
              <span>Gerir Banners do Topo ({bannerSlides.length})</span>
            </button>

            {/* TAB: CATÁLOGO */}
            <button
              onClick={() => setActiveTab('produtos')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'produtos'
                  ? 'border-[#FF6B00] text-slate-950 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-[#FF6B00]" />
              <span>Gerir Catálogo & Preços ({products.length})</span>
            </button>

            {/* TAB: PORTFÓLIO */}
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'portfolio'
                  ? 'border-[#FF6B00] text-slate-950 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Images className="w-4 h-4 text-[#FF6B00]" />
              <span>Gerir Portfólio ({galleryItems.length})</span>
            </button>

            {/* TAB: ENCOMENDAS */}
            <button
              onClick={() => setActiveTab('encomendas')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'encomendas'
                  ? 'border-[#FF6B00] text-slate-950 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-[#FF6B00]" />
              <span>Encomendas & Facturas PDF ({orders.length})</span>
            </button>

            {/* TAB: NOVO PRODUTO */}
            <button
              onClick={() => setActiveTab('novo_produto')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'novo_produto'
                  ? 'border-[#FF6B00] text-slate-950 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Adicionar Produto</span>
            </button>
          </div>
        </div>

        {/* --- TAB 0: GESTÃO DO BANNER ROTATIVO (FOTOS E TEXTOS) --- */}
        {activeTab === 'banners' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Imagens e Mensagens do Banner Rotativo</span>
                <span className="text-xs bg-orange-100 text-[#FF6B00] font-bold px-2 py-0.5 rounded">
                  Ecrã Total (Edge-to-Edge)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aqui podes <strong>trocar a foto de qualquer slide</strong>, alterar a ordem de passagem, pausar slides ou adicionar imagens novas do teu computador ou da galeria Quieto Angola.
              </p>
            </div>

            {/* List of Current Slides */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Slides Atuais no Banner ({bannerSlides.length}):
              </span>

              <div className="grid grid-cols-1 gap-3">
                {bannerSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      slide.active !== false
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-24 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-300 relative group">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="text-[10px] text-white font-bold cursor-pointer text-center px-1">
                            Trocar
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBannerImageUpload(slide.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[#FF6B00] text-[10px] font-black uppercase">
                            0{idx + 1} · {slide.tagline}
                          </span>
                          {slide.active === false && (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                              Pausado
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate mt-1">
                          {slide.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {slide.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Reorder, Change Photo, Edit Text, Toggle, Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Reorder arrows */}
                      <button
                        onClick={() => handleMoveSlide(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(idx, 'down')}
                        disabled={idx === bannerSlides.length - 1}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Change image file button */}
                      <label className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF6B00] text-xs font-bold cursor-pointer border border-orange-200 transition-colors flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Mudar Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBannerImageUpload(slide.id, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Edit text button */}
                      <button
                        onClick={() => setEditingSlide(slide)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Editar Textos do Slide"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle active button */}
                      <button
                        onClick={() => handleToggleSlideActive(slide.id)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${
                          slide.active !== false
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold'
                        }`}
                      >
                        {slide.active !== false ? 'Ocultar' : 'Ativar'}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                        title="Remover Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Gallery: User Uploaded Images Library */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Images className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Portfólio Oficial Quieto Angola (1 Clique para Adicionar ao Banner)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Clica em qualquer uma destas imagens do teu portfólio para a colocar imediatamente no banner rotativo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {QUIETO_PORTFOLIO_GALLERY.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleAddSlideFromGallery(item)}
                    className="group border border-slate-200 hover:border-[#FF6B00] rounded-xl overflow-hidden cursor-pointer bg-white transition-all hover:shadow-md relative"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.src}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        + Colocar no Banner
                      </div>
                    </div>
                    <div className="p-2 text-[10px] font-bold text-slate-800 truncate">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Slide Form */}
            <div className="pt-4 border-t border-slate-200 bg-slate-50 p-5 rounded-2xl border">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Ou Criar um Novo Slide Personalizado:
              </h4>

              <form onSubmit={handleCreateBannerSlide} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título do Slide:</label>
                    <input
                      type="text"
                      required
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      placeholder="Ex: Nova Coleção de T-shirts 2026"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tagline / Etiqueta Superior:</label>
                    <input
                      type="text"
                      value={newSlideTagline}
                      onChange={(e) => setNewSlideTagline(e.target.value)}
                      placeholder="Ex: NOVIDADE EM LUANDA"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Descrição Curta:</label>
                  <input
                    type="text"
                    value={newSlideDescription}
                    onChange={(e) => setNewSlideDescription(e.target.value)}
                    placeholder="Ex: Personalização rápida com estamparia DTF e entrega direta na tua empresa."
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Imagem do Slide:</label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-[#FF6B00] text-xs">
                      <Upload className="w-4 h-4 text-[#FF6B00]" />
                      <span className="truncate">{newSlideImage ? 'Imagem Selecionada ✓' : 'Carregar Imagem do Computador'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setNewSlideImage(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Texto do Botão:</label>
                    <input
                      type="text"
                      value={newSlideCtaText}
                      onChange={(e) => setNewSlideCtaText(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  Adicionar ao Banner Rotativo
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB 1: GESTÃO DE PRODUTOS & PREÇOS EM TEMPO REAL --- */}
        {activeTab === 'produtos' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {/* Storage Persistence Status Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-emerald-950">
                      Sincronização em Nuvem Ativa (PC & Telemóvel)
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                      Tempo Real (Firestore) ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Os artigos, fotografias e preços adicionados no computador <strong>sincronizam imediatamente com o teu telemóvel</strong> e vice-versa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleForceSave}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  title="Garantir que todas as alterações estão gravadas"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Agora</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  title="Descarregar ficheiro JSON com todos os produtos e imagens"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Backup JSON</span>
                </button>

                <label className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restaurar</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleClearAllProducts}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  title="Zerar todos os produtos do catálogo para cadastrar de raiz"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Zerar Catálogo</span>
                </button>
              </div>
            </div>

            {/* Search and summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Pesquisar por nome ou categoria..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="text-xs text-slate-500">
                Dica: Clica no botão laranja <strong>"Alterar Imagem"</strong> ou na miniatura para trocar a foto por upload ou do portfólio.
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Imagem</th>
                    <th className="py-3 px-3">Nome do Artigo</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3 text-right">Preço Base (Kz)</th>
                    <th className="py-3 px-2 text-center">Mínimo</th>
                    <th className="py-3 px-3 text-center">Ações em Tempo Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {products.length === 0 ? 'Base de Dados Zerada (0 Artigos)' : 'Nenhum artigo encontrado'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {products.length === 0
                                ? 'A base de dados do catálogo está limpa conforme solicitado. Podes começar a adicionar pessoalmente os teus artigos, preços e fotos.'
                                : 'Nenhum produto coincide com a pesquisa atual.'}
                            </p>
                          </div>
                          {products.length === 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('novo_produto')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ Cadastrar Primeiro Artigo Agora</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isEditingThisPrice = editingPriceId === prod.id;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                        {/* Image + Live Upload Button */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div 
                              onClick={() => setProductImageSelectorModal(prod)}
                              className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer hover:border-[#FF6B00] shadow-sm transition-all"
                              title="Clica para alterar ou gerir a foto deste artigo"
                            >
                              <img
                                key={prod.image}
                                src={prod.image.startsWith('/public/') ? prod.image.replace(/^\/public\//, '/') : prod.image}
                                alt={prod.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/aistudio/Sem_t_tulo-1-15_614126e0.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Edit3 className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <button
                                onClick={() => setProductImageSelectorModal(prod)}
                                className="text-[11px] bg-orange-50 hover:bg-orange-100 text-[#FF6B00] font-bold px-2 py-1 rounded-lg border border-orange-200 flex items-center gap-1 transition-colors whitespace-nowrap"
                                title="Abrir galeria e opções de foto"
                              >
                                <ImageIcon className="w-3 h-3" />
                                <span>Alterar Imagem</span>
                              </button>
                              <label className="text-[10px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer block underline">
                                <span>Upload Rápido</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleProductImageUpload(prod.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </td>

                        {/* Name and Description */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{prod.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {prod.categoryLabel}
                          </span>
                        </td>

                        {/* Price (Interactive inline change!) */}
                        <td className="py-2.5 px-3 text-right">
                          {isEditingThisPrice ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={newPriceValue}
                                onChange={(e) => setNewPriceValue(Number(e.target.value))}
                                className="w-24 border border-[#FF6B00] rounded px-2 py-1 text-xs font-bold text-right focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveInlinePrice(prod.id)}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                title="Guardar novo preço"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingPriceId(null)}
                                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                                {formatKz(prod.basePrice)}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPriceId(prod.id);
                                  setNewPriceValue(prod.basePrice);
                                }}
                                className="p-1 text-slate-400 hover:text-[#FF6B00] rounded hover:bg-slate-100"
                                title="Editar Preço em Kwanzas"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Min Order */}
                        <td className="py-2.5 px-2 text-center text-slate-600 font-bold">
                          {prod.minOrder} un
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold"
                            >
                              Editar Tudo
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Tem a certeza que deseja remover "${prod.name}" do catálogo do site?`)) {
                                  onDeleteProduct(prod.id);
                                  showNotification(`Artigo "${prod.name}" removido com sucesso.`);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                              title="Remover Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB PORTFÓLIO: GESTÃO DE FOTOS & PRODUÇÕES REAIS --- */}
        {activeTab === 'portfolio' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Persistence & Info banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-black font-black flex items-center justify-center shrink-0">
                  <Images className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-950">
                      Gestão de Fotografias do Portfólio Quieto Angola
                    </h3>
                    <span className="bg-[#FF6B00]/20 text-[#EA580C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {galleryItems.length} Fotografias Ativas
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Adiciona novas fotos de produções reais ou remove peças antigas. As alterações atualizam a seção <strong>Portfólio</strong> do site e ficam gravadas em memória permanente (IndexedDB).
                  </p>
                </div>
              </div>
            </div>

            {/* Secção de Carregamento em Massa de Várias Fotos */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-slate-50 border-2 border-dashed border-[#FF6B00]/50 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-bold shadow-sm">
                    <Images className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                      Carregar Várias Fotos de Uma Só Vez
                      <span className="bg-[#FF6B00] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                        Seleção Múltipla
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600">
                      Seleciona várias fotografias do telemóvel ou computador em simultâneo. Todas são otimizadas e sincronizadas automaticamente com a nuvem e com o Portfólio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opções prévias para o lote de fotos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Categoria para as fotos do lote:
                  </label>
                  <select
                    value={batchCategory}
                    onChange={(e) => setBatchCategory(e.target.value as GalleryCategoryType)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="textil">Têxtil & Uniformes</option>
                    <option value="brindes">Brindes Executivos</option>
                    <option value="papelaria">Papelaria Corporativa</option>
                    <option value="epi">Segurança & EPI</option>
                    <option value="frotas">Frotas & Viaturas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cliente / Referência:
                  </label>
                  <input
                    type="text"
                    value={batchClient}
                    onChange={(e) => setBatchClient(e.target.value)}
                    placeholder="Ex: Quieto Angola, Sonangol..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Técnica Gráfica:
                  </label>
                  <input
                    type="text"
                    value={batchTechnique}
                    onChange={(e) => setBatchTechnique(e.target.value)}
                    placeholder="Ex: Estampa DTF Têxtil HD"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Botão de carregamento múltiplo com barra de progresso */}
              {isUploadingBatch ? (
                <div className="bg-white border border-[#FF6B00]/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Loader2 className="w-4 h-4 text-[#FF6B00] animate-spin" />
                    <span>
                      A processar fotos ({batchProgress?.current || 0} de {batchProgress?.total || 0})...
                    </span>
                  </div>
                  {batchProgress?.currentFileName && (
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      A comprimir: <span className="font-mono text-slate-700">{batchProgress.currentFileName}</span>
                    </p>
                  )}
                  <div className="w-full max-w-md bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-[#FF6B00] h-full transition-all duration-300 ease-out"
                      style={{
                        width: `${batchProgress?.total ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    A gravar na nuvem e no telemóvel/computador em tempo real...
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#FF6B00] hover:bg-orange-500/5 rounded-xl cursor-pointer bg-white transition-all group shadow-xs hover:shadow">
                  <div className="w-12 h-12 rounded-full bg-orange-100 group-hover:bg-[#FF6B00] group-hover:text-white text-[#FF6B00] flex items-center justify-center transition-colors mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#FF6B00] transition-colors text-center">
                    Clica aqui para Carregar Várias Fotos de Uma Só Vez
                  </span>
                  <span className="text-xs text-slate-500 mt-1 text-center">
                    Podes segurar Ctrl/Cmd ou selecionar múltiplos ficheiros de imagem na tua galeria
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePortfolioMultipleUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Form: Adicionar Nova Foto ao Portfólio (Individual) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#FF6B00]" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Adicionar Nova Fotografia ao Portfólio (Individual com Detalhes)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  PNG, JPG ou WebP otimizado automaticamente
                </span>
              </div>

              <form onSubmit={handleCreateGalleryItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Photo Upload or URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      1. Imagem da Peça: *
                    </label>
                    <div className="flex flex-col gap-2">
                      {newGalImage ? (
                        <div className="relative w-full h-32 rounded-xl border border-slate-300 bg-white overflow-hidden p-1 flex items-center justify-center group">
                          <img
                            src={newGalImage}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setNewGalImage('')}
                            className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs font-bold shadow-md"
                            title="Remover e escolher outra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#FF6B00] rounded-xl cursor-pointer bg-white transition-colors">
                          <Upload className="w-6 h-6 text-[#FF6B00] mb-1" />
                          <span className="text-xs font-bold text-slate-700">Carregar Foto do Computador / Telemóvel</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Suporta seleção individual ou múltipla</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePortfolioImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Ou link direto:</span>
                        <input
                          type="text"
                          value={newGalImage}
                          onChange={(e) => setNewGalImage(e.target.value)}
                          placeholder="https://... ou /assets/..."
                          className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title, Category & Client */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Título da Peça / Brinde: *
                      </label>
                      <input
                        type="text"
                        value={newGalTitle}
                        onChange={(e) => setNewGalTitle(e.target.value)}
                        placeholder="Ex: Hoodie Canguru Personalizado DTF"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Categoria:
                        </label>
                        <select
                          value={newGalCategory}
                          onChange={(e) => setNewGalCategory(e.target.value as GalleryCategoryType)}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                        >
                          <option value="textil">Têxtil & Uniformes</option>
                          <option value="brindes">Brindes Executivos</option>
                          <option value="papelaria">Papelaria Corporativa</option>
                          <option value="epi">Segurança & EPI</option>
                          <option value="frotas">Frotas & Viaturas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Cliente / Projeto:
                        </label>
                        <input
                          type="text"
                          value={newGalClient}
                          onChange={(e) => setNewGalClient(e.target.value)}
                          placeholder="Ex: BFA, Sonangol..."
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Técnica Gráfica:
                        </label>
                        <input
                          type="text"
                          value={newGalTechnique}
                          onChange={(e) => setNewGalTechnique(e.target.value)}
                          placeholder="Ex: DTF Têxtil HD, Laser..."
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Tiragem Mínima:
                        </label>
                        <input
                          type="number"
                          value={newGalMinQty}
                          onChange={(e) => setNewGalMinQty(Number(e.target.value))}
                          min={1}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description & Action */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Descrição da Produção:
                      </label>
                      <textarea
                        rows={3}
                        value={newGalDescription}
                        onChange={(e) => setNewGalDescription(e.target.value)}
                        placeholder="Detalhes sobre tecido, gramagem, gravação e acabamento..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Foto ao Portfólio</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Search and Grid of current Portfolio items */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Fotografias Ativas no Portfólio ({galleryItems.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Clica em "Remover" para retirar qualquer foto em tempo real
                  </span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchPortfolio}
                    onChange={(e) => setSearchPortfolio(e.target.value)}
                    placeholder="Filtrar por nome ou cliente..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Grid of cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryItems
                  .filter(item => 
                    !searchPortfolio || 
                    item.title.toLowerCase().includes(searchPortfolio.toLowerCase()) ||
                    item.client.toLowerCase().includes(searchPortfolio.toLowerCase()) ||
                    item.technique.toLowerCase().includes(searchPortfolio.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={item.image.startsWith('/public/') ? item.image.replace(/^\/public\//, '/') : item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="p-3 space-y-1 flex-1">
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {item.technique}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Cliente: <strong className="text-slate-600">{item.client}</strong>
                        </p>
                      </div>

                      <div className="p-2.5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Mín: {item.minQuantity} un
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeletePortfolioItem(item)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Remover esta foto do portfólio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: ENCOMENDAS & EMISSÃO DE FACTURA PDF --- */}
        {activeTab === 'encomendas' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Registo de Encomendas & Emissão de Documentos Fiscais
                </h3>
                <p className="text-xs text-slate-500">
                  Clica em <strong>"Emitir Factura PDF"</strong> para gerar o documento certificado para o cliente ou partilhar no WhatsApp.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Nenhuma encomenda registada ainda</p>
                <p className="text-[11px] text-slate-400">As novas compras efetuadas pelos clientes aparecerão aqui automaticamente.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-white font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Nº Encomenda</th>
                      <th className="py-3 px-3">Cliente / NIF</th>
                      <th className="py-3 px-3">Contacto</th>
                      <th className="py-3 px-3">Total (Kz)</th>
                      <th className="py-3 px-3">Pagamento</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3 text-center">Factura PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {ord.id}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">
                            {ord.isCompany && ord.companyName ? ord.companyName : ord.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ord.isCompany && ord.nif ? `NIF: ${ord.nif}` : 'Consumidor Final'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          <div>{ord.customerPhone}</div>
                          <div className="text-[11px] text-slate-400">{ord.customerProvince}</div>
                        </td>

                        <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums">
                          {formatKz(ord.totalAmount)}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-700 uppercase text-[11px]">
                            {ord.paymentMethod}
                          </span>
                        </td>

                        {/* Status dropdown */}
                        <td className="py-3 px-3 text-center">
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) => {
                              const newStat = e.target.value as 'pendente' | 'aprovado' | 'em_analise';
                              onUpdateOrderStatus(ord.id, newStat, newStat === 'aprovado' ? 2 : 1);
                              showNotification(`Estado da encomenda ${ord.id} atualizado.`);
                            }}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                              ord.paymentStatus === 'aprovado'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-amber-50 border-amber-300 text-amber-800'
                            }`}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="aprovado">Pago / Aprovado</option>
                            <option value="em_analise">Em Análise</option>
                          </select>
                        </td>

                        {/* Invoice Generator Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onOpenInvoiceModal(ord)}
                            className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 mx-auto"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Emitir Factura PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: FORMULÁRIO DE ADICIONAR NOVO PRODUTO --- */}
        {activeTab === 'novo_produto' && (
          <form onSubmit={handleCreateProduct} className="p-6 flex-1 overflow-y-auto space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
              Criar Novo Artigo para o Catálogo e Personalizador
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Artigo / Brinde *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ex: Camisola de Algodão Oversized Luanda"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="vestuario">T-shirts & Vestuário</option>
                  <option value="brindes_executivos">Brindes Executivos</option>
                  <option value="bebidas_termicos">Bebidas & Térmicos</option>
                  <option value="eventos_sacolas">Eventos & Sacolas</option>
                  <option value="tecnologia">Tecnologia & Escritório</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço Base em Kwanzas (Kz) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={newProdBasePrice}
                  onChange={(e) => setNewProdBasePrice(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade Mínima de Encomenda *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newProdMinOrder}
                  onChange={(e) => setNewProdMinOrder(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo de Produção (Dias Úteis)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProdLeadTime}
                  onChange={(e) => setNewProdLeadTime(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição do Artigo
              </label>
              <textarea
                rows={2}
                value={newProdDescription}
                onChange={(e) => setNewProdDescription(e.target.value)}
                placeholder="Detalhes dos materiais, gramagem, acabamento e recomendações de uso..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* Image Uploader */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fotografia / Imagem do Produto:
              </label>
              <div className="flex items-center gap-4">
                {newProdImage ? (
                  <div className="w-16 h-16 rounded-lg border border-slate-300 overflow-hidden shrink-0">
                    <img src={newProdImage} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer border border-slate-300">
                      <span>Carregar Foto do Computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file, 800, 800, 0.85);
                              setNewProdImage(compressed);
                            } catch {
                              const reader = new FileReader();
                              reader.onload = (event) => setNewProdImage(event.target?.result as string);
                              reader.readAsDataURL(file);
                            } finally {
                              e.target.value = '';
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setNewProdImage(e.target.value);
                        }
                      }}
                      className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
                    >
                      <option value="">Ou escolhe da Galeria Quieto...</option>
                      {QUIETO_PORTFOLIO_GALLERY.map((g, i) => (
                        <option key={i} value={g.src}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">Formatos aceites: PNG, JPG ou WebP (otimizado automaticamente)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('produtos')}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-md transition-colors"
              >
                Publicar Artigo no Site Agora
              </button>
            </div>
          </form>
        )}

        {/* --- EDIT SLIDE TEXT MODAL --- */}
        {editingSlide && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">Editar Conteúdo do Slide</h4>
                <button
                  onClick={() => setEditingSlide(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline Superior:</label>
                <input
                  type="text"
                  value={editingSlide.tagline}
                  onChange={(e) => setEditingSlide({ ...editingSlide, tagline: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título Principal:</label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição:</label>
                <textarea
                  rows={2}
                  value={editingSlide.description}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Texto do Botão:</label>
                <input
                  type="text"
                  value={editingSlide.ctaText || 'Personalizar Agora'}
                  onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setEditingSlide(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const updated = bannerSlides.map(s => s.id === editingSlide.id ? editingSlide : s);
                    onUpdateBannerSlides(updated);
                    setEditingSlide(null);
                    showNotification('Slide do banner atualizado com sucesso!');
                  }}
                  className="px-4 py-1.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-lg"
                >
                  Guardar Slide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT FULL PRODUCT MODAL --- */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">Editar Produto Completo</h4>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome:</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preço em Kwanzas (Kz):</label>
                  <input
                    type="number"
                    value={editingProduct.basePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pedido Mínimo:</label>
                  <input
                    type="number"
                    value={editingProduct.minOrder}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minOrder: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Product Image in Edit Modal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fotografia do Artigo:</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img
                      key={editingProduct.image}
                      src={editingProduct.image}
                      alt={editingProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => setProductImageSelectorModal(editingProduct)}
                      className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Trocar Imagem (Galeria ou Upload)</span>
                    </button>
                    <p className="text-[10px] text-slate-500">Podes carregar do PC ou escolher do portfólio oficial</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição:</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onUpdateProduct(editingProduct);
                    setEditingProduct(null);
                    showNotification(`Produto "${editingProduct.name}" atualizado com sucesso!`);
                  }}
                  className="px-4 py-1.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-lg"
                >
                  Guardar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- DEDICATED PRODUCT IMAGE SELECTION & UPLOAD MODAL --- */}
        {productImageSelectorModal && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider block">
                    Gestão de Imagem do Artigo
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {productImageSelectorModal.name}
                  </h4>
                </div>
                <button
                  onClick={() => setProductImageSelectorModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Current Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <img
                    key={productImageSelectorModal.image}
                    src={productImageSelectorModal.image.startsWith('/public/') ? productImageSelectorModal.image.replace(/^\/public\//, '/') : productImageSelectorModal.image}
                    alt={productImageSelectorModal.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/aistudio/Sem_t_tulo-1-15_614126e0.jpg';
                    }}
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Imagem Ativa no Site:
                  </span>
                  <p className="text-xs text-slate-700 font-mono line-clamp-1 break-all bg-white px-2 py-1 rounded border border-slate-200">
                    {productImageSelectorModal.image.startsWith('data:') 
                      ? 'Imagem personalizada carregada via upload' 
                      : productImageSelectorModal.image}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-center sm:justify-start">
                    <Check className="w-3 h-3" /> Atualizado em tempo real no catálogo
                  </span>
                </div>
              </div>

              {/* Method 1: Upload from Computer with automatic compression */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Carregar Foto do Computador ou Telemóvel:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#FF6B00] rounded-xl cursor-pointer text-xs font-bold text-slate-800 transition-colors">
                    <Upload className="w-4 h-4 text-[#FF6B00]" />
                    <span>Selecionar Ficheiro (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(productImageSelectorModal.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400">
                  * A imagem é otimizada e comprimida automaticamente para carregar instantaneamente.
                </p>
              </div>

              {/* Method 2: Choose 1-click from Quieto Angola Portfolio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                    2. Ou Escolhe do Portfólio Quieto Angola ({galleryItems.length} Fotos):
                  </label>
                  <span className="text-[10px] text-[#FF6B00] font-bold">1 Clique para Aplicar</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50">
                  {galleryItems.map((item, i) => {
                    const cleanImg = item.image.startsWith('/public/') ? item.image.replace(/^\/public\//, '/') : item.image;
                    const isSelected = productImageSelectorModal.image === cleanImg || productImageSelectorModal.image === item.image;

                    return (
                      <button
                        key={item.id || i}
                        type="button"
                        onClick={() => handleApplyPortfolioImageToProduct(productImageSelectorModal.id, cleanImg, item.title)}
                        className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all group ${
                          isSelected
                            ? 'border-[#FF6B00] bg-orange-50 ring-2 ring-[#FF6B00]/40'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={cleanImg}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 line-clamp-1 text-center w-full">
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method 3: Direct URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  3. Ou Cola um Link / URL de Imagem:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customProductImageUrl}
                      onChange={(e) => setCustomProductImageUrl(e.target.value)}
                      placeholder="Ex: https://exemplo.com/minha-imagem.jpg"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyUrlImageToProduct(productImageSelectorModal.id, customProductImageUrl)}
                    disabled={!customProductImageUrl.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>

              {/* Close button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setProductImageSelectorModal(null)}
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  Concluir Edição da Imagem ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
