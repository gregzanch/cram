//@ts-ignore
import * as THREE from "three";
import matcapPorcelainWhite from "../res/matcaps/matcap-porcelain-white.jpg";
import matcapRazin from "../res/matcaps/razin.png";
import triPattern from "../res/textures/tri_pattern.jpg"

const loader = new THREE.TextureLoader();
export const MATCAP_PORCELAIN_WHITE = loader.load(matcapPorcelainWhite);
export const MATCAP_RAZIN = loader.load(matcapRazin);
export const TEXTURE_TRI_PATTERN = loader.load(triPattern);