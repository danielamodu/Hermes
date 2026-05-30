"use client";

import { Compass, BookOpen, Terminal, Cpu } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-[#0C0C0F] text-white pt-24 px-4 pb-12 font-mono flex flex-col items-center">
      <div className="w-full max-w-[900px] flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <h1 
            style={{ fontFamily: "var(--font-syne)" }}
            className="font-bold text-3xl tracking-wide mb-1 text-white uppercase"
          >
            Developer Documentation
          </h1>
          <p className="text-zinc-500 text-xs">// Technical reference, supported intents, and system setup guide for Hermes.</p>
        </header>

        {/* Section 1: Overview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <BookOpen size={16} className="text-[#F59E0B]" />
            <h2 
              style={{ fontFamily: "var(--font-syne)" }}
              className="text-white text-base font-bold uppercase tracking-wider"
            >
              Overview
            </h2>
          </div>
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans">
            Hermes is the first Conversational AI Agent specifically built for the Portaldot network. By pairing a robust natural language processing engine with direct low-level Substrate RPC APIs, Hermes allows you to manage accounts, broadcast extrinsics, verify balances, and inspect the state of the chain in plain English — without needing any SDK or smart contract knowledge.
          </p>
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans">
            Its architecture separates natural language processing (using LLM-assisted or rule-based intent parsing) from raw execution (using a native Python Substrate client). This ensures zero latency on simple queries and highly deterministic transaction broadcasting on critical calls.
          </p>
        </section>

        {/* Section 2: Supported Commands Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Terminal size={16} className="text-[#F59E0B]" />
            <h2 
              style={{ fontFamily: "var(--font-syne)" }}
              className="text-white text-base font-bold uppercase tracking-wider"
            >
              Supported Commands
            </h2>
          </div>
          
          <div className="overflow-x-auto border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#111114]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-zinc-500 font-bold uppercase select-none">
                  <th className="p-4 w-1/4">Action / Intent</th>
                  <th className="p-4 w-1/3">Example Query</th>
                  <th className="p-4">Underlying Substrate Call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 font-mono text-[11px] text-zinc-300">
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Chain Info</td>
                  <td className="p-4 italic text-zinc-400">"what is the current block height?"</td>
                  <td className="p-4 font-mono text-zinc-500">Queries latest block hash and system height via RPC.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Check Balance</td>
                  <td className="p-4 italic text-zinc-400">"show balance of 5GrwvaEF..."</td>
                  <td className="p-4 font-mono text-zinc-500">Reads System.Account storage key to return free POT.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Transfer POT</td>
                  <td className="p-4 italic text-zinc-400">"send 10 POT to 5FHneW46..."</td>
                  <td className="p-4 font-mono text-zinc-500">Signs and broadcasts a balances.transferKeepAlive extrinsic.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Fee Estimation</td>
                  <td className="p-4 italic text-zinc-400">"how much is the transfer fee?"</td>
                  <td className="p-4 font-mono text-zinc-500">Composes a keep alive transfer and retrieves state payment details.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Inspect Address</td>
                  <td className="p-4 italic text-zinc-400">"inspect account 5H7x..."</td>
                  <td className="p-4 font-mono text-zinc-500">Checks for deployed contract code hashes or keypair metadata.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Runtime Specs</td>
                  <td className="p-4 italic text-zinc-400">"show runtime details"</td>
                  <td className="p-4 font-mono text-zinc-500">Fetches specName, specVersion, and address formats from node properties.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Total Supply</td>
                  <td className="p-4 italic text-zinc-400">"show me the total POT supply"</td>
                  <td className="p-4 font-mono text-zinc-500">Queries Balances.TotalIssuance storage.</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-bold text-[#F59E0B]">Address Inspector</td>
                  <td className="p-4 italic text-zinc-400">"inspect address 5Grw..."</td>
                  <td className="p-4 font-mono text-zinc-500">Queries balance, nonce, and account type for any account address.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Setup Guide */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Compass size={16} className="text-[#F59E0B]" />
            <h2 
              style={{ fontFamily: "var(--font-syne)" }}
              className="text-white text-base font-bold uppercase tracking-wider"
            >
              Setup Guide
            </h2>
          </div>
          
          <div className="space-y-5 text-xs">
            <div className="space-y-2">
              <span className="text-[#F59E0B] font-bold uppercase tracking-wide">1. Clone and Navigate</span>
              <pre className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-3 rounded-lg text-zinc-300 overflow-x-auto text-[10px]">
{`git clone https://github.com/your-repo/hermes.git
cd hermes`}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-[#F59E0B] font-bold uppercase tracking-wide">2. Install Dependencies</span>
              <p className="text-zinc-500 leading-relaxed font-sans text-[11px] mb-1">
                Install both backend python modules and frontend node packages in separate terminal sessions:
              </p>
              <pre className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-3 rounded-lg text-zinc-300 overflow-x-auto text-[10px]">
{`# Install Python backend requirements
cd backend
pip install -r requirements.txt

# Install Next.js frontend dependencies
cd ../frontend
npm install`}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-[#F59E0B] font-bold uppercase tracking-wide">3. Run Local Node</span>
              <p className="text-zinc-500 leading-relaxed font-sans text-[11px]">
                Ensure your local Portaldot / Substrate development node is running and listening at:
                <code className="text-amber-500 ml-1">ws://127.0.0.1:9944</code>
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[#F59E0B] font-bold uppercase tracking-wide">4. Startup Backend API Server</span>
              <pre className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-3 rounded-lg text-zinc-300 overflow-x-auto text-[10px]">
{`cd backend
python main.py`}
              </pre>
              <p className="text-zinc-500 leading-relaxed font-sans text-[11px]">
                This boots up the FastAPI backend on <code className="text-white">http://localhost:8000</code> (configurable via <code className="text-white">NEXT_PUBLIC_API_URL</code>).
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[#F59E0B] font-bold uppercase tracking-wide">5. Startup Frontend Application</span>
              <pre className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-3 rounded-lg text-zinc-300 overflow-x-auto text-[10px]">
{`cd frontend
npm run dev`}
              </pre>
              <p className="text-zinc-500 leading-relaxed font-sans text-[11px]">
                This runs the Next.js frontend dashboard locally on <code className="text-white">http://localhost:3000</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Tech Stack */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Cpu size={16} className="text-[#F59E0B]" />
            <h2 
              style={{ fontFamily: "var(--font-syne)" }}
              className="text-white text-base font-bold uppercase tracking-wider"
            >
              Tech Stack
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-4 rounded-xl space-y-2">
              <span className="font-bold text-xs uppercase text-[#F59E0B]">Frontend App</span>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Modern frontend built on Next.js 14, React 18, Tailwind CSS, TypeScript, and Lucide React Icons for stateful rendering.
              </p>
            </div>
            <div className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-4 rounded-xl space-y-2">
              <span className="font-bold text-xs uppercase text-[#F59E0B]">Backend API</span>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Asynchronous FastAPI Python server integrating open-source Substrate-Interface wrappers and advanced OpenAI semantic parsing.
              </p>
            </div>
            <div className="bg-[#111114] border border-[rgba(255,255,255,0.06)] p-4 rounded-xl space-y-2">
              <span className="font-bold text-xs uppercase text-[#F59E0B]">Ledger / Node</span>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Standardized Substrate blockchain network runtime featuring a local development testnet, custom WASM contract decoders, and POT tokenomics.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
