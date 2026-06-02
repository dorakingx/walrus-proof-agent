# Walrus Proof Agent

Walrus Proof Agent is a Sui Overflow 2026 prototype for turning autonomous agent decisions into verifiable audit trails.

The demo focuses on a high-value pattern: an AI agent handles a real-world workflow, stores its evidence bundle and reasoning artifacts in Walrus, then mints a compact Sui receipt so any reviewer can verify what happened before money, trades, or approvals move.

## Why Sui and Walrus

- Walrus stores the large evidence bundle, including documents, citations, model output, and replay metadata.
- Sui stores the compact proof receipt, with the Walrus blob id, evidence digest, signer, policy, and timestamp.
- Reviewers verify the receipt without trusting the agent UI.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Move prototype

The `move/` package sketches the Sui receipt object that would be deployed after the web demo is wired to a Sui wallet and Walrus upload flow.
