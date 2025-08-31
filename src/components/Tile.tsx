import {motion} from "motion/react"
import type {Point} from "../type.ts"

export interface TileProp {
    speed: { vx: number, by: Point };
    type: number;
}

import picSand from "../images/sand.png";
import picShroomlight from "../images/shroomlight.png";
import picPodzol from "../images/Podzol.png";
import picMycelium from "../images/Mycelium.png";
import picNetherGoldOre from "../images/nether_gold_ore.png";
import {useState} from "react";


const TilePics = [
    picSand,
    picShroomlight,
    picPodzol,
    picMycelium,
    picNetherGoldOre,
];
const TileNames = [
    "Sand",
    "Schroomligh",
    "Podzol",
    "Mycelium",
    "NetherGoldOre",
];
export const TileTypeCount = TileNames.length;


export function Tile(prop: {
    id: number,
    tileProp: TileProp,
    center: Point,
    onComplete: (id: number) => void,
}) {
    const {id, tileProp, onComplete, center} = prop;
    const duration = 1.0;

    const {vx, by} = tileProp.speed;

    const xPath: string[] = (
        [0.0, duration * vx]
    ).map(
        x => `${x * 50 + center.x}vw`
    );
    const yPath: string[] = (
        [0.0, 1.2]
    ).map(
        y => `${y * 50 + center.y}vh`
    );

    const [hidden, setHidden] = useState(true);

    return <motion.div
        className="absolute w-16 md:w-24 lg:w-32 h-16 md:h-24 lg:h-32"
        hidden={hidden}
        animate={{
            opacity: ["100%", "0%"],
            x: xPath,
            y: yPath,
        }}
        transition={{
            x: {
                duration: duration,
                times: [0, 1],
                ease: ["easeOut"],
            },
            y: {
                duration: duration,
                times: [0, 1],
                ease: [[by.x, by.y, by.x, by.y]],
            },
            opacity: {
                duration: duration,
                times: [0, 1],
                ease: ["easeIn"],
            },
        }}

        onAnimationComplete={() => {
            onComplete(id);
        }}
        onAnimationStart={() => setHidden(false)}
    >
        <div className="content-center w-full h-full"
             style={{
                 transform: "translate(-50%, -50%)",
             }}>
            <img alt="tile" src={TilePics[tileProp.type]}/>
        </div>
    </motion.div>;
}