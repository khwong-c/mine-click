import {TileRecord} from "../type.ts";
import {TilePics} from "../tileTypes.ts";
import {useMediaQuery} from "usehooks-ts";
import {motion} from "motion/react";

export const ClickRecord = (props: {
    clickRecord: { local: TileRecord, global: TileRecord },
    lastClicked: string,
}) => {
    const {clickRecord, lastClicked} = props;
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    return <div
        className={`${isPhone ? "w-screen" : "w-80"} px-2 py-0`}
        style={{
            fontSize: "14px",
            color: "#555",
            userSelect: "none",
            zIndex: 1000,
        }}
    >
        <ul>
            {Object.entries(clickRecord.local).map(([key, value]) => (
                <li key={key}>
                    <motion.div
                        className="rounded-2xl m-1 py-0.5 pl-4 pr-8 flex bg-cyan-900 text-blue-200 items-center justify-start w-full"
                        animate={{
                            backgroundColor: [key == lastClicked ? "#a16207" : "#164e63", "#164e63"],
                            color: [key == lastClicked ? "#fef08a" : "#bfdbfe", "#bfdbfe"]
                        }}
                    >
                        <div className="items-center justify-between"><img src={TilePics[key]}
                                                                           className="rounded-2xl size-8"/>
                        </div>
                        <div className="items-center">Yours: {value} /
                            Global: {clickRecord.global[key] ?? 0}</div>
                    </motion.div>
                </li>
            ))}
        </ul>
    </div>;
}