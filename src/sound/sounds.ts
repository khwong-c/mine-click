import digSounds from "./dig.ogg";
import hitSounds from "./hit.ogg";

export { digSounds, hitSounds };

export const digSoundSegments: [number, number][] = [
    [0, 500],
    [500, 500],
    [1000, 500],
    [1500, 500],
];
export const hitSoundSegments: [number, number][] = [
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

export const digSoundSegmentsMap = enumerate(digSoundSegments);
export const hitSoundSegmentsMap = enumerate(hitSoundSegments);

