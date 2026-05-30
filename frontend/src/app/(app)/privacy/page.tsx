"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0F] text-[#F5F0E8] relative pt-24 pb-32">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.04),transparent_60%)] -z-10" />

      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 mb-12">
          <Link href="/" className="hover:text-[#F59E0B] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-500">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="font-mono text-xs tracking-[0.25em] text-[#F59E0B] uppercase">[ LEGAL ]</div>
          <h1 className="font-sans font-bold text-4xl md:text-5xl tracking-tight text-[#F5F0E8]">
            Privacy Policy
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Last updated: <span className="text-zinc-400">May 2026</span>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 font-sans text-[#F5F0E8]/80 leading-relaxed">

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Overview
            </h2>
            <p>
              Hermes is an AI-powered agent interface for the Portaldot blockchain. We are committed to protecting your privacy and being transparent about what data we collect — which, by design, is as little as possible.
            </p>
            <p>
              This policy explains what information Hermes collects when you use the platform, how it is used, and the choices you have.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Information We Collect
            </h2>
            <p>Hermes may collect the following categories of information:</p>
            <ul className="space-y-2 pl-4">
              {[
                "SS58 wallet addresses you enter or generate through the interface.",
                "Chat messages and prompts submitted to the Hermes agent.",
                "Transaction metadata (hashes, block numbers, amounts) from on-chain activity you initiate.",
                "Basic browser telemetry (page views, session duration) for service improvement.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#F59E0B] font-mono text-xs mt-1 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              We do <strong className="text-[#F5F0E8]">not</strong> collect mnemonic seed phrases. Mnemonics generated through Hermes are stored locally in the server keystore and are never transmitted to third-party services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              How We Use Your Data
            </h2>
            <ul className="space-y-2 pl-4">
              {[
                "To route your natural language intents to the correct on-chain actions.",
                "To return accurate chain data (balances, block info, transaction results).",
                "To improve agent classification accuracy and response quality.",
                "To diagnose and fix errors or failed transactions.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#F59E0B] font-mono text-xs mt-1 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Third-Party Services
            </h2>
            <p>
              Hermes uses the following third-party services to operate:
            </p>
            <div className="bg-[#111114] border border-white/[0.06] rounded-none p-5 space-y-3 font-mono text-sm">
              {[
                { name: "OpenRouter / Groq", purpose: "LLM inference for intent classification" },
                { name: "Portaldot Node", purpose: "On-chain data queries and transaction broadcasting" },
              ].map((s) => (
                <div key={s.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-[#F59E0B] w-44 shrink-0">{s.name}</span>
                  <span className="text-zinc-500">{s.purpose}</span>
                </div>
              ))}
            </div>
            <p>
              These services have their own privacy policies. We encourage you to review them independently.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Data Retention
            </h2>
            <p>
              Chat history and transaction logs are not persisted on our servers beyond the active session. Local transaction history stored in your browser's <code className="font-mono text-[#F59E0B] text-sm bg-[#F59E0B]/10 px-1">localStorage</code> remains under your control and can be cleared at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have rights to access, correct, or delete personal data we hold. Since Hermes collects minimal identifying data, most interactions are effectively pseudonymous. Contact us at the address below to exercise any rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Contact
            </h2>
            <p>
              Questions about this policy? Reach us at{" "}
              <a
                href="https://x.com/fortyxbt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F59E0B] hover:underline"
              >
                @fortyxbt
              </a>{" "}
              or open an issue on{" "}
              <a
                href="https://github.com/danielamodu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F59E0B] hover:underline"
              >
                GitHub
              </a>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-20 pt-8 border-t border-white/[0.06] flex items-center justify-between">
          <Link href="/" className="font-mono text-xs text-zinc-600 hover:text-[#F59E0B] transition-colors">
            ← Back to Home
          </Link>
          <Link href="/terms" className="font-mono text-xs text-zinc-600 hover:text-[#F59E0B] transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
