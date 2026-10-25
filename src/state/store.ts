import type { IGameState } from '../types/game';

export type StateListener = (state: IGameState, previous: IGameState) => void;

export interface IStore {
  getState: () => IGameState;
  setState: (next: IGameState) => void;
  subscribe: (listener: StateListener) => () => void;
}

export function createStore(initial: IGameState): IStore {
  let state = initial;
  const listeners = new Set<StateListener>();

  return {
    getState: () => state,
    setState: (next) => {
      if (next === state) return;
      const previous = state;
      state = next;
      for (const listener of listeners) listener(state, previous);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
