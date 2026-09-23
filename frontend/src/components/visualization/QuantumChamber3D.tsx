import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Rotate3d, 
  ZoomIn, 
  Info, 
  X, 
  Cpu, 
  Activity, 
  Sparkles, 
  Maximize2,
  Compass
} from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  category: string;
  description: string;
  spec: string;
  position3D: THREE.Vector3;
}

const HARDWARE_HOTSPOTS: Hotspot[] = [
  {
    id: 'processor',
    name: 'Quantum Processor',
    category: 'Superconducting Transmon Core',
    description: 'A quantum processor containing superconducting circuits that operate at extremely low temperatures, utilizing Josephson junctions for non-linear inductive energy transitions.',
    spec: '127 Transmon Qubits • Coherence T₁ = 118 μs • 15.2 mK',
    position3D: new THREE.Vector3(0, -0.68, 0.25),
  },
  {
    id: 'dilution',
    name: 'Dilution Refrigerator',
    category: 'Multi-Stage Cryostat',
    description: 'Closed-cycle dilution refrigerator using helium isotope mixtures (³He/⁴He) to cool the processor down to 15 millikelvin, effectively eliminating thermal noise.',
    spec: '300 K → 15.2 mK • Ultra-High Vacuum (< 10⁻⁸ mbar)',
    position3D: new THREE.Vector3(0, 1.1, 0.4),
  },
  {
    id: 'cables',
    name: 'Microwave Control Lines',
    category: 'RF Control & Wiring',
    description: 'Semi-rigid coaxial lines delivering phase-calibrated 4–8 GHz microwave pulses to address individual qubits and manipulate quantum states with high fidelity.',
    spec: '0.085" Semi-Rigid Coaxial • -60 dB Thermal Attenuation',
    position3D: new THREE.Vector3(0.55, 0.35, 0.35),
  },
  {
    id: 'shields',
    name: 'Cryogenic Stage',
    category: 'Thermal Radiation Isolation',
    description: 'Gold-plated OFHC copper radiation shields and thermal anchoring stages at 50K, 4K, 800mK, and 100mK isolating the processor from thermal blackbody radiation.',
    spec: 'OFHC Gold-Plated Copper • Magnetic Mu-Metal Shielding',
    position3D: new THREE.Vector3(-0.6, 0.55, 0.3),
  },
  {
    id: 'readout',
    name: 'Readout System',
    category: 'Dispersive Electronics',
    description: 'Cryogenic low-noise amplifiers (HEMT and TWPA) enabling high-fidelity quantum non-demolition (QND) measurement of qubit states via cavity frequency shifts.',
    spec: 'Dispersive Coupling • Traveling-Wave Parametric Amp',
    position3D: new THREE.Vector3(0.35, -0.28, 0.35),
  },
  {
    id: 'electronics',
    name: 'Control Electronics',
    category: 'Microwave Synthesis & Filtering',
    description: 'Room-temperature AWG pulse synthesis combined with cryogenic directional couplers and circulators to direct microwave pulses while blocking thermal reflections.',
    spec: 'Phase Coherence: < 0.1° • 4–8 GHz Synthesizers',
    position3D: new THREE.Vector3(-0.35, -0.65, 0.3),
  },
];

export const QuantumChamber3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [screenCoords, setScreenCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // Telemetry status
  const telemetry = useMemo(() => ({
    processor: '127 QUBITS',
    temperature: '15.2 mK',
    coherence: '118 μs',
    vacuum: '2.4 × 10⁻⁸ mbar',
    status: 'READY',
  }), []);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    let width = container.clientWidth || 520;
    let height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 4.8);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Realistic Laboratory & Cryogenic Lighting
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.95);
    scene.add(ambientLight);

    // Overhead Laboratory Fluorescent / LED Key Light
    const overheadLight = new THREE.DirectionalLight(0xffffff, 2.4);
    overheadLight.position.set(3, 8, 4);
    scene.add(overheadLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    fillLight.position.set(-4, 3, 3);
    scene.add(fillLight);

    // Specular Rim Light from Behind
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.8);
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    // Subtle Cryogenic Core Glow (Electric Cyan)
    const cryoCoreLight = new THREE.PointLight(0x06b6d4, 2.2, 5);
    cryoCoreLight.position.set(0, -0.65, 0);
    scene.add(cryoCoreLight);

    // 3. Materials System (Authentic Laboratory Metals & Glass)
    const goldPlateMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b, // 24k Gold
      metalness: 0.95,
      roughness: 0.18,
      envMapIntensity: 1.6,
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb87333, // Pure Copper
      metalness: 0.9,
      roughness: 0.28,
    });

    const stainlessSteelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Stainless Steel / Chrome
      metalness: 0.96,
      roughness: 0.12,
    });

    const graphiteSiliconMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // High-Resistivity Silicon Die
      metalness: 0.85,
      roughness: 0.12,
    });

    const brassConnectorMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059, // Brass SMA Connectors
      metalness: 0.88,
      roughness: 0.32,
    });

    const emissiveLatticeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.85,
      roughness: 0.1,
    });

    // Outer Cutaway Vacuum Chamber (PBR Glass / Acrylic Inspection Shroud)
    const vacuumChamberMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.06,
      transmission: 0.93,
      transparent: true,
      opacity: 0.22,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.7,
    });

    // 4. Cryostat Root Group
    const cryostatGroup = new THREE.Group();
    scene.add(cryostatGroup);

    // 4A. Outer Vacuum Flanges & Cutaway Chamber
    const vacuumChamberGeo = new THREE.CylinderGeometry(1.35, 1.35, 3.4, 48, 1, true);
    const vacuumChamber = new THREE.Mesh(vacuumChamberGeo, vacuumChamberMat);
    vacuumChamber.position.y = 0.2;
    cryostatGroup.add(vacuumChamber);

    // Top 300K Room-Temp Mounting Flange (Stainless Steel)
    const topFlangeGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.16, 48);
    const topFlange = new THREE.Mesh(topFlangeGeo, stainlessSteelMat);
    topFlange.position.y = 1.9;
    cryostatGroup.add(topFlange);

    // Bottom Base Flange
    const bottomFlangeGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.14, 48);
    const bottomFlange = new THREE.Mesh(bottomFlangeGeo, stainlessSteelMat);
    bottomFlange.position.y = -1.5;
    cryostatGroup.add(bottomFlange);

    // 4B. Golden Chandelier Thermal Radiation Shield Plates (Multi-Tier)
    // 50K Plate, 4K Plate, Still (800mK) Plate, Cold Plate (100mK), Mixing Chamber (15mK)
    const tiers = [
      { r: 1.15, y: 1.55, label: '50K Stage', mat: goldPlateMat },
      { r: 1.02, y: 1.05, label: '4K Stage', mat: goldPlateMat },
      { r: 0.88, y: 0.50, label: 'Still Stage (800 mK)', mat: goldPlateMat },
      { r: 0.74, y: -0.05, label: 'Cold Plate (100 mK)', mat: copperMat },
      { r: 0.62, y: -0.55, label: 'Mixing Chamber (15 mK)', mat: goldPlateMat },
    ];

    tiers.forEach((tier, i) => {
      // Plate
      const plateGeo = new THREE.CylinderGeometry(tier.r, tier.r, 0.055, 48);
      const plateMesh = new THREE.Mesh(plateGeo, tier.mat);
      plateMesh.position.y = tier.y;
      cryostatGroup.add(plateMesh);

      // Flange Rim Bevel
      const rimGeo = new THREE.TorusGeometry(tier.r, 0.015, 12, 48);
      const rimMesh = new THREE.Mesh(rimGeo, tier.mat);
      rimMesh.position.y = tier.y + 0.025;
      rimMesh.rotation.x = Math.PI / 2;
      cryostatGroup.add(rimMesh);

      // Support Struts to Next Lower Plate
      if (i < tiers.length - 1) {
        const nextTier = tiers[i + 1];
        const strutCount = 4;
        const strutRadius = tier.r * 0.72;
        const strutHeight = tier.y - nextTier.y;

        for (let s = 0; s < strutCount; s++) {
          const angle = (s * Math.PI * 2) / strutCount + (i * 0.4);
          const strutGeo = new THREE.CylinderGeometry(0.022, 0.022, strutHeight, 16);
          const strutMesh = new THREE.Mesh(strutGeo, i % 2 === 0 ? copperMat : stainlessSteelMat);
          strutMesh.position.set(
            Math.cos(angle) * strutRadius,
            tier.y - strutHeight / 2,
            Math.sin(angle) * strutRadius
          );
          cryostatGroup.add(strutMesh);
        }
      }
    });

    // 4C. Semi-Rigid Coaxial Microwave Lines (Braided Gold & Silver Bundles)
    const coaxialLinesCount = 16;
    for (let c = 0; c < coaxialLinesCount; c++) {
      const angle = (c * Math.PI * 2) / coaxialLinesCount;
      const rTop = 0.95;
      const rMid1 = 0.82;
      const rMid2 = 0.65;
      const rBot = 0.45;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * rTop, 1.55, Math.sin(angle) * rTop),
        new THREE.Vector3(Math.cos(angle + 0.15) * rMid1, 1.05, Math.sin(angle + 0.15) * rMid1),
        new THREE.Vector3(Math.cos(angle - 0.1) * rMid2, 0.50, Math.sin(angle - 0.1) * rMid2),
        new THREE.Vector3(Math.cos(angle + 0.2) * (rBot * 1.15), -0.05, Math.sin(angle + 0.2) * (rBot * 1.15)),
        new THREE.Vector3(Math.cos(angle) * rBot, -0.55, Math.sin(angle) * rBot),
      ]);

      const wireGeo = new THREE.TubeGeometry(curve, 36, 0.011, 8, false);
      const wireMesh = new THREE.Mesh(wireGeo, c % 2 === 0 ? goldPlateMat : stainlessSteelMat);
      cryostatGroup.add(wireMesh);

      // SMA Connectors along wires at stages
      [1.05, 0.50, -0.05].forEach((yLevel) => {
        const connGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6);
        const connMesh = new THREE.Mesh(connGeo, brassConnectorMat);
        connMesh.position.set(Math.cos(angle) * (rMid1 * 0.95), yLevel, Math.sin(angle) * (rMid1 * 0.95));
        cryostatGroup.add(connMesh);
      });
    }

    // 4D. Central Superconducting Processor Assembly (Below Mixing Chamber)
    // Gold Magnetic Shield Can (Cutaway Front)
    const shieldCanGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 36, 1, false, Math.PI * 0.35, Math.PI * 1.3);
    const shieldCanMesh = new THREE.Mesh(shieldCanGeo, goldPlateMat);
    shieldCanMesh.position.y = -0.74;
    cryostatGroup.add(shieldCanMesh);

    // Silicon Processor Chip Die Mount
    const chipBaseGeo = new THREE.BoxGeometry(0.52, 0.04, 0.52);
    const chipBase = new THREE.Mesh(chipBaseGeo, goldPlateMat);
    chipBase.position.y = -0.78;
    cryostatGroup.add(chipBase);

    // High-Resistivity Silicon Die
    const siliconDieGeo = new THREE.BoxGeometry(0.42, 0.015, 0.42);
    const siliconDie = new THREE.Mesh(siliconDieGeo, graphiteSiliconMat);
    siliconDie.position.y = -0.75;
    cryostatGroup.add(siliconDie);

    // 127-Transmon Qubit Junction Lattice Pads (Microscopic Grid)
    const gridDim = 5;
    for (let r = 0; r < gridDim; r++) {
      for (let col = 0; col < gridDim; col++) {
        const x = (col - (gridDim - 1) / 2) * 0.075;
        const z = (r - (gridDim - 1) / 2) * 0.075;
        const padGeo = new THREE.BoxGeometry(0.028, 0.01, 0.028);
        const padMesh = new THREE.Mesh(padGeo, emissiveLatticeMat);
        padMesh.position.set(x, -0.738, z);
        cryostatGroup.add(padMesh);
      }
    }

    // High-Frequency Waveguide Traces on Chip (Thin Metallic Channels)
    for (let w = 0; w < 4; w++) {
      const traceGeo = new THREE.BoxGeometry(0.38, 0.005, 0.008);
      const traceMesh = new THREE.Mesh(traceGeo, goldPlateMat);
      traceMesh.position.set(0, -0.74, (w - 1.5) * 0.09);
      cryostatGroup.add(traceMesh);
    }

    // 5. Interactive Orbit Controls (Smooth Pointer Damping + Zoom)
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;
    let targetZoom = 4.8;
    let currentZoom = 4.8;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      rotationVelocityY += deltaX * 0.005;
      rotationVelocityX += deltaY * 0.004;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom = Math.max(3.2, Math.min(6.8, targetZoom + e.deltaY * 0.003));
    };

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        rotationVelocityY += deltaX * 0.006;
        rotationVelocityX += deltaY * 0.005;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // 6. Animation Loop with Screen Projection for Hotspots
    let animId: number;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Auto-rotation when not user-dragged
      if (isRotating && !isDragging) {
        cryostatGroup.rotation.y += 0.0045;
      }

      // Apply drag momentum with smooth decay
      cryostatGroup.rotation.y += rotationVelocityY;
      cryostatGroup.rotation.x = Math.max(-0.45, Math.min(0.55, cryostatGroup.rotation.x + rotationVelocityX));

      rotationVelocityY *= 0.90;
      rotationVelocityX *= 0.90;

      // Smooth Zoom Interpolation
      currentZoom += (targetZoom - currentZoom) * 0.08;
      camera.position.z = currentZoom;

      // Pulse Cryogenic Core Light gently
      cryoCoreLight.intensity = 2.0 + Math.sin(elapsed * 2.0) * 0.4;

      // Render Three.js Scene
      renderer.render(scene, camera);

      // Project 3D Hotspot coordinates onto 2D viewport
      const newCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
      HARDWARE_HOTSPOTS.forEach((spot) => {
        tempVec.copy(spot.position3D);
        tempVec.applyMatrix4(cryostatGroup.matrixWorld);

        // Vector to camera to check if facing front
        const dot = tempVec.dot(camera.position);
        tempVec.project(camera);

        const x = (tempVec.x * 0.5 + 0.5) * width;
        const y = (-tempVec.y * 0.5 + 0.5) * height;
        const isVisible = tempVec.z < 1.0 && dot > -0.5;

        newCoords[spot.id] = { x, y, visible: isVisible };
      });
      setScreenCoords(newCoords);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 480;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      goldPlateMat.dispose();
      copperMat.dispose();
      stainlessSteelMat.dispose();
      graphiteSiliconMat.dispose();
      brassConnectorMat.dispose();
      emissiveLatticeMat.dispose();
      vacuumChamberMat.dispose();

      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isRotating]);

  return (
    <div className={`relative w-full rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden select-none ${className}`}>
      {/* 1. TOP SCIENTIFIC HUD OVERLAY */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
        {/* Left System Badge */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700/80 backdrop-blur-md pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            DEMO SYSTEM • SIMULATION
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Temp: <strong className="text-white font-mono">{telemetry.temperature}</strong></span>
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              isRotating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}
            title="Toggle automatic 3D rotation"
          >
            <Rotate3d className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. THREE.JS 3D CANVAS MOUNT */}
      <div 
        ref={mountRef} 
        className="w-full h-[460px] sm:h-[500px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10" 
      />

      {/* 3. INTERACTIVE 3D HOTSPOT PINS */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {HARDWARE_HOTSPOTS.map((spot) => {
          const coords = screenCoords[spot.id];
          if (!coords || !coords.visible) return null;

          const isSelected = selectedHotspot?.id === spot.id;
          const isHovered = hoveredHotspot?.id === spot.id;

          return (
            <div
              key={spot.id}
              style={{
                transform: `translate(${coords.x}px, ${coords.y}px)`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            >
              {/* Pulsing Pin Ring */}
              <button
                type="button"
                onClick={() => setSelectedHotspot(isSelected ? null : spot)}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className={`group relative flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
                  isSelected ? 'scale-125' : ''
                }`}
              >
                <span className={`absolute w-6 h-6 rounded-full animate-ping opacity-60 ${
                  isSelected ? 'bg-cyan-400' : 'bg-indigo-400'
                }`} />
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950 shadow-md ${
                  isSelected ? 'bg-cyan-400' : 'bg-cyan-300 group-hover:bg-cyan-400'
                }`} />
              </button>

              {/* Hover Quick Tooltip */}
              {isHovered && !selectedHotspot && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-xl backdrop-blur-md text-left z-30 pointer-events-none animate-fadeIn">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    {spot.category}
                  </div>
                  <div className="text-xs font-bold text-white leading-tight mt-0.5">
                    {spot.name}
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 leading-normal line-clamp-2">
                    {spot.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. PINNED COMPONENT DETAIL DRAWER / POPUP */}
      {selectedHotspot && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl z-30 animate-fadeIn text-slate-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                {selectedHotspot.category}
              </span>
              <h4 className="text-sm font-extrabold text-white mt-1.5 leading-snug">
                {selectedHotspot.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedHotspot.description}
          </p>

          <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{selectedHotspot.spec}</span>
          </div>
        </div>
      )}

      {/* 5. BOTTOM SCIENTIFIC HUD OVERLAY */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/85 px-4 py-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">PROCESSOR:</span>
            <span className="text-white font-semibold">{telemetry.processor}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold">COHERENCE T₁:</span>
            <span className="text-white font-semibold">{telemetry.coherence}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">VACUUM:</span>
            <span className="text-slate-300">{telemetry.vacuum}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Drag to Rotate • Scroll to Zoom
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            ● READY
          </span>
        </div>
      </div>
    </div>
  );
};
