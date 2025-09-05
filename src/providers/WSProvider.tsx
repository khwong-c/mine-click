import useWebSocket from 'react-use-websocket';
import {ReadyState} from 'react-use-websocket';
import * as React from "react";
import {WS_ENDPOINT} from "../config.ts";

import {WSResponse, WSCallbacks, WebSocketContext, WSCallbackDispatch} from "./wsContext.ts"
import {useReducer} from "react";

export default function WSProvider(props: React.PropsWithChildren) {
    const {children} = props;
    const [callbacks, setCallbacks] = useReducer(
        (cb: WSCallbacks, payload: WSCallbackDispatch): WSCallbacks => {
            if (payload?.onClick != null) {
                cb.onClick[payload.id] = payload.onClick;
            }
            if (payload?.onGlobalClickRecord != null) {
                cb.onGlobalClickRecord[payload.id] = payload.onGlobalClickRecord;
            }
            return cb;
        }, {
            onGlobalClickRecord: {},
            onClick: {},
        }
    );
    const {
        sendJsonMessage,
        readyState,
    } =
        useWebSocket(WS_ENDPOINT, {
            onMessage: (e) => {
                const msg = JSON.parse(e.data) as WSResponse;
                if (msg?.tile != null) {
                    const tile = msg.tile
                    Object.values(callbacks.onClick).forEach(
                        (callback) => callback(tile)
                    );
                }
                if (msg?.clicks != null) {
                    const clicks = msg.clicks
                    Object.values(callbacks.onGlobalClickRecord).forEach(
                        (callback) => callback(clicks)
                    );
                }
            },
            shouldReconnect: () => true,
            disableJson: false,
            heartbeat: {
                returnMessage: "pong",
            }
        });
    return (
        <WebSocketContext.Provider value={{
            sendMsg: sendJsonMessage,
            setCallbacks: setCallbacks,
        }}>
            {readyState != ReadyState.OPEN ?
                <div
                    className="w-dvw h-dvh absolute backdrop-blur-md items-center justify-center content-center z-50">
                    <center><p className="font-extrabold text-9xl bg-emerald-900">Loading...</p></center>
                </div> :
                <></>}
            {children}
        </WebSocketContext.Provider>
    )
}
