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
- Walrus blob id from the successful testnet run: `1obXQfVEnVz9t2lA2RTJSEVdy-o83VUkx27rgbKkX6M`
- Walrus object id from the successful testnet run: `0xa1ef0782a603f233bdee115363d80b55952a9ae249ea9ebc31ca62b9a2c8bba0`
- ProofReceipt object id from the successful testnet run: `0x20440d2307718b28efa4ba263bd04d2b698ce49f313b68028d1aea54fdcad572`
- Sui testnet transaction digest from the successful testnet run: `DgzmaWF17k9Mre3tvYYyZoZ5rKhqLvY9qQ6NExqajvUE`
- Optional demo video: `outputs/walrus-proof-agent-demo.mov`

## Successful Testnet Run

- ProofReceipt package: `0xa3e9a77c772f1cc588fd2f1e3c7d5dc99965ab3c5f183f88fbf240c36c4fab6a`
- Walrus blob: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/1obXQfVEnVz9t2lA2RTJSEVdy-o83VUkx27rgbKkX6M`
- Walrus object: `0xa1ef0782a603f233bdee115363d80b55952a9ae249ea9ebc31ca62b9a2c8bba0`
- ProofReceipt object: `https://testnet.suivision.xyz/object/0x20440d2307718b28efa4ba263bd04d2b698ce49f313b68028d1aea54fdcad572`
- Testnet transaction: `https://testnet.suivision.xyz/txblock/DgzmaWF17k9Mre3tvYYyZoZ5rKhqLvY9qQ6NExqajvUE`
- Proof digest: `0x8f02754e246d2129a71e39265675a1da3de1693b7db1decb7bd8354c1e6db55d`
- Anchor digest: `0x41e88f3ec6ec7c119ff02830f64d0d01a642e058720aa45a547f47defe1dd307`

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
