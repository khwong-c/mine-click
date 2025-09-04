import {TileRecord} from "../type.ts";
import {TilePics} from "../tileTypes.ts";
import {useMediaQuery} from "usehooks-ts";

export const ClickRecord = (props: { clickRecord: { local: TileRecord, global: TileRecord } }) => {
    const {clickRecord} = props;
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
                    <div className="rounded-2xl bg-cyan-900 m-1 py-0.5 pl-4 pr-8 flex text-blue-200 items-center justify-start w-full"
                    >
                        <div className="items-center justify-between"><img src={TilePics[key]}
                                                                                    className="rounded-2xl size-8"/>
                        </div>
                        <div className="items-center">Yours: {value} /
                            Global: {clickRecord.global[key] ?? 0}</div>
                    </div>
                </li>
            ))}
        </ul>
    </div>;
}