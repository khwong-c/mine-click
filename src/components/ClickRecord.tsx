import {TileRecord} from "../type.ts";

export const ClickRecord = (props: { tileRecord: TileRecord}) => {
    const {tileRecord} = props;
    return <div
        style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            fontSize: "14px",
            color: "#555",
            userSelect: "none",
            zIndex: 1000,
        }}
    >
        {Object.entries(tileRecord).map(([key, value]) => (
            value != 0 ?
                <div key={key}>
                    {key}: {value}
                </div> : <></>
        ))}
    </div>;
}