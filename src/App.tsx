import {useState, useReducer} from 'react';
import {useMediaQuery, useInterval} from "usehooks-ts";
import {CircleButton} from './components/CircleButton';
import {Tile, TileTypeCount, type TileProp} from './components/Tile';
import useSound from "use-sound";

import {digSounds, digSoundSegments, digSoundSegmentsMap} from "./sound/sounds.ts";
import {hitSounds, hitSoundSegments, hitSoundSegmentsMap} from "./sound/sounds.ts";

import tunnelBG from "./images/tunnel.webp";
import {FeverPickAxe} from "./components/FeverPickAxe.tsx";

const feverModeDuration = 10000; // ms

interface GameState {
    tiles: { id: number, tileProp: TileProp }[];
    feverMode: boolean;
    autoTapping: boolean;
}

export function App() {
    const [curID, setCurID] = useState(0);
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    const center = isPhone ? {x: 50, y: 75} : {x: 50, y: 80};

    // Tiles
    const getNewTile = () => {
        const result = {
            id: curID,
            tileProp: {
                speed: {
                    vx: (Math.random() + 0.5) * Math.sign(Math.random() - 0.5),
                    by: {x: Math.random() * 0.5, y: -Math.random() * 0.7 - 0.3},
                },
                type: Math.floor(Math.random() * TileTypeCount)
            },
        }
        setCurID(curID + 1);
        return result
    }

    // Sound
    //
    const [digSoundIndex, setDigSoundIndex] = useState(0);
    const [playDigSound] = useSound(digSounds, {
        sprite: digSoundSegmentsMap, volume: 0.50,
    });
    const playDig = () => {
        playDigSound({id: String(digSoundIndex)});
        setDigSoundIndex((digSoundIndex + 1) % digSoundSegments.length);
    }

    const [hitSoundIndex, setHitSoundIndex] = useState(0);
    const [playHitSound] = useSound(hitSounds, {
        sprite: hitSoundSegmentsMap, volume: 0.50,
    });
    const playHit = () => {
        playHitSound({id: String(hitSoundIndex)});
        setHitSoundIndex(Math.floor(Math.random() * hitSoundSegments.length));
    }

    // Game Logic
    const [gameState, dispatch] = useReducer(
        (prev: GameState, payload: Partial<{ command: string, id: number }>) => {
            switch (payload.command) {
                case "add": {
                    const newTile = getNewTile();
                    return {
                        ...prev,
                        tiles: [...prev.tiles, newTile],
                    };
                }
                case "remove":
                    return {
                        ...prev,
                        tiles: prev.tiles.filter(tile => tile.id !== payload.id),
                    };
                case "startAutoTap":
                    return {
                        ...prev,
                        autoTapping: true,
                    };
                case "stopAutoTap":
                    return {
                        ...prev,
                        autoTapping: false,
                    };
                case "startFever":
                    return {
                        ...prev,
                        feverMode: true,
                    };
                case "stopFever":
                    return {
                        ...prev,
                        feverMode: false,
                    };
                default:
                    return prev;
            }
        }, {
            tiles: [],
            feverMode: false,
            autoTapping: false,
        },
    );

    // Fever mode logic
    const feverChance = 0.1;
    useInterval(() => {
        dispatch({command: "stopFever"});
    }, gameState.feverMode ? feverModeDuration : null);
    const hitBeforeDigRatio = gameState.feverMode ? 1 : 3;

    const [hitCount, setHitCount] = useState(0);
    const onMining = () => {
        if (hitCount + 1 >= hitBeforeDigRatio) {
            playDig();
            dispatch({command: "add"})
            if (!gameState.feverMode && Math.random() < feverChance) {
                dispatch({command: "startFever"});
            }
            setHitCount(0);
        } else {
            playHit();
            setHitCount(hitCount + 1);
        }
    }
    // Auto tapping logic
    const autoTapInterval = 333;
    useInterval(() => {
        if (gameState.autoTapping) {
            onMining();
        }
    }, autoTapInterval);


    // Add tiles periodically


    return <div
        className="w-full h-dvh bg-gray-900 overflow-hidden relative"
        style={{
            backgroundImage: `url(${tunnelBG})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
    >
        <div
            className="absolute w-fit h-fit z-20"
            style={{
                left: `${center.x}vw`, top: `${center.y}vh`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <CircleButton
                onClick={onMining}
                onPress={() => dispatch({command: "startAutoTap"})}
                onRelease={() => dispatch({command: "stopAutoTap"})}
            />
        </div>
        {/* Render tiles */}
        {gameState.tiles.map(tile => <Tile
            key={tile.id} id={tile.id} tileProp={tile.tileProp}
            center={center}
            onComplete={(id) => {
                dispatch({command: "remove", id: id});
            }}
        />)}
        {/* Fever mode overlay */}
        {
            gameState.feverMode ? <FeverPickAxe/> : <></>
        }
    </div>;
}


