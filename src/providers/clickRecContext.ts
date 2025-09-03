import {createContext, useContext} from 'react';
import {TileRecord} from "../type.ts";

export type ClickRecDispatchPayload = Partial<{ command: string, tileType: string, newRecord: TileRecord }>;

export const ClickRecContext = createContext<{ local: TileRecord, global: TileRecord }>({local: {}, global: {}});
export const ClickRecControllerContext = createContext<(payload: ClickRecDispatchPayload) => void>(() => ({}));

export const useClickRec = () => useContext(ClickRecContext);
export const useClickRecController = () => useContext(ClickRecControllerContext);

