# Sui Overflow Submission Checklist

## Project

- Name: Walrus Proof Agent
- Track: Walrus
- Live demo: https://walrus-proof-agent.vercel.app
- Repository: https://github.com/dorakingx/walrus-proof-agent

## One-Sentence Pitch

Walrus Proof Agent stores AI-agent evidence and reasoning on Walrus, then mints a Sui `ProofReceipt` so reviewers can verify agent decisions without trusting the application UI.

## What To Submit

- Live demo URL
- GitHub repository
- Short project description
- Track: Walrus
- ProofReceipt package id from the successful testnet run
- Walrus blob id from the successful testnet run
- ProofReceipt object id from the successful testnet run
- Sui testnet transaction digest from the successful testnet run
- Optional 2-minute demo video

## Judge Demo Flow

1. Open the live demo.
2. Connect Slush on Sui testnet.
3. Click `Publish ProofReceipt package` if no package id is shown.
4. Select `DAO review`.
5. Click `Upload to Walrus + mint ProofReceipt`.
6. Approve the Slush transaction.
7. Open the Walrus blob link.
8. Open the Sui transaction link.
9. Open the ProofReceipt object link.

## Why This Should Score

- It uses Walrus for the large proof payload rather than treating Walrus as decorative storage.
- It uses Sui for a compact, verifiable receipt object.
- The demo creates real testnet artifacts that reviewers can inspect.
- The use case is a practical agentic workflow: DAO grant review with auditable evidence.

## Remaining Roadmap

- Replace the demo proof payload with uploaded PDFs, CSVs, and model traces.
- Add receipt lookup by transaction digest or object id.
- Add a verification CLI that recomputes the digest from a Walrus blob.
- Deploy the package to mainnet after testnet review.
