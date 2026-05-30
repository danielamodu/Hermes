"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0F] text-[#F5F0E8] relative font-sans selection:bg-[#F59E0B]/30">

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-32 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <span className="inline-flex items-center justify-center rounded-none border border-white/[0.08] px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-zinc-500 bg-white/[0.02] mb-4">
            Legal — Privacy
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#F5F0E8] mb-4">
            Privacy <span className="text-[#F59E0B]">Policy</span>
          </h1>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            Effective: May 2026 — Last updated: May 30, 2026
          </p>
        </div>

        {/* Card Stack Section */}
        <div className="space-y-6">
          {/* Card 1: Overview */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">1.</span> Overview
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Hermes is an AI-powered agent interface for the Portaldot blockchain. We are committed to protecting your privacy and being transparent about what data we collect — which, by design, is as little as possible.
              </p>
              <p>
                This policy explains what information Hermes collects when you use the platform, how it is used, and the choices you have.
              </p>
            </div>
          </div>

          {/* Card 2: Information We Collect */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">2.</span> Information We Collect
            </h2>
            <div className="space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Hermes is a non-custodial interface. We may collect the following categories of information:
              </p>
              <ul className="space-y-3 pl-1">
                {[
                  "SS58 wallet addresses you enter or generate through the interface.",
                  "Chat messages and prompts submitted to the Hermes agent.",
                  "Transaction metadata (hashes, block numbers, amounts) from on-chain activity you initiate.",
                  "Basic browser telemetry (page views, session duration) for service improvement.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F59E0B] font-mono text-xs mt-1 shrink-0">0{i+1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5 font-mono text-xs text-zinc-400">
                <span className="text-[#F59E0B] font-semibold">NOTE:</span> We do <strong className="text-[#F5F0E8] font-medium">not</strong> collect mnemonic seed phrases. Mnemonics generated through Hermes are stored locally in the server keystore and are never transmitted to third-party services.
              </div>
            </div>
          </div>

          {/* Card 3: How We Use Your Data */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">3.</span> How We Use Your Data
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                We use the collected information for the following specific purposes:
              </p>
              <ul className="space-y-3 pl-1">
                {[
                  "To route your natural language intents to the correct on-chain actions.",
                  "To return accurate chain data (balances, block info, transaction results).",
                  "To improve agent classification accuracy and response quality.",
                  "To diagnose and fix errors or failed transactions.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F59E0B] font-mono text-xs mt-1 shrink-0">0{i+1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 4: Third-Party Services */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">4.</span> Third-Party Services
            </h2>
            <div className="space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Hermes uses the following third-party services to operate:
              </p>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 space-y-4 font-mono text-xs">
                {[
                  { name: "OpenRouter / Groq", purpose: "LLM inference for intent classification" },
                  { name: "Portaldot Node", purpose: "On-chain data queries and transaction broadcasting" },
                ].map((s) => (
                  <div key={s.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 border-b border-white/[0.04] last:border-0 pb-3 last:pb-0">
                    <span className="text-[#F5F0E8] w-48 shrink-0">{s.name}</span>
                    <span className="text-zinc-500">{s.purpose}</span>
                  </div>
                ))}
              </div>
              <p>
                These services have their own privacy policies. We encourage you to review them independently. Links to external sites are provided for convenience. Hermes bears no responsibility for the privacy practices of those destinations.
              </p>
            </div>
          </div>

          {/* Card 5: Data Retention */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">5.</span> Data Retention
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Chat history and transaction logs are not persisted on our servers beyond the active session. Local transaction history stored in your browser's <code className="font-mono text-[#F5F0E8] text-xs bg-white/[0.04] px-1.5 py-0.5 border border-white/[0.08]">localStorage</code> remains under your control and can be cleared at any time.
              </p>
              <p>
                On-chain data follows Portaldot's permanent ledger model and cannot be deleted by Hermes or anyone else.
              </p>
            </div>
          </div>

          {/* Card 6: Your Rights */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">6.</span> Your Rights
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Depending on your jurisdiction, you may have rights to access, correct, or delete personal data we hold. Since Hermes collects minimal identifying data, most interactions are effectively pseudonymous. Because we hold no personal data, there is nothing for us to delete, export, or correct on your behalf.
              </p>
            </div>
          </div>

          {/* Card 7: Contact Us */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">7.</span> Contact Us
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-sans">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us. We aim to respond within 48 hours.
            </p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 mb-6">
              <p className="text-[#F5F0E8] font-bold text-lg mb-2 font-mono">Hermes Protocol</p>
              <p className="text-zinc-400 font-mono text-xs">Primary Handle: <span className="text-zinc-300">@fortyxbt</span></p>
              <p className="text-zinc-400 font-mono text-xs">Open Source: <span className="text-zinc-300">github.com/danielamodu</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://github.com/danielamodu"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile flex-1 text-center border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-zinc-300 px-6 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-200 ease-out"
              >
                View on GitHub
              </a>
              <a
                href="https://x.com/fortyxbt"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile flex-1 text-center bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black px-6 py-3 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-all duration-200 ease-out"
              >
                Contact @fortyxbt
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="btn-tactile inline-flex items-center gap-2 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-zinc-400 hover:text-[#F5F0E8] px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-200 ease-out"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
