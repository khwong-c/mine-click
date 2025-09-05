import useWebSocket from 'react-use-websocket';
import {ReadyState} from 'react-use-websocket';
import * as React from "react";
import {WS_ENDPOINT} from "../config.ts";

import {WSResponse, WSCallbacks, WSCallbackContext, WebSocketContext} from "./wsContext.ts"
import {useReducer} from "react";

export default function WSProvider(props: React.PropsWithChildren) {
    const {children} = props;
    const [callbacks, setCallbacks] = useReducer(
        (cb: WSCallbacks, payload: Partial<WSCallbacks>): WSCallbacks => {
            if (payload?.onClick != null) {
                cb.onClick = payload.onClick;
            }
            if (payload?.onGlobalClickRecord != null) {
                cb.onGlobalClickRecord = payload.onGlobalClickRecord;
            }
            return cb;
        }, {
            onGlobalClickRecord: () => {
            },
            onClick: () => {
            },
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
                    callbacks.onClick(msg.tile)
                }
                if (msg?.clicks != null) {
                    callbacks.onGlobalClickRecord(msg.clicks)
                }
            },
            shouldReconnect: () => false,
            disableJson: false,
            heartbeat: {
                returnMessage: "pong",
            }
        });
    return (
        <WebSocketContext.Provider value={{
            sendMsg: (msg) => {
                sendJsonMessage(msg);
            },
        }}>
            <WSCallbackContext.Provider value={{
                setOnClick: (cb) => {
                    setCallbacks({onClick: cb});
                },
                setOnGlobalClickRecord: (cb) => {
                    setCallbacks({onGlobalClickRecord: cb});
                },
            }}>
                {readyState != ReadyState.OPEN ?
                    <div
                        className="w-dvw h-dvh absolute backdrop-blur-md items-center justify-center content-center z-50">
                        <center><p className="font-extrabold text-9xl bg-emerald-900">Loading...</p></center>
                    </div> :
                    <></>}
                {children}
            </WSCallbackContext.Provider>
        </WebSocketContext.Provider>
    )
}
