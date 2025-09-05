import {TileRecord} from "../type.ts";
import {createContext, useContext} from "react";

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
    onClick: (tile: string) => void,
    onGlobalClickRecord: (rec: TileRecord) => void,
}

export type WSCallbacksRegister = {
    setOnClick: (cb: (tile: string) => void)=>void,
    setOnGlobalClickRecord: (cb: (rec: TileRecord) => void)=>void,
}

export type WebSocketSession = {
    sendMsg: ((msg: WSRequest) => void),
}

export const WSCallbackContext = createContext<WSCallbacksRegister>({
    setOnClick: () => {
    },
    setOnGlobalClickRecord: () => {
    },
});

export const WebSocketContext = createContext<WebSocketSession>({
    sendMsg: () => {},
})

export const useWSCallBack = () => useContext(WSCallbackContext);
export const useWebSocket = () => useContext(WebSocketContext);