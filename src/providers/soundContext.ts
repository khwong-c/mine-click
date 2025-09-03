import {createContext, useContext} from 'react';


export const SoundContext = createContext<{
    playDig: () => void,
    playHit: () => void,
}>({
    playDig: () => {
    },
    playHit: () => {
    },
});

export const useSoundContext = () => useContext(SoundContext);


