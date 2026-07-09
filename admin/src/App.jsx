import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Activity, Users, CheckCircle, AlertTriangle, ShieldCheck, Sparkles, Zap, ArrowRight, Camera, Cpu, Settings, ExternalLink } from 'lucide-react';

const latencyData = [
  { time: '10:00', latency: 120 },
  { time: '10:05', latency: 135 },
  { time: '10:10', latency: 110 },
  { time: '10:15', latency: 140 },
  { time: '10:20', latency: 125 },
  { time: '10:25', latency: 115 },
  { time: '10:30', latency: 130 },
];

const consensusData = [
  { day: 'Mon', success: 99.8, failed: 0.2 },
  { day: 'Tue', success: 99.9, failed: 0.1 },
  { day: 'Wed', success: 99.7, failed: 0.3 },
  { day: 'Thu', success: 99.9, failed: 0.1 },
  { day: 'Fri', success: 99.8, failed: 0.2 },
  { day: 'Sat', success: 99.9, failed: 0.1 },
  { day: 'Sun', success: 99.9, failed: 0.1 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' or 'dashboard'

  return (
    <div className="min-h-screen bg-black text-[#dac5a7] font-sans antialiased selection:bg-brand-500/30 selection:text-white">
      {/* Premium Header */}
      <nav className="border-b border-[#dac5a7]/10 bg-black/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-outfit text-2xl font-bold tracking-wider text-white">VISAGE<span className="text-brand-500">AI</span></span>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab(activeTab === 'landing' ? 'dashboard' : 'landing')}
              className="text-sm font-medium hover:text-white transition-colors duration-200"
            >
              {activeTab === 'landing' ? 'Console Operations' : 'Back to Platform'}
            </button>
            <a 
              href="http://localhost:8081" 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center space-x-2"
            >
              <span>Scan Face</span>
              <Camera className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {activeTab === 'landing' ? (
        /* Upvio-inspired Landing Page */
        <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side: Product Value Prop */}
            <div className="space-y-10">
              <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full text-brand-500 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>WORKSPACE FOR VITALS AI</span>
              </div>
              
              <h1 className="font-outfit text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                The platform <br />
                behind every scan
              </h1>
              
              <p className="text-lg text-[#dac5a7]/80 max-w-lg leading-relaxed">
                Create, run, and manage deterministic facial topography scans from one place. Deploy instant AI evaluation with zero hardware overhead.
              </p>

              {/* Checklist */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-white font-outfit text-base">Collect 100+ dermal & wellness metrics via shareable API endpoints</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-white font-outfit text-base">Design secure scan templates, share links, and inspect results</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-white font-outfit text-base">Deploy instantly via our fully hosted, compliant OpenAPI server</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-white font-outfit text-base font-semibold">Start testing for free with zero-config local setup</span>
                </div>
              </div>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="px-8 py-4 rounded-lg bg-brand-500 text-white font-semibold text-base hover:bg-brand-600 transition-all duration-200 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/45 flex items-center justify-center space-x-3 group"
                >
                  <span>Launch Operations Console</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="http://localhost:8000/docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-8 py-4 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>API Sandbox</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Side: Interactive Mock Console */}
            <div className="relative group">
              {/* Outer Neon Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-45 transition duration-1000 group-hover:duration-200"></div>
              
              {/* Container */}
              <div className="relative bg-zinc-950/80 border border-[#dac5a7]/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
                {/* Simulated Web Camera Header */}
                <div className="flex justify-between items-center border-b border-[#dac5a7]/10 pb-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-[#dac5a7]/40 tracking-wider">VISAGE_CORE_ENGINE_V2</span>
                  <div className="flex items-center space-x-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full text-green-400 text-[10px] font-semibold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping mr-1" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Main Scanning Mock Visual */}
                <div className="relative aspect-video rounded-xl bg-black border border-[#dac5a7]/5 flex items-center justify-center overflow-hidden mb-6 group-hover:border-[#dac5a7]/10 transition-colors">
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                  
                  {/* Face Topography Overlay mockup */}
                  <div className="relative w-48 h-48 rounded-full border border-dashed border-brand-500/40 flex items-center justify-center">
                    {/* Glowing scanning bar */}
                    <div className="absolute w-full h-0.5 bg-brand-500/60 shadow-lg shadow-brand-500 top-1/2 left-0 animate-bounce"></div>
                    <Cpu className="w-16 h-16 text-[#dac5a7]/20" />
                    {/* Floating landmarks mockup */}
                    <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-brand-500/80 shadow shadow-brand-500" />
                    <div className="absolute top-16 right-16 w-1.5 h-1.5 rounded-full bg-brand-500/80 shadow shadow-brand-500" />
                    <div className="absolute bottom-12 left-20 w-1.5 h-1.5 rounded-full bg-brand-500/80 shadow shadow-brand-500" />
                    <div className="absolute bottom-20 right-8 w-1.5 h-1.5 rounded-full bg-brand-500/80 shadow shadow-brand-500" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 animate-pulse border border-white" />
                  </div>

                  {/* Operational overlay info */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#dac5a7]/5 text-[10px] font-mono text-[#dac5a7]/60 space-y-0.5">
                    <p>Symmetry: <span className="text-white">98.42%</span></p>
                    <p>Melanin: <span className="text-white">45.2%</span></p>
                    <p>Aesthetic Index: <span className="text-white">87.4</span></p>
                  </div>
                </div>

                {/* Subtitle details */}
                <div className="grid grid-cols-3 gap-4 text-center border-t border-[#dac5a7]/10 pt-4">
                  <div>
                    <h5 className="text-[10px] font-mono text-[#dac5a7]/40 uppercase tracking-wider">Engine Mode</h5>
                    <p className="text-sm font-semibold text-white mt-1">OpenCV Edge</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-mono text-[#dac5a7]/40 uppercase tracking-wider">IPD Compliance</h5>
                    <p className="text-sm font-semibold text-brand-500 mt-1">99.14%</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-mono text-[#dac5a7]/40 uppercase tracking-wider">Fitzpatrick</h5>
                    <p className="text-sm font-semibold text-white mt-1">Type IV</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Premium Operations Dashboard Tab */
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          {/* Dashboard Header */}
          <div className="flex justify-between items-end border-b border-[#dac5a7]/10 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">System Operations Console</h2>
              <p className="text-slate-400 mt-1">Real-time Visage AI analytics and endpoint metrics</p>
            </div>
            <button 
              onClick={() => setActiveTab('landing')}
              className="text-sm px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-white/5 transition-colors"
            >
              ← Back to Platform
            </button>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-950 p-6 rounded-xl border border-[#dac5a7]/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Users</p>
                  <h3 className="text-3xl font-bold text-white mt-2">1,284</h3>
                </div>
                <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
                  <Users className="w-5 h-5 text-brand-500" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-4">↑ 12.5% from last hour</p>
            </div>

            <div className="bg-zinc-950 p-6 rounded-xl border border-[#dac5a7]/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg API Latency</p>
                  <h3 className="text-3xl font-bold text-white mt-2">125ms</h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-4">↓ -4.2% optimized rate</p>
            </div>

            <div className="bg-zinc-950 p-6 rounded-xl border border-[#dac5a7]/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Success Rate</p>
                  <h3 className="text-3xl font-bold text-white mt-2">99.8%</h3>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-4">↑ 0.1% consensus stability</p>
            </div>

            <div className="bg-zinc-950 p-6 rounded-xl border border-[#dac5a7]/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Low Confidence Flags</p>
                  <h3 className="text-3xl font-bold text-white mt-2">23</h3>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-4">↓ -15% calibration error drop</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-zinc-950 p-6 rounded-xl border border-[#dac5a7]/10 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-brand-500" />
                <span>API Latency Trace (ms)</span>
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5b53ff" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#5b53ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                    <XAxis dataKey="time" stroke="#78716c" />
                    <YAxis stroke="#78716c" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid rgba(218, 197, 167, 0.1)', borderRadius: '8px', color: '#dac5a7' }}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#5b53ff" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-950 p-6 rounded-xl border border-[#dac5a7]/10 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Consensus Success Rate (%)</span>
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consensusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                    <XAxis dataKey="day" stroke="#78716c" />
                    <YAxis stroke="#78716c" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid rgba(218, 197, 167, 0.1)', borderRadius: '8px', color: '#dac5a7' }}
                    />
                    <Legend />
                    <Bar dataKey="success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-[#dac5a7]/10 py-12 mt-20 text-center text-xs text-[#dac5a7]/40 space-y-2">
        <p>© 2026 Visage AI Ensemble Platforms. All rights reserved.</p>
        <p className="font-mono">Secure, HIPAA-compliant facial analytics processing</p>
      </footer>
    </div>
  );
}
