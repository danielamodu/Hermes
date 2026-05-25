"use client";

import BackgroundEffects from '@/components/BackgroundEffects';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";


const CodeBoilerplate = () => (
  <pre className="text-[11px] leading-relaxed text-zinc-400 font-mono overflow-x-auto p-4 bg-[#030303]/90 border border-zinc-800/80 rounded-lg h-full max-h-[350px] overflow-y-auto">
    <code>
      <span className="text-zinc-600"># Imports</span>{"\n"}
      <span className="text-purple-400">from</span> substrateinterface <span className="text-purple-400">import</span> <span className="text-amber-400">SubstrateInterface</span>{"\n"}
      <span className="text-purple-400">from</span> substrateinterface.exceptions <span className="text-purple-400">import</span> <span className="text-amber-400">SubstrateRequestException</span>{"\n\n"}
      <span className="text-zinc-600"># Initialize Substrate connection</span>{"\n"}
      <span className="text-purple-400">try</span>:{"\n"}
      &nbsp;&nbsp;substrate = <span className="text-blue-400">SubstrateInterface</span>(
      url=<span className="text-green-400">"ws://127.0.0.1:9944"</span>,
      ss58_format=<span className="text-amber-400">42</span>,
      type_registry_preset=<span className="text-green-400">"default"</span>
      ){"\n"}
      <span className="text-purple-400">except</span> <span className="text-amber-400">ConnectionRefusedError</span> <span className="text-purple-400">as</span> e:{"\n"}
      &nbsp;&nbsp;<span className="text-teal-400">print</span>(<span className="text-green-400">f"Connection failed: {"{"}e{"}"}"</span>){"\n"}
      &nbsp;&nbsp;<span className="text-teal-400">exit</span>(<span className="text-amber-400">1</span>){"\n\n"}
      alice = <span className="text-green-400">"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHp..."</span>{"\n\n"}
      <span className="text-purple-400">try</span>:{"\n"}
      &nbsp;&nbsp;<span className="text-zinc-600"># Query system account balance</span>{"\n"}
      &nbsp;&nbsp;result = substrate.<span className="text-teal-400">query</span>(
      module=<span className="text-green-400">"System"</span>,
      storage_function=<span className="text-green-400">"Account"</span>,
      params=[alice]
      ){"\n"}
      &nbsp;&nbsp;balance = result.value[<span className="text-green-400">'data'</span>][<span className="text-green-400">'free'</span>]{"\n"}
      &nbsp;&nbsp;formatted_bal = balance / <span className="text-amber-400">10</span>**<span className="text-amber-400">10</span>{"\n\n"}
      &nbsp;&nbsp;<span className="text-zinc-600"># Query total issuance supply</span>{"\n"}
      &nbsp;&nbsp;issuance = substrate.<span className="text-teal-400">query</span>(
      module=<span className="text-green-400">"Balances"</span>,
      storage_function=<span className="text-green-400">"TotalIssuance"</span>
      ){"\n"}
      &nbsp;&nbsp;total = issuance.value / <span className="text-amber-400">10</span>**<span className="text-amber-400">10</span>{"\n\n"}
      &nbsp;&nbsp;<span className="text-teal-400">print</span>(<span className="text-green-400">f"Total Issuance: {"{"}total:,.4f{"}"} POT"</span>){"\n"}
      &nbsp;&nbsp;<span className="text-teal-400">print</span>(<span className="text-green-400">f"Alice Balance: {"{"}formatted_bal:,.4f{"}"} POT"</span>){"\n\n"}
      <span className="text-purple-400">except</span> <span className="text-amber-400">SubstrateRequestException</span> <span className="text-purple-400">as</span> e:{"\n"}
      &nbsp;&nbsp;<span className="text-teal-400">print</span>(<span className="text-green-400">f"Substrate query failed: {"{"}e{"}"}"</span>)
    </code>
  </pre>
);

export default function LandingPage() {
  const fullCommandText = "show me total POT supply and current block height";
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [stage, setStage] = useState(0); // 0: typing, 1: parsing, 2: fetching wasm, 3: signing, 4: success block, 5: interactive
  const [customInput, setCustomInput] = useState("");
  const [history, setHistory] = useState<Array<{ type: "input" | "output"; text: string; details?: any }>>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [blockHeight, setBlockHeight] = useState(12459);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Mouse-tracking radial spotlight glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        spotlightRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Block height increment
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sleek progress bar filling instantly
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Typing effect (State-driven single-timeout loop)
  useEffect(() => {
    if (typingIndex < fullCommandText.length) {
      const timeout = setTimeout(() => {
        setTypedText(prev => prev + fullCommandText.charAt(typingIndex));
        setTypingIndex(prev => prev + 1);
      }, 45);
      return () => clearTimeout(timeout);
    } else {
      const t1 = setTimeout(() => setStage(1), 500); // parsing intent
      const t2 = setTimeout(() => setStage(2), 1100); // fetching wasm
      const t3 = setTimeout(() => setStage(3), 1700); // signing tx
      const t4 = setTimeout(() => setStage(4), 2300); // success block
      const t5 = setTimeout(() => setStage(5), 3300); // interactive CLI
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    }
  }, [typingIndex]);

  // Scroll to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [stage, history]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const cmd = customInput.trim();
    const cleanCmd = cmd.toLowerCase();

    // Add user input
    setHistory(prev => [...prev, { type: "input", text: cmd }]);
    setCustomInput("");

    setTimeout(() => {
      if (cleanCmd === "help") {
        setHistory(prev => [
          ...prev,
          {
            type: "output",
            text: `Available commands:
  - deploy <name>   Instantiate ink! contract
  - tx <hash>       Query transaction details
  - balance         Check developer account balance
  - system          Show agent node telemetry
  - clear           Clear console log history`
          }
        ]);
      } else if (cleanCmd === "clear") {
        setHistory([]);
      } else if (cleanCmd === "balance") {
        setHistory(prev => [
          ...prev,
          {
            type: "output",
            text: `[info] querying dev keypair...
[account] 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
[balance] 1,250.45 UNIT (Portaldot Devnet)`
          }
        ]);
      } else if (cleanCmd === "system") {
        setHistory(prev => [
          ...prev,
          {
            type: "output",
            text: `[system] Hermes Agent OS v1.0.0 (active)
[status] Synced with Portaldot local-node
[keystore] Loaded: DevKeypair (sr25519)
[inference] 2ms execution latency (powered by Groq)`
          }
        ]);
      } else if (cleanCmd.startsWith("deploy")) {
        const tokenName = cmd.split(" ").slice(1).join(" ") || "CustomToken";
        setHistory(prev => [
          ...prev,
          {
            type: "output",
            text: `[info] parsing intent: "deploy contract ${tokenName}"...
[intent] classified: DEPLOY_CONTRACT
[info] fetching wasm artifacts...
[info] signing transaction using keystore...`,
            details: {
              success: true,
              contractName: tokenName,
              address: "5D34uK5a..." + Math.random().toString(36).substring(2, 10),
              txHash: "0x" + Math.random().toString(16).substring(2, 34)
            }
          }
        ]);
      } else {
        setHistory(prev => [
          ...prev,
          {
            type: "output",
            text: `[info] parsing custom intent: "${cmd}"...
[intent] classified: AGENT_TRANSACTION
[info] executing custom agent task...
[success] transaction completed successfully!`
          }
        ]);
      }
    }, 400);
  };
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden font-mono w-full pt-24">
      <BackgroundEffects />

      {/* Centered Breathing Amber Glow Behind Hero */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,1),transparent_60%)] -z-20 animate-breathe-glow"
      />

      {/* Background Retro Grid / Dot Matrix Pattern Layer */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(rgba(245,158,11,0.04)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:40px_40px]"
      />

      {/* Mouse-tracking Radial Spotlight Layer */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.04), transparent 80%)`
        }}
      />

      {/* Global CSS Style tag for cursor blink, fade in, float, and breathing glow */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: blink 1s step-start infinite;
        }
        @keyframes customFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes customFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes breathe {
          from { opacity: 0.03; }
          to { opacity: 0.08; }
        }
        .animate-fade-in-once {
          animation: customFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float-infinite {
          animation: customFloat 6s ease-in-out infinite;
        }
        .animate-breathe-glow {
          animation: breathe 8s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Terminal Hero Section */}
      <section className="flex flex-col items-center justify-center space-y-6 md:space-y-8 max-w-5xl mx-auto w-full px-4 md:px-8 pt-[140px] pb-[80px]">
        <div className="inline-flex items-center space-x-2 border border-accent/20 bg-accent/5 px-3 py-1 rounded-full text-xs text-accent tracking-widest uppercase">
          <span>v1.0.0 Active</span>
        </div>

        {/* Hero Text Section */}
        <div className="flex flex-col items-center space-y-6 max-w-2xl w-full text-center">
          <h1 className="font-sans font-bold text-4xl md:text-5xl text-white tracking-tight leading-tight">
            The First AI Agent for Portaldot
          </h1>
          <p className="font-mono text-sm text-[#A09888] max-w-[500px] leading-relaxed mx-auto">
            Query blocks, inspect addresses, fetch balances, and explore the Portaldot network — all in plain English. No SDK knowledge required.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center py-3 px-6 bg-[#F59E0B] text-[#0C0C0F] font-mono text-sm font-medium rounded-[8px] hover:bg-[#F59E0B]/90 shadow-lg shadow-[#F59E0B]/15 btn-tactile"
          >
            Launch Hermes →
          </Link>
        </div>

        {/* Dynamic centered terminal UI */}
        <div
          onClick={() => {
            if (stage === 5) inputRef.current?.focus();
          }}
          className={`w-full max-w-4xl bg-[#030303]/90 border ${isFocused ? 'border-accent/40 shadow-[0_0_60px_rgba(245,158,11,0.2)]' : 'border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]'} rounded-lg overflow-hidden transition-all duration-300 cursor-text`}
        >
          {/* Terminal Window Header */}
          <div className="h-10 bg-zinc-950/80 border-b border-zinc-800 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
              <span className="text-xs text-zinc-500 pl-4 font-mono">hermes-terminal --boot-sequence</span>
            </div>
            {stage === 5 && (
              <span className="text-[10px] text-green-400 font-bold bg-green-950/30 px-2 py-0.5 border border-green-900 rounded-full animate-pulse uppercase tracking-wider font-mono">
                ● INTERACTIVE_MODE
              </span>
            )}
          </div>

          {/* Terminal Window Body */}
          <div className="p-4 md:p-6 space-y-4 text-xs md:text-sm h-[380px] md:h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 flex flex-col justify-start">
            {/* Step 1: Initial typed command */}
            <div className="flex space-x-2">
              <span className="text-accent font-bold">{">"}</span>
              <span className="text-white">
                {typedText}
                {stage === 0 && <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-cursor-blink align-middle"></span>}
              </span>
            </div>

            {/* Step 2: Parsing intent log */}
            {stage >= 1 && (
              <div className="space-y-1 text-white/40 pl-4 border-l border-zinc-800/80 font-mono animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-600">●</span>
                  <span>[info] parsing intent...</span>
                </div>
                <div className="text-accent/60 flex items-center space-x-2">
                  <span className="text-accent/40">●</span>
                  <span>[intent] classified: BATCH_QUERY</span>
                </div>
              </div>
            )}

            {/* Step 3: Fetching artifacts log */}
            {stage >= 2 && (
              <div className="space-y-1 text-white/40 pl-4 border-l border-zinc-800/80 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-600">●</span>
                  <span>[info] querying Balances.TotalIssuance and System.Events...</span>
                </div>
              </div>
            )}

            {/* Step 4: Signing txn log */}
            {stage >= 3 && (
              <div className="space-y-1 text-white/40 pl-4 border-l border-zinc-800/80 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-600">●</span>
                  <span>[info] compiling structured multi-query results...</span>
                </div>
              </div>
            )}

            {/* Step 5: Success box block */}
            {stage >= 4 && (
              <div className="pl-4 border-l border-zinc-800/80">
                <div className="bg-zinc-950/80 p-3 rounded border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)] space-y-2 max-w-2xl font-mono">
                  <div className="text-green-400 font-bold mb-1 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>[+] TRANSACTION_SUCCESS</span>
                  </div>
                  <div className="text-[11px] md:text-xs text-white/90 leading-relaxed pl-3 border-l-2 border-green-500/40 space-y-1">
                    <div>[CHAIN_QUERY] Total POT Supply: <span className="text-accent font-bold">1,000,000,000 POT</span></div>
                    <div>[CHAIN_QUERY] Block Height: <span className="text-white/80">#412,402</span> · Finalized: <span className="text-white/60">#412,401</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive custom commands history log */}
            {stage === 5 && history.map((item, idx) => (
              <div key={idx} className="space-y-2">
                {item.type === "input" ? (
                  <div className="flex space-x-2">
                    <span className="text-accent font-bold">{">"}</span>
                    <span className="text-white">{item.text}</span>
                  </div>
                ) : (
                  <div className="space-y-1 pl-4 border-l border-zinc-800/80">
                    <pre className="text-white/50 whitespace-pre-wrap font-mono text-xs leading-relaxed">{item.text}</pre>
                    {item.details && (
                      <div className="bg-zinc-950/80 p-3 rounded border border-green-500/20 space-y-1 max-w-2xl font-mono mt-2">
                        <div className="text-green-400 font-bold mb-2 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span>[+] TRANSACTION_SUCCESS</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-2 text-[11px] md:text-xs">
                          <span className="text-white/40">Contract:</span>
                          <span className="text-white/80">{item.details.contractName}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-2 text-[11px] md:text-xs">
                          <span className="text-white/40">Address:</span>
                          <span className="text-accent break-all font-mono">{item.details.address}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-2 text-[11px] md:text-xs">
                          <span className="text-white/40">Tx Hash:</span>
                          <span className="text-white/60 break-all font-mono">{item.details.txHash}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Interactive prompt input display */}
            {stage === 5 && (
              <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2 pt-2">
                <span className="text-accent font-bold">[portaldot-cli]&gt;</span>
                <div className="flex-1 flex items-center relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="bg-transparent border-none outline-none text-white font-mono flex-1 caret-transparent"
                    placeholder="Type intent (e.g. balance, help, system)..."
                  />
                  <div className="absolute left-0 pointer-events-none text-white flex items-center font-mono">
                    {customInput}
                    <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-cursor-blink align-middle"></span>
                  </div>
                </div>
              </form>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>
      </section>

      {/* Capabilities Strip */}
      <div className="w-full py-6 overflow-hidden relative flex justify-center items-center">
        <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-16 gap-y-6 max-w-5xl px-4 md:px-8">
          {[
            "block-lookup",
            "pot-transfer",
            "address-inspect",
            "fee-estimate",
            "addr-inspect",
            "historic-balance",
            "runtime-info",
            "total-supply"
          ].map((tag, idx) => {
            const delay = idx * 300;
            return (
              <span
                key={tag}
                className="opacity-0 animate-fade-in-once inline-block"
                style={{ animationDelay: `${delay}ms` }}
              >
                <span
                  className="font-mono text-[11px] font-bold text-accent/60 uppercase tracking-widest hover:text-accent transition-colors duration-300 animate-float-infinite inline-block"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  [{tag}]
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Target 3: New DX Comparison Section (3D Scroll Reveal) */}
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col space-y-4 mb-12">
            <div className="text-xs text-accent tracking-widest uppercase font-bold font-mono">Boilerplate vs Intent</div>
            <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tighter text-white uppercase font-sans">
              DITCH THE DOCS. JUST ASK.
            </h2>
            <p className="text-sm text-white/50 max-w-2xl mx-auto font-sans leading-relaxed">
              Stop digging through Portaldot documentation and writing manual SDK queries. Ask Hermes in plain English and get instant chain data, address intelligence, and network insights.
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full text-left">
          {/* Left Column: Dense Substrate SDK Boilerplate */}
          <div className="flex flex-col bg-[#050505] border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-colors duration-300">
            <div className="h-10 bg-zinc-950/80 border-b border-zinc-800 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">substrate_query.py</span>
              </div>
              <span className="text-[10px] text-red-400 font-bold font-mono bg-red-950/30 border border-red-900/60 px-2 py-0.5 rounded uppercase">
                34 Lines of Code
              </span>
            </div>
            <div className="p-1">
              <CodeBoilerplate />
            </div>
          </div>

          {/* Right Column: Clean single-line intent */}
          <div className="flex flex-col justify-between p-6 md:p-8 bg-[#050505] border border-zinc-800 hover:border-accent/30 rounded-lg h-full transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            {/* corner grid overlay decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none"></div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-mono">Hermes Prompt Interface</span>
                <span className="text-[10px] text-green-400 font-bold font-mono bg-green-950/30 border border-green-900/60 px-2 py-0.5 rounded uppercase">
                  1 Line of Text
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold font-sans">Natural Language Query</div>
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg flex items-center space-x-3 shadow-inner relative group-hover:border-accent/20 transition-colors duration-300">
                  <span className="text-accent font-black text-lg select-none">&gt;</span>
                  <span className="text-white text-sm md:text-base font-bold font-sans tracking-wide leading-relaxed">
                    show me total POT supply and current block height
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold">Compiler Intent Analysis Pipeline</span>
                  <span className="text-accent font-bold tracking-widest">100% COMPILED</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-950 border border-zinc-800/80 rounded-sm overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-accent via-amber-500 to-accent shadow-[0_0_15px_rgba(245,158,11,0.6)] rounded-sm transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-900/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Status: Pipeline Resolved</span>
              <span className="text-green-400 font-bold">Success (2ms)</span>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* Target 4: Capabilities Matrix (tmux Style) */}
      <section className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col space-y-2 mb-12">
          <div className="text-xs text-accent tracking-widest uppercase font-bold font-mono">[CAPABILITIES]</div>
          <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-wide uppercase">
            Agent Capabilities
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Intent Parsing */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[AGENT-v1.0]</span>
            <div className="text-accent font-bold text-base font-mono">[01] INTENT_PARSING</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">Groq Engine</h3>
            <p className="text-xs md:text-sm text-white/50 leading-relaxed font-sans">
              Transform natural language requests into strict Substrate transaction payloads instantly.
            </p>
          </div>

          {/* Card 2: Chain Intelligence */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[EXPLORER]</span>
            <div className="text-accent font-bold text-base font-mono">[02] CHAIN_INTELLIGENCE</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">Block Explorer</h3>
            <p className="text-xs md:text-sm text-white/50 leading-relaxed font-sans">
              Query blocks, inspect addresses, fetch historic balances, and monitor network state in real time.
            </p>
          </div>

          {/* Card 3: Address Inspector */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[ADDR-INSPECT]</span>
            <div className="text-accent font-bold text-base font-mono">[03] ADDR_INSPECTOR</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">Address Inspector</h3>
            <p className="text-xs md:text-sm text-white/50 leading-relaxed font-sans">
              Inspect any Portaldot address — check balance, nonce, and account type instantly.
            </p>
          </div>

          {/* Card 4: State Monitoring with Live Update */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[STATE-MONITOR]</span>
            <div className="text-accent font-bold text-base font-mono">[04] REAL_TIME_METRICS</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">State Monitoring</h3>
            <p className="text-xs md:text-sm text-white/50 leading-relaxed font-sans">
              Maintain full real-time visual telemetry over deployed ink! contract blocks.
            </p>

            {/* Live Updating Block Height */}
            <div className="mt-4 flex items-center space-x-2 bg-[#020202] border border-zinc-800/80 px-3 py-1.5 rounded-sm font-mono text-xs w-full max-w-[240px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Height:</span>
              <span className="text-green-400 font-bold">#{blockHeight.toLocaleString()}</span>
              <span className="text-zinc-700 font-bold font-sans">|</span>
              <span className="text-zinc-500 uppercase text-[9px]">Synced</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target 4: How It Works Section (tmux Style) */}
      <section className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16 md:py-24 border-b border-zinc-900 bg-background/10">
        <div className="flex flex-col space-y-2 mb-12">
          <div className="text-xs text-accent tracking-widest uppercase font-bold font-mono">[WORKFLOW]</div>
          <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-wide uppercase">
            How It Works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[SYS-INTENT]</span>
            <div className="text-accent font-bold text-base font-mono">[01] INTENT</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">Type your intent</h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Simply express your goal in natural language (e.g., 'deploy a token contract').
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[SYS-PROC]</span>
            <div className="text-accent font-bold text-base font-mono">[02] PROCESSING</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">Hermes parses + executes</h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Our ultra-low latency Groq-powered inference engine compiles, parses, and signs the transaction payload.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-[#030303]/90 border border-zinc-800/80 p-6 md:p-8 space-y-4 rounded-none transition-all duration-300 hover:border-accent/40 hover:bg-[#050505] group">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-accent transition-colors">[SYS-LIVE]</span>
            <div className="text-accent font-bold text-base font-mono">[03] RESOLVED</div>
            <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">Chain data returned instantly</h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Hermes queries the Portaldot node and returns structured, readable results directly in your terminal.
            </p>
          </div>
        </div>
      </section>

      {/* Large Editorial Footer (Landing Page Exclusive) */}
      <footer className="pt-[120px] pb-0 w-full font-mono relative overflow-hidden bg-transparent mt-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 max-w-5xl mx-auto w-full px-4 md:px-8">
          <div className="space-y-4">
            <h3 className="font-sans font-black text-4xl md:text-5xl text-white tracking-tighter uppercase leading-none">
              Experience <br />
              <span className="text-accent">Liftoff</span>
            </h3>
            <p className="text-xs text-white/40 max-w-xs leading-relaxed">
              Deploy smart contracts, sign transactions, and query blocks instantly using natural language.
            </p>
            <div className="text-[10px] text-white/20 pt-2 font-mono">
              &copy; 2026 Hermes Systems Inc. All rights reserved.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 md:gap-24">
            {/* Workspace Column */}
            <div className="space-y-4">
              <h4 className="text-xs text-white uppercase tracking-widest font-bold font-sans">Workspace</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/chat" className="text-white/40 hover:text-accent transition-colors">Chat Console</Link>
                </li>
                <li>
                  <Link href="/explorer" className="text-white/40 hover:text-accent transition-colors">Explorer</Link>
                </li>
                <li>
                  <Link href="/docs" className="text-white/40 hover:text-accent transition-colors">Docs</Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className="space-y-4">
              <h4 className="text-xs text-white uppercase tracking-widest font-bold font-sans">Connect</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://x.com/fortyxbt" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors">Twitter / X</a>
                </li>
                <li>
                  <a href="https://github.com/danielamodu" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors">GitHub</a>
                </li>
                <li>
                  <a href="https://discord.com/fortyxbt" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors">Discord</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Massive Giant Typography (Centerpiece) */}
        <div className="w-full select-none pointer-events-none mt-16 mb-0 overflow-hidden flex justify-center items-center">
          <span className="font-sans font-black text-[13vw] tracking-tighter uppercase leading-none text-white/[0.04] text-center w-full select-none block leading-none">
            HERMES
          </span>
        </div>
      </footer>
    </div>
  );
}
