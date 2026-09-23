import React, { useState } from 'react';
import { BlochSphere3D } from './BlochSphere3D';
import { Qubit3D } from './Qubit3D';
import { Superposition3D } from './Superposition3D';
import { Entanglement3D } from './Entanglement3D';
import { QuantumChamber3D } from './QuantumChamber3D';
import { Orbit, Sparkles, Waves, Link, Cpu, Layers } from 'lucide-react';

export const VisualizationLab: React.FC = () => {
  const [activeViz, setActiveViz] = useState<'chamber' | 'qubit' | 'superposition' | 'entangle' | 'bloch'>('bloch');
  const [theta, setTheta] = useState<number>(Math.PI / 2);
  const [phi, setPhi] = useState<number>(0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
              Photorealistic 3D Lab
            </span>
            <span className="text-xs text-slate-500">PBR Physics & Quantum State Visualizers</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Quantum Visualization Lab
          </h1>
          <p className="text-xs text-slate-500">
            Manipulate state vectors, simulate Born-rule wave collapse, and inspect non-local entanglement in interactive 3D.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveViz('bloch')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeViz === 'bloch'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Bloch Sphere</span>
          </button>

          <button
            onClick={() => setActiveViz('superposition')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeViz === 'superposition'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Superposition</span>
          </button>

          <button
            onClick={() => setActiveViz('qubit')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeViz === 'qubit'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Qubit</span>
          </button>

          <button
            onClick={() => setActiveViz('entangle')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeViz === 'entangle'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Entanglement</span>
          </button>

          <button
            onClick={() => setActiveViz('chamber')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeViz === 'chamber'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Cryo-Chamber</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        {activeViz === 'bloch' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <BlochSphere3D
                theta={theta}
                phi={phi}
                onStateChange={(th, ph) => {
                  setTheta(th);
                  setPhi(ph);
                }}
                interactive={true}
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <h4 className="font-extrabold text-sm text-indigo-900 mb-1">
                  How the Bloch Sphere Works
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every pure single-qubit state can be represented as a point on the surface of a 3-dimensional unit sphere:
                </p>
                <div className="mt-2 p-2 bg-white rounded-xl border border-indigo-200/60 font-mono text-xs text-indigo-700 font-bold">
                  |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Fine Spherical Coordinates:
                </span>
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                    <span>Polar Angle θ (Colatitude):</span>
                    <span className="font-bold">{(theta / Math.PI).toFixed(2)}π</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI}
                    step="0.01"
                    value={theta}
                    onChange={e => setTheta(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                    <span>Azimuthal Angle φ (Longitude):</span>
                    <span className="font-bold">{(phi / Math.PI).toFixed(2)}π</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={2 * Math.PI}
                    step="0.01"
                    value={phi}
                    onChange={e => setPhi(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeViz === 'superposition' && (
          <div className="max-w-2xl mx-auto py-2">
            <Superposition3D />
          </div>
        )}

        {activeViz === 'qubit' && (
          <div className="max-w-xl mx-auto py-2">
            <Qubit3D size="lg" />
          </div>
        )}

        {activeViz === 'entangle' && (
          <div className="max-w-2xl mx-auto py-2">
            <Entanglement3D />
          </div>
        )}

        {activeViz === 'chamber' && (
          <div className="max-w-3xl mx-auto py-2">
            <QuantumChamber3D />
          </div>
        )}
      </div>
    </div>
  );
};
