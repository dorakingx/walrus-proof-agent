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
- ProofReceipt package id from the successful testnet run: `0xa3e9a77c772f1cc588fd2f1e3c7d5dc99965ab3c5f183f88fbf240c36c4fab6a`
- Walrus blob id from the successful testnet run: `Chb7kXNYNRDpbnrh7nQOjmqUefQwlmu0Rn69NBF7sYM`
- Walrus object id from the successful testnet run: `0xbdb198ab7638e3f6ab5bac75c61bc1f0532661126469a9abdffb8fd38dfaf55d`
- ProofReceipt object id from the successful testnet run: `0x062ced55fdcd412c92bb24f6a8398362f20e4504d3c3dd8c7f7ff41d84bc4fb5`
- Sui testnet transaction digest from the successful testnet run: `GJagYAYMN9oq5dNnJdbo4NZeDneX3s6vG6YUEPmY9PhE`
- Optional demo video: `outputs/walrus-proof-agent-hybrid-demo.mov`

## Successful Testnet Run

- ProofReceipt package: `0xa3e9a77c772f1cc588fd2f1e3c7d5dc99965ab3c5f183f88fbf240c36c4fab6a`
- Walrus blob: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/Chb7kXNYNRDpbnrh7nQOjmqUefQwlmu0Rn69NBF7sYM`
- Walrus object: `0xbdb198ab7638e3f6ab5bac75c61bc1f0532661126469a9abdffb8fd38dfaf55d`
- ProofReceipt object: `https://testnet.suivision.xyz/object/0x062ced55fdcd412c92bb24f6a8398362f20e4504d3c3dd8c7f7ff41d84bc4fb5`
- Testnet transaction: `https://testnet.suivision.xyz/txblock/GJagYAYMN9oq5dNnJdbo4NZeDneX3s6vG6YUEPmY9PhE`
- Proof digest: `0x6c4fcac6eb81ad1727b7ada9fc74becb6614838a0f690955b7e742508a4e6df0`
- Anchor digest: `0x91e7fc86dec9d73fe26d5971f08f07eaddab64010b762c651a2ff813897e6246`

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
