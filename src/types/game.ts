export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'game-over';

export type GameOverReason = 'time' | 'lives' | 'ingredients';

export interface IIngredient {
  id: string;
  name: string;
  icon: string;
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IRecipeRange {
  min: number;
  max: number;
}

export interface IRecipe {
  id: string;
  name: string;
  difficulty: Difficulty;
  temperature: IRecipeRange;
  density: IRecipeRange;
  magicPower: IRecipeRange;
}

export interface ICauldronValues {
  temperature: number;
  density: number;
  magicPower: number;
}

export type Parameter = keyof ICauldronValues;

export interface IBrewResult {
  success: boolean;
  count: number;
}

export type ReactionKind = 'ingredients' | 'stats' | 'mix';

export interface IReaction {
  id: string;
  name: string;
  kind: ReactionKind;
  effect: string;
  isActive: (ingredients: readonly IIngredient[]) => boolean;
  apply: (values: ICauldronValues) => ICauldronValues;
  timePenalty?: number;
  livesLost?: number;
  clearsCauldron?: boolean;
}

export interface IReactionEvent {
  ids: string[];
  count: number;
}

export interface IGameState {
  status: GameStatus;
  difficulty: Difficulty;
  score: number;
  timeLeft: number;
  endTime: number | null;
  lives: number;
  activeRecipe: IRecipe | null;
  shelf: IIngredient[];
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>;
  gameOverReason: GameOverReason | null;
  lastBrew: IBrewResult | null;
  lastReaction: IReactionEvent | null;
}
