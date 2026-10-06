import React from 'react'
import type { Solution } from '../chem/solver'
import { FormulaText } from './FormulaText'

export default function AnswerCards({ solution, mode }: { solution: Solution; mode: 'full' | 'simpler' | 'detailed' | 'onlyAnswer' }) {
  if (mode === 'onlyAnswer') {
    return (
      <div className="card">
        <h3>Đáp án / Answer</h3>
        <FormulaText text={solution.answer} />
        <p>{solution.verified ? '✓ Verified' : '⚠ Needs more information'}</p>
      </div>
    )
  }
  const steps = mode === 'simpler' ? solution.steps.slice(0, 2) : solution.steps
  return (
    <div>
      <div className="card"><h3>Detected problem</h3><p>{solution.interpretation}</p></div>
      {solution.equation && <div className="card"><h3>Chemical equation</h3><FormulaText text={solution.equation} /></div>}
      {solution.given.length > 0 && (
        <div className="card"><h3>Given data</h3><ul>{solution.given.map((g, i) => <li key={i}><FormulaText text={g} /></li>)}</ul></div>
      )}
      {solution.formula && <div className="card"><h3>Formula</h3><p>{solution.formula}</p></div>}
      {steps.length > 0 && (
        <div className="card"><h3>Calculation</h3><ol>{steps.map((s, i) => <li key={i}><FormulaText text={s} /></li>)}</ol></div>
      )}
      <div className="card"><h3>Final answer</h3><p><strong><FormulaText text={solution.answer} /></strong></p></div>
      <div className="card"><h3>Verification</h3><p>{solution.verified ? '✓ Verified' : '⚠ Needs more information'}</p><p>{solution.verification}</p></div>
      {solution.missingInfo && <div className="card"><h3>⚠ {solution.missingInfo}</h3></div>}
    </div>
  )
}
