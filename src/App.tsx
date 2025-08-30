import {useState, useReducer} from 'react';
import {CircleButton} from './components/CircleButton';
import {Tile, TileTypeCount, type TileProp} from './components/Tile';

const center = {x: 50, y: 50,}

export function App() {
    const [curID, setCurID] = useState(0);

    const getNewTile = () => {
        const result = {
            id: curID,
            tileProp: {
                speed: {
                    r: Math.random() * 1.2 + 0.8,
                    theta: Math.random() * 2 * Math.PI,
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


    return <div className="w-full h-screen bg-gray-900 overflow-hidden relative">
        <div
            className="absolute w-fit h-fit z-20"
            style={{
                left: `${center.x}vw`, top: `${center.y}vh`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <CircleButton onClick={() => dispatch({command: "add"})}/>
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


