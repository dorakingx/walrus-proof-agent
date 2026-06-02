module walrus_proof_agent::proof_registry {
    use sui::clock::Clock;
    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    public struct ProofReceipt has key, store {
        id: UID,
        walrus_blob_id: vector<u8>,
        evidence_digest: vector<u8>,
        policy: vector<u8>,
        signer: address,
        created_ms: u64,
    }

    public struct ProofSealed has copy, drop {
        receipt: address,
        signer: address,
        created_ms: u64,
    }

    entry fun seal_proof(
        walrus_blob_id: vector<u8>,
        evidence_digest: vector<u8>,
        policy: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let signer = tx_context::sender(ctx);
        let receipt = ProofReceipt {
            id: object::new(ctx),
            walrus_blob_id,
            evidence_digest,
            policy,
            signer,
            created_ms: clock.timestamp_ms(),
        };
        let receipt_id = object::uid_to_address(&receipt.id);

        event::emit(ProofSealed {
            receipt: receipt_id,
            signer,
            created_ms: receipt.created_ms,
        });

        transfer::public_transfer(receipt, signer);
    }
}
