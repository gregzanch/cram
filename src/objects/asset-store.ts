//@ts-ignore
import * as THREE from "three";
import matcapPorcelainWhite from "../res/matcaps/matcap-porcelain-white.jpg";
import matcapRazin from "../res/matcaps/razin.png";


const loader = new THREE.TextureLoader();
export const MATCAP_PORCELAIN_WHITE = loader.load(matcapPorcelainWhite);
export const MATCAP_RAZIN = loader.load(matcapRazin);
