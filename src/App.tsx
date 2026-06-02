import { useMemo, useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import {
  useCurrentAccount,
  useCurrentNetwork,
  useCurrentWallet,
  useDAppKit,
} from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";

type StepStatus = "verified" | "pending" | "sealed";

type ProofStep = {
  label: string;
  description: string;
  status: StepStatus;
  hash: string;
};

type AnchorState = {
  digest: string;
  proofDigest: string;
  anchorDigest: string;
  walrusBlobId: string;
  walrusObjectId?: string;
  walrusEventDigest?: string;
  eventBytes: number[];
};

type WalrusStoreResult = {
  blobId: string;
  objectId?: string;
  endEpoch?: number;
  eventDigest?: string;
  status: "newlyCreated" | "alreadyCertified";
};

type WalrusStoreResponse =
  | {
      newlyCreated: {
        blobObject: {
          id: string;
          blobId: string;
          storage?: {
            endEpoch?: number;
          };
        };
      };
    }
  | {
      alreadyCertified: {
        blobId: string;
        endEpoch?: number;
        event?: {
          txDigest?: string;
        };
      };
    };

const initialSteps: ProofStep[] = [
  {
    label: "Intent",
    description: "Grant DAO asks an agent to screen an applicant against funding rules.",
    status: "verified",
    hash: "0x2f49...9c1a",
  },
  {
    label: "Evidence",
    description: "Proposal, GitHub activity, budget table, and conflict disclosures are bundled.",
    status: "verified",
    hash: "0x87da...41f0",
  },
  {
    label: "Reasoning",
    description: "Agent produces a signed rubric score with cited evidence and reversible notes.",
    status: "sealed",
    hash: "0x5b10...a63e",
  },
  {
    label: "Sui Receipt",
    description: "A testnet event anchors the real Walrus blob id, digest, signer, and policy.",
    status: "pending",
    hash: "0x---",
  },
];

const statusText: Record<StepStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  sealed: "Sealed",
};

function shortDigest(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
    hash |= 0;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x${hex.slice(0, 4)}...${hex.slice(-4)}`;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function shortAddress(address?: string) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function createProofPayload(scenario: string, signer: string) {
  const payload = {
    app: "walrus-proof-agent",
    network: "sui:testnet",
    scenario,
    signer,
    policy: "evidence-hash+signer+rubric-v1",
    evidence: [
      "proposal.pdf",
      "github-activity.json",
      "budget-table.csv",
      "conflict-disclosures.md",
    ],
    createdAt: new Date().toISOString(),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const digestBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));

  return {
    payload,
    proofDigest: `0x${bytesToHex(digestBytes)}`,
  };
}

async function createAnchorDigest(input: {
  proofDigest: string;
  signer: string;
  scenario: string;
  walrusBlobId: string;
  walrusObjectId?: string;
}) {
  const bytes = new TextEncoder().encode(JSON.stringify(input));
  const digestBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));

  return {
    anchorDigest: `0x${bytesToHex(digestBytes)}`,
    eventBytes: Array.from(digestBytes),
  };
}

async function storeProofOnWalrus(payload: unknown, signer: string): Promise<WalrusStoreResult> {
  const publisher = "https://publisher.walrus-testnet.walrus.space";
  const params = new URLSearchParams({
    epochs: "1",
    deletable: "true",
    send_object_to: signer,
  });
  const response = await fetch(`${publisher}/v1/blobs?${params}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload, null, 2),
  });

  if (!response.ok) {
    throw new Error(`Walrus upload failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as WalrusStoreResponse;

  if ("newlyCreated" in data) {
    return {
      status: "newlyCreated",
      blobId: data.newlyCreated.blobObject.blobId,
      objectId: data.newlyCreated.blobObject.id,
      endEpoch: data.newlyCreated.blobObject.storage?.endEpoch,
    };
  }

  return {
    status: "alreadyCertified",
    blobId: data.alreadyCertified.blobId,
    endEpoch: data.alreadyCertified.endEpoch,
    eventDigest: data.alreadyCertified.event?.txDigest,
  };
}

function App() {
  const [mode, setMode] = useState<"dao" | "trading" | "ops">("dao");
  const [sealed, setSealed] = useState(false);
  const [anchor, setAnchor] = useState<AnchorState | null>(null);
  const [anchorError, setAnchorError] = useState("");
  const [isAnchoring, setIsAnchoring] = useState(false);
  const account = useCurrentAccount();
  const wallet = useCurrentWallet();
  const network = useCurrentNetwork();
  const dAppKit = useDAppKit();

  const scenario = useMemo(() => {
    const labels = {
      dao: "DAO grant review",
      trading: "Autonomous market action",
      ops: "Incident response runbook",
    };
    return labels[mode];
  }, [mode]);

  const steps = useMemo(() => {
    if (!sealed) {
      return initialSteps;
    }

    return initialSteps.map((step) =>
      step.label === "Sui Receipt"
        ? {
            ...step,
            status: "verified" as const,
            hash: anchor?.digest ? shortDigest(anchor.digest) : shortDigest(`${scenario}-${Date.now()}`),
          }
        : step,
    );
  }, [anchor?.digest, scenario, sealed]);

  async function sealProofToSui() {
    if (!account) {
      setAnchorError("Connect Slush on testnet before anchoring a proof.");
      return;
    }

    setAnchorError("");
    setIsAnchoring(true);

    try {
      const proof = await createProofPayload(scenario, account.address);
      const walrus = await storeProofOnWalrus(proof.payload, account.address);
      const anchorDigest = await createAnchorDigest({
        proofDigest: proof.proofDigest,
        signer: account.address,
        scenario,
        walrusBlobId: walrus.blobId,
        walrusObjectId: walrus.objectId,
      });
      const tx = new Transaction();
      tx.moveCall({
        target: "0x2::event::emit",
        typeArguments: ["vector<u8>"],
        arguments: [tx.pure.vector("u8", anchorDigest.eventBytes)],
      });

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.FailedTransaction) {
        throw new Error(
          result.FailedTransaction.status.error?.message ?? "Sui transaction failed.",
        );
      }

      setSealed(true);
      setAnchor({
        digest: result.Transaction.digest,
        proofDigest: proof.proofDigest,
        anchorDigest: anchorDigest.anchorDigest,
        walrusBlobId: walrus.blobId,
        walrusObjectId: walrus.objectId,
        walrusEventDigest: walrus.eventDigest,
        eventBytes: anchorDigest.eventBytes,
      });
    } catch (error) {
      setAnchorError(error instanceof Error ? error.message : "Unable to anchor proof.");
    } finally {
      setIsAnchoring(false);
    }
  }

  return (
    <main className="app">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sui Overflow 2026 concept</p>
            <h1>Walrus Proof Agent</h1>
          </div>
          <div className="walletArea">
            <ConnectButton />
          </div>
        </header>

        <section className="summary">
          <div>
            <span className="badge">Active workflow</span>
            <h2>{scenario}</h2>
            <p>
              Convert agent decisions into durable Walrus evidence and a compact
              Sui receipt that any reviewer can verify before funds, trades, or
              approvals move.
            </p>
          </div>
          <div className="score">
            <strong>92</strong>
            <span>audit confidence</span>
          </div>
        </section>

        <section className="controls" aria-label="Workflow selector">
          <button className={mode === "dao" ? "active" : ""} onClick={() => setMode("dao")}>
            DAO review
          </button>
          <button className={mode === "trading" ? "active" : ""} onClick={() => setMode("trading")}>
            Trading agent
          </button>
          <button className={mode === "ops" ? "active" : ""} onClick={() => setMode("ops")}>
            Ops runbook
          </button>
        </section>

        <section className="grid">
          <div className="panel timeline">
            <div className="panelHeader">
              <h3>Proof trail</h3>
              <span>{steps.length} checkpoints</span>
            </div>
            <div className="steps">
              {steps.map((step) => (
                <article className="step" key={step.label}>
                  <div className={`dot ${step.status}`} />
                  <div>
                    <div className="stepTitle">
                      <h4>{step.label}</h4>
                      <span>{statusText[step.status]}</span>
                    </div>
                    <p>{step.description}</p>
                    <code>{step.hash}</code>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel inspector">
            <div className="panelHeader">
              <h3>Receipt preview</h3>
              <span>Walrus + Sui event</span>
            </div>
            <dl>
              <div>
                <dt>Wallet</dt>
                <dd>{wallet?.name ?? "Connect Slush"}</dd>
              </div>
              <div>
                <dt>Signer</dt>
                <dd>{shortAddress(account?.address)}</dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>{network}</dd>
              </div>
              <div>
                <dt>Walrus blob</dt>
                <dd>
                  {anchor?.walrusBlobId ? (
                    <a
                      href={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${anchor.walrusBlobId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {anchor.walrusBlobId}
                    </a>
                  ) : (
                    "Ready to upload proof JSON"
                  )}
                </dd>
              </div>
              {anchor?.walrusObjectId && (
                <div>
                  <dt>Walrus object</dt>
                  <dd className="mono">{anchor.walrusObjectId}</dd>
                </div>
              )}
              {anchor?.walrusEventDigest && (
                <div>
                  <dt>Certified event</dt>
                  <dd>
                    <a
                      href={`https://testnet.suivision.xyz/txblock/${anchor.walrusEventDigest}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortDigest(anchor.walrusEventDigest)}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt>Policy</dt>
                <dd>Evidence hash + signer + rubric version</dd>
              </div>
              <div>
                <dt>Retention</dt>
                <dd>90 days, renewable by reviewer quorum</dd>
              </div>
              <div>
                <dt>Verifier</dt>
                <dd>Anyone with the Walrus blob id and Sui transaction digest</dd>
              </div>
              {anchor && (
                <>
                  <div>
                    <dt>Proof digest</dt>
                    <dd className="mono">{anchor.proofDigest}</dd>
                  </div>
                  <div>
                    <dt>Anchor digest</dt>
                    <dd className="mono">{anchor.anchorDigest}</dd>
                  </div>
                  <div>
                    <dt>Testnet tx</dt>
                    <dd>
                      <a
                        href={`https://testnet.suivision.xyz/txblock/${anchor.digest}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortDigest(anchor.digest)}
                      </a>
                    </dd>
                  </div>
                </>
              )}
            </dl>
            <button className="primary" onClick={sealProofToSui} disabled={!account || isAnchoring}>
              {isAnchoring ? "Uploading and waiting for wallet..." : "Upload to Walrus + anchor on Sui"}
            </button>
            {anchorError && <p className="error">{anchorError}</p>}
          </aside>
        </section>
      </section>
    </main>
  );
}

export default App;
