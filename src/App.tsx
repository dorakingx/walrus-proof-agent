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
  eventBytes: number[];
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
    description: "A testnet event anchors the Walrus blob id, digest, signer, and policy.",
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
    walrusBlobId: "wal://grant-review/epoch-18",
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
    eventBytes: Array.from(digestBytes),
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
      const tx = new Transaction();
      tx.moveCall({
        target: "0x2::event::emit",
        typeArguments: ["vector<u8>"],
        arguments: [tx.pure.vector("u8", proof.eventBytes)],
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
        eventBytes: proof.eventBytes,
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
              <span>Sui object</span>
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
                <dd>wal://grant-review/epoch-18</dd>
              </div>
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
                <dd>Anyone with the Sui object id</dd>
              </div>
              {anchor && (
                <>
                  <div>
                    <dt>Proof digest</dt>
                    <dd className="mono">{anchor.proofDigest}</dd>
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
              {isAnchoring ? "Waiting for wallet..." : "Seal proof to Sui testnet"}
            </button>
            {anchorError && <p className="error">{anchorError}</p>}
          </aside>
        </section>
      </section>
    </main>
  );
}

export default App;
