import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Zap, Sparkles } from 'lucide-react';

interface BlochSphereProps {
  theta?: number; // 0 to PI
  phi?: number;   // 0 to 2*PI
  onStateChange?: (theta: number, phi: number) => void;
  interactive?: boolean;
}

export const BlochSphere3D: React.FC<BlochSphereProps> = ({
  theta: propTheta = 0,
  phi: propPhi = 0,
  onStateChange,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [theta, setTheta] = useState<number>(propTheta);
  const [phi, setPhi] = useState<number>(propPhi);
  const [stateNotation, setStateNotation] = useState<string>('|0⟩');

  const arrowRef = useRef<THREE.ArrowHelper | null>(null);
  const pointMeshRef = useRef<THREE.Mesh | null>(null);
  const targetDirRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const currentDirRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));

  // Spherical to Cartesian (Three.js coordinates: Y is up/Z-axis of Bloch)
  const getCartesian = (th: number, ph: number) => {
    const y = Math.cos(th);
    const x = Math.sin(th) * Math.cos(ph);
    const z = Math.sin(th) * Math.sin(ph);
    return new THREE.Vector3(x, y, z).normalize();
  };

  useEffect(() => {
    setTheta(propTheta);
    setPhi(propPhi);
    targetDirRef.current = getCartesian(propTheta, propPhi);
  }, [propTheta, propPhi]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 340;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 1.8, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    // 1. Photorealistic Glass Bloch Sphere
    const sphereRadius = 1.25;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 48, 48);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x818cf8,
      metalness: 0.05,
      roughness: 0.1,
      transmission: 0.94,
      transparent: true,
      opacity: 0.25,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.7,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, glassMat);
    scene.add(sphereMesh);

    // 2. Geodesic Rings (Equator, XZ, YZ planes)
    const ringGeo = new THREE.RingGeometry(sphereRadius - 0.005, sphereRadius + 0.005, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide });

    const equator = new THREE.Mesh(ringGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    const meridianXZ = new THREE.Mesh(ringGeo, ringMat);
    scene.add(meridianXZ);

    const meridianYZ = new THREE.Mesh(ringGeo, ringMat);
    meridianYZ.rotation.y = Math.PI / 2;
    scene.add(meridianYZ);

    // 3. Cartesian Axes (Z is vertical, X is horizontal, Y is depth)
    const axisLen = sphereRadius * 1.35;

    // Z-Axis (Vertical: Blue/Indigo)
    const zDir = new THREE.Vector3(0, 1, 0);
    const zAxis = new THREE.ArrowHelper(zDir, new THREE.Vector3(0, -axisLen, 0), axisLen * 2, 0x4f46e5, 0.12, 0.07);
    scene.add(zAxis);

    // X-Axis (Cyan)
    const xDir = new THREE.Vector3(1, 0, 0);
    const xAxis = new THREE.ArrowHelper(xDir, new THREE.Vector3(-axisLen, 0, 0), axisLen * 2, 0x06b6d4, 0.12, 0.07);
    scene.add(xAxis);

    // Y-Axis (Purple)
    const yDir = new THREE.Vector3(0, 0, 1);
    const yAxis = new THREE.ArrowHelper(yDir, new THREE.Vector3(0, 0, -axisLen), axisLen * 2, 0xa855f7, 0.12, 0.07);
    scene.add(yAxis);

    // 4. Luminous Quantum State Vector Arrow
    const initialDir = getCartesian(theta, phi);
    currentDirRef.current.copy(initialDir);
    targetDirRef.current.copy(initialDir);

    const arrow = new THREE.ArrowHelper(initialDir, new THREE.Vector3(0, 0, 0), sphereRadius, 0x00f0ff, 0.18, 0.1);
    scene.add(arrow);
    arrowRef.current = arrow;

    // Glowing tip sphere
    const pointGeo = new THREE.SphereGeometry(0.08, 24, 24);
    const pointMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const pointMesh = new THREE.Mesh(pointGeo, pointMat);
    pointMesh.position.copy(initialDir.clone().multiplyScalar(sphereRadius));
    scene.add(pointMesh);
    pointMeshRef.current = pointMesh;

    // Mouse drag interaction to orbit view
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      scene.rotation.y += deltaX * 0.01;
      scene.rotation.x += deltaY * 0.01;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth Slerp toward target vector
      currentDirRef.current.lerp(targetDirRef.current, 0.08);
      currentDirRef.current.normalize();

      arrow.setDirection(currentDirRef.current);
      pointMesh.position.copy(currentDirRef.current.clone().multiplyScalar(sphereRadius));

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sphereGeo.dispose();
      glassMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pointGeo.dispose();
      pointMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  const updateAngles = (newTheta: number, newPhi: number, notation?: string) => {
    setTheta(newTheta);
    setPhi(newPhi);
    targetDirRef.current = getCartesian(newTheta, newPhi);
    if (notation) setStateNotation(notation);
    if (onStateChange) onStateChange(newTheta, newPhi);
  };

  // Gate presets with smooth animation & mathematical Dirac updates
  const applyGate = (gate: 'H' | 'X' | 'Y' | 'Z' | 'S' | 'reset') => {
    switch (gate) {
      case 'reset':
        updateAngles(0, 0, '|0⟩');
        break;
      case 'H':
        // H|0> = |+> = (|0> + |1>)/sqrt(2)
        updateAngles(Math.PI / 2, 0, '|+⟩ = (|0⟩ + |1⟩)/√2');
        break;
      case 'X':
        // X|0> = |1>
        updateAngles(Math.PI, 0, '|1⟩ (Bit Flipped)');
        break;
      case 'Y':
        updateAngles(Math.PI / 2, Math.PI / 2, '|i⟩ = (|0⟩ + i|1⟩)/√2');
        break;
      case 'Z':
        updateAngles(theta, (phi + Math.PI) % (2 * Math.PI), 'Phase Flipped Z|ψ⟩');
        break;
      case 'S':
        updateAngles(theta, (phi + Math.PI / 2) % (2 * Math.PI), 'S|ψ⟩ (+π/2 phase)');
        break;
    }
  };

  const zCoord = Math.cos(theta);
  const p0 = ((1 + zCoord) / 2) * 100;
  const p1 = ((1 - zCoord) / 2) * 100;

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 w-full">
      <div className="flex items-center justify-between w-full mb-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Photorealistic 3D Bloch Sphere</h4>
          <p className="text-[11px] text-slate-400">PBR Glass shell • Drag to orbit</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
            {stateNotation}
          </span>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-[280px] cursor-grab active:cursor-grabbing relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center shadow-inner"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-indigo-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
          |0⟩ (North Pole)
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-indigo-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
          |1⟩ (South Pole)
        </div>
        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
          |+⟩ (X+)
        </div>
      </div>

      {/* Live Probabilities */}
      <div className="w-full mt-3 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">P(|0⟩) Probability</span>
          <span className="font-bold text-indigo-600 font-mono text-sm">{p0.toFixed(1)}%</span>
        </div>
        <div className="p-2 rounded-xl bg-cyan-50/70 border border-cyan-100">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">P(|1⟩) Probability</span>
          <span className="font-bold text-cyan-600 font-mono text-sm">{p1.toFixed(1)}%</span>
        </div>
      </div>

      {/* Quick Gate Actions */}
      {interactive && (
        <div className="w-full mt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
            Apply Gate Transformations (Animated Slerp):
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            <button
              onClick={() => applyGate('reset')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold font-mono bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> |0⟩
            </button>
            <button
              onClick={() => applyGate('H')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              H
            </button>
            <button
              onClick={() => applyGate('X')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold font-mono bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              X
            </button>
            <button
              onClick={() => applyGate('Y')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold font-mono bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
            >
              Y
            </button>
            <button
              onClick={() => applyGate('Z')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold font-mono bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Z
            </button>
            <button
              onClick={() => applyGate('S')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold font-mono bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              S
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
