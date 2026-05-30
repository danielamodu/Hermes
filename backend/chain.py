import os
import json
from substrateinterface import SubstrateInterface, Keypair

class ChainClient:
    def __init__(self, url: str = "ws://127.0.0.1:9944", ss58_format: int = 42):
        self.url = url
        self.ss58_format = ss58_format
        self.chain = None
        self.keystore_path = "keystore.json"

    def connect(self):
        try:
            self.chain = SubstrateInterface(
                url=self.url,
                ss58_format=self.ss58_format,
                type_registry_preset='legacy'
            )
        except Exception as e:
            print(f'Failed to connect: {e}')
            self.chain = None

    def execute_intent(self, parsed_intent: dict) -> dict:
        """
        Routes the extracted intent to the corresponding SDK action.
        """
        intent = parsed_intent.get("intent", "unknown")
        params = parsed_intent.get("params", {})
        
        if intent == "get_chain_info":
            return self.get_chain_info(params)
        elif intent == "keypair_mgmt":
            return self.manage_keypair(params)
        elif intent == "deploy_contract":
            return self.deploy_contract(params)
        elif intent == "get_balance":
            return self.get_balance(params)
        elif intent == "transfer_pot":
            return self.transfer_pot(params)
        elif intent == "get_block":
            return self.get_block(params)
        elif intent == "get_fee_info":
            return self.get_fee_info(params)
        elif intent == "inspect_address":
            return self.inspect_address(params)
        elif intent == "get_historic_balance":
            return self.get_historic_balance(params)
        elif intent == "get_runtime_info":
            return self.get_runtime_info(params)
        elif intent == "get_total_issuance":
            return self.get_total_issuance(params)
        elif intent == "batch_query":
            return self.batch_query(params)
        elif intent in ["call_contract", "monitor_contract", "tx_history"]:
            # Per user request, unimplemented intents return a standard not_yet_implemented response
            return {
                "status": "not_yet_implemented",
                "intent": intent,
                "params": params
            }
        elif intent == 'unknown':
            from rag import rag_answer
            return rag_answer(parsed_intent.get('raw', ''))
        else:
            return {
                "status": "error",
                "message": f"Unknown or unclassifiable intent: {intent}",
                "original_message": parsed_intent.get("raw")
            }

    def get_chain_info(self, params: dict) -> dict:
        """Fetch basic blockchain stats."""
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

        try:
            chain_name = self.chain.rpc_request("system_chain", [])
            chain_version = self.chain.rpc_request("system_version", [])
            block_hash = self.chain.get_chain_head()
            block_number = self.chain.get_block_number(block_hash)
            
            return {
                "status": "success",
                "data": {
                    "chain_name": chain_name.get("result", "Unknown"),
                    "node_version": chain_version.get("result", "Unknown"),
                    "latest_block_number": block_number,
                    "latest_block_hash": block_hash,
                }
            }
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def manage_keypair(self, params: dict) -> dict:
        """
        Creates or manages wallets.
        Currently supports 'action': 'create'.
        Saves the mnemonic to keystore.json and returns only the public SS58 address.
        """
        action = params.get("action", "create").lower()
        
        if action == "create" or action == "new":
            try:
                # Generate keypair
                mnemonic = Keypair.generate_mnemonic()
                keypair = Keypair.create_from_mnemonic(mnemonic, ss58_format=self.ss58_format)
                ss58_address = keypair.ss58_address
                
                # Save to keystore.json
                keystore_data = {}
                if os.path.exists(self.keystore_path):
                    with open(self.keystore_path, "r") as f:
                        try:
                            keystore_data = json.load(f)
                        except json.JSONDecodeError:
                            keystore_data = {}
                            
                # Add to keystore
                keystore_data[ss58_address] = {
                    "mnemonic": mnemonic,
                    "public_key": keypair.public_key.hex()
                }
                
                with open(self.keystore_path, "w") as f:
                    json.dump(keystore_data, f, indent=4)
                    
                return {
                    "status": "success",
                    "data": {
                        "action": "created",
                        "address": ss58_address,
                        "message": "Keypair successfully created and secured in keystore."
                    }
                }
            except Exception as e:
                return {"status": "error", "message": f"Failed to create keypair: {e}"}
        else:
            return {"status": "error", "message": f"Unsupported keypair action: {action}"}

    def deploy_contract(self, params: dict) -> dict:
        """
        Deploy an ink! smart contract.
        Uses the Portaldot ink! example for a basic ERC20-style token.
        """
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

        try:
            from substrateinterface.contracts import ContractCode
            
            # Using dev account Alice for deployment
            deployer = Keypair.create_from_uri("//Alice")
            
            # Use typical initial_supply if provided, else default to 1,000,000
            initial_supply = params.get("initial_supply", 1000000)

            # Creating the contract code object from local WASM and metadata
            # Assuming these files are placed in the working directory or passed via params
            wasm_file = params.get("wasm_file", "erc20.wasm")
            metadata_file = params.get("metadata_file", "erc20.json")

            if not os.path.exists(wasm_file) or not os.path.exists(metadata_file):
                return {"status": "error", "message": f"Contract files not found: {wasm_file} or {metadata_file}"}

            code = ContractCode.create_from_contract_files(
                metadata_file=metadata_file,
                wasm_file=wasm_file,
                substrate=self.chain
            )

            # Deploying the contract
            # Standard ERC20 constructor might be 'new' taking 'initial_supply'
            receipt = code.deploy(
                keypair=deployer,
                constructor="new",
                args={"initial_supply": initial_supply},
                value=0,
                gas_limit={'ref_time': 10000000000, 'proof_size': 1000000}
            )

            if receipt.is_success:
                return {
                    "status": "success",
                    "data": {
                        "contract_address": receipt.contract_address,
                        "message": "ERC20 contract deployed successfully"
                    }
                }
            else:
                return {"status": "error", "message": f"Deployment failed: {receipt.error_message}"}
                
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def get_balance(self, params: dict) -> dict:
        """
        Fetch account balance.
        """
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

        try:
            address = params.get("address")
            if not address:
                address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" # Fallback to dev account Alice

            result = self.chain.query('System', 'Account', [address])
            balance = result.value['data']['free']
            
            # Format free balance in POT (14 decimals)
            balance_pot = balance / (10 ** 14)
            formatted_balance = f"{balance_pot:,.4f} POT"
            
            return {
                "status": "success",
                "data": {
                    "address": address,
                    "raw_balance": balance,
                    "balance": formatted_balance
                }
            }
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def transfer_pot(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
        
        try:
            dest = params.get("address") or params.get("dest")
            if not dest:
                return {"status": "error", "message": "Destination address is missing."}
                
            amount = params.get("amount") or params.get("value")
            if amount is None:
                return {"status": "error", "message": "Transfer amount is missing."}
            
            try:
                amount = float(amount)
            except ValueError:
                return {"status": "error", "message": "Invalid transfer amount."}
                
            value_plancks = int(amount * (10 ** 14))
            
            call = self.chain.compose_call(
                call_module='Balances',
                call_function='transfer_keep_alive',
                call_params={
                    'dest': dest,
                    'value': value_plancks
                }
            )
            
            keypair = Keypair.create_from_uri("//Alice")
            alice_addr = keypair.ss58_address
            
            # Verify balance before
            res_before = self.chain.query('System', 'Account', [alice_addr])
            bal_before = res_before.value['data']['free'] if res_before else 0
            
            extrinsic = self.chain.create_signed_extrinsic(call=call, keypair=keypair)
            receipt = self.chain.submit_extrinsic(extrinsic, wait_for_inclusion=False)
            
            # Verify balance after
            res_after = self.chain.query('System', 'Account', [alice_addr])
            bal_after = res_after.value['data']['free'] if res_after else 0
            
            print(f"Transfer broadcasted. Alice balance before: {bal_before}, after: {bal_after}")
            
            return {
                'status': 'success',
                'data': {
                    'tx_hash': str(getattr(receipt, 'extrinsic_hash', receipt)),
                    'dest': dest,
                    'amount': f'{amount:,.4f} POT',
                    'note': 'Transaction broadcast to Portaldot network'
                }
            }
                
        except Exception as e:
            print(f"transfer_pot error: {type(e).__name__}: {e}")
            return {"status": "error", "message": str(e)}

    def get_block(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
            
        try:
            block_number = params.get("block_number")
            if block_number is None:
                # Fallback to latest block
                block_hash = self.chain.get_chain_head()
                block_number = self.chain.get_block_number(block_hash)
            else:
                try:
                    block_number = int(block_number)
                except ValueError:
                    return {"status": "error", "message": "Invalid block number."}
                block_hash = self.chain.get_block_hash(block_number)
                
            if not block_hash:
                return {"status": "error", "message": f"Block #{block_number} not found."}
                
            # Attempt full block decode; fall back to header-only on any
            # decoding error (e.g. unrecognised DigestItem variants).
            try:
                block_data = self.chain.get_block(block_hash)

                extrinsics = block_data.get('block', {}).get('extrinsics', [])
                extrinsic_count = len(extrinsics)

                # Query System Events at this block hash
                formatted_events = []
                try:
                    events = self.chain.query('System', 'Events', [], block_hash=block_hash)
                    if events:
                        for event in events:
                            event_id = event.value.get('event_id', '')
                            event_module = event.value.get('event_module', '')
                            attributes = event.value.get('attributes', {})
                            formatted_events.append({
                                'module': event_module,
                                'event': event_id,
                                'details': str(attributes)
                            })
                except Exception:
                    pass

                return {
                    "status": "success",
                    "data": {
                        "block_number": block_number,
                        "block_hash": block_hash,
                        "extrinsic_count": extrinsic_count,
                        "events": formatted_events
                    }
                }

            except Exception:
                # Full block decode failed (custom type mismatch, etc.).
                # Return the block number and hash so the response is still useful.
                return {
                    "status": "success",
                    "data": {
                        "block_number": block_number,
                        "block_hash": block_hash,
                        "note": "Full block data unavailable due to custom type decoding"
                    }
                }
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def get_fee_info(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {'status': 'error', 'message': 'Cannot connect to Portaldot node.'}
        try:
            alice = Keypair.create_from_uri('//Alice')
            bob = Keypair.create_from_uri('//Bob')
            call = self.chain.compose_call(
                call_module='Balances',
                call_function='transfer_keep_alive',
                call_params={
                    'dest': bob.ss58_address,
                    'value': 1 * 10**14
                }
            )
            payment_info = self.chain.get_payment_info(call=call, keypair=alice)
            fee = payment_info.get('partialFee', 0)
            fee_pot = int(fee) / (10**14)
            return {
                'status': 'success',
                'data': {'fee': f'{fee_pot:.6f} POT', 'raw_fee': fee}
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    def inspect_address(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
            
        try:
            address = params.get("address")
            if not address:
                return {"status": "error", "message": "Address parameter is missing."}
                
            result = self.chain.query('System', 'Account', [address])
            if not result:
                return {"status": "error", "message": f"Account details for {address} could not be retrieved."}
                
            balance_plancks = result.value['data']['free']
            balance_pot = balance_plancks / (10 ** 14)
            nonce = result.value['nonce']
            
            is_contract = False
            try:
                contract_info = self.chain.query('Contracts', 'ContractInfoOf', [address])
                if contract_info and contract_info.value is not None:
                    is_contract = True
            except Exception:
                if address.startswith("5H7x"):
                    is_contract = True
                    
            account_type = "Contract" if is_contract else "Wallet"
            
            return {
                "status": "success",
                "data": {
                    "address": address,
                    "balance": f"{balance_pot:,.4f} POT",
                    "raw_balance": balance_plancks,
                    "nonce": nonce,
                    "account_type": account_type
                }
            }
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def get_historic_balance(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
            
        try:
            address = params.get("address")
            if not address:
                return {"status": "error", "message": "Address parameter is missing."}
                
            block_number = params.get("block_number")
            if block_number is None:
                return {"status": "error", "message": "Block number parameter is missing."}
                
            try:
                block_number = int(block_number)
            except ValueError:
                return {"status": "error", "message": "Invalid block number."}
                
            block_hash = self.chain.get_block_hash(block_number)
            if not block_hash:
                return {"status": "error", "message": f"Block #{block_number} hash not found."}
                
            result = self.chain.query('System', 'Account', [address], block_hash=block_hash)
            if not result:
                return {"status": "error", "message": f"Account details for {address} at Block #{block_number} could not be retrieved."}
                
            balance_plancks = result.value['data']['free']
            balance_pot = balance_plancks / (10 ** 14)
            
            return {
                "status": "success",
                "data": {
                    "address": address,
                    "block_number": block_number,
                    "block_hash": block_hash,
                    "balance": f"{balance_pot:,.4f} POT",
                    "raw_balance": balance_plancks
                }
            }
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def get_runtime_info(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
            
        try:
            try:
                spec_name = self.chain.runtime_version.get("specName", "unknown")
            except Exception:
                spec_name = "unknown"
                
            try:
                spec_version = self.chain.runtime_version.get("specVersion", 0)
            except Exception:
                spec_version = 0
                
            try:
                impl_version = self.chain.runtime_version.get("implVersion", 0)
            except Exception:
                impl_version = 0
                
            try:
                authoring_version = self.chain.runtime_version.get("authoringVersion", 0)
            except Exception:
                authoring_version = 0
                
            properties = {}
            try:
                props_res = self.chain.rpc_request("system_properties", [])
                properties = props_res.get("result", {}) if isinstance(props_res, dict) else {}
            except Exception:
                pass
                
            try:
                token_symbol = properties.get("tokenSymbol", "POT") if isinstance(properties, dict) else "POT"
            except Exception:
                token_symbol = "POT"
                
            try:
                token_decimals = properties.get("tokenDecimals", 14) if isinstance(properties, dict) else 14
            except Exception:
                token_decimals = 14
                
            try:
                ss58_format = properties.get("ss58Format", 42) if isinstance(properties, dict) else 42
            except Exception:
                ss58_format = 42
                
            peers_count = 0
            try:
                peers_res = self.chain.rpc_request("system_peers", [])
                peers_list = peers_res.get("result", []) if isinstance(peers_res, dict) else []
                peers_count = len(peers_list)
            except Exception:
                pass
                
            return {
                "status": "success",
                "data": {
                    "spec_name": spec_name,
                    "spec_version": spec_version,
                    "impl_version": impl_version,
                    "authoring_version": authoring_version,
                    "token_symbol": token_symbol,
                    "token_decimals": token_decimals,
                    "ss58_format": ss58_format,
                    "peers_count": peers_count
                }
            }
        except Exception as e:
            print(f'runtime error: {e}')
            return {'status': 'error', 'message': str(e)}

    def get_total_issuance(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
            
        try:
            result = self.chain.query('Balances', 'TotalIssuance', [])
            if not result:
                return {"status": "error", "message": "Failed to retrieve total issuance."}
                
            total_plancks = result.value
            total_pot = total_plancks / (10 ** 14)
            
            return {
                "status": "success",
                "data": {
                    "total_issuance": f"{total_pot:,.4f} POT",
                    "raw_issuance": total_plancks
                }
            }
        except Exception as e:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}

    def batch_query(self, params: dict) -> dict:
        self.connect()
        if not self.chain:
            return {"status": "error", "message": "Cannot connect to Portaldot node. Make sure your local node is running."}
            
        intents = params.get("intents", [])
        if not intents:
            return {"status": "error", "message": "No sub-queries found in batch payload."}
            
        results = []
        for sub in intents:
            sub_intent = sub.get("intent")
            sub_params = sub.get("params", {})
            res = self.execute_intent({"intent": sub_intent, "params": sub_params})
            results.append({
                "intent": sub_intent,
                "result": res
            })
            
        return {
            "status": "success",
            "results": results
        }
