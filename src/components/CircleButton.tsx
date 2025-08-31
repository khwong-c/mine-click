import {motion} from "motion/react"
import {useState} from "react";
import GrassBlock from "../images/Grass_Block.png";

export function CircleButton(prop: {
    onPress: () => void,
    onRelease: () => void,
    onClick: () => void,
}) {
    const [isPressed, setPressed] = useState(false);
    const {onClick, onPress, onRelease} = prop;
    const onPressHandler = () => {
        onPress();
        setPressed(true);
    };
    const onReleaseHandler = () => {
        onRelease();
        setPressed(false);
    };

    return <motion.div whileTap={{scale: 0.8}}>
        <button
            onClick={onClick}
            onMouseDown={onPressHandler} onMouseUp={onReleaseHandler} onMouseLeave={onReleaseHandler}
            onTouchStart={onPressHandler} onTouchEnd={onReleaseHandler} onTouchCancel={onReleaseHandler} onTouchMove={onReleaseHandler}
            className={`w-24 md:w-32 lg:w-48 h-24 md:h-32 lg:h-48 rounded-full ${isPressed ? 'bg-gray-500' : 'bg-gray-700 hover:scale-105'} flex items-center justify-center shadow-lg hover:bg-gray-600 transition-all duration-200 focus:outline-none`}
            aria-label="Spawn tiles">
            <div className={`relative w-20 h-20 `}>
                <img
                    src={GrassBlock}
                    onContextMenu={
                        (e) => {
                            e.preventDefault()
                            return false
                        }
                    }
                    alt="Press to mine"
                    className="w-full h-full object-contain" draggable="false"/>
            </div>
        </button>
    </motion.div>;
}