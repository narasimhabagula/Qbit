import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Orbit } from 'lucide-react';

interface Qubit3DProps {
  initialState?: '|0⟩' | '|1⟩' | '|+⟩';
  onStateChange?: (state: '|0⟩' | '|1⟩' | '|+⟩') => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Qubit3D: React.FC<Qubit3DProps> = ({
  initialState = '|+⟩',
  onStateChange,
  size = 'md',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeState, setActiveState] = useState<'|0⟩' | '|1⟩' | '|+⟩'>(initialState);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const heightMap = { sm: 200, md: 280, lg: 360 };
  const canvasHeight = heightMap[size];

  const stateVectorRef = useRef<THREE.ArrowHelper | null>(null);
  const targetDirRef = useRef<THREE.Vector3>(new THREE.Vector3(1, 0, 0));
  const currentDirRef = useRef<THREE.Vector3>(new THREE.Vector3(1, 0, 0));
  const coreLightRef = useRef<THREE.PointLight | null>(null);

  const getVectorForState = (st: '|0⟩' | '|1⟩' | '|+⟩') => {
    if (st === '|0⟩') return new THREE.Vector3(0, 1, 0); // North Pole
    if (st === '|1⟩') return new THREE.Vector3(0, -1, 0); // South Pole
    return new THREE.Vector3(1, 0, 0); // Equator (|0> + |1>)/sqrt(2)
  };

  const handleSelectState = (st: '|0⟩' | '|1⟩' | '|+⟩') => {
    setActiveState(st);
    targetDirRef.current = getVectorForState(st);
    if (onStateChange) onStateChange(st);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 320;
    const height = canvasHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x00f0ff, 2.5, 5);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);
    coreLightRef.current = coreLight;

    // 1. Transparent Quantum Containment Field Sphere
    const shellGeo = new THREE.SphereGeometry(1.2, 48, 48);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x818cf8,
      metalness: 0.1,
      roughness: 0.12,
      transmission: 0.92,
      transparent: true,
      opacity: 0.28,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.6,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shellMesh);

    // 2. Geodesic Quantum Energy Rings (Equator & Meridians)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.35,
    });
    const ringGeo = new THREE.TorusGeometry(1.2, 0.006, 16, 64);

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring2);

    // 3. Central Luminous Qubit Core
    const coreGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 4. Orbiting Photonic Energy Packets
    const orbitCount = 30;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(orbitCount * 3);
    for (let i = 0; i < orbitCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = 0.6 + Math.random() * 0.55;
      pPositions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi);
      pPositions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleCloud = new THREE.Points(pGeo, pMat);
    scene.add(particleCloud);

    // 5. State Vector Arrow
    const initialDir = getVectorForState(activeState);
    currentDirRef.current.copy(initialDir);
    targetDirRef.current.copy(initialDir);

    const arrow = new THREE.ArrowHelper(initialDir, new THREE.Vector3(0, 0, 0), 1.15, 0x00f0ff, 0.16, 0.08);
    scene.add(arrow);
    stateVectorRef.current = arrow;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth orbital movement
      ring1.rotation.z = elapsed * 0.2;
      ring2.rotation.y = elapsed * 0.15;
      particleCloud.rotation.y = elapsed * 0.4;
      particleCloud.rotation.x = Math.sin(elapsed * 0.3) * 0.2;

      // Slerp state vector smoothly towards target
      currentDirRef.current.lerp(targetDirRef.current, 0.08);
      currentDirRef.current.normalize();
      arrow.setDirection(currentDirRef.current);

      // Core pulse
      const pulse = Math.sin(elapsed * 3) * 0.05 + 1;
      coreMesh.scale.set(pulse, pulse, pulse);

      if (coreLightRef.current) {
        coreLightRef.current.intensity = 2.2 + Math.sin(elapsed * 4) * 0.5;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 w-full relative overflow-hidden group"
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Orbit className="w-4 h-4 text-indigo-600" />
          <span>Photorealistic 3D Qubit</span>
        </div>
        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200/60">
          State: {activeState}
        </span>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full relative rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-900 overflow-hidden flex items-center justify-center cursor-pointer"
        style={{ height: `${canvasHeight}px` }}
      />

      {/* Interactive State Selector Buttons */}
      <div className="w-full mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => handleSelectState('|0⟩')}
          className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
            activeState === '|0⟩'
              ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          |0⟩ Ground
        </button>

        <button
          onClick={() => handleSelectState('|+⟩')}
          className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
            activeState === '|+⟩'
              ? 'bg-cyan-600 text-white shadow-md scale-[1.02]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          |+⟩ Superposition
        </button>

        <button
          onClick={() => handleSelectState('|1⟩')}
          className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
            activeState === '|1⟩'
              ? 'bg-purple-600 text-white shadow-md scale-[1.02]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          |1⟩ Excited
        </button>
      </div>
    </div>
  );
};
