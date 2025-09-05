import {useCallback, useEffect, useReducer, useState} from "react";

import {GameState, GameStateContext, GameStateDispatchContext, GameStateDispatchPayload} from "./gameStateContext.ts";
import {TileNames} from "../tileTypes.ts";
import {useInterval} from "usehooks-ts";
import {useWebSocket} from "./wsContext.ts";

const feverModeDuration = 10000; // ms

const GameStateProvider = (props: React.PropsWithChildren) => {
    const {children} = props;

    // Tiles Generation Logic
    const [curID, setCurID] = useState(0);
    const getNewTileProp = useCallback((tileType: string) => {
        const result = {
            id: curID,
            tileProp: {
                speed: {
                    vx: (Math.random() + 0.5) * Math.sign(Math.random() - 0.5),
                    by: {x: Math.random() * 0.5, y: -Math.random() * 0.7 - 0.3},
                },
                type: tileType,
            },
        }
        setCurID(curID + 1);
        return result
    },[curID])

    const [gameState, gameStateDispatch] = useReducer(
        (prev: GameState, payload: GameStateDispatchPayload) => {
            switch (payload.command) {
                case "add": {
                    const tileType = payload.tileType ?? TileNames[0];
                    return {...prev, tiles: [...prev.tiles, getNewTileProp(tileType)],};
                }
                case "remove":
                    return {...prev, tiles: prev.tiles.filter(tile => tile.id !== payload.id),};
                case "startAutoTap":
                    return {...prev, autoTapping: true,};
                case "stopAutoTap":
                    return {...prev, autoTapping: false,};
                case "startFever":
                    return {...prev, feverMode: true,};
                case "stopFever":
                    return {...prev, feverMode: false,};
                default:
                    return prev;
            }
        }, {
            tiles: [],
            feverMode: false,
            autoTapping: false,
        });

    // Fever mode logic
    useInterval(() => {
        gameStateDispatch({command: "stopFever"});
    }, gameState.feverMode ? feverModeDuration : null);

    const ws = useWebSocket();
    useEffect(() => {
        ws.setCallbacks({
            id: "gameState",
            onClick: tile => {
                gameStateDispatch({command:"add", tileType: tile});
            },
        })
    },[gameStateDispatch, ws])

    return (
        <GameStateContext.Provider value={gameState}>
            <GameStateDispatchContext.Provider value={(payload) => gameStateDispatch(payload)}>
                {children}
            </GameStateDispatchContext.Provider>
        </GameStateContext.Provider>
    );
};

export default GameStateProvider;