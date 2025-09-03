import {TileRecord} from "../type.ts";

export const ClickRecord = (props: { clickRecord: { local: TileRecord, global: TileRecord }}) => {
    const {clickRecord} = props;
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
        {Object.entries(clickRecord.local).map(([key, value]) => (
                <div key={key}>
                    {key}: {value} / {clickRecord.global[key] ?? 0}
                </div>
        ))}
    </div>;
}