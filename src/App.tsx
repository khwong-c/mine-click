import {useState, useReducer} from 'react';
import {useMediaQuery} from "usehooks-ts";
import {CircleButton} from './components/CircleButton';
import {Tile, TileTypeCount, type TileProp} from './components/Tile';
import useSound from "use-sound";

import digSounds from "./sound/dig.ogg"

export function App() {
    const [curID, setCurID] = useState(0);
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    const center = isPhone ? {x: 50, y: 75} : {x: 50, y: 50};


    const getNewTile = () => {
        const result = {
            id: curID,
            tileProp: {
                speed: {
                    vx : (Math.random() + 0.5) * Math.sign(Math.random() - 0.5),
                    by: {x: Math.random() * 0.5, y: -Math.random()*0.7 - 0.3},
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

    const [playDig] = useSound(digSounds, {
        sprite: {
            0: [0, 500],
            1: [500, 500],
            2: [1000, 500],
            3: [1500, 500],
        },
        volume: 0.85,
    });

    const onMining = () => {
        playDig({id: String(Math.floor(Math.random() * 4))});
        dispatch({command: "add"})
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


