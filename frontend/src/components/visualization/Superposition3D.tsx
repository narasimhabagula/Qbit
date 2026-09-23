import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Sliders, RefreshCw, Zap } from 'lucide-react';

export const Superposition3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [prob0, setProb0] = useState<number>(50); // percentage 0 to 100
  const prob1 = 100 - prob0;

  const [isMeasured, setIsMeasured] = useState<boolean>(false);
  const [measuredState, setMeasuredState] = useState<'|0⟩' | '|1⟩' | null>(null);

  const prob0Ref = useRef<number>(0.5);
  const isMeasuredRef = useRef<boolean>(false);
  const measuredStateRef = useRef<'|0⟩' | '|1⟩' | null>(null);

  // Sync ref
  useEffect(() => {
    prob0Ref.current = prob0 / 100;
  }, [prob0]);

  useEffect(() => {
    isMeasuredRef.current = isMeasured;
    measuredStateRef.current = measuredState;
  }, [isMeasured, measuredState]);

  const handleMeasure = () => {
    // Born rule: random collapse based on prob0
    const roll = Math.random();
    const outcome = roll < prob0 / 100 ? '|0⟩' : '|1⟩';
    setMeasuredState(outcome);
    setIsMeasured(true);
  };

  const handleReset = () => {
    setIsMeasured(false);
    setMeasuredState(null);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 340;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const light0 = new THREE.PointLight(0x6366f1, 2.5, 6);
    light0.position.set(0, 1.2, 0);
    scene.add(light0);

    const light1 = new THREE.PointLight(0x06b6d4, 2.5, 6);
    light1.position.set(0, -1.2, 0);
    scene.add(light1);

    // 1. Dual Probability Cloud Spheres (|0> at top, |1> at bottom)
    const pole0Geo = new THREE.SphereGeometry(0.35, 32, 32);
    const pole0Mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const pole0Mesh = new THREE.Mesh(pole0Geo, pole0Mat);
    pole0Mesh.position.set(0, 0.9, 0);
    scene.add(pole0Mesh);

    const pole1Geo = new THREE.SphereGeometry(0.35, 32, 32);
    const pole1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const pole1Mesh = new THREE.Mesh(pole1Geo, pole1Mat);
    pole1Mesh.position.set(0, -0.9, 0);
    scene.add(pole1Mesh);

    // 2. Central Quantum Particle in Superposition
    const coreGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 3. Dynamic Probability Wave Filaments
    const waveCount = 80;
    const waveGeo = new THREE.BufferGeometry();
    const wavePos = new Float32Array(waveCount * 3);
    for (let i = 0; i < waveCount; i++) {
      wavePos[i * 3] = (Math.random() - 0.5) * 1.6;
      wavePos[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      wavePos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
    const waveMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const waveParticles = new THREE.Points(waveGeo, waveMat);
    scene.add(waveParticles);

    // 4. Probability Bridge Filament Line
    const bridgeMat = new THREE.LineBasicMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.5,
    });
    const bridgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.9, 0),
      new THREE.Vector3(0, -0.9, 0),
    ]);
    const bridgeLine = new THREE.Line(bridgeGeo, bridgeMat);
    scene.add(bridgeLine);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const p0 = prob0Ref.current;
      const p1 = 1 - p0;

      if (!isMeasuredRef.current) {
        // Superposition state: scale poles by probability amplitude
        const s0 = 0.4 + p0 * 1.2;
        const s1 = 0.4 + p1 * 1.2;
        pole0Mesh.scale.set(s0, s0, s0);
        pole1Mesh.scale.set(s1, s1, s1);

        pole0Mat.opacity = 0.3 + p0 * 0.6;
        pole1Mat.opacity = 0.3 + p1 * 0.6;

        // Core particle oscillates smoothly between poles, biased by probability
        const targetY = (p0 - 0.5) * 1.5 + Math.sin(elapsed * 4) * (0.35 * Math.min(p0, p1));
        coreMesh.position.y += (targetY - coreMesh.position.y) * 0.1;
        coreMesh.scale.set(1, 1, 1);

        waveParticles.rotation.y = elapsed * 0.5;
        waveParticles.visible = true;
      } else {
        // Collapsed state
        const targetY = measuredStateRef.current === '|0⟩' ? 0.9 : -0.9;
        coreMesh.position.y += (targetY - coreMesh.position.y) * 0.2;
        coreMesh.scale.set(1.4, 1.4, 1.4);

        if (measuredStateRef.current === '|0⟩') {
          pole0Mesh.scale.set(1.5, 1.5, 1.5);
          pole1Mesh.scale.set(0.1, 0.1, 0.1);
        } else {
          pole0Mesh.scale.set(0.1, 0.1, 0.1);
          pole1Mesh.scale.set(1.5, 1.5, 1.5);
        }
        waveParticles.visible = false;
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
      pole0Geo.dispose();
      pole0Mat.dispose();
      pole1Geo.dispose();
      pole1Mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      bridgeGeo.dispose();
      bridgeMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  const alpha = Math.sqrt(prob0 / 100).toFixed(2);
  const beta = Math.sqrt(prob1 / 100).toFixed(2);

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 w-full">
      {/* Title & Dirac Notation */}
      <div className="flex items-center justify-between w-full mb-2">
        <div>
          <h4 className="text-xs font-bold text-slate-800">3D Superposition & Wave Collapse</h4>
          <span className="text-[11px] font-mono text-indigo-600 font-bold">
            |ψ⟩ = {alpha}|0⟩ + {beta}|1⟩
          </span>
        </div>

        {isMeasured ? (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Wave</span>
          </button>
        ) : (
          <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-bold border border-cyan-200">
            Probability Cloud
          </span>
        )}
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-[280px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden flex items-center justify-center"
      >
        <div className="absolute top-3 left-4 text-[11px] font-mono text-indigo-300 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-md">
          |0⟩ state ({prob0}%)
        </div>
        <div className="absolute bottom-3 left-4 text-[11px] font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-md">
          |1⟩ state ({prob1}%)
        </div>

        {isMeasured && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 border border-emerald-400/60 text-white p-3 rounded-2xl text-center shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              Measurement Collapse
            </span>
            <span className="text-2xl font-black font-mono text-white block my-1">
              Result: {measuredState}
            </span>
            <span className="text-[11px] text-slate-300">
              Measured with {measuredState === '|0⟩' ? prob0 : prob1}% probability
            </span>
          </div>
        )}
      </div>

      {/* Interactive Probability Slider */}
      <div className="w-full mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tune Amplitudes:</span>
          </span>
          <span className="font-mono text-xs">
            <strong className="text-indigo-600">{prob0}% |0⟩</strong> / <strong className="text-cyan-600">{prob1}% |1⟩</strong>
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={prob0}
          disabled={isMeasured}
          onChange={e => setProb0(parseInt(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer disabled:opacity-40"
        />

        {/* Measure Trigger Button */}
        <button
          onClick={handleMeasure}
          disabled={isMeasured}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>Cinematic Measurement Collapse (Born Rule)</span>
        </button>
      </div>
    </div>
  );
};
