import {motion, type Easing} from "motion/react"
import type {Point} from "../type.ts"

export interface TileProp {
    speed: { r: number, theta: number };
    type: number;
}

import picSand from "../images/sand.png";
import picShroomlight from "../images/shroomlight.png";
import picPodzol from "../images/Podzol.png";
import picMycelium from "../images/Mycelium.png";
import picNetherGoldOre from "../images/nether_gold_ore.png";


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
    const g = 2.0;
    const duration = 1.0;

    const {r, theta} = tileProp.speed;

    const vX = Math.sin(theta) * r;
    const vY = Math.cos(theta) * r;

    const xPath = [`${center.x}vw`, `${vX * 50 + center.x}vw`];
    const yPath: string[] = (
        (vY <= 0) ? [0.0, -(vY ** 2) / 2 / g, g / 2 + vY] : [0.0, g / 2 + vY]
    ).map(
        y => `${y * 50 + center.y}vh`
    );
    const yTime: number[] = (vY <= 0) ? [0, -vY, 1] : [0, 1];
    const yEase: Easing[] = (vY <= 0) ? ["circOut", "circIn"] : ["circIn"];

    return <motion.div
        className="absolute w-16 md:w-24 lg:w-32 h-16 md:h-24 lg:h-32"
        animate={{
            opacity: ["100%", "0%"],
            x: xPath,
            y: yPath,
        }}
        transition={{
            x: {
                duration: duration,
                times: [0, 1],
                ease: ["linear"],
            },
            y: {
                duration: duration,
                times: yTime,
                ease: yEase,
            },
            opacity: {
                duration: duration,
                times: [0, 1],
                ease: ["easeOut"],
            },
        }}

        onAnimationComplete={() => {
            onComplete(id);
        }}
    >
        <div
            className="content-center w-full h-full"
            style={{
                transform: "translate(-50%, -50%)",
            }}
        >
            <img alt="tile" src={TilePics[tileProp.type]}/>
        </div>
    </motion.div>;
}