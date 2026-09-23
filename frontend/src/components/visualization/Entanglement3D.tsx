import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RefreshCw, Zap, Link } from 'lucide-react';

export const Entanglement3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMeasured, setIsMeasured] = useState<boolean>(false);
  const [measuredOutcome, setMeasuredOutcome] = useState<'00' | '11' | null>(null);

  const isMeasuredRef = useRef<boolean>(false);
  const measuredOutcomeRef = useRef<'00' | '11' | null>(null);

  useEffect(() => {
    isMeasuredRef.current = isMeasured;
    measuredOutcomeRef.current = measuredOutcome;
  }, [isMeasured, measuredOutcome]);

  const handleMeasure = () => {
    // 50% 00, 50% 11 in Bell state |Phi+>
    const outcome = Math.random() > 0.5 ? '00' : '11';
    setMeasuredOutcome(outcome);
    setIsMeasured(true);
  };

  const handleReset = () => {
    setIsMeasured(false);
    setMeasuredOutcome(null);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 360;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const lightA = new THREE.PointLight(0x6366f1, 2.5, 6);
    lightA.position.set(-1.4, 0, 0);
    scene.add(lightA);

    const lightB = new THREE.PointLight(0x06b6d4, 2.5, 6);
    lightB.position.set(1.4, 0, 0);
    scene.add(lightB);

    // 1. Qubit A (Left Particle: -1.4)
    const particleGeo = new THREE.SphereGeometry(0.26, 32, 32);
    const matA = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.4,
    });
    const qubitA = new THREE.Mesh(particleGeo, matA);
    qubitA.position.set(-1.4, 0, 0);
    scene.add(qubitA);

    // Outer shell A
    const shellGeo = new THREE.SphereGeometry(0.48, 24, 24);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
    });
    const shellA = new THREE.Mesh(shellGeo, shellMat);
    shellA.position.set(-1.4, 0, 0);
    scene.add(shellA);

    // 2. Qubit B (Right Particle: +1.4)
    const matB = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.4,
    });
    const qubitB = new THREE.Mesh(particleGeo, matB);
    qubitB.position.set(1.4, 0, 0);
    scene.add(qubitB);

    const shellB = new THREE.Mesh(shellGeo, shellMat);
    shellB.position.set(1.4, 0, 0);
    scene.add(shellB);

    // 3. Entanglement Bridge - Quantum Optical Filaments
    const filamentCurves: THREE.CatmullRomCurve3[] = [];
    const filamentMeshes: THREE.Line[] = [];

    for (let f = 0; f < 5; f++) {
      const offset = (f - 2) * 0.12;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.4, 0, 0),
        new THREE.Vector3(-0.7, offset * 1.5, offset),
        new THREE.Vector3(0, -offset * 1.2, -offset),
        new THREE.Vector3(0.7, offset * 1.5, offset),
        new THREE.Vector3(1.4, 0, 0),
      ]);
      filamentCurves.push(curve);

      const points = curve.getPoints(40);
      const fGeo = new THREE.BufferGeometry().setFromPoints(points);
      const fMat = new THREE.LineBasicMaterial({
        color: f % 2 === 0 ? 0x818cf8 : 0x38bdf8,
        transparent: true,
        opacity: 0.45,
      });
      const fMesh = new THREE.Line(fGeo, fMat);
      scene.add(fMesh);
      filamentMeshes.push(fMesh);
    }

    // 4. Flowing Correlated Photons on the Filaments
    const photonCount = 24;
    const photonGeo = new THREE.BufferGeometry();
    const photonPos = new Float32Array(photonCount * 3);
    photonGeo.setAttribute('position', new THREE.BufferAttribute(photonPos, 3));
    const photonMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const photonParticles = new THREE.Points(photonGeo, photonMat);
    scene.add(photonParticles);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isMeasuredRef.current) {
        // Synchronized quantum spin oscillations
        qubitA.rotation.y = elapsed * 1.5;
        qubitB.rotation.y = elapsed * 1.5; // Identical phase synchronization

        shellA.rotation.z = -elapsed * 0.5;
        shellB.rotation.z = -elapsed * 0.5;

        // Flowing photons between qubits
        const posArr = photonParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < photonCount; i++) {
          const t = ((elapsed * 0.3 + i / photonCount) % 1);
          const curveIdx = i % filamentCurves.length;
          const pt = filamentCurves[curveIdx].getPoint(t);
          posArr[i * 3] = pt.x;
          posArr[i * 3 + 1] = pt.y;
          posArr[i * 3 + 2] = pt.z;
        }
        photonParticles.geometry.attributes.position.needsUpdate = true;
        photonParticles.visible = true;

        // Pulse intensity
        matA.emissiveIntensity = 0.7 + Math.sin(elapsed * 4) * 0.3;
        matB.emissiveIntensity = 0.7 + Math.sin(elapsed * 4) * 0.3;
      } else {
        // Collapsed state
        const val = measuredOutcomeRef.current;
        const color = val === '00' ? 0x6366f1 : 0x06b6d4;

        matA.color.setHex(color);
        matA.emissive.setHex(color);
        matB.color.setHex(color);
        matB.emissive.setHex(color);

        photonParticles.visible = false;
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
      particleGeo.dispose();
      shellGeo.dispose();
      matA.dispose();
      matB.dispose();
      shellMat.dispose();
      photonGeo.dispose();
      photonMat.dispose();
      filamentMeshes.forEach(m => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Link className="w-4 h-4 text-indigo-600" />
          <span>3D Quantum Entanglement Channel</span>
        </div>
        <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
          Bell State: |Φ⁺⟩
        </span>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-[280px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden flex items-center justify-center"
      >
        <div className="absolute top-3 left-4 text-[11px] font-mono text-indigo-300 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-md">
          Qubit A (q0)
        </div>
        <div className="absolute top-3 right-4 text-[11px] font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-md">
          Qubit B (q1)
        </div>

        {isMeasured && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-purple-400/60 text-white px-4 py-2 rounded-xl text-center shadow-xl backdrop-blur-md">
            <span className="text-xs font-mono font-bold text-cyan-300">
              Correlated Outcome: |{measuredOutcome}⟩ (Instant Collapse)
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-3 flex items-center gap-2">
        {!isMeasured ? (
          <button
            onClick={handleMeasure}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Measure Qubit A (Observe Instant Correlation)</span>
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Entangled Superposition</span>
          </button>
        )}
      </div>
    </div>
  );
};
