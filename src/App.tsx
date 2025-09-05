import {useState} from 'react';
import {useMediaQuery, useInterval} from "usehooks-ts";
import {CircleButton} from './components/CircleButton';
import {Tile} from './components/Tile';


import tunnelBG from "./images/tunnel.webp";
import {FeverPickAxe} from "./components/FeverPickAxe.tsx";
import {Title} from "./components/Title.tsx";
import {useClickRec} from "./providers/clickRecContext.ts";
import {useGameState, useGameStateController} from "./providers/gameStateContext.ts";
import {useSoundContext} from "./providers/soundContext.ts";
import {useWebSocket} from "./providers/wsContext.ts";

export function App() {
    // Layout
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    const center = isPhone ? {x: 50, y: 75} : {x: 50, y: 80};

    const ws = useWebSocket();

    // Clicks and Display
    const clickRecord = useClickRec();
    const gameState = useGameState();
    const gameStateController = useGameStateController();

    // Sound
    const sound = useSoundContext()

    const [hitCount, setHitCount] = useState(0);
    const hitBeforeDigRatio = gameState.feverMode ? 1 : 3;

    // Fever mode logic
    // 95% chances to trigger fever mode for digging 50 tiles.
    // Around 15 seconds for human click, 50 seconds for auto-tap
    const feverChance = 0.05816;
    const onMining = async () => {
        if (hitCount + 1 >= hitBeforeDigRatio) {
            ws.sendMsg({type: "click"});
            if (!gameState.feverMode && Math.random() < feverChance) {
                gameStateController({command: "startFever"});
            }
            setHitCount(0);
        } else {
            sound.playHit();
            setHitCount(hitCount + 1);
        }
    }
    // Auto tapping logic
    const autoTapInterval = 333;
    useInterval(async () => {
        if (gameState.autoTapping) {
            await onMining();
        }
    }, autoTapInterval);

    return <div
        className="w-full h-dvh bg-gray-900 overflow-hidden relative"
        style={{
            backgroundImage: `url(${tunnelBG})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
    >
        <Title clickRecord={clickRecord}/>
        <div
            className="absolute w-fit h-fit z-20"
            style={{
                left: `${center.x}vw`, top: `${center.y}vh`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <CircleButton
                onClick={onMining}
                onPress={() => gameStateController({command: "startAutoTap"})}
                onRelease={() => gameStateController({command: "stopAutoTap"})}
            />
        </div>
        {/* Render tiles */}
        {gameState.tiles.map(tile => <Tile
            key={tile.id} id={tile.id} tileProp={tile.tileProp}
            center={center}
            onComplete={(id) => {
                gameStateController({command: "remove", id: id});
            }}
        />)}
        {/* Fever mode overlay */}
        {
            gameState.feverMode ? <FeverPickAxe/> : <></>
        }
    </div>;
}


