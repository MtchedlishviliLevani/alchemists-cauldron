# Alchemist's Cauldron

A browser puzzle game: mix ingredients, match 3 target ranges and brew potions before time or lives run out.

Built for the [RS School Qualifying Stage](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron) with plain TypeScript. No frameworks, game engines or UI libraries.

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

## Repository workflow

- `main` holds released code only.
- `story-N` is the base branch for each story: `story-1` comes from `main`, `story-2` from `story-1`, and `story-3` from `story-2`.
- Each task is a `<type>/<short-description>` branch from the current story branch, merged back through a pull request.
- When a story is finished, an unmerged pull request from `story-N` into the previous branch is submitted for cross-check.

Commit messages follow the [RS School git convention](https://rs.school/docs/git-convention): `<type>: <subject>`, where type is one of `init`, `feat`, `fix`, `refactor`, `docs`, `style`, `test` or `chore`.
