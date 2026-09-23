import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface QBitMascot3DProps {
  state?: 'idle' | 'thinking' | 'speaking' | 'explaining' | 'success';
  size?: number; // size in pixels, e.g. 140
  className?: string;
}

export const QBitMascot3D: React.FC<QBitMascot3DProps> = ({
  state = 'idle',
  size = 140,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<'idle' | 'thinking' | 'speaking' | 'explaining' | 'success'>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 2.5, 4);
    cyanPoint.position.set(0, 0.2, 1);
    scene.add(cyanPoint);

    // Mascot Group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // 1. Ceramic White Metallic Body
    const whiteChassisMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.25,
      roughness: 0.15,
    });

    const bodyGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, whiteChassisMat);
    bodyMesh.scale.set(1, 1.1, 0.95);
    robotGroup.add(bodyMesh);

    // 2. Dark Obsidian Glass Visor
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      metalness: 0.8,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const visorGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.15, 0.35);
    visorMesh.scale.set(1.1, 0.65, 0.5);
    robotGroup.add(visorMesh);

    // 3. Glowing Cyan Photonic Eyes / Optical Visor Lines
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const eyeGeo = new THREE.CapsuleGeometry(0.04, 0.12, 8, 16);

    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.16, 0.15, 0.52);
    eyeLeft.rotation.z = Math.PI / 2;
    robotGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.16, 0.15, 0.52);
    eyeRight.rotation.z = Math.PI / 2;
    robotGroup.add(eyeRight);

    // 4. Glowing Quantum Core in Chest
    const coreGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, -0.22, 0.46);
    robotGroup.add(coreMesh);

    // Core Ring
    const coreRingGeo = new THREE.TorusGeometry(0.15, 0.015, 16, 32);
    const coreRingMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, metalness: 0.8, roughness: 0.2 });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.position.set(0, -0.22, 0.46);
    robotGroup.add(coreRing);

    // 5. Floating Quantum Halo Rings (Active when thinking / explaining)
    const haloGeo = new THREE.TorusGeometry(0.75, 0.012, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
    const halo1 = new THREE.Mesh(haloGeo, haloMat);
    halo1.rotation.x = Math.PI / 2.3;
    scene.add(halo1);

    const halo2 = new THREE.Mesh(haloGeo, haloMat);
    halo2.rotation.x = -Math.PI / 3;
    scene.add(halo2);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const currentSt = stateRef.current;

      // Gentle floating hover
      robotGroup.position.y = Math.sin(elapsed * 2) * 0.08;
      robotGroup.rotation.y = Math.sin(elapsed * 1.2) * 0.1;

      // Core pulse
      const pulse = 1 + Math.sin(elapsed * 4) * 0.15;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Behavior per state
      if (currentSt === 'thinking') {
        halo1.rotation.z = elapsed * 3;
        halo2.rotation.z = -elapsed * 3;
        halo1.visible = true;
        halo2.visible = true;
      } else if (currentSt === 'speaking') {
        halo1.visible = false;
        halo2.visible = false;
        eyeLeft.scale.y = 1 + Math.sin(elapsed * 15) * 0.3;
        eyeRight.scale.y = 1 + Math.sin(elapsed * 15) * 0.3;
      } else if (currentSt === 'explaining') {
        halo1.rotation.z = elapsed * 1.5;
        halo2.rotation.y = elapsed * 1.5;
        halo1.visible = true;
        halo2.visible = true;
      } else {
        // Idle
        halo1.rotation.z = elapsed * 0.4;
        halo2.rotation.z = -elapsed * 0.4;
        halo1.visible = true;
        halo2.visible = false;
        eyeLeft.scale.set(1, 1, 1);
        eyeRight.scale.set(1, 1, 1);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      bodyGeo.dispose();
      whiteChassisMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className={`flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
