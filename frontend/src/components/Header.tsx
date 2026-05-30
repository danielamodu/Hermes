"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [address, setAddress] = useState<string | null>(null);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlockHeight = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.block_number) {
            setBlockHeight(data.block_number);
          }
        }
      } catch (err) {
        // Failed to fetch block height - ignoring to prevent console spam
      }
    };

    fetchBlockHeight();
    const interval = setInterval(fetchBlockHeight, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem("hermes_active_address");
      if (saved && saved.startsWith("5") && (saved.length === 47 || saved.length === 48)) {
        setAddress(saved);
      } else {
        setAddress(null);
      }
    };
    
    handleUpdate();
    
    // Listen to storage events from other tabs/frames
    window.addEventListener("storage", handleUpdate);
    
    // Custom event to update navbar instantly within the same tab
    window.addEventListener("hermes_address_changed", handleUpdate);
    
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("hermes_address_changed", handleUpdate);
    };
  }, []);

  const handleChangeAddress = () => {
    localStorage.removeItem("hermes_active_address");
    window.dispatchEvent(new Event("hermes_address_changed"));
    window.location.reload();
  };

  if (pathname === "/chat") return null;

  return (
    <header className="absolute top-0 left-0 right-0 w-full z-50 pointer-events-auto bg-transparent">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-0 md:h-16 gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-2 h-2 bg-accent rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform"></div>
            <span className="font-sans font-bold tracking-widest text-sm uppercase text-white group-hover:text-accent transition-colors">Hermes</span>
          </Link>
          
          {/* Mobile right side - only shows if address is set */}
          {address && (
            <div className="flex md:hidden items-center space-x-2">
              <span className="font-mono text-[10px] bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 px-2 py-1 rounded">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={handleChangeAddress}
                className="text-[10px] text-accent/80 hover:text-accent font-medium px-1.5 py-0.5 bg-accent/10 hover:bg-accent/20 rounded border border-accent/20 transition-all cursor-pointer"
              >
                Change
              </button>
            </div>
          )}
        </div>

        <nav className="flex space-x-6 text-sm font-medium overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <Link href="/chat" className={`hover:text-accent transition-colors whitespace-nowrap ${pathname === '/chat' ? 'text-accent' : 'text-white/60'}`}>Chat</Link>
          <Link href="/explorer" className={`hover:text-accent transition-colors whitespace-nowrap ${pathname === '/explorer' ? 'text-accent' : 'text-white/60'}`}>Explorer</Link>
          <Link href="/docs" className={`hover:text-accent transition-colors whitespace-nowrap ${pathname === '/docs' ? 'text-accent' : 'text-white/60'}`}>Docs</Link>
        </nav>
        
        {/* Desktop right side */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-medium tracking-wide">
          <div className="font-mono text-[11px] text-zinc-500 flex items-center">
            <span className="text-green-500 animate-pulse mr-1.5">●</span>
            <span>Portaldot Dev | #{blockHeight !== null ? blockHeight.toLocaleString() : "..."}</span>
          </div>

          {address && (
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[11px] bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 px-3 py-1.5 rounded-lg">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={handleChangeAddress}
                className="text-[11px] text-accent/80 hover:text-accent font-medium px-2.5 py-1.5 bg-accent/10 hover:bg-accent/20 rounded border border-accent/20 hover:border-accent/40 transition-all cursor-pointer"
              >
                Change
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
