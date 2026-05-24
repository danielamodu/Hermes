#!/usr/bin/env python3
"""
Hermes — Hello World: Portaldot Chain Interaction
==================================================
Creates a keypair and queries the local Portaldot dev node.

Prerequisites:
  1. Local Portaldot dev node running:  ./portaldot_dev --dev --alice
  2. Python SDK installed:              pip install substrate-interface

Usage:
  python hello_portaldot.py [--url ws://127.0.0.1:9944]
"""

import argparse
import sys

from substrateinterface import SubstrateInterface, Keypair, KeypairType


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

LOCAL_NODE_URL = "ws://127.0.0.1:9944"
MAINNET_URL = "wss://mainnet.portaldot.io"
SS58_FORMAT = 42  # Portaldot address format


def connect(url: str) -> SubstrateInterface:
    """Connect to a Portaldot node."""
    print(f"\n⛓️  Connecting to Portaldot node at {url} ...")
    chain = SubstrateInterface(
        url=url,
        ss58_format=SS58_FORMAT,
        type_registry_preset="default",
    )
    print(f"   ✅ Connected | Chain: {chain.name} | Version: {chain.version}")
    return chain


# ---------------------------------------------------------------------------
# 1. Keypair Creation
# ---------------------------------------------------------------------------

def demo_keypair():
    """Generate a fresh keypair and demonstrate signing/verification."""
    print("\n" + "=" * 60)
    print("🔑  KEYPAIR CREATION")
    print("=" * 60)

    # Generate a new mnemonic and keypair (SR25519 by default)
    mnemonic = Keypair.generate_mnemonic()
    keypair = Keypair.create_from_mnemonic(mnemonic)

    print(f"   Mnemonic  : {mnemonic}")
    print(f"   SS58 Addr : {keypair.ss58_address}")
    print(f"   Public Key: {keypair.public_key.hex()}")
    print(f"   Crypto    : SR25519")

    # Sign and verify a test message
    message = "Hello from Hermes 🪽"
    signature = keypair.sign(message)
    verified = keypair.verify(message, signature)
    print(f"\n   📝 Signed message: \"{message}\"")
    print(f"   ✅ Signature verified: {verified}")

    # Also demonstrate the dev keypair (//Alice)
    alice = Keypair.create_from_uri("//Alice")
    print(f"\n   Dev keypair //Alice : {alice.ss58_address}")

    return keypair, alice


# ---------------------------------------------------------------------------
# 2. Chain Queries
# ---------------------------------------------------------------------------

def demo_chain_query(chain: SubstrateInterface, alice: Keypair):
    """Query chain state — system info and Alice's account balance."""
    print("\n" + "=" * 60)
    print("🔍  CHAIN QUERIES")
    print("=" * 60)

    # --- System constants ---
    chain_name = chain.rpc_request("system_chain", [])
    chain_version = chain.rpc_request("system_version", [])
    print(f"   Chain name    : {chain_name.get('result', 'N/A')}")
    print(f"   Node version  : {chain_version.get('result', 'N/A')}")

    # --- Block info ---
    block_hash = chain.get_chain_head()
    block_number = chain.get_block_number(block_hash)
    print(f"   Latest block  : #{block_number}  ({block_hash[:18]}...)")

    # --- Account balance (Alice on dev chain is pre-funded) ---
    print(f"\n   📊 Account balance for //Alice ({alice.ss58_address}):")
    result = chain.query("System", "Account", [alice.ss58_address])

    if result and result.value:
        acct = result.value
        nonce = acct.get("nonce", 0)
        free = acct.get("data", {}).get("free", 0)
        reserved = acct.get("data", {}).get("reserved", 0)

        # POT has 14 decimals
        free_pot = free / (10 ** 14)
        reserved_pot = reserved / (10 ** 14)

        print(f"      Nonce      : {nonce}")
        print(f"      Free       : {free_pot:,.4f} POT  (raw: {free})")
        print(f"      Reserved   : {reserved_pot:,.4f} POT  (raw: {reserved})")
    else:
        print("      ⚠️  Account not found (chain may not be in dev mode)")

    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Hermes — Portaldot Hello World"
    )
    parser.add_argument(
        "--url",
        default=LOCAL_NODE_URL,
        help=f"Node WebSocket URL (default: {LOCAL_NODE_URL})",
    )
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════════════════╗")
    print("║          HERMES — Portaldot Hello World                 ║")
    print("║          First Conversational AI Agent for Portaldot    ║")
    print("╚══════════════════════════════════════════════════════════╝")

    # Step 1: Keypair demo (offline — no node needed)
    keypair, alice = demo_keypair()

    # Step 2: Connect to node and query chain (needs running node)
    try:
        chain = connect(args.url)
        demo_chain_query(chain, alice)
        chain.close()
        print("\n   🔌 Connection closed cleanly.")
    except ConnectionRefusedError:
        print(f"\n   ❌ Could not connect to {args.url}")
        print("      Make sure the local dev node is running:")
        print("      $ ./portaldot_dev --dev --alice")
        sys.exit(1)
    except Exception as e:
        print(f"\n   ❌ Error: {e}")
        print("      Keypair demo above works offline.")
        print("      To run chain queries, start the local node first.")
        sys.exit(1)

    print("\n✅ Hello World complete! Hermes is ready to build.\n")


if __name__ == "__main__":
    main()
