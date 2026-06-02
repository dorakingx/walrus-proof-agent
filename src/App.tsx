import { useMemo, useState } from "react";

type StepStatus = "verified" | "pending" | "sealed";

type ProofStep = {
  label: string;
  description: string;
  status: StepStatus;
  hash: string;
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
    description: "A compact proof object records the Walrus blob id, digest, signer, and policy.",
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

function App() {
  const [mode, setMode] = useState<"dao" | "trading" | "ops">("dao");
  const [sealed, setSealed] = useState(false);

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
            hash: shortDigest(`${scenario}-${Date.now()}`),
          }
        : step,
    );
  }, [scenario, sealed]);

  return (
    <main className="app">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sui Overflow 2026 concept</p>
            <h1>Walrus Proof Agent</h1>
          </div>
          <button className="connect">Connect Sui Wallet</button>
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
            </dl>
            <button className="primary" onClick={() => setSealed(true)}>
              Seal proof to Sui
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default App;
