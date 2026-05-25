# Hermes — AI-Native Developer Console for Portaldot

The first conversational AI agent built natively for the Portaldot blockchain. Instead of writing Python SDK code or reading documentation, developers interact with Portaldot in plain English.

![Hermes](https://img.shields.io/badge/Portaldot-Native-F59E0B?style=flat-square)
![Python](https://img.shields.io/badge/Python-FastAPI-3B82F6?style=flat-square)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-white?style=flat-square)

## What is Hermes?

Hermes is a full-stack AI agent that translates natural language into direct Portaldot blockchain interactions. Ask about block heights, inspect addresses, check balances, generate wallets, send POT, and explore the network — all through a clean terminal-style chat interface.

## Features

- **Natural Language Chain Queries** — block height, network status, runtime info, total supply
- **POT Transfers** — send POT directly from the wallet panel, real onchain tx with gas shown
- **Wallet Management** — check balances, view recent transactions
- **Block Explorer** — query any block by number, returns hash and extrinsic count
- **Address Inspector** — inspect any SS58 address, check balance and nonce
- **Fee Estimation** — estimate POT transfer fees before sending
- **RAG Knowledge Base** — answers general Portaldot ecosystem questions from scraped docs
- **Session History** — chat sessions persisted per wallet address

## Tech Stack

- **Frontend** — Next.js, Tailwind CSS, Framer Motion
- **Backend** — Python FastAPI
- **Chain** — Portaldot Python SDK (substrate-interface), local Portaldot dev node
- **AI** — Rule-based intent classifier + Groq LLM for general questions
- **Design** — amber.dark design system (bg #0C0C0F, accent #F59E0B, Syne + DM Mono)

## Supported Commands

| Intent | Example Query |
|--------|--------------|
| Chain info | "what is the current block height?" |
| Balance | "check balance of 5Grwva...utQY" |
| Transfer | "send 1 POT to 5FHneW...694ty" |
| Block lookup | "show me block 387" |
| Wallet gen | "create a new Portaldot wallet" |
| Fee estimate | "what is the current POT transfer fee?" |
| Total supply | "show me total POT supply" |
| Runtime info | "what version is Portaldot running?" |
| General Q&A | "what is LAO NPoS consensus?" |

## Local Setup

### Prerequisites
- WSL Ubuntu (Windows) or Linux
- Node.js 18+
- Python 3.12+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/danielamodu/Hermes.git
cd Hermes
```

### 2. Download Portaldot local node
Download the Ubuntu client from [Portaldot Chain Info](https://portaldot-dev.readthedocs.io/en/latest/) and place it in `node/portaldot-testnet-ubuntu/`.

### 3. Start the Portaldot node
```bash
cd node/portaldot-testnet-ubuntu
./portaldot_dev --dev --alice
```

### 4. Set up the backend
```bash
cd backend
pip install -r requirements.txt --break-system-packages
cp .env.example .env
# add your GROQ_API_KEY to .env
uvicorn main:app --reload
```

### 5. Set up the frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### 6. Build the RAG knowledge base (optional)
```bash
cd backend
python3 scraper.py
```

### 7. Open Hermes
Visit `http://localhost:3000` — enter your Portaldot SS58 address to get started.

## Environment Variables

### Backend `.env`
PORTALDOT_NODE_URL=ws://127.0.0.1:9944
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

### Frontend `.env.local`
NEXT_PUBLIC_API_URL=http://localhost:8000

## Architecture
User (plain English)
↓
Next.js Frontend
↓ POST /chat
FastAPI Backend
↓
Rule-based Intent Classifier
↓                    ↓
Known Intent         Unknown Intent
↓                    ↓
Portaldot SDK        Groq LLM + RAG
↓                    ↓
Chain Response       Doc-grounded Answer
↓
Formatted Reply → Frontend

## Demo Flow (60-90 seconds)

1. Start local Portaldot node
2. Open Hermes — enter Portaldot address
3. Ask "what is the current block height?" → real chain data
4. Click address in navbar → wallet dropdown → real POT balance
5. Send 1 POT → real onchain transfer → tx hash + gas fee shown

## Built for Portaldot Online Mini Hackathon S1

- Track: General
- Builder: Daniel Amodu (@fortyxbt)
- Twitter: [@fortyxbt](https://x.com/fortyxbt)
- GitHub: [@danielamodu](https://github.com/danielamodu)

## License

MIT
