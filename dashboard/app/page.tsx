'use client';

import Link from 'next/link';
import { 
  Chrome, 
  ArrowRight, 
  Zap, 
  Database,
  RefreshCw,
  Table,
  CheckCircle,
  FileText,
  MousePointerClick,
  MonitorCheck
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-[#f3f4f6] font-sans antialiased relative overflow-x-hidden">
      {/* Background grids and minimal geometric lights (no generic overdone glowing blobs) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav Bar */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            B
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Beacon
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-gray-400 hover:text-white transition duration-200"
          >
            Dashboard
          </Link>
          <Link 
            href="/dashboard"
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold shadow-md transition duration-200"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Version 1.1 Now Active
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Your job applications,<br />
          <span className="bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            tracked in one click.
          </span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed mb-10">
          A minimalist Chrome Extension that automatically scrapes postings, detects form submissions on corporate portals, and updates your real-time board instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-lg text-sm shadow-md transition"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#extension-setup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#111827]/85 border border-[#1f2937] hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-lg text-sm transition"
          >
            <Chrome className="w-4.5 h-4.5 text-indigo-400" />
            <span>Install Extension</span>
          </a>
        </div>
      </section>

      {/* WHY BEACON (THE SPREADSHEETS COMPARISON) */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Why use Beacon?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Traditional tracking is slow and error-prone. Beacon automates the record-keeping so you can focus on interviewing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Spreadsheet pain points */}
          <div className="bg-[#0b0f19] border border-red-500/10 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/5 text-red-400 flex items-center justify-center">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">The Spreadsheet Method</h3>
                <span className="text-[10px] uppercase font-bold text-red-400">Inefficient</span>
              </div>
            </div>
            <ul className="space-y-3.5 text-sm text-gray-400 flex-1">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>Copy-pasting job URLs and matching names manually for every posting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>No automated tracking when submitting forms on corporate portals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>Forgetting to update follow-ups or notes leading to ghosted opportunities.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold mt-0.5">✕</span>
                <span>Manual updates required on multiple devices to keep details matched.</span>
              </li>
            </ul>
          </div>

          {/* Beacon solution */}
          <div className="bg-[#0b0f19] border border-indigo-500/20 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative shadow-lg shadow-indigo-600/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">The Beacon Experience</h3>
                <span className="text-[10px] uppercase font-bold text-indigo-400">Fully Automated</span>
              </div>
            </div>
            <ul className="space-y-3.5 text-sm text-gray-300 flex-1">
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                <span>**One-click Scraper**: Grab titles, company and details from LinkedIn, Indeed, Instahyre instantly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                <span>**Portal Interceptor**: Detects when you hit submit on Workday, Greenhouse, or Lever and prompts to track.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                <span>**Real-time Board**: Zero latency syncing. Drag cards or edit notes, updates apply globally on all open tabs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                <span>**Secure & Encrypted**: Connected with Supabase Row-Level Security. Only you can read/edit your information.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DETAILED FEATURES LIST */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1f2937]/50 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Built for the Modern Candidate</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">No generic wrappers. An integrated database workspace designed to speed up your pipeline.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0b0f19] border border-border rounded-xl p-6 hover:border-indigo-500/20 transition duration-300">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <MousePointerClick className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Intelligent Scraper</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Detects site headers on major job platforms and custom company postings. Scrapes title, company, description, and automatically fills inputs.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-border rounded-xl p-6 hover:border-indigo-500/20 transition duration-300">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Zero-Latency Sync</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Using Supabase PostgreSQL Realtime channels. If you have the tracker board open on three different monitors or tabs, edits update instantly.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-border rounded-xl p-6 hover:border-indigo-500/20 transition duration-300">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Portal Interceptor</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Uses form upload heuristics. Detects when you click submit on standard redirect applications and prompts you to track before you navigate away.
            </p>
          </div>
        </div>

        {/* CSS Kanban mockup representation */}
        <div className="mt-16 bg-[#0b0f19] border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
            <h4 className="font-bold text-sm text-white">Visual Workspace Mockup</h4>
            <span className="text-[10px] text-gray-500">Live Funnel Breakdown</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="border border-border/80 bg-background/50 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Applied</span>
              <div className="bg-card border border-border/60 p-2.5 rounded-lg text-xs">
                <div className="font-semibold text-white">React Developer</div>
                <div className="text-[10px] text-gray-500">Google • LinkedIn</div>
              </div>
            </div>
            <div className="border border-border/80 bg-background/50 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase">Interview</span>
              <div className="bg-card border border-purple-500/20 p-2.5 rounded-lg text-xs">
                <div className="font-semibold text-white">Software Engineer</div>
                <div className="text-[10px] text-gray-500">Vercel • Instahyre</div>
              </div>
            </div>
            <div className="border border-border/80 bg-background/50 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Offer</span>
              <div className="bg-card border border-emerald-500/20 p-2.5 rounded-lg text-xs">
                <div className="font-semibold text-white">Frontend Architect</div>
                <div className="text-[10px] text-gray-500">Stripe • Greenhouse</div>
              </div>
            </div>
            <div className="border border-border/80 bg-background/50 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Rejected</span>
              <div className="border border-dashed border-border/40 rounded-lg flex items-center justify-center p-4 text-[10px] text-gray-600">
                Empty
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXTENSION SETUP GUIDE */}
      <section id="extension-setup" className="max-w-5xl mx-auto px-6 py-20 border-t border-[#1f2937]/50 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-2">
              <Chrome className="w-7 h-7 text-indigo-400" />
              Chrome Extension Setup
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Load Extension</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Open Google Chrome, navigate to <code className="text-indigo-400 font-mono">chrome://extensions</code>, enable **Developer mode**, and select **Load unpacked**. Select the <code className="text-indigo-400 font-mono">/extension</code> directory.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Copy Credentials</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Log in to your Dashboard, click **Extension Auth** in the top-right toolbar, and copy the Project API URL, Anon Key, and user JWT session token.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Paste & Activate</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Open the Extension popup in Chrome, switch to the **Settings** tab, paste your credentials, and click **Save**. Status badge will display green as **Connected**.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extension Graphic Preview mockup */}
          <div className="bg-[#0b0f19] border border-border p-6 rounded-xl shadow-2xl relative w-full max-w-sm mx-auto">
            <div className="absolute -top-3 -right-3 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold text-white shadow-lg">
              Extension Panel
            </div>
            
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <span className="text-xs font-bold text-white">Beacon Scraper</span>
              <div className="flex items-center gap-1 bg-success/15 border border-success/30 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Connected
              </div>
            </div>

            <div className="flex border-b border-border mb-4">
              <span className="flex-1 text-center pb-2 text-xs font-bold text-white border-b-2 border-indigo-500">History</span>
              <span className="flex-1 text-center pb-2 text-xs font-bold text-gray-500">Settings</span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-[#111827] border border-border rounded-lg p-2.5 flex justify-between items-center">
                <div>
                  <h5 className="text-[11px] font-bold text-white">Backend Developer</h5>
                  <p className="text-[9px] text-gray-500">Google</p>
                </div>
                <span className="text-[9px] font-bold bg-[#0a66c2]/15 border border-[#0a66c2]/30 text-[#0a66c2] px-1.5 py-0.5 rounded">LinkedIn</span>
              </div>

              <div className="bg-[#111827] border border-border rounded-lg p-2.5 flex justify-between items-center">
                <div>
                  <h5 className="text-[11px] font-bold text-white">Full-stack Engineer</h5>
                  <p className="text-[9px] text-gray-500">Stripe</p>
                </div>
                <span className="text-[9px] font-bold bg-[#e15d44]/15 border border-[#e15d44]/30 text-[#e15d44] px-1.5 py-0.5 rounded">Instahyre</span>
              </div>
            </div>

            <button className="w-full mt-4 bg-[#111827] hover:bg-[#1f2937] border border-border text-white text-xs font-semibold py-2 rounded-lg transition duration-200">
              Open Workspace
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <span className="text-xs text-gray-500">
          © {new Date().getFullYear()} Beacon. Built for modern job search automation.
        </span>
        <div className="flex gap-6">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-indigo-400 transition">
            Dashboard
          </Link>
          <a href="#extension-setup" className="text-xs text-gray-500 hover:text-indigo-400 transition">
            Extension Setup
          </a>
        </div>
      </footer>
    </div>
  );
}
