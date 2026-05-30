"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0F] text-[#F5F0E8] relative pt-24 pb-32">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.04),transparent_60%)] -z-10" />

      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 mb-12">
          <Link href="/" className="hover:text-[#F59E0B] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-500">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="font-mono text-xs tracking-[0.25em] text-[#F59E0B] uppercase">[ LEGAL ]</div>
          <h1 className="font-sans font-bold text-4xl md:text-5xl tracking-tight text-[#F5F0E8]">
            Terms of Service
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Last updated: <span className="text-zinc-400">May 2026</span>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 font-sans text-[#F5F0E8]/80 leading-relaxed">

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using Hermes ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users of the Hermes platform, including the chat interface, block explorer, and any associated APIs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Description of Service
            </h2>
            <p>
              Hermes is an AI-powered agent for the Portaldot blockchain. It enables users to query on-chain data, inspect addresses, check balances, and initiate transactions using natural language. The Service operates by routing user intent through a large language model inference layer connected to a Substrate-compatible node.
            </p>
            <div className="bg-[#111114] border border-[#F59E0B]/20 rounded-none p-4 font-mono text-xs text-[#F59E0B]/80">
              ⚠ Hermes is currently in developer preview (v1.0.0). Use on mainnet or with significant funds is not recommended.
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Permitted Use
            </h2>
            <p>You may use Hermes to:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Query and explore the Portaldot blockchain in good faith.",
                "Generate wallets and manage test funds on Portaldot devnet.",
                "Develop and test applications that integrate with the Hermes API.",
                "Learn how Substrate-based blockchains work using the natural language interface.",
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
              Prohibited Use
            </h2>
            <p>You may <strong className="text-[#F5F0E8]">not</strong> use Hermes to:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Engage in fraudulent, deceptive, or malicious on-chain activity.",
                "Attempt to extract, reverse-engineer, or exploit the agent's inference layer.",
                "Use the Service to violate any applicable law or regulation.",
                "Automate high-frequency requests that degrade service availability for other users.",
                "Impersonate other users or misrepresent your identity.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-red-500/70 font-mono text-xs mt-1 shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Wallet & Key Security
            </h2>
            <p>
              Hermes may generate cryptographic wallets on your behalf. You are solely responsible for the security of any mnemonic seed phrases displayed or stored during use. Hermes Systems Inc. does not have access to your private keys and cannot recover lost wallets. Never share your mnemonic with anyone.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Transactions & Irreversibility
            </h2>
            <p>
              All blockchain transactions initiated through Hermes are irreversible once confirmed on-chain. You are responsible for verifying recipient addresses and amounts before confirming any transfer. Hermes Systems Inc. bears no liability for funds lost due to incorrect transaction parameters, node unavailability, or user error.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided <strong className="text-[#F5F0E8]">"as is"</strong> without warranty of any kind, express or implied. We do not guarantee uptime, accuracy of chain data, or the correctness of AI-generated intent classifications. Use the Service at your own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Hermes Systems Inc. shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of funds, data, or profits.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Changes to Terms
            </h2>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms. Material changes will be announced via the project's GitHub repository.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans font-bold text-lg text-[#F5F0E8] border-l-2 border-[#F59E0B] pl-4">
              Contact
            </h2>
            <p>
              For questions about these Terms, reach us at{" "}
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
          <Link href="/privacy" className="font-mono text-xs text-zinc-600 hover:text-[#F59E0B] transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
