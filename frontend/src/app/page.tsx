"use client";

import BackgroundEffects from '@/components/BackgroundEffects';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CodeBoilerplate = () => (
  <pre className="text-[11px] md:text-xs leading-relaxed text-zinc-400 font-mono overflow-x-auto p-4 bg-[#111114]/80 border border-white/[0.06] rounded-none h-full max-h-[350px] overflow-y-auto">
    <code>
      <span className="text-zinc-600"># Imports</span>{"\n"}
      <span className="text-purple-400">from</span> substrateinterface <span className="text-purple-400">import</span> <span className="text-amber-400">SubstrateInterface</span>{"\n"}
      <span className="text-purple-400">from</span> substrateinterface.exceptions <span className="text-purple-400">import</span> <span className="text-amber-400">SubstrateRequestException</span>{"\n\n"}
      <span className="text-zinc-600"># Initialize Substrate connection</span>{"\n"}
      <span className="text-purple-400">try</span>:{"\n"}
      &nbsp;&nbsp;substrate = <span className="text-blue-400">SubstrateInterface</span>(
      url=<span className="text-green-400">"ws://127.0.0.1:9944"</span>,
      network_prefix=<span className="text-amber-400">42</span>,
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
  const router = useRouter();
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

  // Scroll to bottom of terminal container only
  useEffect(() => {
    if (terminalEndRef.current && terminalEndRef.current.parentElement) {
      const parent = terminalEndRef.current.parentElement;
      parent.scrollTo({
        top: parent.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [stage, history]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const cmd = customInput.trim();
    // Route to chat app with query
    router.push(`/chat?q=${encodeURIComponent(cmd)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0C0C0F] relative overflow-x-hidden font-mono w-full">
      <BackgroundEffects />

      {/* Global CSS Style tag for cursor blink, fade in, and custom animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: blink 1s step-start infinite;
        }
        @keyframes customFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes customFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes breathe {
          from { opacity: 0.02; }
          to { opacity: 0.06; }
        }
        .animate-fade-in-once {
          animation: customFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float-infinite {
          animation: customFloat 6s ease-out infinite;
        }
        .animate-breathe-glow {
          animation: breathe 8s ease-out infinite alternate;
        }
      `}</style>

      {/* Breathing Amber Glow Layer (Page Level) */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_70%)] -z-20 animate-breathe-glow"
      />

      {/* Mouse-tracking Radial Spotlight Layer */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-200"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.03), transparent 80%)`
        }}
      />

      {/* --- HERO SECTION --- */}
      <section className="h-screen w-full bg-[#000000] flex flex-col justify-center items-center relative overflow-hidden px-4 md:px-8 select-none z-10">
        {/* Ambient background clean fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#0C0C0F] pointer-events-none" />

        {/* Small caps letter-spaced mono label */}
        <div className="font-mono text-xs md:text-sm tracking-[0.3em] text-[#F59E0B] uppercase font-bold mb-6 animate-fade-in-once">
          [ PORTALDOT_AGENT ]
        </div>

        {/* Centered Rotating glowing iridescent gradient orb */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center select-none my-4 md:my-8 animate-fade-in-once [animation-delay:200ms]">
          {/* Subtle bloom/glow backer */}
          <div className="absolute w-[125%] h-[125%] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22)_0%,rgba(234,88,12,0.04)_50%,transparent_100%)] blur-[40px] md:blur-[60px] animate-pulse pointer-events-none" />
          
          {/* The Orb Ring */}
          <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full p-[2px] bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#EA580C] animate-[spin_24s_linear_infinite] shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <div className="w-full h-full rounded-full bg-[#000000] flex items-center justify-center">
              {/* Internal glowing blur */}
              <div className="w-[96%] h-[96%] rounded-full bg-gradient-to-tr from-[#F59E0B]/5 to-[#EA580C]/15 blur-[1px]" />
            </div>
          </div>
          {/* Soft inner core */}
          <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_70%)] animate-[pulse_5s_ease-in-out_infinite]" />
        </div>

        {/* Headline overlaid or below */}
        <h1 className="font-sans font-bold text-4xl md:text-[64px] text-[#F5F0E8] leading-[1.1] tracking-tight text-center max-w-4xl mt-6 animate-fade-in-once [animation-delay:400ms]">
          The First AI Agent for <br />
          <span className="text-[#F59E0B]">Portaldot</span>
        </h1>

        {/* Minimal CTA button below */}
        <a
          href="/chat"
          className="mt-10 md:mt-12 inline-flex items-center justify-center px-8 py-3.5 border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#000000] font-mono text-xs tracking-[0.15em] uppercase font-bold transition-all duration-200 btn-tactile rounded-none animate-fade-in-once [animation-delay:600ms]"
        >
          Launch Hermes →
        </a>
      </section>

      {/* --- PLAYGROUND TERMINAL SECTION --- */}
      <section className="py-20 md:py-40 max-w-5xl mx-auto w-full px-4 md:px-8 flex flex-col items-center relative z-10">
        <div className="w-full max-w-4xl flex flex-col space-y-4 mb-16 text-center items-center mx-auto">
          <div className="font-mono text-xs tracking-[0.25em] text-[#F59E0B] uppercase">
            [ PLAYGROUND ]
          </div>
          <h2 className="font-sans font-bold text-3xl md:text-[40px] tracking-tight text-[#F5F0E8] leading-tight">
            Witness Hermes in <span className="text-[#F59E0B]">Action</span>
          </h2>
          <p className="font-sans text-base md:text-[18px] text-[#F5F0E8]/70 max-w-2xl leading-relaxed">
            Interact with our simulated console environment. Hermes processes real-time intents, retrieves balances, and signs system transactions.
          </p>
        </div>

        {/* Dynamic centered terminal UI */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (stage === 5) inputRef.current?.focus();
            }
          }}
          onClick={() => {
            if (stage === 5) inputRef.current?.focus();
          }}
          className={`w-full max-w-4xl bg-[#111114] border ${isFocused ? 'border-[#F59E0B]/50 shadow-[0_0_60px_rgba(245,158,11,0.12)]' : 'border-white/[0.06] shadow-[0_0_50px_rgba(0,0,0,0.6)]'} rounded-none overflow-hidden transition-all duration-200 cursor-text focus:outline-none focus:ring-1 focus:ring-[#F59E0B]`}
        >
          {/* Terminal Window Header */}
          <div className="h-10 bg-black/60 border-b border-white/[0.06] px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
              <span className="text-[11px] text-zinc-500 pl-4 font-mono">hermes-terminal --boot-sequence</span>
            </div>
            {stage === 5 && (
              <span className="text-[10px] text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2.5 py-0.5 border border-[#F59E0B]/20 rounded-none animate-pulse uppercase tracking-wider font-mono">
                ● INTERACTIVE_MODE
              </span>
            )}
          </div>

          {/* Terminal Window Body */}
          <div className="p-4 md:p-6 space-y-4 text-xs md:text-sm h-[380px] md:h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 flex flex-col justify-start">
            {/* Step 1: Initial typed command */}
            <div className="flex space-x-2">
              <span className="text-[#F59E0B] font-bold">{">"}</span>
              <span className="text-[#F5F0E8]">
                {typedText}
                {stage === 0 && <span className="inline-block w-1.5 h-4 bg-[#F59E0B] ml-1 animate-cursor-blink align-middle"></span>}
              </span>
            </div>

            {/* Step 2: Parsing intent log */}
            {stage >= 1 && (
              <div className="space-y-1 text-white/40 pl-4 border-l border-white/[0.06] font-mono animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-600">●</span>
                  <span>[info] parsing intent...</span>
                </div>
                <div className="text-[#F59E0B]/60 flex items-center space-x-2">
                  <span className="text-[#F59E0B]/40">●</span>
                  <span>[intent] classified: BATCH_QUERY</span>
                </div>
              </div>
            )}

            {/* Step 3: Fetching artifacts log */}
            {stage >= 2 && (
              <div className="space-y-1 text-white/40 pl-4 border-l border-white/[0.06] font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-600">●</span>
                  <span>[info] querying Balances.TotalIssuance and System.Events...</span>
                </div>
              </div>
            )}

            {/* Step 4: Signing txn log */}
            {stage >= 3 && (
              <div className="space-y-1 text-white/40 pl-4 border-l border-white/[0.06] font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-600">●</span>
                  <span>[info] compiling structured multi-query results...</span>
                </div>
              </div>
            )}

            {/* Step 5: Success box block */}
            {stage >= 4 && (
              <div className="pl-4 border-l border-white/[0.06]">
                <div className="bg-[#0C0C0F] p-3 rounded-none border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)] space-y-2 max-w-2xl font-mono">
                  <div className="text-green-400 font-bold mb-1 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>[+] TRANSACTION_SUCCESS</span>
                  </div>
                  <div className="text-[11px] md:text-xs text-[#F5F0E8]/90 leading-relaxed pl-3 border-l-2 border-green-500/40 space-y-1">
                    <div>[CHAIN_QUERY] Total POT Supply: <span className="text-[#F59E0B] font-bold">1,000,000,000 POT</span></div>
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
                    <span className="text-[#F59E0B] font-bold">{">"}</span>
                    <span className="text-[#F5F0E8]">{item.text}</span>
                  </div>
                ) : (
                  <div className="space-y-1 pl-4 border-l border-white/[0.06]">
                    <pre className="text-white/50 whitespace-pre-wrap font-mono text-xs leading-relaxed">{item.text}</pre>
                    {item.details && (
                      <div className="bg-[#0C0C0F] p-3 rounded-none border border-green-500/20 space-y-1 max-w-2xl font-mono mt-2">
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
                          <span className="text-[#F59E0B] break-all font-mono">{item.details.address}</span>
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
                <span className="text-[#F59E0B] font-bold">[portaldot-cli]&gt;</span>
                <div className="flex-1 flex items-center relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="bg-transparent border-none outline-none text-[#F5F0E8] font-mono flex-1 caret-transparent"
                    placeholder="Type intent (e.g. balance, help, system)..."
                  />
                  <div className="absolute left-0 pointer-events-none text-[#F5F0E8] flex items-center font-mono">
                    {customInput}
                    <span className="inline-block w-1.5 h-4 bg-[#F59E0B] ml-0.5 animate-cursor-blink align-middle"></span>
                  </div>
                </div>
              </form>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>
      </section>

      {/* --- DX COMPARISON SECTION --- */}
      <section className="py-20 md:py-40 max-w-5xl mx-auto w-full px-4 md:px-8 relative z-10">
        <div className="w-full max-w-4xl flex flex-col space-y-4 mb-16 text-center items-center mx-auto">
          <div className="font-mono text-xs tracking-[0.25em] text-[#F59E0B] uppercase">[ SIMPLICITY ]</div>
          <h2 className="font-sans font-bold text-3xl md:text-[40px] tracking-tight text-[#F5F0E8] leading-tight">
            Ditch the SDK. <span className="text-[#F59E0B]">Just Ask.</span>
          </h2>
          <p className="font-sans text-base md:text-[18px] text-[#F5F0E8]/70 max-w-2xl leading-relaxed">
            Stop researching developer documentation and constructing complex RPC packets. Compile standard natural language into multi-query payloads in milliseconds.
          </p>
        </div>

        {/* 2-Column Minimal Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full">
          {/* Left Column: Substrate SDK Boilerplate */}
          <div className="flex flex-col bg-[#111114] border border-white/[0.06] rounded-none overflow-hidden hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.04)] transition-all duration-200">
            <div className="h-10 bg-black/60 border-b border-white/[0.06] px-4 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">substrate_query.py</span>
              <span className="text-[10px] text-red-400 font-bold font-mono bg-red-950/20 border border-red-900/40 px-2 py-0.5 rounded-none uppercase">
                34 Lines of Code
              </span>
            </div>
            <div className="p-2 overflow-hidden flex-1">
              <CodeBoilerplate />
            </div>
          </div>

          {/* Right Column: Clean single-line intent */}
          <div className="flex flex-col justify-between p-6 md:p-8 bg-[#111114] border border-white/[0.06] hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] rounded-none h-full transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F59E0B]/5 to-transparent pointer-events-none"></div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#F59E0B] font-bold uppercase tracking-widest font-mono">Hermes Interface</span>
                <span className="text-[10px] text-green-400 font-bold font-mono bg-green-950/20 border border-green-900/40 px-2 py-0.5 rounded-none uppercase">
                  1 Line of Text
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold font-mono">Natural Language Query</div>
                <div className="bg-black/60 border border-white/[0.06] p-5 rounded-none flex items-center space-x-3 shadow-inner relative group-hover:border-[#F59E0B]/20 transition-colors duration-200">
                  <span className="text-[#F59E0B] font-black text-lg select-none">&gt;</span>
                  <span className="text-[#F5F0E8] text-sm md:text-base font-bold font-sans tracking-wide leading-relaxed">
                    show me total POT supply and current block height
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold">Compiler Intent Analysis Pipeline</span>
                  <span className="text-[#F59E0B] font-bold tracking-widest">100% COMPILED</span>
                </div>
                <div className="h-2.5 w-full bg-black border border-white/[0.06] rounded-none overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#F59E0B] via-amber-500 to-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.5)] rounded-none transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Status: Pipeline Resolved</span>
              <span className="text-green-400 font-bold">Success (2ms)</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- CAPABILITIES MATRIX SECTION --- */}
      <section className="py-20 md:py-40 max-w-5xl mx-auto w-full px-4 md:px-8 relative z-10">
        <div className="w-full max-w-4xl flex flex-col space-y-4 mb-16 text-center items-center mx-auto">
          <div className="font-mono text-xs tracking-[0.25em] text-[#F59E0B] uppercase">[ CAPABILITIES ]</div>
          <h2 className="font-sans font-bold text-3xl md:text-[40px] tracking-tight text-[#F5F0E8] leading-tight">
            Agent <span className="text-[#F59E0B]">Capabilities</span>
          </h2>
          <p className="font-sans text-base md:text-[18px] text-[#F5F0E8]/70 max-w-2xl leading-relaxed">
            Hermes couples advanced low-latency machine inference with direct substrate interactions for comprehensive on-chain control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Intent Parsing (Hero Capability) */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-10 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default md:col-span-3 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1 space-y-4">
              <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[AGENT-v1.0]</span>
              <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#01_INTENT</div>
              <h3 className="font-sans font-bold text-2xl md:text-3xl text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">Groq Engine</h3>
              <p className="text-sm md:text-lg text-[#F5F0E8]/70 leading-relaxed font-sans font-normal max-w-xl">
                Transform natural language requests into strict Substrate transaction payloads instantly. You just ask, Hermes writes the payload.
              </p>
            </div>
            
            <div className="w-full md:w-[400px] bg-black border border-white/[0.04] p-5 rounded-none font-mono text-xs text-zinc-400 space-y-2">
               <div className="text-amber-500/50 mb-4">&gt; User</div>
               <div className="text-zinc-200">"Deploy a new RWA token with 18 decimals."</div>
               <div className="h-px w-full bg-white/[0.06] my-4"></div>
               <div className="text-amber-500/50 mb-2">&gt; Hermes compiles</div>
               <div className="text-green-400 font-bold truncate">payload_hash: 0x8a7b6c...</div>
            </div>
          </div>

          {/* Card 2: Chain Intelligence */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-8 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[EXPLORER]</span>
            <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#02_CHAIN_INTELLIGENCE</div>
            <h3 className="font-sans font-bold text-xl text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">Block Explorer</h3>
            <p className="text-sm md:text-base text-[#F5F0E8]/70 leading-relaxed font-sans font-normal">
              Query blocks, inspect addresses, fetch historic balances, and monitor network state in real time.
            </p>
          </div>

          {/* Card 3: Account Info */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-8 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[ACCOUNT-INFO]</span>
            <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#03_ACCOUNT_INFO</div>
            <h3 className="font-sans font-bold text-xl text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">Account Info</h3>
            <p className="text-sm md:text-base text-[#F5F0E8]/70 leading-relaxed font-sans font-normal">
              Inspect any Portaldot account — check balance, nonce, and account type instantly.
            </p>
          </div>

          {/* Card 4: State Monitoring with Live Update */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-8 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[STATE-MONITOR]</span>
            <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#04_REAL_TIME_METRICS</div>
            <h3 className="font-sans font-bold text-xl text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">State Monitoring</h3>
            <p className="text-sm md:text-base text-[#F5F0E8]/70 leading-relaxed font-sans font-normal">
              Maintain full real-time visual telemetry over deployed ink! contract blocks.
            </p>

            {/* Live Updating Block Height */}
            <div className="mt-4 flex items-center space-x-2 bg-black border border-white/[0.04] px-3 py-1.5 rounded-none font-mono text-xs w-full max-w-[240px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Height:</span>
              <span className="text-green-400 font-bold">#{blockHeight.toLocaleString()}</span>
              <span className="text-zinc-700 font-bold font-sans">|</span>
              <span className="text-zinc-500 uppercase text-[9px]">Synced</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- WORKFLOW SECTION --- */}
      <section className="py-20 md:py-40 max-w-5xl mx-auto w-full px-4 md:px-8 relative z-10">
        <div className="w-full max-w-4xl flex flex-col space-y-4 mb-16 text-center items-center mx-auto">
          <div className="font-mono text-xs tracking-[0.25em] text-[#F59E0B] uppercase">[ WORKFLOW ]</div>
          <h2 className="font-sans font-bold text-3xl md:text-[40px] tracking-tight text-[#F5F0E8] leading-tight">
            How It <span className="text-[#F59E0B]">Works</span>
          </h2>
          <p className="font-sans text-base md:text-[18px] text-[#F5F0E8]/70 max-w-2xl leading-relaxed">
            The standard, streamlined interaction pipeline utilized by Hermes to translate, verify, and resolve your commands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-8 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[STEP 1]</span>
            <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#01_INTENT</div>
            <h3 className="font-sans font-bold text-lg text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">Type intent</h3>
            <p className="text-xs text-[#F5F0E8]/70 leading-relaxed font-sans">
              Simply express your goal in natural language (e.g., 'deploy a token contract').
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-8 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[STEP 2]</span>
            <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#02_PROCESSING</div>
            <h3 className="font-sans font-bold text-lg text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">Parse &amp; Compile</h3>
            <p className="text-xs text-[#F5F0E8]/70 leading-relaxed font-sans">
              Our ultra-low latency Groq-powered inference engine compiles, parses, and signs the transaction payload.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-[#111114] border border-white/[0.06] p-6 md:p-8 space-y-4 rounded-none hover:border-[#F59E0B]/25 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,background-color,color] duration-200 group cursor-default">
            <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-[#F59E0B] transition-colors">[STEP 3]</span>
            <div className="text-[#F59E0B] font-bold text-xs font-mono tracking-wider">#03_RESOLVED</div>
            <h3 className="font-sans font-bold text-lg text-[#F5F0E8] group-hover:text-[#F59E0B] transition-colors">Instant Results</h3>
            <p className="text-xs text-[#F5F0E8]/70 leading-relaxed font-sans">
              Hermes queries the Portaldot node and returns structured, readable results directly in your terminal.
            </p>
          </div>
        </div>
      </section>

      {/* --- EDITORIAL FOOTER --- */}
      <footer className="w-full bg-[#000000] mt-auto z-10 relative pt-12 pb-0">
        {/* Top Row: tagline left, nav columns right */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-start gap-8 pb-10 border-b border-white/[0.06]">

          {/* Left: Catchy tagline */}
          <div className="space-y-3 max-w-xs">
            <p className="font-sans font-bold text-xl md:text-2xl text-[#F5F0E8] leading-snug tracking-tight">
              The chain speaks.<br />
              <span className="text-[#F59E0B]">You just ask.</span>
            </p>
            <p className="font-mono text-[11px] text-zinc-600 tracking-widest uppercase leading-relaxed">
              Plain English → On-chain results.<br />
              No SDK. No docs. Just intent.
            </p>
          </div>

          {/* Right: Nav Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20 text-[13px]">
            {/* Workspace column */}
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-[11px] text-[#F5F0E8] uppercase tracking-[0.2em]">Workspace</h4>
              <ul className="space-y-3 font-mono">
                <li><Link href="/chat" className="text-zinc-500 hover:text-[#F59E0B] transition-colors duration-200">Chat Console</Link></li>
                <li><Link href="/explorer" className="text-zinc-500 hover:text-[#F59E0B] transition-colors duration-200">Explorer</Link></li>
                <li><Link href="/docs" className="text-zinc-500 hover:text-[#F59E0B] transition-colors duration-200">Docs</Link></li>
              </ul>
            </div>

            {/* Connect column */}
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-[11px] text-[#F5F0E8] uppercase tracking-[0.2em]">Connect</h4>
              <ul className="space-y-3 font-mono">
                <li><a href="https://x.com/fortyxbt" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#F59E0B] transition-colors duration-200">Twitter / X</a></li>
                <li><a href="https://github.com/danielamodu" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#F59E0B] transition-colors duration-200">GitHub</a></li>
                <li><a href="https://discord.com/fortyxbt" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#F59E0B] transition-colors duration-200">Discord</a></li>
              </ul>
            </div>

            {/* Network column */}
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-[11px] text-[#F5F0E8] uppercase tracking-[0.2em]">Network</h4>
              <ul className="space-y-3 font-mono">
                <li><span className="text-zinc-600">Portaldot Devnet</span></li>

                <li>
                  <span className="inline-flex items-center gap-1.5 text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                    Live
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Massive full-width HERMES wordmark */}
        <div className="w-full select-none pointer-events-none">
          <span className="font-sans font-black text-[10vw] tracking-[-0.03em] uppercase leading-none text-[#F5F0E8]/[0.05] block text-center w-full whitespace-nowrap">HERMES
          </span>
        </div>

        {/* Bottom slim copyright bar */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-5 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-white/[0.04]">
          <span className="font-mono text-[10px] text-zinc-700">&copy; 2026 Hermes Systems Inc. All rights reserved.</span>
          <div className="flex gap-6 font-mono text-[10px] text-zinc-700">
            <Link href="/privacy" className="hover:text-[#F59E0B] transition-colors duration-200">Privacy</Link>
            <Link href="/terms" className="hover:text-[#F59E0B] transition-colors duration-200">Terms</Link>
            <span className="text-[#F59E0B]/40">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
