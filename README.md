# Walrus Proof Agent

Walrus Proof Agent is a Sui Overflow 2026 prototype for turning autonomous agent decisions into verifiable audit trails.

The demo focuses on a high-value pattern: an AI agent handles a real-world workflow, stores its evidence bundle and reasoning artifacts in Walrus, then mints a compact Sui receipt so any reviewer can verify what happened before money, trades, or approvals move.

## Why Sui and Walrus

- Walrus stores the large evidence bundle, including documents, citations, model output, and replay metadata.
- Sui stores the compact proof receipt, with the Walrus blob id, evidence digest, signer, policy, and timestamp.
- Reviewers verify the receipt without trusting the agent UI.

## Current testnet flow

The web app now supports a first real Sui testnet anchor:

1. Connect Slush on Sui testnet.
2. Click `Publish ProofReceipt package` once. The app publishes the compiled Move package from the browser wallet and stores the package id locally.
3. Choose a workflow scenario.
4. Click `Upload to Walrus + mint ProofReceipt`.
5. The app uploads the proof payload to the Walrus Testnet publisher HTTP API.
6. The app hashes `proofDigest + Walrus blob id + signer` and calls `proof_registry::seal_proof`.
7. The UI shows the Walrus blob id, ProofReceipt object id, Sui transaction digest, and verification links.

If the package is not published yet, the app can still fall back to the earlier deterministic 1 MIST anchor transfer. The preferred judging demo is the ProofReceipt package path.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Requirements

- Node.js 22+
- Slush browser extension
- Testnet SUI for gas

## Move prototype

The `move/` package sketches the Sui receipt object that would be deployed after the web demo is wired to a Sui wallet and Walrus upload flow.
