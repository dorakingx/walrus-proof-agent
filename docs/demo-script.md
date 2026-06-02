# Two-Minute Demo Script

## 0:00-0:20 Problem

AI agents are starting to make decisions that affect money, approvals, and operations. The problem is that their evidence and reasoning are usually hidden in app logs, so reviewers cannot verify what happened after the fact.

## 0:20-0:40 Solution

Walrus Proof Agent stores the agent's evidence bundle on Walrus and mints a compact Sui `ProofReceipt`. The receipt binds the Walrus blob id, evidence digest, policy, signer, and timestamp.

## 0:40-1:25 Live Demo

Open the live demo. Connect Slush on Sui testnet. Publish the `ProofReceipt` package if needed. Choose `DAO review`. Click `Upload to Walrus + mint ProofReceipt`. Approve the transaction in Slush.

Point out the Walrus blob id, ProofReceipt object id, and Sui testnet transaction link.

## 1:25-1:50 Verification

Open the Walrus blob link to show the stored proof payload. Open the Sui transaction or object link to show that the receipt exists on testnet. The reviewer can verify this without trusting the frontend.

## 1:50-2:00 Why Sui And Walrus

Walrus is the durable data layer for large proof artifacts. Sui is the verifiable receipt layer. Together they make agent decisions auditable, portable, and reviewable.
