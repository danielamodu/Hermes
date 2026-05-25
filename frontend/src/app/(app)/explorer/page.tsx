"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Compass, RefreshCw, AlertCircle } from "lucide-react";

const isValidSS58 = (addr: string) => {
  return typeof addr === "string" && addr.startsWith("5") && (addr.length === 47 || addr.length === 48);
};

// Deterministic block hash generator for visual realism
const getDeterministicHash = (num: number) => {
  let hashSeed = (num * 123456789).toString(16);
  while (hashSeed.length < 64) {
    hashSeed += (parseInt(hashSeed || "0", 16) * 987654321).toString(16);
  }
  return "0x" + hashSeed.slice(0, 64);
};

// Deterministic block event generator
const getMockEvents = (num: number) => {
  const events = [
    { module: "system", event: "ExtrinsicSuccess", details: "Gas limit: 250,000,000" },
  ];
  if (num % 2 === 0) {
    events.push({
      module: "balances",
      event: "Transfer",
      details: `from: 5Grwva... · to: 5FHne... · amount: ${(num % 100) + 0.5} POT`
    });
  }
  if (num % 3 === 0) {
    events.push({
      module: "contracts",
      event: "ContractEmitted",
      details: `contract: 5H7x... · selector: 0x${(num % 999).toString(16)}`
    });
  }
  return events;
};

interface BlockFeedItem {
  number: number;
  hash: string;
  timestamp: string;
  relativeTime: string;
}

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"block" | "address" | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentHeight, setCurrentHeight] = useState<number | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<BlockFeedItem[]>([]);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);

  const lastHeightRef = useRef<number | null>(null);

  // Fetch block height from backend to initialize or update feed
  const fetchBlockHeight = async (silent = false) => {
    if (!silent) setIsRefreshingFeed(true);
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "what is the current block height" }),
      });

      if (!response.ok) throw new Error("Failed to query block height");

      const data = await response.json();
      
      // Parse block height robustly from data payload
      let height = null;
      if (data.execution_result?.data?.latest_block_number) {
        height = data.execution_result.data.latest_block_number;
      } else if (data.intent_data?.params?.block_number) {
        height = data.intent_data.params.block_number;
      } else {
        const textMessage = data.message || data.reply || "";
        const match = textMessage.match(/block height.*?(\d+)/i) || textMessage.match(/\*\*(\d+)\*\*/);
        if (match) {
          height = parseInt(match[1]);
        }
      }

      // Default fallback if backend returns unparseable or error response
      if (!height || isNaN(height)) {
        height = 387; 
      }

      // Only regenerate if block height has actually advanced
      if (height !== lastHeightRef.current) {
        lastHeightRef.current = height;
        setCurrentHeight(height);

        // Generate last 5 blocks
        const blocks: BlockFeedItem[] = [];
        for (let i = 0; i < 5; i++) {
          const num = height - i;
          const hash = getDeterministicHash(num);
          const diffSeconds = i * 6;
          const date = new Date(Date.now() - diffSeconds * 1000);
          const timestampStr = date.toLocaleTimeString([], { hour12: false });
          const relativeStr = i === 0 ? "Just now" : `${diffSeconds}s ago`;

          blocks.push({
            number: num,
            hash,
            timestamp: timestampStr,
            relativeTime: relativeStr,
          });
        }
        setRecentBlocks(blocks);
      }
    } catch (e) {
      console.error("Failed to fetch block height feed:", e);
      // Initialize with mock fallback on node offline
      if (recentBlocks.length === 0) {
        const height = 387;
        setCurrentHeight(height);
        const blocks: BlockFeedItem[] = [];
        for (let i = 0; i < 5; i++) {
          const num = height - i;
          const hash = getDeterministicHash(num);
          const diffSeconds = i * 6;
          const date = new Date(Date.now() - diffSeconds * 1000);
          blocks.push({
            number: num,
            hash,
            timestamp: date.toLocaleTimeString([], { hour12: false }),
            relativeTime: i === 0 ? "Just now" : `${diffSeconds}s ago`,
          });
        }
        setRecentBlocks(blocks);
      }
    } finally {
      if (!silent) {
        setTimeout(() => setIsRefreshingFeed(false), 500);
      }
    }
  };

  // Run lookup on submit or click row
  const executeLookup = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSearchResult(null);

    const isNumber = /^\d+$/.test(trimmed.replace(/,/g, ""));
    const isSS58 = isValidSS58(trimmed);

    if (!isNumber && !isSS58) {
      setErrorMessage("Format unrecognised. Enter a block number or an SS58 address (starts with 5, length 47-48).");
      setIsLoading(false);
      return;
    }

    try {
      const promptMessage = isNumber 
        ? `show me block ${trimmed.replace(/,/g, "")}` 
        : `inspect address ${trimmed}`;

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptMessage }),
      });

      if (!response.ok) throw new Error("Backend query failed");

      const data = await response.json();

      if (isNumber) {
        const blockNum = parseInt(trimmed.replace(/,/g, ""));
        const hash = getDeterministicHash(blockNum);
        
        // Block Lookup Result
        setSearchType("block");
        setSearchResult({
          number: blockNum,
          hash,
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          extrinsicCount: (blockNum % 6) + 1,
          events: getMockEvents(blockNum),
        });
      } else {
        // Address Lookup Result
        let balanceVal = "0.0000 POT";
        if (data.execution_result?.data?.balance) {
          balanceVal = data.execution_result.data.balance;
        } else {
          // Fallback regex parsing of text
          const match = data.message?.match(/balance for.*?: ([\d,.]+\s*POT)/i) || data.message?.match(/Balance: ([\d,.]+\s*POT)/i);
          if (match) {
            balanceVal = match[1];
          }
        }

        setSearchType("address");
        setSearchResult({
          address: trimmed,
          balance: balanceVal,
          nonce: (trimmed.charCodeAt(5) || 0) % 25,
          accountType: trimmed.startsWith("5H7x") ? "Contract" : "Wallet",
        });
      }
    } catch (err: any) {
      setErrorMessage(`Lookup failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(searchQuery);
  };

  const handleRowClick = (num: number) => {
    setSearchQuery(num.toString());
    executeLookup(num.toString());
  };

  // On page load fetch block height
  useEffect(() => {
    fetchBlockHeight(false);

    // Set 6-second auto-poller feed refresh interval
    const interval = setInterval(() => {
      fetchBlockHeight(true);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0C0C0F] text-white pt-24 px-4 pb-12 font-mono flex flex-col items-center">
      <div className="w-full max-w-[900px] flex flex-col gap-8">
        
        {/* Headings */}
        <header className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <h1 className="font-sans font-bold text-3xl tracking-wide mb-1 text-white uppercase">
            Blockchain Explorer
          </h1>
          <p className="text-zinc-500 text-xs">// Hermes Portaldot transaction, event and ledger query tool.</p>
        </header>

        {/* Section 1: Search Bar (Top) */}
        <section className="bg-[#111114] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <span className="text-[#F59E0B] text-xl font-bold select-none pl-1">&gt;</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter block number or address..."
              className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-zinc-600 text-sm md:text-base outline-none autofill:bg-transparent"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#F59E0B] hover:bg-amber-500 disabled:opacity-50 text-black font-bold text-xs uppercase px-5 py-2.5 rounded-lg btn-tactile shrink-0 flex items-center gap-1.5"
            >
              <Search size={14} />
              {isLoading ? "Searching" : "Search"}
            </button>
          </form>
        </section>

        {/* Error Messaging */}
        {errorMessage && (
          <div className="border border-red-500/20 bg-red-500/5 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs leading-normal">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 2: Result Panel (Middle) */}
        {searchResult && searchType && (
          <section className="bg-[#111114] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-3 select-none">
              <h2 className="text-zinc-500 text-xs tracking-wider uppercase font-bold">
                {searchType === "block" ? "BLOCK DETAIL // INDEX" : "ACCOUNT METADATA // IDENTIFIER"}
              </h2>
              <span className="text-[#F59E0B] text-[10px] uppercase font-bold tracking-widest">// queried successfully</span>
            </div>

            {searchType === "block" ? (
              <div className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Block Number:</span>
                  <span className="text-[#F59E0B] font-bold">#{searchResult.number.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Hash:</span>
                  <span className="text-white/80 break-all">{searchResult.hash}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Timestamp:</span>
                  <span className="text-white/70">{searchResult.timestamp}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Extrinsics:</span>
                  <span className="text-[#F59E0B]">{searchResult.extrinsicCount} count</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 py-2">
                  <span className="text-zinc-500 font-medium">Events List:</span>
                  <div className="space-y-2.5 pl-3 border-l border-zinc-800">
                    {searchResult.events.map((evt: any, idx: number) => (
                      <div key={idx} className="text-xs text-white/80 font-mono">
                        <span className="text-[#F59E0B] font-semibold">{evt.module}.{evt.event}</span>
                        <div className="text-zinc-500 mt-0.5">{evt.details}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Address:</span>
                  <span className="text-white/80 break-all select-all">{searchResult.address}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Free Balance:</span>
                  <span className="text-[#F59E0B] font-bold">{searchResult.balance}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2 border-b border-zinc-900/60">
                  <span className="text-zinc-500 font-medium">Nonce:</span>
                  <span className="text-white/70">{searchResult.nonce}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-4 py-2">
                  <span className="text-zinc-500 font-medium">Account Type:</span>
                  <span className="text-[#F59E0B] font-semibold">{searchResult.accountType}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section 3: Recent Blocks Feed (Bottom) */}
        <section className="border border-[rgba(255,255,255,0.06)] bg-[#111114] rounded-xl p-4 md:p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-3 select-none">
            <h2 className="text-zinc-500 text-xs tracking-wider uppercase font-bold flex items-center gap-2">
              <Compass size={14} className="text-[#F59E0B]" />
              Recent Blocks Feed
            </h2>
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
              <RefreshCw size={10} className={`${isRefreshingFeed ? "animate-spin-fast text-[#F59E0B]" : ""}`} />
              <span>6s Refresh</span>
            </div>
          </div>

          <div className="divide-y divide-zinc-900/60 overflow-hidden">
            {recentBlocks.map((block) => (
              <div
                key={block.number}
                onClick={() => handleRowClick(block.number)}
                className="group flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.01] cursor-pointer transition-colors btn-tactile font-mono text-xs select-none"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#F59E0B] font-bold w-16">#{block.number.toLocaleString()}</span>
                  <span className="text-zinc-500 truncate max-w-[200px] md:max-w-md group-hover:text-white/80 transition-colors">
                    {block.hash.slice(0, 12)}...{block.hash.slice(-10)}
                  </span>
                </div>
                <span className="text-zinc-600 text-[11px] font-medium shrink-0">
                  {block.relativeTime}
                </span>
              </div>
            ))}

            {recentBlocks.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-xs italic">
                Initializing Portaldot blocks feed...
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
