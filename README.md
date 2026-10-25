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

## Implemented

**Precondition — project setup**

- Vite build with strict TypeScript, ESLint and Prettier with no errors
- Husky hooks: commit message check on commit, lint and format check on push
- Folder structure that keeps game rules (`logic/`, `state/`, `storage/`) apart from rendering (`ui/`)

**Level 1 — one full playable game (Medium rules)**

- **Shelf & cauldron:** 6 ingredient cards with the 3 numbers and a random stock of 2–15. Each add costs 1 stock; an empty slot stays in place, dimmed, and can't be used. The cauldron holds up to 4 ingredients in the order they were added.
- **Parameter bars:** Temperature, Density and Magic Power update after every add, with smooth transitions, a 0 centre line for signed values, the recipe target zone, a value marker and a green glow when the value fits.
- **Recipes & Brew:** a random Medium recipe from the 20-recipe table and the counter `Ingredients: n / 4`. Brew checks every value against the range ±8: success gives +200 points, +10 s (up to 150 s) and a new recipe; failure costs a life. Ingredients are spent either way.
- **Timer & Game Over:** 150 s and 3 lives. Time is computed from timestamps and turns red and pulses under 15 s. The game ends at 00:00, with 0 lives, or when ingredients run out, and shows the reason, the final score and **Play again**.
- **Pause:** the Pause button or a hidden tab stops the timer and blurs the field; the dialog offers **Resume** and **Exit to Menu**.
- **Leaderboard:** a Top-10 list in `localStorage`. A qualifying score asks for a name (2–15 characters: letters, digits, space, `_`, `-`). Dates use `DD.MM.YYYY HH:MM`, and on equal scores the earlier result stays higher. **Clear Leaderboard** asks for confirmation in an in-app dialog. Broken saved data never crashes the game.

## How to play

1. Press **Start Game**. A random recipe appears with 3 target ranges, and the shelf fills with ingredients.
2. Click ingredients on the shelf to add them to the cauldron (up to 4). The 3 bars show the current mix and glow green when a value is inside its target zone.
3. Press **Brew**. If all 3 values are inside the zones (±8), you score 200 points and gain 10 seconds; otherwise you lose a life. Used ingredients are gone either way.
4. Keep brewing until the time runs out, all lives are lost, or the ingredients run out.
5. Use **Pause** at any time. A Top-10 score can be saved to the **Leaderboard**.

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
├── data/          # fixed game data: ingredients, recipes, difficulty, bar scales
├── logic/         # pure game rules: stock, sums, brew check, recipes, timer, leaderboard
├── state/         # the store that holds the game state
├── storage/       # localStorage access for the leaderboard
├── types/         # shared TypeScript types
├── ui/            # DOM rendering and dialogs only, no game rules
├── styles/        # CSS with design tokens
└── assets/        # icons and images
```

## Repository workflow

- `main` holds released code only.
- `story-N` is the base branch for each story: `story-1` comes from `main`, `story-2` from `story-1`, and `story-3` from `story-2`.
- Each task is a `<type>/<short-description>` branch from the current story branch, merged back through a pull request.
- When a story is finished, an unmerged pull request from `story-N` into the previous branch is submitted for cross-check.

Commit messages follow the [RS School git convention](https://rs.school/docs/git-convention): `<type>: <subject>`, where type is one of `init`, `feat`, `fix`, `refactor`, `docs`, `style`, `test` or `chore`.
