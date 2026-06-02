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
2. Choose a workflow scenario.
3. Click `Upload to Walrus + anchor on Sui`.
4. The app uploads the proof payload to the Walrus Testnet publisher HTTP API.
5. The app hashes `proofDigest + Walrus blob id + signer` and emits that anchor digest as a `sui::event::emit<vector<u8>>` event.
6. The UI shows the Walrus blob id, Walrus object id when available, Sui transaction digest, and verification links.

This is the bridge from prototype to real demo. The next milestone is deploying the custom `ProofReceipt` Move package so the anchor is stored as a first-class Sui object rather than a generic event.

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
