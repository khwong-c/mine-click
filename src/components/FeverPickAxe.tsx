import {motion} from "motion/react"

import picPickAxe from "../images/pickaxe.png";

export function FeverPickAxe() {
    return <div
        className="items-center"
        style={{
            zIndex: 1000,
            position: "absolute",
            top: "50%",
            left: "50%",
            pointerEvents: "none",
        }}

    >
        <div
            className="w-fit h-fit"
            style={{
                transform: "translate(-50%, -50%)",
            }}
        >
            <motion.img
                src={picPickAxe}
                initial={{opacity: 0, scale: 1.2}}
                animate={{
                    opacity: [0.8, 0.0],
                    scale: [1.2, 0.7]
                }}
                transition={{duration: 1.0, ease: "easeInOut"}}
                style={{
                    userSelect: "none",
                    width: "80vw",
                    height: "80vh",
                    objectFit: "contain",
                }}
                alt="Fever Pickaxe"
                draggable="false"/>
        </div>
    </div>;
}