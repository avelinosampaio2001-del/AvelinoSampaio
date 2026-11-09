import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Product, SideDesign } from '../types';
import { 
  RotateCw, 
  Maximize2, 
  Eye, 
  Compass, 
  Play, 
  Pause,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ThreeDStudioViewerProps {
  product: Product;
  colorHex: string;
  frontDesign: SideDesign;
  backDesign: SideDesign;
  activeSide: 'frente' | 'costas';
  onSwitchSide?: (side: 'frente' | 'costas') => void;
  className?: string;
}

export const ThreeDStudioViewer: React.FC<ThreeDStudioViewerProps> = ({
  product,
  colorHex,
  frontDesign,
  backDesign,
  activeSide,
  onSwitchSide,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [currentViewAngle, setCurrentViewAngle] = useState<'frente' | 'costas' | 'angulo' | 'livre'>('frente');

  // References to keep Three.js instances across re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const shirtGroupRef = useRef<THREE.Group | null>(null);
  const fabricMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Front & Back dynamic print canvases
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const backTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Target camera position for smooth camera transition
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Determine product model type
  const isMug = product.id.includes('caneca');
  const isStanley = product.id.includes('stanley');
  const isBottle = product.id.includes('garrafa');
  const isCylindrical = isMug || isStanley || isBottle;

  // -------------------------------------------------------------
  // Texture Generator: Render SideDesign onto 2D Canvas
  // -------------------------------------------------------------
  const renderDesignToCanvas = useCallback(
    (canvas: HTMLCanvasElement, design: SideDesign, label: string) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 1024;
      canvas.width = size;
      canvas.height = size;

      // Clear transparent
      ctx.clearRect(0, 0, size, size);

      // Coordinate scaling from 500x500 virtual studio to 1024x1024 canvas
      const scaleFactor = size / 500;

      // Render Graphics
      const renderGraphics = () => {
        design.graphics.forEach((gfx) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.save();
            const posX = gfx.x * scaleFactor;
            const posY = gfx.y * scaleFactor;
            ctx.translate(posX, posY);
            if (gfx.rotation) {
              ctx.rotate((gfx.rotation * Math.PI) / 180);
            }
            const origW = img.naturalWidth || img.width || 1;
            const origH = img.naturalHeight || img.height || 1;
            const imgWidth = 140 * gfx.scale * scaleFactor;
            const imgHeight = (imgWidth * origH) / origW;
            ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            ctx.restore();

            // Notify texture to update
            if (label === 'front' && frontTextureRef.current) {
              frontTextureRef.current.needsUpdate = true;
            } else if (label === 'back' && backTextureRef.current) {
              backTextureRef.current.needsUpdate = true;
            }
          };
          img.src = gfx.src;
        });
      };

      // Render Text
      const renderTexts = () => {
        design.textElements.forEach((txt) => {
          ctx.save();
          const posX = txt.x * scaleFactor;
          const posY = txt.y * scaleFactor;
          ctx.translate(posX, posY);
          if (txt.rotation) {
            ctx.rotate((txt.rotation * Math.PI) / 180);
          }

          const fontSize = Math.round(txt.fontSize * scaleFactor * 1.05);
          ctx.font = `bold ${fontSize}px "${txt.font || 'Outfit'}", sans-serif`;
          ctx.fillStyle = txt.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Subtle shadow for legibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 4 * scaleFactor;
          ctx.shadowOffsetX = 1 * scaleFactor;
          ctx.shadowOffsetY = 2 * scaleFactor;

          ctx.fillText(txt.text, 0, 0);
          ctx.restore();
        });
      };

      renderGraphics();
      renderTexts();
    },
    []
  );

  // -------------------------------------------------------------
  // Procedural Micro-Weave Cotton Bump Map
  // -------------------------------------------------------------
  const createCottonBumpMap = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#999999';
    for (let x = 0; x < 128; x += 4) {
      ctx.fillRect(x, 0, 2, 128);
    }
    ctx.fillStyle = '#666666';
    for (let y = 0; y < 128; y += 4) {
      ctx.fillRect(0, y, 128, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  };

  // -------------------------------------------------------------
  // Procedural Wooden Hanger Texture
  // -------------------------------------------------------------
  const createWoodTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#A06D3B'; // warm natural oak wood
    ctx.fillRect(0, 0, 256, 256);

    // subtle wood grain rings
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.ellipse(128, 128, 30 + i * 8, 10 + i * 4, (i * 0.1), 0, Math.PI * 2);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // -------------------------------------------------------------
  // Initialize Three.js Scene
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xF5F6F8);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.set(0, 0.1, 3.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 5.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // don't go too far under the floor
    controls.minPolarAngle = Math.PI / 6; // don't go strictly vertical
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      setIsInteracting(true);
      setCurrentViewAngle('livre');
      targetCameraPos.current = null;
    });

    controls.addEventListener('end', () => {
      setIsInteracting(false);
    });

    // Studio Environment Reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    // 3-Point Studio Lighting Rig
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0xd0d5dd, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.4);
    keyLight.position.set(3, 4, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 0.75);
    fillLight.position.set(-3, 2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Soft Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const radGrad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 64);
    radGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
    radGrad.addColorStop(0.5, 'rgba(0,0,0,0.08)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.35;
    scene.add(shadowMesh);

    // Create Root Model Group
    const modelGroup = new THREE.Group();
    shirtGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Setup Textures
    const frontCanvas = document.createElement('canvas');
    const backCanvas = document.createElement('canvas');
    frontCanvasRef.current = frontCanvas;
    backCanvasRef.current = backCanvas;

    const frontTex = new THREE.CanvasTexture(frontCanvas);
    frontTex.colorSpace = THREE.SRGBColorSpace;
    frontTextureRef.current = frontTex;

    const backTex = new THREE.CanvasTexture(backCanvas);
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTextureRef.current = backTex;

    const cottonBump = createCottonBumpMap();
    const woodTex = createWoodTexture();

    // -------------------------------------------------------------
    // Build 3D Models based on product type
    // -------------------------------------------------------------
    fabricMaterialsRef.current = [];

    if (isCylindrical) {
      // Build 3D Tumbler / Mug
      buildCylindricalModel(modelGroup, isStanley ? 'stanley' : isBottle ? 'bottle' : 'mug', colorHex, frontTex);
    } else {
      // Build 3D T-Shirt / Hoodie Garment
      buildTshirtModel(modelGroup, colorHex, cottonBump, woodTex, frontTex, backTex);
    }

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth Camera transition when snapping to view presets
      if (targetCameraPos.current) {
        camera.position.lerp(targetCameraPos.current, 0.08);
        controls.target.lerp(targetLookAt.current, 0.08);
        if (camera.position.distanceTo(targetCameraPos.current) < 0.02) {
          camera.position.copy(targetCameraPos.current);
          targetCameraPos.current = null;
        }
      }

      // Auto-rotation when active and user is not dragging
      if (autoRotate && !isInteracting && modelGroup) {
        modelGroup.rotation.y += 0.8 * delta;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initial render of textures
    renderDesignToCanvas(frontCanvas, frontDesign, 'front');
    renderDesignToCanvas(backCanvas, backDesign, 'back');
    frontTex.needsUpdate = true;
    backTex.needsUpdate = true;

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      frontTex.dispose();
      backTex.dispose();
      cottonBump.dispose();
      woodTex.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [product.id, isCylindrical, isStanley, isBottle]);

  // -------------------------------------------------------------
  // Helper: Build Procedural 3D T-Shirt Model
  // -------------------------------------------------------------
  const buildTshirtModel = (
    group: THREE.Group,
    baseColor: string,
    bumpMap: THREE.CanvasTexture,
    woodMap: THREE.CanvasTexture,
    frontTex: THREE.CanvasTexture,
    backTex: THREE.CanvasTexture
  ) => {
    group.clear();
    fabricMaterialsRef.current = [];

    // Fabric Material with realistic physical response
    const fabricMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness: 0.82,
      metalness: 0.04,
      bumpMap: bumpMap,
      bumpScale: 0.015,
      side: THREE.DoubleSide
    });
    fabricMaterialsRef.current.push(fabricMat);

    // 1. Torso Shape using ExtrudeGeometry for natural bevels & thickness
    const shape = new THREE.Shape();
    // Starting bottom left
    shape.moveTo(-0.76, -1.05);
    shape.lineTo(0.76, -1.05); // Bottom hem
    shape.bezierCurveTo(0.78, -0.2, 0.79, 0.2, 0.78, 0.45); // Right waist
    shape.lineTo(1.35, 0.48); // Under right sleeve
    shape.bezierCurveTo(1.42, 0.65, 1.38, 0.82, 1.25, 0.95); // Right sleeve outer
    shape.lineTo(0.48, 1.08); // Right shoulder
    shape.bezierCurveTo(0.28, 0.92, -0.28, 0.92, -0.48, 1.08); // Neck collar dip
    shape.lineTo(-1.25, 0.95); // Left shoulder
    shape.bezierCurveTo(-1.38, 0.82, -1.42, 0.65, -1.35, 0.48); // Left sleeve outer
    shape.lineTo(-0.78, 0.45); // Under left sleeve
    shape.bezierCurveTo(-0.79, 0.2, -0.78, -0.2, -0.76, -1.05); // Left waist

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 2,
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelOffset: 0,
      bevelSegments: 4
    };

    const torsoGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    torsoGeo.center();
    const torsoMesh = new THREE.Mesh(torsoGeo, fabricMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    group.add(torsoMesh);

    // 2. Ribbed Crew Neck Collar
    const collarGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 48);
    collarGeo.scale(1.1, 0.7, 1);
    const collarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor).multiplyScalar(0.96),
      roughness: 0.9,
      bumpMap: bumpMap,
      bumpScale: 0.03
    });
    fabricMaterialsRef.current.push(collarMat);
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2.3;
    collarMesh.position.set(0, 0.98, 0.04);
    group.add(collarMesh);

    // 3. Inner Neck Brand Tag (Quieto Angola)
    const tagGeo = new THREE.PlaneGeometry(0.22, 0.12);
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 256;
    tagCanvas.height = 140;
    const tCtx = tagCanvas.getContext('2d')!;
    tCtx.fillStyle = '#111827';
    tCtx.fillRect(0, 0, 256, 140);
    tCtx.fillStyle = '#FF6B00';
    tCtx.font = 'bold 24px sans-serif';
    tCtx.textAlign = 'center';
    tCtx.fillText('QUIETO ANGOLA', 128, 55);
    tCtx.fillStyle = '#9CA3AF';
    tCtx.font = '18px sans-serif';
    tCtx.fillText('100% ALGODÃO · SIZE L', 128, 95);
    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagMat = new THREE.MeshBasicMaterial({ map: tagTex });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(0, 0.88, -0.06);
    tagMesh.rotation.x = 0.2;
    group.add(tagMesh);

    // 4. Wooden Showroom Hanger at Top
    const hangerGroup = new THREE.Group();
    const hangerShape = new THREE.Shape();
    hangerShape.moveTo(-0.95, 0.96);
    hangerShape.quadraticCurveTo(0, 1.25, 0.95, 0.96);
    hangerShape.lineTo(0.92, 0.90);
    hangerShape.quadraticCurveTo(0, 1.18, -0.92, 0.90);
    hangerShape.closePath();

    const hangerGeo = new THREE.ExtrudeGeometry(hangerShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    });
    hangerGeo.center();
    const hangerMat = new THREE.MeshStandardMaterial({
      map: woodMap,
      roughness: 0.45,
      metalness: 0.05
    });
    const hangerMesh = new THREE.Mesh(hangerGeo, hangerMat);
    hangerMesh.position.set(0, 1.08, 0);
    hangerGroup.add(hangerMesh);

    // Metal Chrome Hook
    const hookGeo = new THREE.TorusGeometry(0.12, 0.015, 12, 32, Math.PI * 1.3);
    const hookMat = new THREE.MeshStandardMaterial({
      color: 0xD4D4D8,
      metalness: 0.95,
      roughness: 0.15
    });
    const hookMesh = new THREE.Mesh(hookGeo, hookMat);
    hookMesh.rotation.z = -Math.PI / 2.3;
    hookMesh.position.set(0, 1.32, 0);
    hangerGroup.add(hookMesh);
    group.add(hangerGroup);

    // 5. Front Chest Decal Plane (Interactive Text & Graphic mapping)
    const frontDecalGeo = new THREE.PlaneGeometry(0.85, 0.95, 16, 16);
    // Slight curvature to match torso
    const fPos = frontDecalGeo.attributes.position;
    for (let i = 0; i < fPos.count; i++) {
      const x = fPos.getX(i);
      const z = -(x * x) * 0.06;
      fPos.setZ(i, z);
    }
    frontDecalGeo.computeVertexNormals();

    const frontDecalMat = new THREE.MeshBasicMaterial({
      map: frontTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const frontDecalMesh = new THREE.Mesh(frontDecalGeo, frontDecalMat);
    frontDecalMesh.position.set(0, 0.05, 0.20);
    group.add(frontDecalMesh);

    // 6. Back Decal Plane
    const backDecalGeo = new THREE.PlaneGeometry(0.85, 0.95, 16, 16);
    const bPos = backDecalGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const x = bPos.getX(i);
      const z = -(x * x) * 0.06;
      bPos.setZ(i, z);
    }
    backDecalGeo.computeVertexNormals();

    const backDecalMat = new THREE.MeshBasicMaterial({
      map: backTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const backDecalMesh = new THREE.Mesh(backDecalGeo, backDecalMat);
    backDecalMesh.rotation.y = Math.PI; // Face backwards
    backDecalMesh.position.set(0, 0.05, -0.20);
    group.add(backDecalMesh);
  };

  // -------------------------------------------------------------
  // Helper: Build 3D Mug / Stanley / Bottle
  // -------------------------------------------------------------
  const buildCylindricalModel = (
    group: THREE.Group,
    type: 'mug' | 'stanley' | 'bottle',
    baseColor: string,
    printTex: THREE.CanvasTexture
  ) => {
    group.clear();
    fabricMaterialsRef.current = [];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness: type === 'stanley' ? 0.35 : 0.2,
      metalness: type === 'stanley' ? 0.25 : 0.05
    });
    fabricMaterialsRef.current.push(bodyMat);

    if (type === 'stanley') {
      // Stanley Quencher Tumbler
      // Lower body (fits cupholder)
      const lowerGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.9, 48);
      const lowerMesh = new THREE.Mesh(lowerGeo, bodyMat);
      lowerMesh.position.y = -0.55;
      group.add(lowerMesh);

      // Upper wider body
      const upperGeo = new THREE.CylinderGeometry(0.55, 0.44, 1.1, 48);
      const upperMesh = new THREE.Mesh(upperGeo, bodyMat);
      upperMesh.position.y = 0.45;
      group.add(upperMesh);

      // Steel Rim
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xDDDDDD, metalness: 0.9, roughness: 0.2 });
      const rimGeo = new THREE.CylinderGeometry(0.555, 0.555, 0.08, 48);
      const rimMesh = new THREE.Mesh(rimGeo, steelMat);
      rimMesh.position.y = 1.02;
      group.add(rimMesh);

      // Transparent Acrylic Lid
      const lidMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        transmission: 0.9,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1
      });
      const lidGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.14, 48);
      const lidMesh = new THREE.Mesh(lidGeo, lidMat);
      lidMesh.position.y = 1.1;
      group.add(lidMesh);

      // Ergonomic Handle
      const handleGeo = new THREE.TorusGeometry(0.5, 0.055, 16, 32, Math.PI * 0.9);
      const handleMesh = new THREE.Mesh(handleGeo, bodyMat);
      handleMesh.position.set(0.58, 0.45, 0);
      handleMesh.rotation.z = -Math.PI / 2;
      group.add(handleMesh);

      // Print Decal on Upper Body
      const decalGeo = new THREE.CylinderGeometry(0.552, 0.442, 0.85, 48, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
      const decalMat = new THREE.MeshBasicMaterial({
        map: printTex,
        transparent: true,
        depthWrite: false
      });
      const decalMesh = new THREE.Mesh(decalGeo, decalMat);
      decalMesh.position.y = 0.45;
      group.add(decalMesh);

    } else {
      // Classic Ceramic Mug
      const mugGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.25, 48, 1, true);
      const mugMesh = new THREE.Mesh(mugGeo, bodyMat);
      group.add(mugMesh);

      // Inside cavity & bottom
      const bottomGeo = new THREE.CircleGeometry(0.55, 48);
      const bottomMesh = new THREE.Mesh(bottomGeo, bodyMat);
      bottomMesh.rotation.x = Math.PI / 2;
      bottomMesh.position.y = -0.62;
      group.add(bottomMesh);

      // Handle
      const handleGeo = new THREE.TorusGeometry(0.42, 0.07, 16, 32, Math.PI * 0.95);
      const handleMesh = new THREE.Mesh(handleGeo, bodyMat);
      handleMesh.position.set(0.62, 0, 0);
      handleMesh.rotation.z = -Math.PI / 2;
      group.add(handleMesh);

      // Decal Wrap
      const decalGeo = new THREE.CylinderGeometry(0.553, 0.553, 0.95, 48, 1, true, -Math.PI / 2.8, (Math.PI * 2) / 2.8);
      const decalMat = new THREE.MeshBasicMaterial({
        map: printTex,
        transparent: true,
        depthWrite: false
      });
      const decalMesh = new THREE.Mesh(decalGeo, decalMat);
      group.add(decalMesh);
    }
  };

  // -------------------------------------------------------------
  // Real-Time Color Update without scene rebuilding
  // -------------------------------------------------------------
  useEffect(() => {
    const col = new THREE.Color(colorHex);
    fabricMaterialsRef.current.forEach((mat) => {
      mat.color.copy(col);
      mat.needsUpdate = true;
    });
  }, [colorHex]);

  // -------------------------------------------------------------
  // Real-Time Canvas Re-renders on Design Changes
  // -------------------------------------------------------------
  useEffect(() => {
    if (frontCanvasRef.current && frontTextureRef.current) {
      renderDesignToCanvas(frontCanvasRef.current, frontDesign, 'front');
      frontTextureRef.current.needsUpdate = true;
    }
  }, [frontDesign, renderDesignToCanvas]);

  useEffect(() => {
    if (backCanvasRef.current && backTextureRef.current) {
      renderDesignToCanvas(backCanvasRef.current, backDesign, 'back');
      backTextureRef.current.needsUpdate = true;
    }
  }, [backDesign, renderDesignToCanvas]);

  // -------------------------------------------------------------
  // Camera View Snap Presets
  // -------------------------------------------------------------
  const setCameraView = (view: 'frente' | 'costas' | 'angulo') => {
    setCurrentViewAngle(view);
    if (view === 'frente') {
      targetCameraPos.current = new THREE.Vector3(0, 0.1, 3.8);
      if (onSwitchSide && activeSide !== 'frente') onSwitchSide('frente');
    } else if (view === 'costas') {
      targetCameraPos.current = new THREE.Vector3(0, 0.1, -3.8);
      if (onSwitchSide && activeSide !== 'costas') onSwitchSide('costas');
    } else if (view === 'angulo') {
      targetCameraPos.current = new THREE.Vector3(2.6, 1.2, 2.8);
    }
    targetLookAt.current.set(0, 0, 0);
  };

  const handleResetCamera = () => {
    setCameraView('frente');
  };

  return (
    <div className={`relative w-full aspect-square max-w-[500px] mx-auto select-none rounded-2xl overflow-hidden bg-gradient-to-b from-[#F8F9FA] to-[#E9ECEF] border border-slate-200 shadow-inner flex flex-col ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing relative"
        title="Arrasta com o rato para girar o modelo em 360°"
      />

      {/* Top Floating Badge & Interactive Instructions */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/80 shadow-sm text-[11px] font-bold text-slate-800 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-[#FF6B00] animate-spin-slow" />
          <span>Modelo 3D Interativo</span>
          <span className="text-slate-400 font-normal">|</span>
          <span className="text-[10px] text-slate-500 font-normal">Gira com o rato</span>
        </div>

        {/* 360 Auto-Rotate Play/Pause Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all shadow-sm ${
            autoRotate
              ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
              : 'bg-white/90 text-slate-700 hover:text-slate-900 border-slate-200'
          }`}
          title={autoRotate ? 'Pausar rotação automática' : 'Ativar rotação contínua 360°'}
        >
          {autoRotate ? (
            <>
              <Pause className="w-3 h-3 fill-current" />
              <span>Giro Ativo</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Girar 360°</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Mouse Interaction Hint (fades on hover) */}
      <div className={`absolute inset-x-0 bottom-14 flex justify-center pointer-events-none transition-opacity duration-300 ${isInteracting ? 'opacity-0' : 'opacity-80'}`}>
        <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <RotateCw className="w-3 h-3 text-[#FF6B00]" />
          <span>Arrasta com o rato em qualquer direção · Roda para zoom</span>
        </div>
      </div>

      {/* Bottom Floating Camera Quick-View Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-300 shadow-md z-10">
        <button
          onClick={() => setCameraView('frente')}
          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
            currentViewAngle === 'frente'
              ? 'bg-[#FF6B00] text-black shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          Frente (0°)
        </button>
        <button
          onClick={() => setCameraView('costas')}
          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
            currentViewAngle === 'costas'
              ? 'bg-[#FF6B00] text-black shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          Costas (180°)
        </button>
        <button
          onClick={() => setCameraView('angulo')}
          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
            currentViewAngle === 'angulo'
              ? 'bg-[#FF6B00] text-black shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          Ângulo 45°
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Restaurar posição inicial"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
