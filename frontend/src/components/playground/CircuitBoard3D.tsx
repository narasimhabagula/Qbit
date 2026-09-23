import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PlacedGate } from '../../types/quantum';

interface CircuitBoard3DProps {
  numQubits: number;
  gates: PlacedGate[];
  isExecuting: boolean;
  activeStep: number | null;
}

export const CircuitBoard3D: React.FC<CircuitBoard3DProps> = ({
  numQubits,
  gates,
  isExecuting,
  activeStep,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const activeStepRef = useRef<number | null>(activeStep);
  const isExecutingRef = useRef<boolean>(isExecuting);

  useEffect(() => {
    activeStepRef.current = activeStep;
    isExecutingRef.current = isExecuting;
  }, [activeStep, isExecuting]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 540;
    const height = 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const pulseLight = new THREE.PointLight(0x00f0ff, 0, 4);
    scene.add(pulseLight);

    // 1. Dark Glass Optical Circuit Substrate
    const substrateGeo = new THREE.BoxGeometry(4.6, 0.08, 2.4);
    const substrateMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      metalness: 0.8,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const substrate = new THREE.Mesh(substrateGeo, substrateMat);
    substrate.position.y = -0.04;
    scene.add(substrate);

    // 2. Luminous Superconducting Qubit Waveguide Channels
    const channelMeshes: THREE.Mesh[] = [];
    const maxSteps = 6;
    const startX = -1.8;
    const stepWidth = 0.65;

    for (let q = 0; q < numQubits; q++) {
      const z = (q - (numQubits - 1) / 2) * 0.55;
      const wireGeo = new THREE.BoxGeometry(4.2, 0.02, 0.04);
      const wireMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.set(0, 0.01, z);
      scene.add(wire);
      channelMeshes.push(wire);
    }

    // 3. 3D Gate Blocks (Glass/Metallic with beveled edges)
    const gateMeshes: { mesh: THREE.Mesh; gate: PlacedGate }[] = [];

    const glassGateMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.8,
      clearcoat: 1.0,
    });

    const activeGateMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });

    gates.forEach(gate => {
      const x = startX + gate.step * stepWidth;
      const z = (gate.targetQubit - (numQubits - 1) / 2) * 0.55;

      const gateGeo = new THREE.BoxGeometry(0.38, 0.18, 0.38);
      const gMesh = new THREE.Mesh(gateGeo, glassGateMat.clone());
      gMesh.position.set(x, 0.1, z);
      scene.add(gMesh);
      gateMeshes.push({ mesh: gMesh, gate });

      // CNOT vertical link
      if (gate.type === 'CNOT' && gate.controlQubit !== undefined) {
        const cz = (gate.controlQubit - (numQubits - 1) / 2) * 0.55;
        const linkHeight = Math.abs(cz - z);
        const linkGeo = new THREE.CylinderGeometry(0.025, 0.025, linkHeight, 16);
        const linkMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
        const linkMesh = new THREE.Mesh(linkGeo, linkMat);
        linkMesh.position.set(x, 0.1, (cz + z) / 2);
        linkMesh.rotation.x = Math.PI / 2;
        scene.add(linkMesh);
      }
    });

    // 4. Travelling Optical Photon Pulse
    const photonGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const photon = new THREE.Mesh(photonGeo, photonMat);
    scene.add(photon);
    photon.visible = false;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle tilt
      scene.rotation.y = Math.sin(elapsed * 0.4) * 0.05;

      const currStep = activeStepRef.current;
      const executing = isExecutingRef.current;

      if (executing && currStep !== null) {
        photon.visible = true;
        const targetX = startX + currStep * stepWidth;
        photon.position.set(targetX, 0.08, 0);
        pulseLight.position.set(targetX, 0.5, 0);
        pulseLight.intensity = 3.0;

        // Highlight gates matching current step
        gateMeshes.forEach(({ mesh, gate }) => {
          if (gate.step === currStep) {
            mesh.scale.set(1.15, 1.25, 1.15);
            (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x00f0ff);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8;
          } else {
            mesh.scale.set(1, 1, 1);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
          }
        });
      } else {
        photon.visible = false;
        pulseLight.intensity = 0;
        gateMeshes.forEach(({ mesh }) => {
          mesh.scale.set(1, 1, 1);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
        });
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
      substrateGeo.dispose();
      substrateMat.dispose();
      glassGateMat.dispose();
      activeGateMat.dispose();
      photonGeo.dispose();
      photonMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [numQubits, gates]);

  return (
    <div className="w-full relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
      <div className="absolute top-2 left-3 z-10 text-[10px] font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">
        3D Quantum Optical Channel
      </div>
      <div ref={mountRef} className="w-full h-[240px] cursor-grab active:cursor-grabbing" />
    </div>
  );
};
