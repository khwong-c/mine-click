import type {TileProp} from "../components/Tile.tsx";
import {createContext, useContext} from "react";

export type GameState = {
    tiles: { id: number, tileProp: TileProp }[];
    feverMode: boolean;
    autoTapping: boolean;
}
export type GameStateDispatchPayload = Partial<{ command: string, id: number, tileType: string }>
export const GameStateContext = createContext<GameState>({
    tiles: [],
    feverMode: false,
    autoTapping: false,
});
export const GameStateDispatchContext = createContext<(payload: GameStateDispatchPayload) => void>(() => ({}));

export const useGameState = () => useContext(GameStateContext);
export const useGameStateController = () => useContext(GameStateDispatchContext);