import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Bot,
  Layers
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const [assignmentAssigned, setAssignmentAssigned] = useState<boolean>(false);

  const students = [
    { name: 'Aarav Sharma', progress: 92, status: 'Active', weakTopic: 'None', xp: 2450 },
    { name: 'Elena Rostova', progress: 85, status: 'Active', weakTopic: 'Pauli-Z Gate', xp: 2180 },
    { name: 'Student (You)', progress: 68, status: 'Active', weakTopic: 'Phase Estimation', xp: 1240 },
    { name: 'Dr. Vikram Rao', progress: 64, status: 'Active', weakTopic: 'Toffoli Decomposition', xp: 1190 },
    { name: 'Priya Patel', progress: 48, status: 'Needs Help', weakTopic: 'CNOT Entanglement', xp: 980 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Academic & Research Portal
            </span>
            <span className="text-xs text-slate-500">Cohort: Quantum Information batch 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Instructor & Educator Console
          </h1>
          <p className="text-xs text-slate-500">
            Monitor classroom quantum literacy, diagnose collective student misconceptions, and assign interactive circuit homework.
          </p>
        </div>

        <button
          onClick={() => {
            setAssignmentAssigned(true);
            setTimeout(() => setAssignmentAssigned(false), 3000);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{assignmentAssigned ? 'Assignment Broadcasted!' : 'Assign Quantum Lab'}</span>
        </button>
      </div>

      {/* Class Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Enrolled Students
          </span>
          <span className="text-3xl font-black text-slate-900 font-mono">42</span>
          <span className="text-xs text-emerald-600 block mt-1 font-semibold">96% Active this week</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Avg Course Completion
          </span>
          <span className="text-3xl font-black text-slate-900 font-mono">71.4%</span>
          <span className="text-xs text-indigo-600 block mt-1 font-semibold">Foundations completed</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Simulation Circuits Run
          </span>
          <span className="text-3xl font-black text-slate-900 font-mono">1,480</span>
          <span className="text-xs text-cyan-600 block mt-1 font-semibold">Across Qiskit & Cirq</span>
        </div>
      </div>

      {/* AI Misconception Alert Card */}
      <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-amber-900">QBIT AI Class Misconception Diagnostic</h4>
            <span className="text-[10px] font-mono bg-amber-200/80 text-amber-900 px-2 py-0.2 rounded font-semibold">
              High Priority
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            <strong>14 out of 42 students</strong> made the error of placing measurement operators <em>before</em> applying entangling CNOT gates in yesterday's homework.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700 transition-all">
              Push 5-Min Remedial Module
            </button>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Student Progress Roster</h3>
          <span className="text-xs text-slate-400">Class 2026-A</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Foundations Completion</th>
                <th className="p-4">Total XP</th>
                <th className="p-4">AI Diagnostic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{st.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-slate-600">{st.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-indigo-600">{st.xp} XP</td>
                  <td className="p-4">
                    {st.weakTopic === 'None' ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        Mastery On Track
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Review: {st.weakTopic}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
