import {useState} from "react";
import PickaxeImage from "../images/Enchanted_Diamond_Pickaxe.gif";

export function CircleButton(prop: {
    // onPress: () => void,
    // onRelease: () => void,
    // isPressed: boolean,
    onClick: () => void,
}) {
    const [isPressed, setPressed] = useState(false);
    const {onClick} = prop;
    const onPress = () => {
        setPressed(true);
    };
    const onRelease = () => {
        setPressed(false);
    };

    return <button
        onClick={onClick}
        onMouseDown={onPress} onMouseUp={onRelease} onMouseLeave={onRelease}
        className={`w-64 h-64 rounded-full ${isPressed ? 'bg-green-600 scale-95' : 'bg-green-500 hover:scale-105'} flex items-center justify-center shadow-lg hover:bg-green-400 transition-all duration-200 focus:outline-none z-20`}
        aria-label="Spawn tiles">
        <div className={`relative w-20 h-20 ${isPressed ? 'scale-95' : ''} transition-transform duration-200`}>
            <img
                src={PickaxeImage}
                className="w-full h-full object-contain" draggable="false"/>
        </div>
    </button>;
}