import React from 'react';
import { SideDesign } from '../types';

interface ProductSilhouetteProps {
  productId: string;
  side: 'frente' | 'costas';
  colorHex: string;
  design: SideDesign;
  onSelectElement?: (id: string) => void;
  selectedElementId?: string | null;
  interactive?: boolean;
}

export const ProductSilhouette: React.FC<ProductSilhouetteProps> = ({
  productId,
  side,
  colorHex,
  design,
  onSelectElement,
  selectedElementId,
  interactive = true,
}) => {
  const isLight = colorHex.toLowerCase() === '#ffffff' || colorHex.toLowerCase() === '#f5ebe1';

  // Determine which silhouette to draw
  const isHoodie = productId.includes('hoodie');
  const isPolo = productId.includes('polo');
  const isMug = productId.includes('caneca');
  const isStanley = productId.includes('stanley');
  const isBottle = productId.includes('garrafa');
  const isTote = productId.includes('sacola');
  const isCap = productId.includes('bone');
  const isTshirt = !isHoodie && !isPolo && !isMug && !isStanley && !isBottle && !isTote && !isCap;

  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto select-none flex items-center justify-center p-4">
      {/* SVG Canvas Container */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-xl"
        style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.08))' }}
      >
        <defs>
          <radialGradient id="highlight" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isLight ? 0.3 : 0.12} />
            <stop offset="100%" stopColor="#000000" stopOpacity={isLight ? 0.08 : 0.35} />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* --- T-SHIRT (FRONT / BACK) --- */}
        {isTshirt && (
          <g id="tshirt-group">
            {/* Main T-Shirt Body */}
            <path
              d="M 160 80 
                 C 180 100, 320 100, 340 80 
                 L 440 160 
                 C 445 165, 435 185, 410 215 
                 L 365 180 
                 L 370 430 
                 C 370 440, 360 445, 350 445 
                 L 150 445 
                 C 140 445, 130 440, 130 430 
                 L 135 180 
                 L 90 215 
                 C 65 185, 55 165, 60 160 
                 Z"
              fill={colorHex}
              stroke={isLight ? '#CBD5E1' : '#1E293B'}
              strokeWidth="2.5"
            />
            {/* Shading Overlay */}
            <path
              d="M 160 80 C 180 100, 320 100, 340 80 L 440 160 C 445 165, 435 185, 410 215 L 365 180 L 370 430 C 370 440, 360 445, 350 445 L 150 445 C 140 445, 130 440, 130 430 L 135 180 L 90 215 C 65 185, 55 165, 60 160 Z"
              fill="url(#highlight)"
              opacity="0.9"
            />

            {/* Collar */}
            {side === 'frente' ? (
              <path
                d="M 160 80 C 180 135, 320 135, 340 80 C 315 110, 185 110, 160 80 Z"
                fill={colorHex}
                stroke={isLight ? '#94A3B8' : '#334155'}
                strokeWidth="2"
              />
            ) : (
              <path
                d="M 160 80 C 190 95, 310 95, 340 80 C 310 88, 190 88, 160 80 Z"
                fill={colorHex}
                stroke={isLight ? '#94A3B8' : '#334155'}
                strokeWidth="2"
              />
            )}

            {/* Subtle Fabric Folds / Seams */}
            <path d="M 135 180 L 160 120" stroke={isLight ? '#E2E8F0' : '#1E293B'} strokeWidth="1.5" opacity="0.6" />
            <path d="M 365 180 L 340 120" stroke={isLight ? '#E2E8F0' : '#1E293B'} strokeWidth="1.5" opacity="0.6" />
            <path d="M 140 435 L 360 435" stroke={isLight ? '#E2E8F0' : '#1E293B'} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          </g>
        )}

        {/* --- HOODIE --- */}
        {isHoodie && (
          <g id="hoodie-group">
            <path
              d="M 150 90 L 350 90 L 450 170 L 415 225 L 375 190 L 375 440 L 125 440 L 125 190 L 85 225 L 50 170 Z"
              fill={colorHex}
              stroke={isLight ? '#CBD5E1' : '#1E293B'}
              strokeWidth="2.5"
            />
            <path d="M 150 90 L 350 90 L 450 170 L 415 225 L 375 190 L 375 440 L 125 440 L 125 190 L 85 225 L 50 170 Z" fill="url(#highlight)" />
            {/* Hood */}
            <path
              d="M 150 90 C 180 50, 320 50, 350 90 C 310 125, 190 125, 150 90 Z"
              fill={colorHex}
              stroke={isLight ? '#94A3B8' : '#334155'}
              strokeWidth="2"
            />
            {/* Kangaroo Pocket (Front only) */}
            {side === 'frente' && (
              <path
                d="M 190 340 L 310 340 L 335 410 L 165 410 Z"
                fill={colorHex}
                stroke={isLight ? '#94A3B8' : '#334155'}
                strokeWidth="2"
              />
            )}
            {/* Drawstrings */}
            {side === 'frente' && (
              <>
                <line x1="225" y1="110" x2="225" y2="180" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                <line x1="275" y1="110" x2="275" y2="175" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </g>
        )}

        {/* --- POLO SHIRT --- */}
        {isPolo && (
          <g id="polo-group">
            <path
              d="M 155 85 L 345 85 L 435 160 L 400 205 L 360 175 L 365 435 L 135 435 L 140 175 L 100 205 L 65 160 Z"
              fill={colorHex}
              stroke={isLight ? '#CBD5E1' : '#1E293B'}
              strokeWidth="2.5"
            />
            <path d="M 155 85 L 345 85 L 435 160 L 400 205 L 360 175 L 365 435 L 135 435 L 140 175 L 100 205 L 65 160 Z" fill="url(#highlight)" />
            {/* Collar wings */}
            <polygon points="150,85 210,135 250,95 190,80" fill={colorHex} stroke="#475569" strokeWidth="1.5" />
            <polygon points="350,85 290,135 250,95 310,80" fill={colorHex} stroke="#475569" strokeWidth="1.5" />
            {/* Placket */}
            <rect x="238" y="95" width="24" height="75" fill={colorHex} stroke="#475569" strokeWidth="1.5" />
            <circle cx="250" cy="115" r="2.5" fill="#FFFFFF" stroke="#94A3B8" />
            <circle cx="250" cy="140" r="2.5" fill="#FFFFFF" stroke="#94A3B8" />
          </g>
        )}

        {/* --- MUG / CANECA --- */}
        {isMug && (
          <g id="mug-group" transform="translate(60, 40) scale(0.76)">
            {/* Handle */}
            <path
              d="M 370 170 C 470 170, 470 340, 370 340"
              fill="none"
              stroke={colorHex}
              strokeWidth="38"
              strokeLinecap="round"
            />
            <path
              d="M 370 170 C 470 170, 470 340, 370 340"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              opacity="0.15"
            />
            {/* Cup Body */}
            <rect x="130" y="110" width="250" height="300" rx="16" fill={colorHex} stroke="#64748B" strokeWidth="2.5" />
            <rect x="130" y="110" width="250" height="300" rx="16" fill="url(#highlight)" />
            {/* Rim */}
            <ellipse cx="255" cy="115" rx="125" ry="20" fill={colorHex} stroke="#94A3B8" strokeWidth="2" />
          </g>
        )}

        {/* --- STANLEY TUMBLER --- */}
        {isStanley && (
          <g id="stanley-group" transform="translate(90, 20) scale(0.65)">
            {/* Handle */}
            <path d="M 360 210 C 460 210, 460 410, 360 410" fill="none" stroke="#FF6B00" strokeWidth="32" strokeLinecap="round" />
            {/* Straw */}
            <rect x="235" y="10" width="16" height="100" rx="4" fill="#E2E8F0" opacity="0.85" />
            {/* Lid */}
            <rect x="130" y="90" width="220" height="40" rx="8" fill="#334155" />
            {/* Top taper */}
            <polygon points="140,130 340,130 320,380 160,380" fill={colorHex} stroke="#475569" strokeWidth="2" />
            <polygon points="140,130 340,130 320,380 160,380" fill="url(#highlight)" />
            {/* Base taper */}
            <polygon points="160,380 320,380 300,560 180,560" fill={colorHex} stroke="#475569" strokeWidth="2" />
            <rect x="175" y="555" width="130" height="15" rx="4" fill="#94A3B8" />
          </g>
        )}

        {/* --- TOTE BAG (SACOLA DE PANO CRU) --- */}
        {isTote && (
          <g id="tote-group" transform="translate(60, 20) scale(0.76)">
            {/* Straps */}
            <path d="M 180 200 C 180 40, 230 40, 230 200" fill="none" stroke="#D1C7BD" strokeWidth="20" />
            <path d="M 280 200 C 280 40, 330 40, 330 200" fill="none" stroke="#D1C7BD" strokeWidth="20" />
            {/* Bag Body */}
            <rect x="130" y="200" width="250" height="280" rx="8" fill={colorHex} stroke="#CBD5E1" strokeWidth="2" />
            <rect x="130" y="200" width="250" height="280" rx="8" fill="url(#highlight)" />
            <line x1="130" y1="225" x2="380" y2="225" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
          </g>
        )}

        {/* --- CAP / BONE --- */}
        {isCap && (
          <g id="cap-group" transform="translate(60, 50) scale(0.76)">
            {/* Crown */}
            <path d="M 100 300 C 100 130, 380 130, 380 300 Z" fill={colorHex} stroke="#475569" strokeWidth="2.5" />
            <path d="M 100 300 C 100 130, 380 130, 380 300 Z" fill="url(#highlight)" />
            {/* Visor / Brim */}
            <path d="M 90 300 C 90 300, 240 370, 430 320 C 400 290, 380 290, 380 300 Z" fill={colorHex} stroke="#334155" strokeWidth="2.5" />
            {/* Button on top */}
            <circle cx="240" cy="140" r="10" fill="#FF6B00" />
          </g>
        )}

        {/* --- PRINTABLE BOUNDARY GUIDE (SUBTLE DASHED AREA) --- */}
        <g id="printable-area-guide">
          <rect
            x={isMug ? 170 : isStanley ? 165 : isTote ? 175 : isCap ? 165 : 180}
            y={isMug ? 150 : isStanley ? 160 : isTote ? 240 : isCap ? 190 : 160}
            width={isMug ? 170 : isStanley ? 150 : isTote ? 160 : isCap ? 150 : 140}
            height={isMug ? 190 : isStanley ? 200 : isTote ? 180 : isCap ? 90 : 190}
            fill="none"
            stroke="#FF6B00"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.35"
            rx="6"
          />
          <text
            x={250}
            y={isCap ? 180 : isTote ? 230 : 152}
            textAnchor="middle"
            fill="#FF6B00"
            fontSize="10"
            fontWeight="bold"
            opacity="0.6"
            letterSpacing="1"
          >
            ÁREA DE ESTAMPA ({side.toUpperCase()})
          </text>
        </g>

        {/* --- USER DESIGN ELEMENTS LAYER --- */}
        <g id="design-elements-layer">
          {/* 1. Pre-made or Uploaded Graphics */}
          {design.graphics.map((gfx) => {
            const isSelected = selectedElementId === gfx.id;
            return (
              <g
                key={gfx.id}
                transform={`translate(${gfx.x}, ${gfx.y}) rotate(${gfx.rotation}) scale(${gfx.scale})`}
                onClick={() => interactive && onSelectElement?.(gfx.id)}
                className={interactive ? 'cursor-move' : ''}
              >
                <image
                  href={gfx.src}
                  x="-40"
                  y="-40"
                  width="80"
                  height="80"
                  preserveAspectRatio="xMidYMid meet"
                />
                {isSelected && interactive && (
                  <rect
                    x="-45"
                    y="-45"
                    width="90"
                    height="90"
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    rx="4"
                  />
                )}
              </g>
            );
          })}

          {/* 2. Text Elements */}
          {design.textElements.map((txt) => {
            const isSelected = selectedElementId === txt.id;
            return (
              <g
                key={txt.id}
                transform={`translate(${txt.x}, ${txt.y}) rotate(${txt.rotation})`}
                onClick={() => interactive && onSelectElement?.(txt.id)}
                className={interactive ? 'cursor-move' : ''}
              >
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={txt.color}
                  fontFamily={txt.font}
                  fontSize={txt.fontSize}
                  fontWeight="bold"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                >
                  {txt.text}
                </text>
                {isSelected && interactive && (
                  <rect
                    x={-txt.text.length * (txt.fontSize * 0.32) - 8}
                    y={-txt.fontSize * 0.65}
                    width={txt.text.length * (txt.fontSize * 0.64) + 16}
                    height={txt.fontSize * 1.3}
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    rx="4"
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
