import { solveQuestion } from '../chem/solver'
import type { Solution } from '../chem/solver'

export type Mode = 'full' | 'simpler' | 'detailed' | 'onlyAnswer'

export interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  solution?: Solution
  mode?: Mode
}

export function answerFor(input: string, mode: Mode = 'full', prev?: Solution): ChatMessage {
  const s = solveQuestion(input, prev)
  return { role: 'bot', text: s.answer, solution: s, mode }
}

export function applyAction(solution: Solution | undefined, action: Mode): ChatMessage | null {
  if (!solution) return null
  return { role: 'bot', text: solution.answer, solution, mode: action }
}

export function checkAnswer(lastSolution: Solution | undefined, userAnswer: string): ChatMessage {
  if (!lastSolution) return { role: 'bot', text: 'No active problem to check.' }
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase()
  const expected = norm(lastSolution.answer)
  const given = norm(userAnswer)
  const correct = expected.includes(given) && given.length > 0
  return {
    role: 'bot',
    text: correct ? '✓ Correct!' : `✗ Not quite. Expected: ${lastSolution.answer}`,
    solution: lastSolution,
    mode: 'full',
  }
}
