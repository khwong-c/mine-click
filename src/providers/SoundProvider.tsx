import {useState} from "react";
import useSound from "use-sound";
import {SoundContext} from "./soundContext.ts";

import digSounds from "../sound/dig.ogg";
import hitSounds from "../sound/hit.ogg";

const digSoundSegments: [number, number][] = [
    [0, 500],
    [500, 500],
    [1000, 500],
    [1500, 500],
];
const hitSoundSegments: [number, number][] = [
    [0, 610],
    [610, 480],
    [1090, 420],
    [1510, 550],
];

const enumerate = (segments: Array<[number, number]>) => Object.fromEntries(
    segments.map(
        (v, i) => [String(i), v]
    )
);

const digSoundSegmentsMap = enumerate(digSoundSegments);
const hitSoundSegmentsMap = enumerate(hitSoundSegments);

const SoundProvider = (props: React.PropsWithChildren) => {
    const {children} = props;
    const soundVol = 0.50;

    // Sound
    const [digSoundIndex, setDigSoundIndex] = useState(0);
    const [playDigSound] = useSound(digSounds, {sprite: digSoundSegmentsMap, volume: soundVol});
    const [hitSoundIndex, setHitSoundIndex] = useState(0);
    const [playHitSound] = useSound(hitSounds, {sprite: hitSoundSegmentsMap, volume: soundVol});


    const soundController = {
        playDig: () => {
            playDigSound({id: String(digSoundIndex)});
            setDigSoundIndex((digSoundIndex + 1) % digSoundSegments.length);
        },
        playHit: () => {
            playHitSound({id: String(hitSoundIndex)});
            setHitSoundIndex(Math.floor(Math.random() * hitSoundSegments.length));
        },
    }

    return (
        <SoundContext.Provider value={soundController}>
            {children}
        </SoundContext.Provider>
    )
};

export default SoundProvider;