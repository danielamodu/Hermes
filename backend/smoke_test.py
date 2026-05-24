from intent_parser import IntentParser

p = IntentParser()

# Test cases
test_cases = [
    ("estimate fee for a transfer to 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "get_fee_info"),
    ("what is the transaction fee?", "get_fee_info"),
    ("cost to send 10 POT to 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "get_fee_info"),
    ("transfer 10 POT to 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "transfer_pot"),
]

for msg, expected in test_cases:
    res = p.parse(msg)
    intent = res["intent"]
    if intent == expected:
        print(f"PASS: '{msg}' -> {intent}")
    else:
        print(f"FAIL: '{msg}' -> {intent} (Expected: {expected})")
        exit(1)

print("All priority tests passed successfully!")
