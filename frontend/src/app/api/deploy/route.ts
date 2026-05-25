import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, command } = await request.json();

    // Check for process.env.PORTALDOT_MASTER_KEY
    if (!process.env.PORTALDOT_MASTER_KEY) {
      return NextResponse.json(
        { success: false, error: "Gas tank is uninitialized (missing PORTALDOT_MASTER_KEY)." },
        { status: 500 }
      );
    }

    // Error Pathway: If prompt or command strictly equals "error"
    if (prompt === "error" || command === "error") {
      return NextResponse.json(
        { success: false, error: "contracts.instantiateWithCode: Transaction reverted: InvalidInitializationArgs" },
        { status: 400 }
      );
    }

    // Simulate 1800ms of realistic network broadcast latency
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Generate mock blockchain artifacts
    // 64-character hex string for txHash
    const txHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    // 40-character hex string starting with "5H7x" for contractAddress
    const contractAddress = "5H7x" + Array.from({ length: 36 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    // Random block number between 85000 and 115000
    const blockNumber = Math.floor(Math.random() * (115000 - 85000 + 1)) + 85000;

    // Standard telemetry logging array
    const telemetry = [
      "[rpc] Handshake established with Portaldot local node (ws://127.0.0.1:9944)",
      "[keyring] Instantiated master key from secured environment variable",
      "[gas-tank] Deducting 0.0425 POT for storage deposit and execution fees",
      `[extrinsic] Transaction confirmed in Block #${blockNumber} (tx: 0x${txHash.substring(0, 8)}...)`
    ];

    // Success Pathway
    return NextResponse.json({
      success: true,
      txHash,
      contractAddress,
      blockNumber,
      gasUsed: "0.0425 POT",
      telemetry
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
