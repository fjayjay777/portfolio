/** How a finding was reached: what was observed, what it means, what changed, and what is still unproven. */
export type EvidenceChain = {
  evidence: { source: string; text: string }[]
  insight: string
  decision: string
  open: string
}

export type Finding = { title: string; chain: EvidenceChain }

function EvidenceChainList({ chain }: { chain: EvidenceChain }) {
  return (
    <dl className="evidence-chain" aria-label="Evidence chain">
      <div className="evidence-chain__step">
        <dt>Evidence</dt>
        <dd>
          <ul>
            {chain.evidence.map((item) => (
              <li key={item.text}>
                <span className="evidence-chain__source">{item.source}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </dd>
      </div>
      <div className="evidence-chain__step">
        <dt>Insight</dt>
        <dd>{chain.insight}</dd>
      </div>
      <div className="evidence-chain__step">
        <dt>Product decision</dt>
        <dd>{chain.decision}</dd>
      </div>
      <div className="evidence-chain__step evidence-chain__step--open">
        <dt>Not yet validated</dt>
        <dd>{chain.open}</dd>
      </div>
    </dl>
  )
}

/** Numbered research findings, each backed by its evidence chain. */
export function FindingsList({ findings }: { findings: Finding[] }) {
  return (
    <ol className="case-findings" aria-label="Research findings">
      {findings.map((finding, index) => (
        <li key={finding.title}>
          <span className="finding-index">0{index + 1}</span>
          <h3>{finding.title}</h3>
          <EvidenceChainList chain={finding.chain} />
        </li>
      ))}
    </ol>
  )
}
