import {TileRecord} from "../type.ts";
import {createContext, useContext, type ActionDispatch} from "react";

type WSRequestTypeEnum = "click"
export type WSRequest = {
    type: WSRequestTypeEnum;
} & Partial<{
    tile: string,
}>

export type WSResponse = Partial<{
    clicks: TileRecord,     // Click records from the server
    tile: string,           // New tile from click event
}>

export type WSCallbacks = {
    onClick: Record<string, (tile: string) => void>,
    onGlobalClickRecord: Record<string, (rec: TileRecord) => void>,
}

export type WSCallbackDispatch = {
    id: string,
    onClick?: (tile: string) => void,
    onGlobalClickRecord?: (rec: TileRecord) => void,
}

export type WebSocketSession = {
    sendMsg: (msg: WSRequest) => void,
    setCallbacks: ActionDispatch<[payload: WSCallbackDispatch]>
}

export const WSCallbackContext = createContext<
    ActionDispatch<[payload: WSCallbackDispatch]> | null
>(null);

export const WebSocketContext = createContext<WebSocketSession>({
    sendMsg: () => {},
    setCallbacks: ()=> {},
})

export const useWebSocket = () => useContext(WebSocketContext);