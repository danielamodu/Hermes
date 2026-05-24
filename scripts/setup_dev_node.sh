#!/bin/bash
# ============================================================================
# Hermes — Portaldot Local Dev Node Setup (WSL Ubuntu)
# ============================================================================
# Downloads, extracts, and launches the Portaldot local development node.
# Run this script inside WSL Ubuntu.
#
# Usage:
#   chmod +x setup_dev_node.sh
#   ./setup_dev_node.sh          # Download + extract + run
#   ./setup_dev_node.sh --run    # Skip download, just run existing node
# ============================================================================

set -euo pipefail

DOWNLOAD_URL="https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz"
ARCHIVE_NAME="portaldot-testnet-ubuntu.tar.gz"
NODE_DIR="portaldot-testnet-ubuntu"
NODE_BINARY="portaldot_dev"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
NODE_PATH="${WORKSPACE_DIR}/node"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Hermes — Portaldot Dev Node Setup                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ---- Parse args ----
RUN_ONLY=false
if [[ "${1:-}" == "--run" ]]; then
    RUN_ONLY=true
fi

# ---- Download & Extract ----
if [[ "$RUN_ONLY" == false ]]; then
    echo "📦 Creating node directory: ${NODE_PATH}"
    mkdir -p "${NODE_PATH}"
    cd "${NODE_PATH}"

    if [[ -f "${ARCHIVE_NAME}" ]]; then
        echo "   Archive already exists, skipping download."
    else
        echo "⬇️  Downloading Portaldot testnet node..."
        echo "   URL: ${DOWNLOAD_URL}"
        wget -q --show-progress -O "${ARCHIVE_NAME}" "${DOWNLOAD_URL}"
        echo "   ✅ Download complete."
    fi

    echo "📂 Extracting..."
    tar -xzvf "${ARCHIVE_NAME}"
    echo "   ✅ Extracted."

    echo "🔐 Setting executable permissions..."
    chmod 755 "${NODE_DIR}/${NODE_BINARY}"
    echo "   ✅ Done."
fi

# ---- Launch ----
cd "${NODE_PATH}/${NODE_DIR}"
echo ""
echo "🚀 Starting Portaldot local dev node..."
echo "   Command: ./${NODE_BINARY} --dev --alice"
echo "   WebSocket: ws://127.0.0.1:9944"
echo "   Press Ctrl+C to stop."
echo ""

./${NODE_BINARY} --dev --alice
