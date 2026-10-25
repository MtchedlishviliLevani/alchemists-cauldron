# Alchemist's Cauldron

A browser puzzle game: mix ingredients, match 3 target ranges and brew potions before time or lives run out.

Built for the [RS School Qualifying Stage](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron) with plain TypeScript. No frameworks, game engines or UI libraries.

**Live:** https://mtchedlishvililevani.github.io/alchemists-cauldron/

## Game goal

Every round shows a recipe with 3 target ranges: **Temperature**, **Density** and **Magic Power**. The player adds ingredients from the shelf to the cauldron. Each ingredient changes the 3 values. When the mix is inside all 3 ranges (with the difficulty tolerance), **Brew** succeeds: the player earns points and extra time, and a new recipe appears. A wrong brew costs a life.

The run ends when the time is up, all lives are lost, or the shelf runs out of ingredients. Every ingredient has a limited random stock, so ingredients have to be used carefully.

## Task set

The project is built step by step. Each stage builds on the previous one.

| Stage                      | What it adds                                                                      | Points | Total |
| -------------------------- | --------------------------------------------------------------------------------- | :----: | :---: |
| **Precondition — Story 1** | Repository setup, tooling, folder structure and quality checks                    |   58   |  58   |
| **Level 1 — Basic**        | One full playable game: shelf, cauldron, bars, recipes, timer, pause, leaderboard |  170   |  228  |
| **Level 2 — Extended**     | Difficulty selection and auto-save / Continue Game                                |   50   |  278  |
| **Level 3 — Full game**    | Drag & drop, tooltip, chemical reactions, Pour Out, keyboard shortcuts, effects   |  115   |  393  |

## Current state

**Story 1 — project setup** is done:

- Vite build with strict TypeScript
- ESLint and Prettier with no errors
- Husky hooks: commit message check on commit, lint and format check on push
- Folder structure that keeps game rules apart from rendering
- Typed ingredient catalogue and shared game types
- Start screen shell: empty shelf and cauldron, score and time at `0`, a disabled **Start Game** button

Gameplay (adding ingredients, brewing, timer, lives, leaderboard) comes with Level 1.

## How to play

1. Press **Start Game**. A random recipe appears with 3 target ranges.
2. Click ingredients on the shelf to add them to the cauldron. The 3 bars show the current mix.
3. Press **Brew** when all 3 values are inside the target ranges.
4. Keep brewing until the time runs out, all lives are lost, or the ingredients run out.

## Getting started

Requires Node.js 20 or newer.

```bash
git clone git@github.com:MtchedlishviliLevani/alchemists-cauldron.git
cd alchemists-cauldron
npm ci
npm run dev
```

| Script                 | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server                      |
| `npm run build`        | Type-check and build for production       |
| `npm run preview`      | Serve the production build locally        |
| `npm run lint`         | Run ESLint                                |
| `npm run lint:fix`     | Run ESLint and fix what it can            |
| `npm run format`       | Format all files with Prettier            |
| `npm run format:check` | Check formatting without changing files   |
| `npm run typecheck`    | Run the TypeScript compiler in check mode |

## Project structure

```text
src/
├── main.ts        # entry point: mounts the app
├── data/          # fixed game data (ingredients, later recipes, difficulty, reactions)
├── logic/         # pure game rules: sums, brew check, stock, timer
├── state/         # the game state object and its updates
├── storage/       # localStorage: save / continue and leaderboard
├── types/         # shared TypeScript types
├── ui/            # DOM rendering only, no game rules
├── styles/        # CSS with design tokens
└── assets/        # icons and images
```

## Repository workflow

- `main` holds released code only.
- `story-N` is the base branch for each story: `story-1` comes from `main`, `story-2` from `story-1`, and `story-3` from `story-2`.
- Each task is a `<type>/<short-description>` branch from the current story branch, merged back through a pull request.
- When a story is finished, an unmerged pull request from `story-N` into the previous branch is submitted for cross-check.

Commit messages follow the [RS School git convention](https://rs.school/docs/git-convention): `<type>: <subject>`, where type is one of `init`, `feat`, `fix`, `refactor`, `docs`, `style`, `test` or `chore`.
