import {useReducer, useState} from "react";
import type {TileRecord} from "../type.ts";
import {
    ClickRecContext, ClickRecControllerContext,
    type ClickRecDispatchPayload,
} from './clickRecContext.ts';
import {useInterval, useLocalStorage} from "usehooks-ts";

import {API_URL} from "../config.ts";

const FETCH_CLICK_URL = `${API_URL}/clicks`;
const SUBMIT_CLICK_URL = `${API_URL}/click`;
const FETCH_INTERVAL = 2 * 1000; // 2 seconds


const ClickRecProviders = (props: React.PropsWithChildren) => {
    const {children} = props;
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
                fetch(`${SUBMIT_CLICK_URL}/${type}`, {
                    method: "POST",
                    keepalive: true,
                }).then()
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

    const [interval, setInterval] = useState<number>(0)
    const fetchClicks = async () => {
        setInterval(FETCH_INTERVAL);
        fetch(FETCH_CLICK_URL, {
            method: 'GET',
        }).then(
            (rsp) => rsp.json()
        ).then(
            (rsp: {
                clicks: TileRecord,
            }) => {
                globalClickRecDispatch({command: "set", newRecord: rsp.clicks ?? {}});
            }
        ).catch(
            err => console.error(err)
        )
    }
    useInterval(fetchClicks, interval);
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