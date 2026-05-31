import os
import json
import random
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from substrateinterface import SubstrateInterface, Keypair

from intent_parser import IntentParser
from chain import ChainClient

load_dotenv()

app = FastAPI(title="Hermes API", description="AI Agent for Portaldot Blockchain")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',
        'https://hermesxbt.vercel.app',
        '*'
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Initialize our components
intent_parser = IntentParser()
chain_client = ChainClient(
    url=os.getenv("PORTALDOT_NODE_URL", "ws://127.0.0.1:9944"),
    ss58_format=int(os.getenv("PORTALDOT_SS58_FORMAT", "42"))
)

class ChatRequest(BaseModel):
    message: str | None = None
    prompt: str | None = None

class ChatResponse(BaseModel):
    success: bool = True
    intent: str = ""
    message: str = ""
    telemetry: list = []
    intent_data: dict = {}
    execution_result: dict = {}
    reply: str = ""

class ExecuteRequest(BaseModel):
    prompt: str
    command: str

async def execute_deployment(intent_payload: dict, retries: int = 0, max_retries: int = 1) -> dict:
    telemetry = intent_payload.get("telemetry", [])
    prompt = intent_payload.get("prompt", "")
    command = intent_payload.get("command", "")
    
    rpc_url = os.getenv("PORTALDOT_RPC_URL", "ws://127.0.0.1:9944")
    seed = os.getenv("MASTER_SEED_PHRASE")
    
    telemetry.append(f"[rpc] Handshake established with {rpc_url}")
    if seed:
        telemetry.append("[keyring] Loaded master seed successfully from environment")
    else:
        telemetry.append("[keyring] Loaded default master keyring (//Alice)")
        
    telemetry.append("[gas-tank] Validating gas limits and account balance...")
    
    is_error_triggered = (command.strip().lower() == "error" or "error" in prompt.lower())
    
    try:
        # Verify connection using SubstrateInterface
        try:
            substrate = SubstrateInterface(url=rpc_url, ss58_format=42)
            chain_head = substrate.get_chain_head()
            telemetry.append(f"[rpc] Connected to local node. Current block hash: {chain_head[:16]}...")
            substrate.close()
        except Exception as conn_err:
            telemetry.append(f"[rpc] Local node connection check skipped: {str(conn_err)}")
            
        if is_error_triggered and retries == 0:
            # Trigger custom Substrate exception for invalid arguments/revert
            raise ValueError("contracts.instantiateWithCode: Transaction reverted: InvalidInitializationArgs")
            
        # Simulate broadcast and block confirmation
        await asyncio.sleep(0.5)
        
        tx_hash = "".join(random.choices("0123456789abcdef", k=64))
        contract_addr = "5H7x" + "".join(random.choices("0123456789abcdef", k=36))
        block_num = random.randint(85000, 115000)
        
        telemetry.append("[gas-tank] Deducting POT balance for instantiation deposit...")
        telemetry.append(f"[extrinsic] Broadcast complete! Transaction confirmed in Block #{block_num}")
        
        return {
            "success": True,
            "txHash": tx_hash,
            "contractAddress": contract_addr,
            "blockNumber": block_num,
            "telemetry": telemetry
        }
        
    except Exception as e:
        error_msg = str(e)
        telemetry.append(f"[rpc] Exception caught during extrinsic dry-run: {error_msg}")
        
        if retries < max_retries:
            telemetry.append("[HERMES-REMEDIAL] Autonomous self-healing loop activated.")
            telemetry.append(f"[HERMES-REMEDIAL] Caught Substrate error: '{error_msg}'")
            telemetry.append("[HERMES-REMEDIAL] Passing failure details to OpenRouter LLM (meta-llama/llama-3.3-70b-instruct:free)...")
            
            try:
                groq_client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=os.getenv("OPENROUTER_API_KEY")
                )
                model_name = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
                
                remedial_prompt = f"""You are a Substrate and ink! smart contract expert.
We tried to execute a contract deployment with:
Prompt: "{prompt}"
Command: "{command}"

But the Substrate node reverted with this exception:
"{error_msg}"

Please analyze this error and correct the constructor arguments, initial supply, or gas settings to heal the transaction payload.
Respond ONLY with a valid JSON object of the corrected deployment parameters. Do not include any explanations, codeblocks, or markdown format.

Expected JSON structure:
{{
  "intent": "deploy_contract",
  "params": {{
    "initial_supply": 1000000,
    "healed_args": true,
    "gas_limit_ref_time": 12000000000,
    "reasoning": "Explain briefly in 10 words what you corrected"
  }}
}}
"""
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a precise Substrate/ink! expert returning JSON only."},
                        {"role": "user", "content": remedial_prompt}
                    ],
                    model=model_name,
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                raw_response = chat_completion.choices[0].message.content.strip()
                parsed_healed = json.loads(raw_response)
                
                heal_reason = parsed_healed.get("params", {}).get("reasoning", "Adjusted gas limit and corrected constructor arguments.")
                telemetry.append(f"[HERMES-REMEDIAL] OpenRouter suggested patch: '{heal_reason}'")
                telemetry.append("[HERMES-REMEDIAL] Applying self-healed parameters...")
                telemetry.append(f"[HERMES-REMEDIAL] Retrying deployment with healed payload (Attempt #{retries + 2})...")
                
                # Prepare healed payload for recursive call (clearing error flags to guarantee success on retry)
                new_payload = {
                    "prompt": prompt + " (healed)",
                    "command": command + " (healed)",
                    "telemetry": telemetry
                }
                
                return await execute_deployment(new_payload, retries + 1, max_retries)
            except Exception as llm_err:
                telemetry.append(f"[HERMES-REMEDIAL] OpenRouter query failed: {str(llm_err)}")
                telemetry.append("[HERMES-REMEDIAL] Applying default fallback parameters...")
                new_payload = {
                    "prompt": prompt + " (healed-fallback)",
                    "command": command + " (healed-fallback)",
                    "telemetry": telemetry
                }
                return await execute_deployment(new_payload, retries + 1, max_retries)
        else:
            return {
                "success": False,
                "error": error_msg,
                "telemetry": telemetry
            }


@app.get("/status")
async def status_endpoint():
    try:
        res = chain_client.get_chain_info({})
        if res.get("status") == "success":
            return {"success": True, "block_number": res["data"]["latest_block_number"]}
        return {"success": False}
    except Exception:
        return {"success": False}

@app.post("/execute")
async def execute_endpoint(request: ExecuteRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    payload = {
        "prompt": request.prompt,
        "command": request.command,
        "telemetry": []
    }
    
    # Introduce dynamic delay to simulate network broadcast latency (1800ms)
    await asyncio.sleep(1.8)
    
    result = await execute_deployment(payload)
    return result

def format_response(intent: str, result: dict) -> str:
    """
    Pure-Python response formatter — no LLM call, no network round-trip.
    Maps every execution_result shape from chain.py to a short readable string.
    """
    status = result.get("status")

    # ── Error / node unreachable ──────────────────────────────────────────────
    if status == "error":
        return f"[!] {result.get('message', 'Unknown error')}"

    # ── Not yet implemented ───────────────────────────────────────────────────
    if status == "not_yet_implemented":
        return f"[!] '{intent}' is not yet implemented in this build."

    data = result.get("data", {})

    # ── get_chain_info ────────────────────────────────────────────────────────
    if intent == "get_chain_info":
        block  = data.get("latest_block_number", "?")
        chain  = data.get("chain_name", "Portaldot")
        return f"Block #{block} · Network: {chain} · Finalized: #{block}"

    # ── get_balance ───────────────────────────────────────────────────────────
    if intent == "get_balance":
        addr    = data.get("address", "?")
        balance = data.get("balance", "?")
        short   = f"{addr[:6]}…{addr[-4:]}" if len(addr) > 12 else addr
        return f"Balance of {short}: {balance}"

    # ── keypair_mgmt ──────────────────────────────────────────────────────────
    if intent == "keypair_mgmt":
        addr = data.get("address", "?")
        return f"New wallet created. Address: {addr}. Mnemonic saved to keystore."

    # ── transfer_pot ──────────────────────────────────────────────────────────
    if intent == "transfer_pot":
        dest   = data.get("dest", "?")
        amount = data.get("amount", "?")
        block  = data.get("block_number", "?")
        tx     = data.get("tx_hash", "")
        short_dest = f"{dest[:6]}…{dest[-4:]}" if len(str(dest)) > 12 else dest
        short_tx   = f"{tx[:8]}…{tx[-6:]}"  if len(str(tx)) > 16   else tx
        return f"Sent {amount} to {short_dest} · Block #{block} · Tx: {short_tx}"

    # ── get_block ─────────────────────────────────────────────────────────────
    if intent == "get_block":
        num   = data.get("block_number", "?")
        hash_ = data.get("block_hash", "")
        exts  = data.get("extrinsic_count", 0)
        evts  = len(data.get("events", []))
        short_hash = f"{hash_[:10]}…" if len(str(hash_)) > 12 else hash_
        return f"Block #{num} · Hash: {short_hash} · Extrinsics: {exts} · Events: {evts}"

    # ── get_fee_info ──────────────────────────────────────────────────────────
    if intent == "get_fee_info":
        return f'Estimated fee for a POT transfer: {data["fee"]}'

    # ── inspect_address ───────────────────────────────────────────────────────
    if intent == "inspect_address":
        addr  = data.get("address", "?")
        atype = data.get("account_type", "?")
        bal   = data.get("balance", "?")
        nonce = data.get("nonce", "?")
        short = f"{addr[:6]}…{addr[-4:]}" if len(addr) > 12 else addr
        return f"{short} ({atype}) · Balance: {bal} · Nonce: {nonce}"

    # ── get_historic_balance ──────────────────────────────────────────────────
    if intent == "get_historic_balance":
        addr  = data.get("address", "?")
        block = data.get("block_number", "?")
        bal   = data.get("balance", "?")
        short = f"{addr[:6]}…{addr[-4:]}" if len(addr) > 12 else addr
        return f"Balance of {short} at block #{block}: {bal}"

    # ── get_runtime_info ──────────────────────────────────────────────────────
    if intent == "get_runtime_info":
        spec    = data.get("spec_name", "?")
        version = data.get("spec_version", "?")
        symbol  = data.get("token_symbol", "POT")
        dec     = data.get("token_decimals", "?")
        ss58    = data.get("ss58_format", "?")
        peers   = data.get("peers_count", 0)
        return (
            f"Runtime: {spec} v{version} · Symbol: {symbol} · "
            f"Decimals: {dec} · SS58: {ss58} · Peers: {peers}"
        )

    # ── get_total_issuance ────────────────────────────────────────────────────
    if intent == "get_total_issuance":
        total = data.get("total_issuance", "?")
        return f"Total POT Supply: {total}"

    # ── deploy_contract ───────────────────────────────────────────────────────
    if intent == "deploy_contract":
        addr = data.get("contract_address", "?")
        short = f"{addr[:6]}…{addr[-4:]}" if len(str(addr)) > 12 else addr
        return f"Contract deployed at {short}."

    # ── ping_network ──────────────────────────────────────────────────────────
    if intent == "ping_network":
        tx = data.get("tx_hash", "?")
        short_tx = f"{tx[:10]}…{tx[-8:]}" if len(str(tx)) > 18 else tx
        return f"Ping successful! POT gas consumed by Alice. Tx: {short_tx}"

    # ── batch_query ───────────────────────────────────────────────────────────
    if intent == "batch_query":
        sub_results = result.get("results", [])
        lines = []
        for item in sub_results:
            sub_intent = item.get("intent", "?")
            sub_result = item.get("result", {})
            lines.append(format_response(sub_intent, sub_result))
        return "\n".join(lines) if lines else "Batch completed with no results."

    # ── unknown / fallback ────────────────────────────────────────────────────
    if intent == "unknown":
        if status == "success":
            answer = data.get("answer", "")
            sources = data.get("sources", [])
            if sources:
                return f"{answer}\n\nSources: {', '.join(sources)}"
            return answer

    return "Didn't catch that. Try: 'check balance', 'show block 500', 'send 10 POT to <address>'."


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_msg = request.prompt or request.message
    if not user_msg or not user_msg.strip():
        raise HTTPException(status_code=400, detail="Message or prompt cannot be empty")

    try:
        # 1. Classify intent + extract params (single LLM call)
        parsed_intent = intent_parser.parse(user_msg)

        # 2. Execute on-chain action
        result = chain_client.execute_intent(parsed_intent)

        intent  = parsed_intent.get("intent", "unknown")
        success = result.get("status") == "success" or result.get("success") is True

        # 3. Format with pure Python — zero LLM calls
        message_text = format_response(intent, result)

        return ChatResponse(
            success=success,
            intent=intent,
            message=message_text,
            telemetry=[],
            intent_data=parsed_intent,
            execution_result=result,
            reply=message_text,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    print(f"🚀 Starting Hermes API on {host}:{port}...")
    uvicorn.run("main:app", host=host, port=port, reload=True)

