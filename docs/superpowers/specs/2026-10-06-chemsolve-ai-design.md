# ChemSolve AI — Design Spec

## Purpose
A premium, educational, AI-powered chemistry solver web app. Users type chemistry
questions (Vietnamese/English), upload images (OCR), balance equations, and run
deterministic chemistry tools. Chemistry correctness > visuals; every numeric
answer is computed by the deterministic engine and verified, never invented.

## Stack
- React 18 + Vite + TypeScript, Vitest for tests
- tesseract.js for client-side OCR
- CSS custom properties + `data-theme` attribute for dark/light mode
- No backend. No API keys. All computation client-side.
- Routing: lightweight state-based router (no react-router dependency)

## Architecture
```
src/
  chem/
    data/periodicTable.ts  // ~118 elements: symbol,name,Z,mass,group,period,category,electron config,oxidation states,EN,mp,bp,density,uses
    data/ions.ts           // common ions, valencies
    data/constants.ts      // NA, R, molar volume 22.4L, Kw...
    data/solubility.ts     // basic solubility rules
    parser.ts              // formula parser: subscripts, parentheses, charges, states (s)(l)(g)(aq)
    balancer.ts            // molecular/ionic/redox balancing; never changes formulas; returns counts before/after + verification
    formulas.ts            // molar mass, moles, mass, particles, gas volume, C, CM, dilution, mixing, yield, purity, pH, pOH, Ka/Kb, buffer, titration, redox electrons, empirical/molecular formula, thermo, electrochem, unit conversions
    solver.ts              // intent detection (vi/en) -> structured Solution { interpretation, given, find, equations, formulas, conversions, steps, answer, verification }
  ocr/ocrService.ts        // tesseract.js wrapper; returns {text, confidence}; low confidence -> confirm UI
  ai/chat.ts               // chat orchestration: explain simpler, detailed, only answer, check my answer, follow-ups
  components/              // Layout, Home, Solver, Tools, PeriodicTable, History, Settings, Formula (sub/sup renderer), AnswerCards, ElementModal
  state/AppContext.tsx     // theme, language, history (localStorage)
  App.tsx                  // nav router
  main.tsx, styles.css
tests/                     // vitest unit tests
```

## Key behaviors
- Balancer: parse both sides, build element matrix incl. charges, solve integer
  coefficients via nullspace/rational solve, verify counts & charge.
- Solver: regex/heuristic intent detection for the topic list; if not solvable,
  responds with what information is missing.
- OCR: accept jpg/jpeg/png/webp, drag-drop, paste; tesseract.js; if confidence
  < 80 or formula markers ambiguous, show detected text for user confirmation.
- Chat: buttons "Giải thích đơn giản hơn", "Trình bày chi tiết", "Chỉ hiện đáp án",
  "Kiểm tra đáp án của tôi".
- History & settings persisted in localStorage; copy answer/equation buttons.
- Periodic table: CSS grid by group/period, search + category filter, click modal.
- Accessibility: labels, aria, focus states, keyboard nav, good contrast both themes.
- i18n: default Vietnamese, English toggle.

## Testing (Vitest)
1. Balance H2 + O2 -> H2O  =>  2H2 + O2 -> 2H2O
2. Fe + O2 -> Fe2O3  =>  4Fe + 3O2 -> 2Fe2O3
3. KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O  =>  2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O
4. NaOH + HCl -> NaCl + H2O  =>  1:1:1:1
5. Molar mass, moles, concentration, pH, stoichiometry, limiting reagent, unit conversions, invalid equations

## Non-goals
- No server, no real LLM calls, no image generation.
- Diagrams parsing is best-effort only.
