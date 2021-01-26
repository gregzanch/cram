//@ts-ignore
import * as THREE from "three";
import matcapPorcelainWhite from "../res/matcaps/matcap-porcelain-white.jpg";
import matcapUnderShadow from "../res/matcaps/undershadow.png";
import checker from '../res/textures/checker.png';

import cursor from '../res/sprites/cursor.png';
import disc from '../res/sprites/disc.png';
import disc2 from '../res/sprites/disc2.png';

const loader = new THREE.TextureLoader();
export const MATCAP_PORCELAIN_WHITE = loader.load(matcapPorcelainWhite);

export const MATCAP_UNDER_SHADOW = loader.load(matcapUnderShadow);
export const TEXTURE_CHECKER = loader.load(checker);

export const SPRITE_CURSOR = loader.load(cursor);
export const SPRITE_DISC = loader.load(disc);
export const SPRITE_DISC2 = loader.load(disc2);