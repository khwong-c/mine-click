import picTitle from '../images/title.png';
import {useMediaQuery} from "usehooks-ts";
import {ClickRecord} from "./ClickRecord.tsx";
import {type TileRecord} from "../type.ts";

export function Title(props: {
    clickRecord: {
        local: TileRecord, global: TileRecord,
    }
}) {
    const {clickRecord} = props;
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    return <div
        className="w-screen h-fit p-1 absolute"
    >
        <center>
            <img
                src={picTitle}
                style={{
                    width: isPhone ? "80vw" : "60vw",
                }}
                alt="Title"
                draggable="false"/>
        </center>
        <div className="w-full flex justify-end">
            <ClickRecord clickRecord={clickRecord}/>
        </div>

    </div>;
}