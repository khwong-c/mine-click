import {useEffect, useReducer} from "react";
import type {TileRecord} from "../type.ts";
import {
    ClickRecContext, ClickRecControllerContext,
    type ClickRecDispatchPayload,
} from './clickRecContext.ts';
import {useLocalStorage} from "usehooks-ts";
import {useWebSocket, useWSCallBack} from "./wsContext.ts";

const ClickRecProviders = (props: React.PropsWithChildren) => {
    const {children} = props;
    const ws = useWebSocket();
    const wsCallback = useWSCallBack();

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
    const addTileToLocalRecord = (newTile: string) => {
        updateTileRecord({
            ...localTileRecord,
            [newTile]: (localTileRecord[newTile] ?? 0) + 1,
        });
    }

    const clickRecController = async (payload: ClickRecDispatchPayload) => {
        switch (payload.command) {
            case "add": {
                const type = payload.tileType ?? "";
                addTileToLocalRecord(type);
                globalClickRecDispatch(payload);
                ws.sendMsg({type: "click", tile: type});
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
        wsCallback.setOnGlobalClickRecord((rec) => {
            globalClickRecDispatch({command: "set", newRecord: rec ?? {}});
        });
    },[wsCallback, globalClickRecDispatch]);

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