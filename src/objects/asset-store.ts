//@ts-ignore
import * as THREE from "three";
import matcapPorcelainWhite from "../res/matcaps/matcap-porcelain-white.jpg";
import matcapRazin from "../res/matcaps/razin.png";
import triPattern from "../res/textures/tri_pattern.jpg"
import matcapOverexposedOutline from "../res/matcaps/overexposed-outline.png";
import matcapOutline from "../res/matcaps/outline.png";
import matcapUnderShadow from "../res/matcaps/undershadow.png";
import checker from '../res/textures/checker.png';

import top from '../res/textures/orientation-faces/top.png'
import bottom from '../res/textures/orientation-faces/bottom.png'
import left from '../res/textures/orientation-faces/left.png'
import right from '../res/textures/orientation-faces/right.png'
import front from '../res/textures/orientation-faces/front.png'
import back from '../res/textures/orientation-faces/back.png'

import cursor from '../res/sprites/cursor.png';
import disc from '../res/sprites/disc.png';
import disc2 from '../res/sprites/disc2.png';

const loader = new THREE.TextureLoader();
export const MATCAP_PORCELAIN_WHITE = loader.load(matcapPorcelainWhite);
export const MATCAP_OUTLINE = loader.load(matcapOutline);
export const MATCAP_OVEREXPOSED_OUTLINE = loader.load(matcapOverexposedOutline);
export const MATCAP_RAZIN = loader.load(matcapRazin);
export const MATCAP_UNDER_SHADOW = loader.load(matcapUnderShadow);
export const TEXTURE_TRI_PATTERN = loader.load(triPattern);
export const TEXTURE_CHECKER = loader.load(checker);


export const TEXTURE_ORIENTATION_TOP = loader.load(top);
export const TEXTURE_ORIENTATION_BOTTOM = loader.load(bottom);
export const TEXTURE_ORIENTATION_LEFT = loader.load(left);
export const TEXTURE_ORIENTATION_RIGHT = loader.load(right);
export const TEXTURE_ORIENTATION_FRONT = loader.load(front);
export const TEXTURE_ORIENTATION_BACK = loader.load(back);

export const SPRITE_CURSOR = loader.load(cursor);
export const SPRITE_DISC = loader.load(disc);
export const SPRITE_DISC2 = loader.load(disc2);