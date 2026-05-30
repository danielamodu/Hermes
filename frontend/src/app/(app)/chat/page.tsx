"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AIPromptBox } from "@/components/ui/ai-prompt-box";
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isValidSS58 = (addr: string) => {
  return typeof addr === "string" && addr.startsWith("5") && (addr.length === 47 || addr.length === 48);
};

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  reasoning?: boolean;
  isSystem?: boolean;
  isError?: boolean;
  isRemedial?: boolean;
  isSuccess?: boolean;
  txResult?: {
    contractName?: string;
    address?: string;
    txHash?: string;
  };
};

interface ChatSession {
  id: string;
  timestamp: string;
  title: string;
  messages: Message[];
  isPinned?: boolean;
}

interface LocalTx {
  hash: string;
  amount: string;
  recipient: string;
  timestamp: string;
}

const formatMessageContent = (text: string) => {
  if (!text) return "";
  const parts = text.split("**");
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-amber-500 font-semibold">{part}</strong>;
    }
    return part;
  });
};

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function ChatPage() {
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(false);

  const handleGenerateAddress = async () => {
    setIsGeneratingWallet(true);
    setModalError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "create a new wallet" }),
      });
      if (!res.ok) throw new Error("Failed to generate wallet");
      const data = await res.json();
      
      const address = data?.execution_result?.data?.address;
      if (address) {
        setModalInput(address);
        setShowWarningBanner(true);
      } else {
        setModalError("Address generation succeeded but no address was returned. Please try again.");
      }
    } catch (err: any) {
      setModalError("Could not connect to the Portaldot node. Check that the backend is running and try again.");
    } finally {
      setIsGeneratingWallet(false);
    }
  };

  useEffect(() => {
    if (!showModal) {
      setShowWarningBanner(false);
    }
  }, [showModal]);

  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [potBalance, setPotBalance] = useState<string | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isSendingPOT, setIsSendingPOT] = useState(false);
  const [sendSuccessData, setSendSuccessData] = useState<{ txHash: string; fee?: string } | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [recentTxs, setRecentTxs] = useState<LocalTx[]>([]);
  
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fetchBalance = async (addr: string) => {
    setIsFetchingBalance(true);
    setPotBalance(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `check balance of ${addr}` }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const reply = data.reply || data.message || "";
      const execBalance = data?.execution_result?.data?.balance || data?.execution_result?.data?.free;
      if (execBalance !== undefined) {
        setPotBalance(String(execBalance));
      } else if (reply) {
        setPotBalance(reply);
      } else {
        setPotBalance("0 POT");
      }
    } catch (e) {
      console.error(e);
      setPotBalance("Error loading balance");
    } finally {
      setIsFetchingBalance(false);
    }
  };

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return 'just now';
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHrs < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) return 'just now';
        return `${diffMins}m ago`;
      }
      
      if (now.toDateString() === d.toDateString()) {
        return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      }
      
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (yesterday.toDateString() === d.toDateString()) {
        return 'Yesterday';
      }
      
      return d.toLocaleDateString([], {month: 'short', day: 'numeric'});
    } catch { return 'just now'; }
  };

  const saveTransaction = (txHash: string, amount: string, recipient: string) => {
    const newTx: LocalTx = {
      hash: txHash,
      amount: amount,
      recipient: recipient.slice(0, 6) + '...' + recipient.slice(-4),
      timestamp: new Date().toISOString()
    };
    const existing = localStorage.getItem("hermes_transactions");
    let txList: LocalTx[] = [];
    if (existing) {
      try {
        txList = JSON.parse(existing);
      } catch (e) {}
    }
    const updated = [newTx, ...txList].slice(0, 5);
    localStorage.setItem("hermes_transactions", JSON.stringify(updated));
    setRecentTxs(updated);
  };

  const handleSendPOT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRecipient.trim() || !sendAmount.trim()) return;
    
    const amountVal = parseFloat(sendAmount);
    const balanceVal = parseFloat(potBalance);
    if (isNaN(amountVal) || amountVal <= 0) {
      setSendError("Please enter a valid amount.");
      return;
    }
    if (!isNaN(balanceVal) && amountVal > balanceVal) {
      setSendError("Amount exceeds available balance.");
      return;
    }
    
    setIsSendingPOT(true);
    setSendSuccessData(null);
    setSendError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `send ${sendAmount} POT to ${sendRecipient}` }),
      });
      if (!response.ok) throw new Error("Transfer failed.");
      const data = await response.json();
      
      const reply = data.reply || data.message || "";
      const txResult = data?.execution_result?.data;
      if (txResult && (txResult.txHash || txResult.hash || txResult.address)) {
        const txHash = txResult.txHash || txResult.hash || "Success";
        setSendSuccessData({
          txHash,
          fee: txResult.fee || "0.0001 POT"
        });
        saveTransaction(txHash, sendAmount, sendRecipient);
        if (activeAddress) fetchBalance(activeAddress);
      } else if (reply && !reply.toLowerCase().includes("error") && !reply.toLowerCase().includes("failed")) {
        const txHash = "Executed";
        setSendSuccessData({
          txHash,
          fee: "See logs for details"
        });
        saveTransaction(txHash, sendAmount, sendRecipient);
        if (activeAddress) fetchBalance(activeAddress);
      } else {
        setSendError(reply || "Transfer failed.");
      }
    } catch (err: any) {
      setSendError("Transfer failed. Check that the recipient address is valid and your balance is sufficient.");
    } finally {
      setIsSendingPOT(false);
    }
  };

  useEffect(() => {
    if (showWalletDropdown && activeAddress) {
      fetchBalance(activeAddress);
      setSendRecipient("");
      setSendAmount("");
      setSendSuccessData(null);
      setSendError(null);
      setShowSendForm(false);
      
      const saved = localStorage.getItem("hermes_transactions");
      if (saved) {
        try {
          setRecentTxs(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        setRecentTxs([]);
      }
    }
  }, [showWalletDropdown, activeAddress]);

  const [username, setUsername] = useState<string>("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [editUsernameValue, setEditUsernameValue] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedWalletRef = useRef<string | null>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }
      
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        document.getElementById('new-chat-btn')?.click();
      } else if (e.key === '[' || (e.key === '\\' && e.metaKey)) {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setActiveMenuId(null);
        setEditingSessionId(null);
        setConfirmDeleteId(null);
        setShowProfileDropdown(false);
        setShowWalletDropdown(false);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close menus on click away
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuId(null);
      setShowProfileDropdown(false);
      setShowWalletDropdown(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("click", handleGlobalClick);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("click", handleGlobalClick);
      }
    };
  }, []);

  // Load and sync username namespaced to active address
  useEffect(() => {
    if (activeAddress) {
      const saved = localStorage.getItem(`hermes_username_${activeAddress}`);
      if (saved) {
        setUsername(saved);
      } else {
        const randomNum = Math.floor(100 + Math.random() * 900);
        const defaultName = `${activeAddress.slice(0, 6)}#${randomNum}`;
        localStorage.setItem(`hermes_username_${activeAddress}`, defaultName);
        setUsername(defaultName);
      }
    } else {
      setUsername("");
    }
  }, [activeAddress]);

  // Sync edit field value with username state
  useEffect(() => {
    if (showProfileDropdown) {
      setEditUsernameValue(username);
    }
  }, [showProfileDropdown, username]);

  // SSR-Safe Hydration & Active Address Load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hermes_active_address");
      if (saved && isValidSS58(saved)) {
        setActiveAddress(saved);
      } else {
        setShowModal(true);
      }
    }
  }, []);

  // Load sessions when activeAddress changes
  useEffect(() => {
    if (typeof window !== "undefined" && activeAddress) {
      const stored = localStorage.getItem(`hermes_sessions_${activeAddress}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ChatSession[];
          setSessions(parsed);
        } catch (e) {
          console.error("Failed to parse stored sessions:", e);
        }
      } else {
        setSessions([]);
      }
      setActiveSessionId(null);
      loadedWalletRef.current = activeAddress;
    }
  }, [activeAddress]);

  // Sync state mutations back to localStorage safely
  useEffect(() => {
    if (typeof window !== "undefined" && activeAddress && sessions.length > 0) {
      if (loadedWalletRef.current === activeAddress) {
        localStorage.setItem(`hermes_sessions_${activeAddress}`, JSON.stringify(sessions));
      }
    }
  }, [sessions, activeAddress]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput("");
  };

  const handleRename = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            title: renameValue.trim() || "Untitled",
          }
          : s
      )
    );
    setEditingSessionId(null);
  };

  const handleTogglePin = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            isPinned: !s.isPinned,
          }
          : s
      )
    );
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    setActiveMenuId(null);

    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const executeCommand = async (cmd: string, sessionId: string) => {
    setIsTyping(true);

    try {
      const processingMsg: Message = {
        id: generateUniqueId(),
        role: "agent",
        content: "↳ processing intent...",
        reasoning: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
              ...s,
              messages: [...s.messages, processingMsg],
            }
            : s
        )
      );

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cmd }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setIsTyping(false);
      const rawContent = data.reply || data.message || "";
      if (data.error || typeof rawContent !== "string" || rawContent.toLowerCase().includes("rate limit") || rawContent.toLowerCase().includes("429") || rawContent.toLowerCase().includes("api error")) {
        throw new Error("Hermes API Error");
      }

      // ── Friendly error message map ─────────────────────────────────────────
      // Never show raw backend strings to the user.
      const friendlyMessage = (text: string): string => {
        if (text.includes("Cannot connect to Portaldot node"))
          return "Hermes is having trouble reaching the Portaldot network. Please try again shortly.";
        if (text.includes("not_yet_implemented"))
          return "This feature is coming soon in the next version of Hermes.";
        if (text.includes("Unknown or unclassifiable intent"))
          return 'I didn\'t quite understand that. Try rephrasing — for example: "what is the block height?" or "check balance of [address]".';
        if (text.startsWith("[!]"))
          return "[!] Something went wrong. Please try again.";
        return text;
      };

      const content = friendlyMessage(rawContent);

      const replyMsg: Message = {
        id: generateUniqueId(),
        role: "agent",
        content: content || "Command executed successfully.",
        isError: content.startsWith("[!]"),
      };

      const telemetryMsgs = (data.telemetry || []).map((log: string, idx: number) => ({
        id: `${generateUniqueId()}-read-tel-${idx}`,
        role: "agent",
        content: log,
        isSystem: true,
      }));

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
              ...s,
              messages: [
                ...s.messages.filter((m) => !m.reasoning),
                replyMsg,
                ...telemetryMsgs,
              ],
            }
            : s
        )
      );

    } catch (error: any) {
      setIsTyping(false);
      const errMsg: Message = {
        id: generateUniqueId(),
        role: "agent",
        content: "[!] Hermes is temporarily unavailable. Please try again in a moment.",
        isError: true,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
              ...s,
              messages: [
                ...s.messages.filter((m) => !m.reasoning),
                errMsg,
              ],
            }
            : s
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const cmd = input.trim();
    setInput("");

    if (activeSessionId === null) {
      const newId = generateUniqueId();
      const newSession: ChatSession = {
        id: newId,
        timestamp: new Date().toISOString(),
        title: cmd.slice(0, 16) + (cmd.length > 16 ? "..." : ""),
        messages: [
          {
            id: generateUniqueId(),
            role: "user",
            content: cmd,
          },
        ],
      };

      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(newId);
      executeCommand(cmd, newId);
    } else {
      const userMsg: Message = {
        id: generateUniqueId(),
        role: "user",
        content: cmd,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
              ...s,
              messages: [...s.messages, userMsg],
              title: s.title === "Initial Session"
                ? cmd.slice(0, 16) + (cmd.length > 16 ? "..." : "")
                : s.title,
            }
            : s
        )
      );

      executeCommand(cmd, activeSessionId);
    }
  };

  const filteredSessions = [...sessions]
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090B] text-white">

      <div
        className={`font-mono text-[11px] h-full shrink-0 flex flex-col bg-[#0C0C0F] relative select-none transition-[width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen
          ? "w-64 opacity-100"
          : "w-0 opacity-0 overflow-hidden"
          }`}
      >
        <div className="flex flex-col h-full p-4 w-64 shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 select-none shrink-0">
            <div
              onClick={() => setActiveSessionId(null)}
              className="relative z-50 cursor-pointer flex items-center gap-2 text-amber-500 rounded-xl px-2 py-1 btn-tactile"
              title="Start New Session"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div>
              <span className="font-mono text-sm font-bold tracking-widest text-amber-500">Hermes</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="relative z-50 cursor-pointer p-1.5 text-zinc-600 hover:text-zinc-400 rounded-lg btn-tactile"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1.5 mb-4 shrink-0">
            <button
              id="new-chat-btn"
              onClick={handleNewChat}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono text-zinc-500 hover:text-amber-500 rounded-lg btn-tactile hover:bg-zinc-900/50 text-left cursor-pointer"
            >
              <Plus size={14} className="shrink-0" />
              <span>New chat</span>
            </button>

            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono rounded-lg btn-tactile text-left cursor-pointer ${
                showSearch
                  ? "bg-zinc-900/50 text-amber-500"
                  : "text-zinc-500 hover:text-amber-500 hover:bg-zinc-900/50"
              }`}
            >
              <Search size={14} className="shrink-0" />
              <span>Search</span>
            </button>

            {showSearch && (
              <div className="px-1 mt-1">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 outline-none font-mono text-[10px] focus:border-[#F59E0B]"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="text-[10px] text-zinc-700 uppercase tracking-widest px-2 mb-1 select-none">
              Recent
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id);
                  }}
                  className={`group relative flex items-center justify-between w-full cursor-pointer transition-all py-2 px-2.5 ${s.id === activeSessionId
                    ? "text-zinc-300 font-bold border-l-2 border-amber-500 bg-zinc-900/20 rounded-none pl-2"
                    : "text-zinc-600 hover:text-amber-500 hover:bg-zinc-900/30 rounded-xl"
                    }`}
                >
                  {editingSessionId === s.id ? (
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(s.id);
                        if (e.key === "Escape") setEditingSessionId(null);
                      }}
                      onBlur={() => handleRename(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 w-full outline-none font-mono text-[10px]"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center select-none gap-0.5">
                      <div className="flex items-center gap-1.5 w-full">
                        {s.isPinned && <span className="text-amber-500 shrink-0 font-sans text-[10px]">📌</span>}
                        <span className="truncate">{s.title}</span>
                      </div>
                      {s.timestamp && <span className="text-[9px] text-zinc-600 truncate">{formatDate(s.timestamp)}</span>}
                    </div>
                  )}

                  {editingSessionId !== s.id && (
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === s.id ? null : s.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-1 text-zinc-600 hover:text-amber-500 transition-opacity font-bold cursor-pointer leading-none text-xs"
                      >
                        ⋮
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === s.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -2 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -2 }}
                            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 mt-1 w-24 bg-zinc-950 border border-zinc-800 rounded shadow-2xl z-50 py-1 flex flex-col font-mono text-[10px] text-left origin-top-right will-change-transform"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(s.id);
                              }}
                              className="text-left px-2.5 py-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 btn-tactile"
                            >
                              {s.isPinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(s.id);
                                setRenameValue(s.title);
                                setActiveMenuId(null);
                              }}
                              className="text-left px-2.5 py-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 btn-tactile"
                            >
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirmDeleteId === s.id) {
                                  handleDelete(s.id);
                                  setConfirmDeleteId(null);
                                } else {
                                  setConfirmDeleteId(s.id);
                                  setTimeout(() => setConfirmDeleteId(null), 3000);
                                }
                              }}
                              className="text-left px-2.5 py-1.5 text-red-400 hover:bg-zinc-900 hover:text-red-300 btn-tactile border-t border-zinc-900 transition-colors"
                            >
                              {confirmDeleteId === s.id ? "Confirm Delete" : "Delete"}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ))}

              {filteredSessions.length === 0 && (
                <div className="text-center py-8 text-zinc-700 italic select-none">
                  {searchQuery ? "No sessions found." : "No sessions stored."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#09090B] relative">

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 text-zinc-400 hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] rounded-full btn-tactile z-50 cursor-pointer"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        {/* Minimal borderless top header */}
        <div className="flex items-center justify-between px-6 py-4 select-none shrink-0 z-10 font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && <div className="w-10" />}
            {activeSession && (
              <span className="text-zinc-600 text-xs font-mono">
                {activeSession.title.length > 30
                  ? activeSession.title.slice(0, 30) + "..."
                  : activeSession.title}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 text-[11px] text-white/60 font-medium">
            <Link href="/" className="hover:text-[#F59E0B] transition-colors whitespace-nowrap">Home</Link>
            <Link href="/chat" className="text-[#F59E0B] font-semibold whitespace-nowrap">Chat</Link>
            <Link href="/explorer" className="hover:text-[#F59E0B] transition-colors whitespace-nowrap">Explorer</Link>
            <Link href="/docs" className="hover:text-[#F59E0B] transition-colors whitespace-nowrap">Docs</Link>
          </nav>
          {activeAddress && (
            <div className="flex items-center gap-3 relative">
              {/* Truncated Address trigger button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWalletDropdown(!showWalletDropdown);
                }}
                className="flex items-center gap-2 bg-zinc-900/60 hover:bg-zinc-800/40 border border-zinc-800/80 hover:border-amber-500/30 px-3.5 py-1.5 rounded-full text-[11px] text-zinc-400 hover:text-zinc-200 transition-all font-mono btn-tactile cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></div>
                <span>{`${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`}</span>
                <span className="text-[9px] text-zinc-600">▼</span>
              </button>

              {/* Wallet Dropdown Panel */}
              <AnimatePresence>
                {showWalletDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      backgroundColor: "#111114",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                    className="absolute right-0 top-full mt-2 w-[300px] max-w-[300px] border rounded-2xl shadow-2xl p-4 flex flex-col gap-4 z-50 text-left origin-top-right will-change-transform"
                  >
                    
                    {/* Header Section */}
                    <div className="flex flex-col gap-3 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      {/* pulsing dot + Portaldot Dev label */}
                      <div className="flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping-fast absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span style={{ fontFamily: "var(--font-syne)" }} className="text-white text-xs font-bold tracking-wider">
                            Portaldot Dev
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(activeAddress, 'fullAddress')}
                          className="text-[#F59E0B] hover:text-amber-400 text-[10px] flex items-center gap-1 cursor-pointer font-bold select-none transition-colors"
                        >
                          {copiedText === 'fullAddress' ? 'copied!' : 'copy'}
                        </button>
                      </div>

                      {/* Full Address */}
                      <span className="text-zinc-400 break-all select-all font-mono text-[9px] leading-relaxed">
                        {activeAddress}
                      </span>

                      {/* POT Balance Section */}
                      <div className="flex flex-col gap-1 mt-1 bg-zinc-950/40 border rounded-xl p-2.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold select-none">POT Balance</span>
                        {isFetchingBalance ? (
                          <div className="flex items-center gap-1.5 text-zinc-500 py-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping-fast"></div>
                            <span>Loading balance...</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#F59E0B] font-mono tracking-wide">
                            {potBalance || "0.0000 POT"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col gap-3 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      {/* Send POT Toggle trigger */}
                      <button
                        onClick={() => {
                          setShowSendForm(!showSendForm);
                          setSendError(null);
                          setSendSuccessData(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all btn-tactile cursor-pointer border ${
                          showSendForm 
                            ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" 
                            : "bg-[#1A1A1E] text-zinc-300 border-transparent hover:border-zinc-800"
                        }`}
                      >
                        <span>Send POT</span>
                        <span>{showSendForm ? "▲" : "▼"}</span>
                      </button>

                      {/* Inline Send POT Form */}
                      {showSendForm && (
                        <form onSubmit={handleSendPOT} className="flex flex-col gap-2 bg-zinc-950/40 p-2.5 rounded-xl border border-white/5">
                          <input
                            type="text"
                            placeholder="Recipient Address"
                            value={sendRecipient}
                            onChange={(e) => setSendRecipient(e.target.value)}
                            className="bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1.5 text-[9px] text-zinc-300 outline-none focus:border-[#F59E0B] w-full font-mono placeholder-zinc-600"
                          />
                          <input
                            type="text"
                            placeholder="Amount (POT)"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            className="bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1.5 text-[9px] text-zinc-300 outline-none focus:border-[#F59E0B] w-full font-mono placeholder-zinc-600"
                          />

                          {sendError && (
                            <div role="alert" className="flex items-start gap-1 text-red-400 text-[9px] leading-relaxed font-mono">
                              <span aria-hidden="true" className="shrink-0">⚠</span>
                              <span>{sendError}</span>
                            </div>
                          )}

                          {sendSuccessData && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2 rounded-lg text-[9px] leading-relaxed flex flex-col gap-0.5 font-mono">
                              <span className="font-bold select-none text-green-400">[✓] Send Success</span>
                              <span className="break-all select-all font-mono">Hash: {sendSuccessData.txHash}</span>
                              {sendSuccessData.fee && <span className="font-mono">Fee: {sendSuccessData.fee}</span>}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isSendingPOT || !sendRecipient.trim() || !sendAmount.trim()}
                            className="w-full bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 disabled:bg-zinc-900/50 text-[#F59E0B] disabled:text-zinc-600 py-1.5 rounded font-bold uppercase btn-tactile text-[9px] tracking-wide text-center cursor-pointer transition-colors"
                          >
                            {isSendingPOT ? "Sending..." : "Confirm Send"}
                          </button>
                        </form>
                      )}

                      {/* Receive box */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold select-none">Receive POT</span>
                        <div className="flex items-center justify-between gap-2 bg-zinc-950/40 border rounded-xl p-2 font-mono" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <span className="truncate pr-1 text-zinc-400 text-[9px] select-all w-[180px]">
                            {activeAddress}
                          </span>
                          <button
                            onClick={() => handleCopyToClipboard(activeAddress, 'receiveAddress')}
                            className="text-[#F59E0B] hover:text-amber-400 text-[9px] underline cursor-pointer shrink-0 font-bold"
                          >
                            {copiedText === 'receiveAddress' ? 'copied!' : 'copy'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions (last 3 txs) */}
                    <div className="flex flex-col gap-2 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold select-none">Recent Transactions</span>
                      {recentTxs.length === 0 ? (
                        <span className="text-zinc-600 text-[9px] italic">No recent transfers.</span>
                      ) : (
                        <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                          {recentTxs.slice(0, 3).map((tx, idx) => (
                            <div key={idx} className="flex flex-col gap-1 bg-zinc-950/40 border border-white/5 p-2 rounded-lg text-[9px] font-mono leading-normal select-text">
                              <div className="flex justify-between items-center text-zinc-400 font-semibold select-none">
                                <span className="text-[#F59E0B]">{tx.amount} POT → {tx.recipient}</span>
                                <span className="text-zinc-600 text-[8px]">
                                  {formatDate(tx.timestamp)}
                                </span>
                              </div>
                              <div className="text-zinc-600 text-[8px] truncate flex justify-between items-center gap-1 font-mono mt-0.5">
                                <span className="truncate text-zinc-500">Hash: {tx.hash}</span>
                                <button
                                  onClick={() => handleCopyToClipboard(tx.hash, `txHash_${idx}`)}
                                  className="text-[#F59E0B] hover:text-amber-400 text-[7px] underline shrink-0 cursor-pointer font-bold select-none"
                                >
                                  {copiedText === `txHash_${idx}` ? 'copied!' : 'copy'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Section */}
                    <button
                      onClick={() => {
                        setShowWalletDropdown(false);
                        setModalInput(activeAddress);
                        setModalError(null);
                        setShowModal(true);
                      }}
                      className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/60 text-red-500 hover:text-red-400 py-1.5 rounded-lg font-bold uppercase btn-tactile text-[9px] tracking-wide text-center cursor-pointer transition-colors"
                    >
                      Change Address
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Avatar Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-[#F59E0B] rounded-full border border-zinc-700/50 flex items-center justify-center font-bold font-mono btn-tactile cursor-pointer text-xs"
                  title="User Settings"
                >
                  {username ? username.slice(0, 2).toUpperCase() : "U"}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-56 bg-[#0C0C0E] border border-zinc-800/60 rounded-lg shadow-2xl p-4 flex flex-col gap-3 font-mono text-zinc-200 z-[100] text-xs text-left origin-top-right will-change-transform"
                    >
                      {/* Header */}
                      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Current User</span>
                        <span className="font-bold text-white truncate text-sm">{username}</span>
                      </div>

                      {/* Edit Field */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Rename</span>
                        <input
                          type="text"
                          value={editUsernameValue}
                          onChange={(e) => setEditUsernameValue(e.target.value)}
                          placeholder="New username..."
                          className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 w-full outline-none font-mono text-xs focus:border-[#F59E0B]"
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={() => {
                          if (editUsernameValue.trim()) {
                            const newName = editUsernameValue.trim();
                            localStorage.setItem(`hermes_username_${activeAddress}`, newName);
                            setUsername(newName);
                            setShowProfileDropdown(false);
                          }
                        }}
                        className="bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] py-1.5 rounded font-bold uppercase btn-tactile text-[10px] tracking-wide text-center"
                      >
                        Save
                      </button>

                      {/* Change Address Option */}
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          localStorage.removeItem("hermes_active_address");
                          setActiveAddress(null);
                          setModalInput("");
                          setModalError(null);
                          setShowModal(true);
                        }}
                        className="hover:bg-zinc-900 text-zinc-400 py-1.5 rounded font-bold uppercase btn-tactile text-[10px] tracking-wide text-center border border-transparent hover:border-zinc-800"
                      >
                        Change Address
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Centered Scrollable Conversation Viewport */}
        <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 pt-4 pb-40 scrollbar-thin scrollbar-thumb-[#27272A] scrollbar-track-transparent flex flex-col">
          {activeSessionId === null ? (
            // Centered empty state landing page (Claude style)
            <div className="flex-1 flex flex-col items-center justify-center text-center select-none my-auto max-w-2xl mx-auto px-4 py-8 space-y-6">
              {/* Pulsing Dot */}
              <div className="flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-ping-fast"></div>
              </div>

              {/* Greeting */}
              <div className="flex items-center gap-2.5 justify-center select-none mb-1">
                <span className="text-amber-500 text-[20px] select-none">●</span>
                <span
                  style={{ fontFamily: "var(--font-syne)" }}
                  className="text-[28px] font-bold text-white tracking-tight leading-none"
                >
                  {getGreeting()}, {username}
                </span>
              </div>

              {/* Syne Heading */}
              <h1
                style={{ fontFamily: "var(--font-syne)" }}
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              >
                What can I help you with?
              </h1>

              {/* DM Mono Subtitle */}
              <p
                style={{ fontFamily: "var(--font-dm-mono)" }}
                className="text-[13px] text-zinc-500 font-medium"
              >
                Ask anything about the Portaldot network.
              </p>

              {/* 2x2 Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {[
                  "What is the current block height and network status?",
                  "Show me the total POT supply",
                  "What is the consensus mechanism in Portaldot?",
                  "What is the current POT transfer fee?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInput(prompt)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setInput(prompt); } }}
                    className="bg-zinc-950/60 hover:bg-zinc-900/40 border border-zinc-900 hover:border-amber-500/30 rounded-xl p-4 btn-tactile text-left text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono text-[11px] leading-relaxed flex flex-col justify-between focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    aria-label={`Ask: ${prompt}`}
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Render active chat stream
            <div className="space-y-8">
              {activeMessages.map((msg) => {
                if (msg.reasoning) {
                  return (
                    <div key={msg.id} className="flex justify-start py-2 select-none w-full">
                      <div className="flex items-center space-x-1.5 bg-zinc-900/30 px-4 py-2 rounded-full border border-zinc-800/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-thinking-dot" style={{animationDelay:'-0.3s'}}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-thinking-dot" style={{animationDelay:'-0.15s'}}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-thinking-dot"></div>
                      </div>
                    </div>
                  );
                }

                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex flex-col space-y-1">
                      <span className="text-amber-500/60 text-[10px] select-none font-mono font-semibold" aria-label="Hermes">● hermes</span>
                      <div className="text-zinc-500 font-mono text-[11px] pl-3 md:pl-4 border-l border-zinc-800/40 py-0.5 select-text">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                if (msg.isError) {
                  return (
                    <div key={msg.id} className="flex flex-col space-y-1" role="alert">
                      <span className="text-amber-500/60 text-[10px] select-none font-mono font-semibold" aria-label="Hermes">● hermes</span>
                      <div className="text-amber-500 font-mono text-xs pl-3 md:pl-4 border-l border-red-500/30 py-1 font-bold select-text flex items-start gap-1.5">
                        <span aria-hidden="true" className="mt-px shrink-0 text-red-400">⚠</span>
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  );
                }

                if (msg.isRemedial) {
                  return (
                    <div key={msg.id} className="flex flex-col space-y-1" role="status">
                      <span className="text-amber-500/60 text-[10px] select-none font-mono font-semibold" aria-label="Hermes">● hermes</span>
                      <div className="text-amber-500 font-mono text-xs pl-3 md:pl-4 border-l border-zinc-800/40 py-1 select-text">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                if (msg.isSuccess) {
                  return (
                    <div key={msg.id} className="flex flex-col space-y-1">
                      <span className="text-amber-500/60 text-[10px] select-none font-mono font-semibold" aria-label="Hermes">● hermes</span>
                      <div className="text-green-400 font-mono text-xs pl-3 md:pl-4 border-l border-zinc-800/40 py-1 font-bold select-text">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex flex-col items-end w-full">
                      <div className="bg-zinc-900/60 px-4 py-2 rounded-2xl rounded-tr-sm max-w-[70%] ml-auto text-white leading-relaxed break-words select-text text-left">
                        {formatMessageContent(msg.content)}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex flex-col items-start w-full space-y-1">
                    <span className="text-amber-500/60 text-[10px] select-none font-mono font-semibold" aria-label="Hermes">● hermes</span>
                    <div className="text-zinc-300 leading-relaxed pl-3 md:pl-4 border-l border-zinc-800/40 break-words text-left max-w-[85%] select-text">
                      {formatMessageContent(msg.content)}
                    </div>

                    {msg.txResult && (
                      <div className="mt-2 w-full pl-3 md:pl-4 border-l border-zinc-800/40 select-text">
                        <div className="bg-zinc-950/80 p-3 md:p-4 rounded border border-zinc-800 text-xs space-y-2 overflow-x-auto">
                          <div className="flex text-green-400 font-bold mb-2 md:mb-3 select-none">
                            <span>[+] TRANSACTION_SUCCESS</span>
                          </div>
                          {msg.txResult.contractName && (
                            <div className="flex flex-col md:grid md:grid-cols-[100px_1fr] gap-1 md:gap-4 font-mono">
                              <span className="text-zinc-500">Contract:</span>
                              <span className="text-zinc-300">{msg.txResult.contractName}</span>
                            </div>
                          )}
                          {msg.txResult.address && (
                            <div className="flex flex-col md:grid md:grid-cols-[100px_1fr] gap-1 md:gap-4 font-mono">
                              <span className="text-zinc-500">Address:</span>
                              <span className="text-amber-500 break-all">{msg.txResult.address}</span>
                            </div>
                          )}
                          {msg.txResult.txHash && (
                            <div className="flex flex-col md:grid md:grid-cols-[100px_1fr] gap-1 md:gap-4 font-mono">
                              <span className="text-zinc-500">Hash:</span>
                              <span className="text-zinc-400 break-all">{msg.txResult.txHash}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Centered Input & Minimalist Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent pt-12 pb-6 z-10 shrink-0">
          <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
            
            <div className="w-full">
              <AIPromptBox
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isTyping}
                placeholder="Ask Hermes..."
              />
            </div>

            <p className="text-center text-[11px] text-zinc-600 mt-2">Hermes is an AI and can make mistakes.</p>

          </div>
        </div>

      {/* Address Input Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[9999]"
            onKeyDown={(e) => { if (e.key === 'Escape' && activeAddress) setShowModal(false); }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Portaldot account setup"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
              className="bg-[#0C0C0E] border border-zinc-800/80 p-6 rounded-2xl w-full max-w-md flex flex-col gap-4 font-mono text-xs shadow-2xl relative text-zinc-200 will-change-transform"
            >
              
              {/* Show close/cancel button ONLY if we already have a valid activeAddress */}
              {activeAddress && (
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors btn-tactile text-sm"
                >
                  ✕
                </button>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[#F59E0B] font-bold text-sm tracking-wide uppercase">Portaldot Account</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Enter your Portaldot address to get started. History and sessions will be namespaced to this address.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = modalInput.trim();
                  if (!isValidSS58(trimmed)) {
                    setModalError("Invalid address. It must start with 5 and be 47-48 characters long.");
                    return;
                  }
                  localStorage.setItem("hermes_active_address", trimmed);
                  setActiveAddress(trimmed);
                  setShowModal(false);
                  setModalError(null);
                }}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. 5GrwvaEF5zXb26Fz9rcQpDWS57CteRHpNehXCPcNNoHGKutQY"
                    value={modalInput}
                    onChange={(e) => {
                      setModalInput(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    className="bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2.5 outline-none focus:border-[#F59E0B] text-zinc-200 transition-all font-sans text-xs w-full placeholder-zinc-700 font-mono"
                    aria-label="Portaldot address"
                    aria-describedby={modalError ? "modal-error" : undefined}
                    autoFocus
                  />
                  {modalError && (
                    <div id="modal-error" role="alert" className="flex items-start gap-1.5 text-red-400 text-[10px] leading-relaxed mt-0.5">
                      <span aria-hidden="true" className="mt-px shrink-0">⚠</span>
                      <span>{modalError}</span>
                    </div>
                  )}
                  
                  <span className="text-zinc-500 text-[10px] leading-relaxed mt-1">
                    A Portaldot address is a unique identifier for your account on the network. It starts with the number 5 and is 47–48 characters long.
                  </span>

                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={handleGenerateAddress}
                      disabled={isGeneratingWallet}
                      className="text-amber-500 hover:text-amber-400 text-[10px] underline text-left cursor-pointer transition-colors"
                    >
                      {isGeneratingWallet ? "Generating..." : "Don't have a Portaldot address? Generate one"}
                    </button>
                  </div>
                </div>

                {showWarningBanner && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-2.5 rounded-lg text-[10px] leading-normal font-sans">
                    ⚠️ Your mnemonic has been saved to the server keystore. Write it down before continuing.
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-[#F59E0B] hover:bg-amber-600 active:bg-amber-700 text-black py-2.5 rounded-lg font-bold btn-tactile uppercase cursor-pointer text-xs tracking-wider"
                >
                  Confirm
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
