# ChemSolve AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended: Native) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build a complete, production-quality chemistry solver SPA (ChemSolve AI) with deterministic chemistry engine, equation balancer, AI-style chat solver (vi/en), OCR image input, 17 tools, interactive periodic table, history, dark/light themes, and Vitest tests.

**Architecture:** React + Vite + TS SPA, no backend. Deterministic chemistry engine in `src/chem/`, chat orchestration in `src/ai/`, OCR via tesseract.js in `src/ocr/`, state via React context + localStorage. All numeric answers computed and verified by the engine.

**Tech Stack:** React 18, Vite, TypeScript, Vitest, tesseract.js

**Spec:** docs/superpowers/specs/2026-10-06-chemsolve-ai-design.md

## Global Constraints
- No API keys in frontend; no backend calls; all solving deterministic/offline.
- Never change user's formulas while balancing; never invent missing values; verification claimed only when actually checked.
- Default language Vietnamese, with English toggle.
- Support JPG/JPEG/PNG/WEBP upload, drag-drop, paste.
- Responsive desktop/laptop/tablet/mobile; accessible (labels, aria, focus, contrast).
- Show verified only when counted programmatically.

## Review Focus
1. Invalid equation (e.g. "H2 + O2 -> H2O5" or "xyz") must error gracefully, not crash → balancer validation tests.
2. OCR low-confidence text must be shown for confirmation, not silently solved → ocrService confidence test.
3. Charged/polyatomic ions with parentheses and charges must parse correctly → parser tests.
4. Units must be consistent; gas problems assume đktc 22.4 L unless stated → formula tests.
5. Solver must flag unsolvable/incomplete problems instead of guessing → solver tests.

---

### Task 1: Scaffold Vite + React + TS project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `vitest.config.ts`

- [ ] Run `npm create vite@latest . -- --template react-ts` in Codex dir (non-empty? use --force/merge)
- [ ] `npm install`; add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `tesseract.js`
- [ ] Configure vitest environment jsdom, setup file
- [ ] Run `npm run dev` smoke check (port responds), `npm run build` passes

### Task 2: Chemistry data layer

**Files:**
- Create: `src/chem/data/constants.ts`, `src/chem/data/periodicTable.ts`, `src/chem/data/ions.ts`, `src/chem/data/solubility.ts`, `tests/chem/data.test.ts`

- [ ] Write failing test: `getElement('Fe')` returns Z 26, mass ~55.845; `getElementByNumber(8)` is O; NA ≈ 6.022e23; R = 0.082; Vm = 22.4
- [ ] Implement data files (full periodic table with fields from spec)
- [ ] Run tests → pass

### Task 3: Formula parser

**Files:**
- Create: `src/chem/parser.ts`, `tests/chem/parser.test.ts`

- [ ] Failing tests: parse `H2O` → {H:2,O:1}; `Ca(OH)2` → {Ca:1,O:2,H:2}; `Fe2(SO4)3`; `SO4^2-` charge -2; state `(aq)` parsed; molar mass of H2SO4 ≈ 98
- [ ] Implement `parseFormula(formula: string): { elements: Record<string, number>, charge: number }` and `formulaMolarMass(formula): number`
- [ ] Invalid input returns error result, not throw
- [ ] Tests pass

### Task 4: Equation balancer

**Files:**
- Create: `src/chem/balancer.ts`, `tests/chem/balancer.test.ts`

- [ ] Failing tests:
  - `H2 + O2 -> H2O` → `2H2 + O2 -> 2H2O`
  - `Fe + O2 -> Fe2O3` → `4Fe + 3O2 -> 2Fe2O3`
  - `KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O` → `2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O`
  - `NaOH + HCl -> NaCl + H2O` → coefficients [1,1,1,1]
  - invalid equation throws/returns error
  - charged equation `Fe^3+ + e^- ...` balances with charge conservation
- [ ] Implement `balanceEquation(eq: string): BalancedEquation` — parse sides, build element/charge conservation matrix, solve rational nullspace, scale to smallest integers, verify atom & charge counts
- [ ] Also return `atomsBefore/after` for explainer
- [ ] Tests pass

### Task 5: Calculation formulas

**Files:**
- Create: `src/chem/formulas.ts`, `tests/chem/formulas.test.ts`

- [ ] Failing tests: molarMass H2SO4≈98, NaOH=40; moles n=m/M; gas V=n*22.4; C=n/V; dilution C1V1=C2V2; pH of 0.01M HCl = 2; pOH=12; percentYield; limiting reagent (e.g. 2H2+O2 with given moles); concentration mixing; unit conversion g↔mol, L↔mL
- [ ] Implement each deterministic function returning `{ value, unit, steps: string[] }`
- [ ] Tests pass

### Task 6: Solver (intent detection + structured solution)

**Files:**
- Create: `src/chem/solver.ts`, `tests/chem/solver.test.ts`

- [ ] Failing tests: "Balance H2 + O2 -> H2O" → topic balance, answer contains 2H2; "What is the pH of 0.01 M HCl?" → ph, 2; "Cho 5.6g Fe phản ứng với HCl. Tính thể tích H2 ở đktc." → detected stoichiometry result 2.24 L (Fe + 2HCl); unsolvable → missingInfo message; unknown language handled
- [ ] Implement `solveQuestion(input: string): Solution` with structured sections (interpretation, given, find, equation, formulas, conversions, steps, answer, verification)
- [ ] Tests pass

### Task 7: App shell, theme, i18n, context

**Files:**
- Create: `src/state/AppContext.tsx`, `src/i18n.ts`, `src/components/Layout.tsx`, update `src/App.tsx`, `src/styles.css`

- [ ] Theme toggle (dark/light) persisted; language toggle vi/en; nav: Home, AI Solver, Tools, Periodic Table, History, Settings
- [ ] Responsive layout, mobile nav
- [ ] Build passes; manual smoke in browser

### Task 8: Home page

**Files:** `src/components/Home.tsx`

- [ ] Hero "Your AI Chemistry Solver", subtitle, large input, Solve / Upload Image / Equation Balancer buttons, clickable example questions that route to Solver with prefilled input
- [ ] Accessible labels, responsive

### Task 9: Solver chat UI

**Files:** `src/components/SolverPage.tsx`, `src/ai/chat.ts`, `src/components/AnswerCards.tsx`, `src/components/FormulaText.tsx`

- [ ] Chat messages, text input, image upload (drag/drop/paste), clear conversation, copy answer/equation, regenerate, follow-up quick actions (explain simpler / detailed / only answer / check my answer)
- [ ] Render Solution via AnswerCards: Detected problem, equation, given, formula, calculation, explanation, final answer, verification (✓ Verified / ⚠ Needs more information)
- [ ] FormulaText renders subscripts/superscripts/charges
- [ ] Build passes

### Task 10: Tools section

**Files:** `src/components/Tools.tsx`, `src/components/tools/*.tsx` (one per tool)

- [ ] 17 tools: balancer, molar mass, mole, stoichiometry, concentration, dilution, pH, gas, percent yield, limiting reagent, oxidation number, redox balancer, empirical formula, molecular formula, solution mixing, titration, thermochemistry, electrochemistry, unit converter
- [ ] Each tool: clean form, uses `src/chem/*`, shows step-by-step result + verification
- [ ] Build passes

### Task 11: Periodic table

**Files:** `src/components/PeriodicTable.tsx`, `src/components/ElementModal.tsx`

- [ ] Grid by period/group, color by category, search by name/symbol/number, filter by category, click → modal with full element details, responsive (horizontal scroll on mobile), accessible

### Task 12: History & Settings

**Files:** `src/components/HistoryPage.tsx`, `src/components/SettingsPage.tsx`

- [ ] History lists past solved questions from localStorage, click to view, clear history
- [ ] Settings: theme, language, defaults

### Task 13: OCR integration

**Files:** `src/ocr/ocrService.ts`, `src/components/DropZone.tsx`

- [ ] tesseract.js recognize on image upload; returns text+confidence; if confidence < 80 → show detected text editor for user confirmation; on confirm, feed to solver
- [ ] Handle drag/drop/paste/jpeg/png/webp

### Task 14: Verification & polish

- [ ] Run `npx vitest run` — all pass
- [ ] `npm run build` — no errors
- [ ] `npm run dev` — manual test main flows (home, solve balance, solve pH, stoichiometry vi, tools, periodic table modal, theme toggle, mobile width)
- [ ] Fix console errors, accessibility labels, horizontal overflow
- [ ] Remove dead code; final report
