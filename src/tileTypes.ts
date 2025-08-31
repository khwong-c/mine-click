import picStone from "./images/Stone.png";
import picCoalOre from "./images/coal_ore.png";
import picIronOre from "./images/Iron_Ore_JE3.png";
import picGoldOre from "./images/Gold_Ore_JE3_BE2.png";
import picDiamondOre from "./images/DiamondOreNew.png";
import picRedstoneOre from "./images/Redstone_Ore_JE2_BE2.png";

export const TilePics: {[key:string] : string} = {
    "Stone": picStone,
    "Coal": picCoalOre,
    "Iron": picIronOre,
    "Gold": picGoldOre,
    "Diamond": picDiamondOre,
    "Redstone": picRedstoneOre,
};
export const TileNames = [
    "Stone",
    "Coal",
    "Iron",
    "Gold",
    "Diamond",
    "Redstone",
];

export const TileTypeCount = TileNames.length;
