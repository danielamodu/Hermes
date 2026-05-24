"""
intent_parser.py — rule-based keyword/regex intent classifier.

No LLM calls. No API keys. No rate limits. Instant, deterministic responses.
The IntentParser.parse() interface is identical to the previous LLM version so
nothing else in the codebase needs to change.
"""

import os
import re
from dotenv import load_dotenv

# Load .env (still needed by other modules that share this process)
_here = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(_here, ".env"), override=True)


# ── Compiled regex helpers ────────────────────────────────────────────────────

# SS58 addresses: start with "5", base58 alphabet, 47-48 chars total
_SS58_RE = re.compile(r'\b5[1-9A-HJ-NP-Za-km-z]{45,47}\b')

# Numeric amount (optionally followed by POT)
_AMOUNT_RE = re.compile(r'\b(\d+(?:\.\d+)?)\s*(?:POT\b)?', re.IGNORECASE)

# Block number appearing after the word "block" with optional # or spaces
_BLOCK_NUM_RE = re.compile(r'block\s*#?\s*(\d+)', re.IGNORECASE)

# "at block N" / "in block N" — signals historic balance, not current
_HISTORIC_RE = re.compile(r'\bat\s+block\b|\bin\s+block\b|block\s*#?\s*\d+', re.IGNORECASE)


# ── Low-level helpers ─────────────────────────────────────────────────────────

def _has(text: str, *keywords: str) -> bool:
    """Return True if any keyword appears in the lowercased text."""
    lower = text.lower()
    return any(kw in lower for kw in keywords)


def _ss58(text: str) -> str | None:
    m = _SS58_RE.search(text)
    return m.group() if m else None


def _amount(text: str) -> float | None:
    m = _AMOUNT_RE.search(text)
    return float(m.group(1)) if m else None


def _block_num(text: str) -> int | None:
    m = _BLOCK_NUM_RE.search(text)
    return int(m.group(1)) if m else None


def _result(intent: str, params: dict, confidence: float, raw: str) -> dict:
    return {"intent": intent, "params": params, "confidence": confidence, "raw": raw}


# ── Main classifier ───────────────────────────────────────────────────────────

def classify_intent(message: str) -> dict:
    """
    Rule-based intent classifier.

    Returns a dict in the same format as the previous LLM parser:
        {"intent": str, "params": dict, "confidence": float, "raw": str}

    Rules are evaluated in priority order — more specific patterns first.
    """
    msg = message.lower().strip()

    # ── get_total_issuance ────────────────────────────────────────────────────
    # Must come before get_balance because "total supply" doesn't contain
    # balance keywords, but being explicit avoids future ambiguity.
    if _has(msg,
            'total supply', 'pot supply', 'total pot', 'how many pot',
            'tokens exist', 'in circulation', 'total issuance', 'total token',
            'how many tokens'):
        return _result("get_total_issuance", {}, 0.97, message)

    # ── get_chain_info ────────────────────────────────────────────────────────
    if _has(msg,
            'block height', 'current block', 'block number', 'what block',
            "whats the block", "what's the block", 'network status',
            'chain info', 'block are we', 'which block'):
        return _result("get_chain_info", {"query": "block_height"}, 0.97, message)

    # ── keypair_mgmt ──────────────────────────────────────────────────────────
    if _has(msg,
            'create wallet', 'new wallet', 'generate wallet', 'make wallet',
            'new keypair', 'generate keypair', 'create keypair', 'create a wallet'):
        return _result("keypair_mgmt", {"action": "create"}, 0.97, message)

    # ── get_historic_balance (before get_balance — more specific) ─────────────
    if _has(msg, 'balance', 'how much') and _HISTORIC_RE.search(msg):
        addr = _ss58(message)
        bnum = _block_num(message)
        p: dict = {}
        if addr:            p['address'] = addr
        if bnum is not None: p['block_number'] = bnum
        return _result("get_historic_balance", p, 0.96, message)

    # ── get_fee_info ──────────────────────────────────────────────────────────
    if _has(msg, 'fee', 'cost', 'how much will', 'transfer fee', 'transaction fee', 'network fee', 'gas', 'estimate'):
        amt  = _amount(message)
        addr = _ss58(message)
        p = {}
        if amt is not None: p['amount']  = amt
        if addr:            p['address'] = addr
        return _result("get_fee_info", p, 0.93, message)

    # ── transfer_pot ──────────────────────────────────────────────────────────
    if _has(msg, 'send', 'transfer', 'pot to'):
        addr = _ss58(message)
        amt  = _amount(message)
        p = {}
        if addr:           p['address'] = addr
        if amt is not None: p['amount']  = amt
        return _result("transfer_pot", p, 0.95, message)

    # ── get_block (specific block lookup by number) ───────────────────────────
    if _has(msg,
            'show block', 'block #', 'show me block', 'get block',
            'what happened in block', 'lookup block', 'fetch block'):
        bnum = _block_num(message)
        return _result("get_block", {"block_number": bnum}, 0.96, message)

    # ── inspect_address ───────────────────────────────────────────────────────
    if _has(msg,
            'inspect', 'tell me about address', 'what is this address',
            'about address', 'look up address', 'lookup address', 'address profile',
            'is this a contract', 'contract or wallet'):
        addr = _ss58(message)
        p = {}
        if addr: p['address'] = addr
        return _result("inspect_address", p, 0.95, message)

    # ── get_balance ───────────────────────────────────────────────────────────
    if _has(msg, 'balance', 'check balance', 'how much', 'my balance', 'your balance'):
        addr = _ss58(message)
        p = {}
        if addr: p['address'] = addr
        return _result("get_balance", p, 0.95, message)

    # ── get_runtime_info ──────────────────────────────────────────────────────
    if _has(msg,
            'runtime', 'spec version', 'what version', 'node version',
            'system version', 'runtime info', 'runtime details', 'peer count'):
        return _result("get_runtime_info", {}, 0.95, message)

    # ── deploy_contract ───────────────────────────────────────────────────────
    if _has(msg, 'deploy', 'instantiate contract', 'upload contract'):
        return _result("deploy_contract", {}, 0.90, message)

    # ── unknown ───────────────────────────────────────────────────────────────
    return _result("unknown", {}, 0.0, message)


# ── IntentParser class ────────────────────────────────────────────────────────

class IntentParser:
    """
    Thin wrapper around classify_intent() that preserves the original .parse()
    interface so main.py and everything else stays unchanged.
    """

    def parse(self, user_message: str) -> dict:
        print(f"[IntentParser] Classifying: {user_message!r}")
        result = classify_intent(user_message)
        print(f"[IntentParser] → {result['intent']} (confidence={result['confidence']})")
        return result
