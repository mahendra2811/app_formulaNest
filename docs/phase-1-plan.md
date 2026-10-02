# Phase 1 implementation plan

The three supplied planning files are the requirements. The primary prompt takes precedence. The repository was empty apart from `planning `; no existing application can be reused.

## Architecture

- Expo, strict TypeScript, Expo Router with Home/Learn/Practice/Search/Library tabs and stack detail routes.
- expo-sqlite migrations, transactional validated seed imports, normalized audience and hierarchy mappings. Parameterized filtered queries; bounded content lists. Educational records never enter Zustand.
- Zustand with AsyncStorage for onboarding, selected subjects, theme, and quick/learn preference. SQLite owns bookmarks, recent items, revision, and persisted test sessions/answers.
- TypeScript source content validated before import; four chapters, two subjects, 29 formulas, 11 notes, 24 questions, three sheets.
- Native text equations, accessible React Native styles, system/light/dark themes, native text sharing and clipboard.

## Implementation order

1. Compatible Expo foundation and source contracts.
2. Sample dataset and validation; migrations/import and repository queries.
3. Reusable UI, database provider, preference hydration, onboarding and theme.
4. Personalized home, hierarchy, formula/note details and sheets.
5. Search, library, revision, practice, generated tests and results.
6. Meaningful validation/database/scoring tests, typecheck/lint/Expo validation/export, runtime checks and documentation.

## Decisions and risks

The user explicitly authorizes execution without architecture checkpoints. No deployment is requested. NativeWind is optional and is omitted to keep compatibility simple. Unicode text equations have no remote renderer dependency. Sample content is intentionally limited; unsupported boards, streams, classes and exams show coming-soon states. Web SQLite requires WASM bundling and cross-origin isolation; configure these for browser acceptance testing. Native device acceptance depends on available Android tooling. No Phase 2 work is permitted.

Use the affordable coding model for bounded data implementation and the primary reasoning model for architecture/integration. Record verification evidence in `docs/phase-1-verification.md`.
