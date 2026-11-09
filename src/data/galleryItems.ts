import { GalleryItem } from '../types';
export type { GalleryItem };

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-van-quieto',
    title: 'Carrinha de Distribuição & Frota Quieto',
    category: 'frotas',
    categoryLabel: 'Frotas & Viaturas',
    image: '/assets/aistudio/Sem_t_tulo-1-11_6438026a.jpg',
    technique: 'Vinil Cast Fundição de Alta Durabilidade',
    description: 'Decoração integral e wrapping de frota comercial com grafismos geométricos laranja e preto e logótipo Quieto Angola.',
    client: 'Quieto Angola Frota Oficial',
    minQuantity: 1
  },
  {
    id: 'gal-hoodie-quieto',
    title: 'Hoodie com Capuz "Do Planeamento à Ação"',
    category: 'textil',
    categoryLabel: 'Têxtil & Uniformes',
    image: '/assets/aistudio/Sem_t_tulo-1-12_498dda17.jpg',
    technique: 'Estampa DTF Têxtil HD & Cordão Bicolor',
    description: 'Moletom felpado branco premium 320g com estampa multicolor Quieto Angola e grafismos laterais no braço.',
    client: 'Equipa Criativa Quieto',
    minQuantity: 10
  },
  {
    id: 'gal-identidade-quieto',
    title: 'Kit de Papelaria Institucional & Caneca',
    category: 'papelaria',
    categoryLabel: 'Papelaria Corporativa',
    image: '/assets/aistudio/Sem_t_tulo-1-09_cf4df66d.jpg',
    technique: 'Impressão Offset UV & Sublimação Cerâmica',
    description: 'Conjunto executivo com pasta porta-documentos, folha timbrada, envelope institucional e caneca de porcelana.',
    client: 'Quieto Angola Corporate',
    minQuantity: 25
  },
  {
    id: 'gal-garrafa-inox',
    title: 'Garrafa Térmica Inox Vacuum 500ml',
    category: 'brindes',
    categoryLabel: 'Brindes Executivos',
    image: '/assets/aistudio/Sem_t_tulo-1-14_06d57df6.jpg',
    technique: 'Gravação Laser Fibra Permanente',
    description: 'Garrafa térmica metálica em preto mate com gravação laser milimétrica do logótipo Quieto. Mantém bebidas frias por 24h e quentes por 12h.',
    client: 'Brindes VIP de Fim de Ano',
    minQuantity: 20
  },
  {
    id: 'gal-epi-amp',
    title: 'Kit EPI: Capacete, Fita Lanyard & Bonés AMP',
    category: 'epi',
    categoryLabel: 'Segurança & EPI',
    image: '/assets/aistudio/Sem_t_tulo-1-31_7ac8f463.jpg',
    technique: 'Serigrafia Industrial & Tampografia de Alta Aderência',
    description: 'Capacete de proteção para obras de engenharia com certificação EN397, fita de pescoço reforçada e bonés trucker respiráveis.',
    client: 'AMP Construção & Estruturas',
    minQuantity: 30
  },
  {
    id: 'gal-lanyard-quieto',
    title: 'Fita de Crachá & Lanyard com Mosquetão',
    category: 'textil',
    categoryLabel: 'Têxtil & Uniformes',
    image: '/assets/aistudio/Sem_t_tulo-1-16_8d14977e.jpg',
    technique: 'Sublimação Contínua em Fita Acetinada 25mm',
    description: 'Lanyard corporativo laranja e preto com fecho de segurança anti-estrangulamento e mosquetão em metal escovado para credenciais.',
    client: 'Eventos & Conferências Luanda',
    minQuantity: 50
  },
  {
    id: 'gal-tshirt-quieto',
    title: 'T-shirt de Algodão Penteado 190g Quieto',
    category: 'textil',
    categoryLabel: 'Têxtil & Uniformes',
    image: '/assets/aistudio/Sem_t_tulo-1-15_614126e0.jpg',
    technique: 'Impressão DTF HD a 4 Cores',
    description: 'T-shirt gola redonda unissexo em algodão penteado com estampa frontal do logótipo Quieto e assinatura da marca no peito.',
    client: 'Uniformes & Merchandising',
    minQuantity: 15
  },
  {
    id: 'gal-pasta-quieto',
    title: 'Pasta de Arquivo & Dossier de Argolas Laranja',
    category: 'papelaria',
    categoryLabel: 'Papelaria Corporativa',
    image: '/assets/aistudio/Sem_t_tulo-1-10_eec9ffb8.jpg',
    technique: 'Plastificação Mate com Verniz Localizado UV',
    description: 'Pasta institucional em cartão rígido com mecanismo de argolas niqueladas, bolsa interior e personalização em laranja Quieto.',
    client: 'Quieto Angola Escritórios',
    minQuantity: 25
  },
  {
    id: 'gal-totebag-retogrow',
    title: 'Sacola Ecológica de Pano Cru & Caneca Retogrow',
    category: 'brindes',
    categoryLabel: 'Brindes Executivos',
    image: '/assets/aistudio/Sem_t_tulo-1-23_5d74e6cc.jpg',
    technique: 'Serigrafia Ecológica Base de Água & Cerâmica',
    description: 'Tote bag 100% algodão biológico cru 220g acompanhado de caneca de cerâmica verde floresta para eventos sustentáveis e agronegócio.',
    client: 'Retogrow Angola',
    minQuantity: 30
  },
  {
    id: 'gal-ptp-kit',
    title: 'Kit Completo PTP Peças Auto: T-shirt, Garrafa & Van',
    category: 'frotas',
    categoryLabel: 'Frotas & Viaturas',
    image: '/assets/aistudio/Sem_t_tulo-1-28_54c0432a.jpg',
    technique: 'Branding 360º (Têxtil + Brinde + Decoração Automóvel)',
    description: 'Pacote corporativo completo de identidade: farda de oficina, garrafas metálicas para técnicos e carrinha de assistência decorada.',
    client: 'PTP Peças & Acessórios Automóveis',
    minQuantity: 1
  },
  {
    id: 'gal-cefics-papelaria',
    title: 'Papelaria Institucional & Certificados CEFICS',
    category: 'papelaria',
    categoryLabel: 'Papelaria Corporativa',
    image: '/assets/aistudio/Sem_t_tulo-1-30_ff9a44b0.jpg',
    technique: 'Couché 350g com Estampagem Dourada a Quente',
    description: 'Pastas de apresentação com bolsas, certificados de formação profissional timbrados e cartões de boas-vindas para alunos.',
    client: 'CEFICS Centro de Formação',
    minQuantity: 50
  },
  {
    id: 'gal-capacetes-amp',
    title: 'Capacetes de Segurança & Bonés AMP Construções',
    category: 'epi',
    categoryLabel: 'Segurança & EPI',
    image: '/assets/aistudio/Sem_t_tulo-1-32_9104e562.jpg',
    technique: 'Tampografia Industrial de Ultra Aderência',
    description: 'Equipamento de proteção individual com impressão resistente a riscos, solventes e raios UV para obras em Luanda e Benguela.',
    client: 'AMP Sua Estrutura',
    minQuantity: 25
  },
  {
    id: 'gal-autocolantes-cartoes',
    title: 'Autocolantes em Vinil Troquelado & Cartões de Visita',
    category: 'papelaria',
    categoryLabel: 'Papelaria Corporativa',
    image: '/assets/aistudio/Sem_t_tulo-1-33_5dbcd418.jpg',
    technique: 'Vinil Troquelado à Forma & Couché 400g Soft-Touch',
    description: 'Stickers circulares impermeáveis com recorte digital milimétrico e conjunto de papelaria executiva com toque aveludado.',
    client: 'AMP Embalagens & Branding',
    minQuantity: 100
  },
  {
    id: 'gal-cefics-executivo',
    title: 'Conjunto Executivo CEFICS: Caderno, Caneta & Pasta',
    category: 'brindes',
    categoryLabel: 'Brindes Executivos',
    image: '/assets/aistudio/Sem_t_tulo-1-24_9233e6ee.jpg',
    technique: 'Gravação a Baixo Relevo (Debossing) & Laser',
    description: 'Caderno em pele sintética verde garrafa com gravação térmica do monograma, caneta metálica a condizer e fita marca-páginas.',
    client: 'CEFICS Conferências',
    minQuantity: 20
  },
  {
    id: 'gal-ptp-agenda',
    title: 'Agenda Anual & Caneca PTP Vermelho Desportivo',
    category: 'brindes',
    categoryLabel: 'Brindes Executivos',
    image: '/assets/aistudio/Sem_t_tulo-1-27_5354dea9.jpg',
    technique: 'Termo-estampagem & Cerâmica Vitrificada',
    description: 'Agenda executiva 2026 com acabamento almofadado e caneca vermelha com interior branco para clientes da oficina PTP.',
    client: 'PTP Assistência Luanda',
    minQuantity: 25
  },
  {
    id: 'gal-retogrow-farda',
    title: 'Polo Piquet & Crachás Magnéticos Retogrow',
    category: 'textil',
    categoryLabel: 'Têxtil & Uniformes',
    image: '/assets/aistudio/Sem_t_tulo-1-22_81aae5d1.jpg',
    technique: 'Bordado Computorizado de Alta Densidade',
    description: 'Polo técnico verde militar com bordado frontal de elevada precisão e crachá de identificação magnético sem furar a roupa.',
    client: 'Retogrow Consultoria Agrícola',
    minQuantity: 15
  }
];

export const GALLERY_ITEMS = INITIAL_GALLERY_ITEMS;
