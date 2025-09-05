import {TileRecord} from "../type.ts";
import {TilePics} from "../tileTypes.ts";
import {useMediaQuery} from "usehooks-ts";
import {motion} from "motion/react";
import {useWebSocket} from "../providers/wsContext.ts";
import {useEffect, useMemo, useState} from "react";

export const ClickRecord = (props: {
    clickRecord: { local: TileRecord, global: TileRecord },
}) => {
    const {clickRecord} = props;
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    const colors = useMemo(() => ({
        hotBG: "#a16207",
        hotFG: "#fef08a",
        coolBG: "#164e63",
        coolFG: "#bfdbfe",
    }), [])

    const [motionKey, setMotionKey] = useState<Record<string, string>>({});
    const ws = useWebSocket()

    useEffect(() => {
        ws.setCallbacks({
            id: "clickRecord",
            onClick: (tile) => {
                setMotionKey({
                    ...motionKey,
                    [tile]: `${tile}-${Math.random()}`,
                })
            }
        })
    }, [colors, motionKey, ws])

    return <div
        className={`${isPhone ? "w-screen" : "w-80"} px-2 py-0`}
        style={{
            userSelect: "none",
            zIndex: 10,
        }}
    >
        <ul>
            {Object.entries(clickRecord.local).map(([key, value]) => (
                <li key={key}>
                    <motion.div
                        className="rounded-2xl m-1 py-0.5 pl-4 pr-8 flex bg-cyan-900 text-blue-200 items-center justify-start w-full"
                        initial={{
                            backgroundColor: colors.coolBG,
                            color: colors.coolFG,
                        }}
                        animate={(motionKey[key] ?? null) != null ? {
                            backgroundColor: [colors.hotBG, colors.coolBG],
                            color: [colors.hotFG, colors.coolFG],
                        } : false}
                        transition={{
                            ease: "easeOut"
                        }}
                        key={motionKey[key] || key}
                    >
                        <div className="items-center justify-between">
                            <img src={TilePics[key]} alt="tile"
                                 className={`rounded-2xl ${isPhone ? "size-6" : "size-8"}`}/>
                        </div>
                        <div className="items-center">Yours: {value} /
                            Global: {clickRecord.global[key] ?? 0}</div>
                    </motion.div>
                </li>
            ))}
        </ul>
    </div>;
}