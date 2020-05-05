//@ts-ignore
import * as THREE from "three";
import matcapPorcelainWhite from "../res/matcaps/matcap-porcelain-white.jpg";
import matcapRazin from "../res/matcaps/razin.png";
import triPattern from "../res/textures/tri_pattern.jpg"
import matcapOverexposedOutline from "../res/matcaps/overexposed-outline.png";
import matcapOutline from "../res/matcaps/outline.png";
import matcapUnderShadow from "../res/matcaps/undershadow.png";

const loader = new THREE.TextureLoader();
export const MATCAP_PORCELAIN_WHITE = loader.load(matcapPorcelainWhite);
export const MATCAP_OUTLINE = loader.load(matcapOutline);
export const MATCAP_OVEREXPOSED_OUTLINE = loader.load(matcapOverexposedOutline);
export const MATCAP_RAZIN = loader.load(matcapRazin);
export const MATCAP_UNDER_SHADOW = loader.load(matcapUnderShadow);
export const TEXTURE_TRI_PATTERN = loader.load(triPattern);