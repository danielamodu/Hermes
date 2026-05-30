"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0F] text-[#F5F0E8] relative font-sans selection:bg-[#F59E0B]/30">

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-32 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <span className="inline-flex items-center justify-center rounded-none border border-white/[0.08] px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-zinc-500 bg-white/[0.02] mb-4">
            Legal — Terms
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#F5F0E8] mb-4">
            Terms of <span className="text-[#F59E0B]">Service</span>
          </h1>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            Effective: May 2026 — Last updated: May 30, 2026
          </p>
        </div>

        {/* Card Stack Section */}
        <div className="space-y-6">
          {/* Card 1: Acceptance of Terms */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">1.</span> Acceptance of Terms
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                By accessing or using Hermes ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users of the Hermes platform, including the chat interface, block explorer, and any associated APIs.
              </p>
              <p>
                You must be at least 18 years old and legally capable of entering into binding contracts in your jurisdiction to use the Service. By using Hermes, you represent and warrant that you meet these requirements.
              </p>
            </div>
          </div>

          {/* Card 2: Nature of the Service */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">2.</span> Nature of the Service
            </h2>
            <div className="space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Hermes is an AI-powered agent for the Portaldot blockchain. It enables users to query on-chain data, inspect addresses, check balances, and initiate transactions using natural language. The Service operates by routing user intent through a large language model inference layer connected to a Substrate-compatible node.
              </p>
              <p>
                Hermes does not hold, custody, or control your funds at any time. All transactions are peer-to-peer and settled directly on Portaldot.
              </p>
              <div className="bg-[#F59E0B]/[0.02] border border-[#F59E0B]/20 rounded-lg p-5 font-mono text-xs text-[#F59E0B]/90">
                <span className="font-semibold uppercase tracking-wider block mb-1">Developer Preview:</span>
                Hermes is currently in developer preview (v1.0.0). Use on mainnet or with significant funds is not recommended.
              </div>
            </div>
          </div>

          {/* Card 3: Permitted Use */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">3.</span> Permitted Use
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>You may use Hermes to:</p>
              <ul className="space-y-3 pl-1">
                {[
                  "Query and explore the Portaldot blockchain in good faith.",
                  "Generate wallets and manage test funds on Portaldot devnet.",
                  "Develop and test applications that integrate with the Hermes API.",
                  "Learn how Substrate-based blockchains work using the natural language interface.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F59E0B] font-mono text-xs mt-1 shrink-0">0{i+1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 4: Prohibited Uses */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">4.</span> Prohibited Uses
            </h2>
            <div className="space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>You agree not to use the Service to:</p>
              <ul className="space-y-3 pl-1">
                {[
                  "Violate any applicable law, regulation, or government order in any jurisdiction.",
                  "Engage in fraudulent, deceptive, or malicious on-chain activity.",
                  "Attempt to extract, reverse-engineer, or exploit the agent's inference layer.",
                  "Automate high-frequency requests that degrade service availability for other users.",
                  "Impersonate other users or misrepresent your identity.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F59E0B] font-mono text-xs mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Hermes reserves the right to block access to the web interface for addresses identified as violating these terms.
              </p>
            </div>
          </div>

          {/* Card 5: Wallet & Key Security */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">5.</span> Wallet & Key Security
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                Hermes is a non-custodial protocol. You retain full control of your private keys and wallet at all times. Hermes has no ability to access, freeze, seize, or recover your funds.
              </p>
              <p>
                Hermes may generate cryptographic wallets on your behalf. You are solely responsible for the security of any mnemonic seed phrases displayed or stored during use. Hermes Systems Inc. does not have access to your private keys and cannot recover lost wallets. Never share your mnemonic with anyone.
              </p>
            </div>
          </div>

          {/* Card 6: Transactions & Irreversibility */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">6.</span> Transactions & Irreversibility
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                All blockchain transactions initiated through Hermes are irreversible once confirmed on-chain. You are responsible for verifying recipient addresses and amounts before confirming any transfer. Hermes Systems Inc. bears no liability for funds lost due to incorrect transaction parameters, node unavailability, or user error.
              </p>
              <p>
                Nothing in the Service constitutes financial, investment, legal, or tax advice. You are solely responsible for evaluating the suitability of any transaction for your circumstances.
              </p>
            </div>
          </div>

          {/* Card 7: Disclaimers & Limitation of Liability */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">7.</span> Disclaimers & Limitation of Liability
            </h2>
            <div className="space-y-4 text-xs font-mono text-zinc-400 leading-relaxed uppercase tracking-wider">
              <p className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HERMES SYSTEMS INC. AND ITS CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
              </p>
            </div>
          </div>

          {/* Card 8: Modifications to Terms */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">8.</span> Modifications to Terms
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                We reserve the right to update these Terms at any time. Material changes will be communicated via our official channels (X / GitHub). Continued use of the protocol after changes are posted constitutes your acceptance of the revised Terms.
              </p>
              <p>
                If you disagree with any changes, your sole remedy is to discontinue use of the Service.
              </p>
            </div>
          </div>

          {/* Card 9: Contact */}
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-white/[0.1] ease-out">
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-6 flex items-baseline gap-2">
              <span className="text-[#F59E0B] font-mono text-sm">9.</span> Contact Us
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-sans">
              For legal enquiries or questions regarding these Terms, reach us on X or open an issue on GitHub. We aim to respond to formal legal requests within 5 business days.
            </p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 mb-6">
              <p className="text-[#F5F0E8] font-bold text-lg mb-2 font-mono">Hermes Systems Inc.</p>
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
