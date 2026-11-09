// High-resolution vector graphics ready for instantaneous printing preview

export interface StockGraphic {
  id: string;
  name: string;
  category: string;
  svgDataUri: string;
}

export const STOCK_GRAPHICS: StockGraphic[] = [
  {
    id: 'quieto-brand',
    name: 'Logo Quieto Angola',
    category: 'Oficial',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%23FF6B00"/><circle cx="50" cy="50" r="41" fill="%23121212"/><text x="50" y="47" font-family="sans-serif" font-weight="900" font-size="16" fill="%23FFFFFF" text-anchor="middle">QUIETO</text><text x="50" y="65" font-family="sans-serif" font-weight="700" font-size="11" fill="%23FF6B00" text-anchor="middle">ANGOLA</text></svg>`
  },
  {
    id: 'feito-em-angola',
    name: 'Feito em Angola',
    category: 'Nacional',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect x="5" y="15" width="90" height="70" rx="8" fill="%23121212" stroke="%23EAB308" stroke-width="3"/><path d="M 50 25 L 53 35 L 63 35 L 55 42 L 58 52 L 50 45 L 42 52 L 45 42 L 37 35 L 47 35 Z" fill="%23EAB308"/><text x="50" y="65" font-family="sans-serif" font-weight="bold" font-size="9" fill="%23FFFFFF" text-anchor="middle">FEITO EM</text><text x="50" y="78" font-family="sans-serif" font-weight="900" font-size="11" fill="%23DC2626" text-anchor="middle">ANGOLA</text></svg>`
  },
  {
    id: 'palanca-negra',
    name: 'Palanca Negra Gigante',
    category: 'Nacional',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="45" fill="%23121212" stroke="%23FF6B00" stroke-width="4"/><path d="M 30 75 Q 45 35 60 25 Q 75 18 85 22 Q 72 32 65 48 Q 50 65 30 75 Z" fill="%23FF6B00"/><circle cx="45" cy="45" r="4" fill="%23FFFFFF"/><text x="50" y="85" font-family="sans-serif" font-weight="800" font-size="7" fill="%23FFFFFF" text-anchor="middle">PALANCA 244</text></svg>`
  },
  {
    id: 'luanda-vibes',
    name: 'Luanda 244 Club',
    category: 'Urbano',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%23FF6B00"/><text x="50" y="44" font-family="Impact, sans-serif" font-size="22" fill="%23121212" text-anchor="middle">LUANDA</text><text x="50" y="68" font-family="Impact, sans-serif" font-size="24" fill="%23FFFFFF" text-anchor="middle">+244</text></svg>`
  },
  {
    id: 'corporate-crest',
    name: 'Selo Executivo Premium',
    category: 'Corporativo',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="%231E293B" stroke="%23FF6B00" stroke-width="3"/><text x="50" y="45" font-family="sans-serif" font-weight="900" font-size="12" fill="%23FF6B00" text-anchor="middle">SUMMIT</text><text x="50" y="62" font-family="sans-serif" font-weight="600" font-size="10" fill="%23FFFFFF" text-anchor="middle">2026</text><text x="50" y="74" font-family="sans-serif" font-weight="bold" font-size="6" fill="%2394A3B8" text-anchor="middle">LUANDA EDITION</text></svg>`
  },
  {
    id: 'vip-star',
    name: 'VIP Star Emblem',
    category: 'Eventos',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%23121212" stroke="%23E2E8F0" stroke-width="2"/><polygon points="50,15 58,35 80,35 62,48 68,70 50,56 32,70 38,48 20,35 42,35" fill="%23FF6B00"/><text x="50" y="86" font-family="sans-serif" font-weight="bold" font-size="9" fill="%23FFFFFF" text-anchor="middle">VIP ACCESS</text></svg>`
  }
];
