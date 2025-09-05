import {useEffect, useReducer, type PropsWithChildren, useCallback} from "react";
import type {TileRecord} from "../type.ts";
import {
    ClickRecContext, ClickRecControllerContext,
    type ClickRecDispatchPayload,
} from './clickRecContext.ts';
import {useLocalStorage} from "usehooks-ts";
import {useWebSocket} from "./wsContext.ts";

const ClickRecProviders = (props: PropsWithChildren) => {
    const {children} = props;
    const ws = useWebSocket();

    const [globalClickRec, globalClickRecDispatch] = useReducer(
        (state: TileRecord, payload: ClickRecDispatchPayload) => {
            switch (payload.command) {
                case "add": {
                    const type = payload.tileType ?? "";
                    const curCount = state[type] ?? 0;
                    return {...state, [type]: curCount + 1,};
                }
                case "set": {
                    return payload.newRecord ?? state;
                }
                default:
                    return state;
            }
        }, {});

    // Tile Record Logic
    const [localTileRecord, updateTileRecord] = useLocalStorage<TileRecord>("TileRecord-20250903", {});
    const addTileToLocalRecord = useCallback(
        (newTile: string) => {
            updateTileRecord({
                ...localTileRecord,
                [newTile]: (localTileRecord[newTile] ?? 0) + 1,
            });
        }, [localTileRecord, updateTileRecord]
    )

    const clickRecController = async (payload: ClickRecDispatchPayload) => {
        switch (payload.command) {
            case "add": {
                const type = payload.tileType ?? "";
                addTileToLocalRecord(type);
                globalClickRecDispatch(payload);
                break;
            }
            case "set": {
                globalClickRecDispatch(payload);
                break;
            }
            default:
                break;
        }
    }
    useEffect(() => {
        ws.setCallbacks({
            id: "clickRec",
            onClick: addTileToLocalRecord,
            onGlobalClickRecord: (rec) => {
                globalClickRecDispatch({command: "set", newRecord: rec ?? {}});
            },
        });
    }, [ws, globalClickRecDispatch, addTileToLocalRecord]);

    const localWithZeros = {
        ...Object.fromEntries(Object.keys(globalClickRec).map((k) => [k, 0])),
        ...localTileRecord,
    };
    return (
        <ClickRecContext.Provider value={{
            local: localWithZeros,
            global: globalClickRec,
        }}>
            <ClickRecControllerContext.Provider value={clickRecController}>
                {children}
            </ClickRecControllerContext.Provider>
        </ClickRecContext.Provider>
    );
};

export default ClickRecProviders;