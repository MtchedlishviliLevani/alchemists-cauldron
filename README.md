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

**Level 2 — difficulty and save**

- **Difficulty selection:** **Settings** on the start screen opens the difficulty panel with **Easy**, **Medium** and **Hard**. Every number comes from one settings table (shelf size, cauldron limit, start time, tolerance, lives, score, time bonus, reactions); **Medium** keeps the Level 1 rules. Recipes come only from the chosen difficulty, and the difficulty can't be changed during a run. **Help** opens the game rules.
- **Per-difficulty leaderboard:** one Top-10 list for each difficulty, with tabs and a **Difficulty** column.
- **Auto-save & Continue Game:** the run is saved to `localStorage` after every change that matters, on pause and when the page closes. On the next visit **Continue Game** restores it paused, with the same stock, recipe and cauldron. Game over and **Exit to Menu** clear the save; a broken save is deleted and never crashes the game.

| Setting                     | Easy  | Medium | Hard  |
| --------------------------- | :---: | :----: | :---: |
| Ingredients on shelf        |   4   |   6    |   8   |
| Max ingredients in cauldron |   4   |   4    |   5   |
| Starting time               | 180 s | 150 s  | 150 s |
| Recipe tolerance            |  ±12  |   ±8   |  ±5   |
| Lives                       |   5   |   3    |   3   |
| Score per brew              |  100  |  200   |  300  |
| Time bonus per brew         | +15 s | +10 s  | +5 s  |

**Level 3 — the full game**

- **Drag & drop:** drag a shelf card into the cauldron with the mouse (HTML5 drag events). The cauldron glows as a drop zone; drops are ignored when paused or full. Clicking still works.
- **Tooltip:** cards show only the icon, name and stock; the 3 numbers appear in a tooltip on hover or focus. It opens to the left near the right edge, upward near the bottom edge, and is hidden while paused.
- **Chemical reactions:** a typed table of 15 reactions. Easy has none, Medium uses **Bubbling** and **Solar Frost**, Hard uses **Volatile Mix**, **Pressure Spike** and **Steam Burst**. The mix is recalculated from the ingredient list with the active reactions applied. A reaction fires only when it turns active, and its one-time effect (time, a life, clearing the cauldron) happens once.
- **Pour Out:** empties the cauldron for −10 s without losing a life; poured ingredients are not returned.
- **Visual feedback:** ingredient icons float in a CSS-drawn cauldron; a correct brew shows a sparkle burst with the time bonus, a failed brew an explosion and a screen shake. CSS animations only.
- **Keyboard shortcuts:** during play only, see the table below. They are ignored on the start, pause and Game Over screens and while typing.

| Key       | Action                                    |
| --------- | ----------------------------------------- |
| `1`–`8`   | Add the ingredient in that shelf slot     |
| `B`       | Brew                                      |
| `O`       | Pour Out                                  |
| `P`/`Esc` | Pause (`Esc` in the pause window resumes) |

## How to play

1. Open **Settings** and choose **Easy**, **Medium** or **Hard** (Medium by default). **Help** shows the rules.
2. Press **Start Game**. A random recipe appears with 3 target ranges, and the shelf fills with ingredients.
3. Click or drag ingredients into the cauldron (or press `1`–`8`). Hover a card to see its values. The 3 bars show the current mix and glow green when a value is inside its target zone. On Medium and Hard watch for reactions.
4. Press **Brew** (`B`). If all 3 values are inside the zones (with the difficulty tolerance), you score points and gain time; otherwise you lose a life. Used ingredients are gone either way. **Pour Out** (`O`) empties a bad mix for 10 seconds instead.
5. Keep brewing until the time runs out, all lives are lost, or the ingredients run out.
6. Use **Pause** (`P` / `Esc`) at any time. If you close the page, **Continue Game** brings the run back. A Top-10 score can be saved to the **Leaderboard** of its difficulty.

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
├── data/          # fixed game data: ingredients, recipes, reactions, difficulty, bar scales
├── logic/         # pure game rules: stock, sums, reactions, brew check, timer, save, shortcuts
├── state/         # the store that holds the game state
├── storage/       # localStorage access for the leaderboards and the saved game
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
