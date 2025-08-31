import {useState, useReducer} from 'react';
import {useMediaQuery} from "usehooks-ts";
import {CircleButton} from './components/CircleButton';
import {Tile, TileTypeCount, type TileProp} from './components/Tile';
import useSound from "use-sound";

import {digSounds, digSoundSegments, digSoundSegmentsMap} from "./sound/sounds.ts";
import {hitSounds, hitSoundSegments, hitSoundSegmentsMap} from "./sound/sounds.ts";

const hitBeforeDigRatio = 3;

export function App() {
    const [curID, setCurID] = useState(0);
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    const center = isPhone ? {x: 50, y: 75} : {x: 50, y: 50};

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
    const [tiles, dispatch] = useReducer(
        (prev: { id: number, tileProp: TileProp }[], payload: Partial<{ command: string, id: number }>) => {
            switch (payload.command) {
                case "add": {
                    const newTile = getNewTile();
                    return [...prev, newTile];
                }
                case "remove":
                    return prev.filter(t => (t.id != payload.id));
                default:
                    return prev;
            }
        }, [],
    );

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


    const [hitCount, setHitCount] = useState(0);
    const onMining = () => {
        if (hitCount + 1 >= hitBeforeDigRatio) {
            playDig();
            dispatch({command: "add"})
            setHitCount(0);
        } else {
            playHit();
            setHitCount(hitCount + 1);
        }
    }


    return <div className="w-full h-dvh bg-gray-900 overflow-hidden relative">
        <div
            className="absolute w-fit h-fit z-20"
            style={{
                left: `${center.x}vw`, top: `${center.y}vh`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <CircleButton onClick={onMining}/>
        </div>
        {/* Render tiles */}
        {tiles.map(tile => <Tile
            key={tile.id} id={tile.id} tileProp={tile.tileProp}
            center={center}
            onComplete={(id) => {
                dispatch({command: "remove", id: id});
            }}
        />)}
    </div>;
}


