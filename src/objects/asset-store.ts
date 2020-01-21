//@ts-ignore
import speaker from "!raw-loader!../res/models/speaker.gltf";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";



export interface Assets{
    speaker: THREE.Object3D[];
}
export default class AssetStore{
    assets: {
        speaker: THREE.Object3D[];
    }
    constructor() {
        const gltfloader = new GLTFLoader();
        this.assets = {} as Assets;
        gltfloader.parse(speaker, '../res/models/speaker.gltf', (gltf) => {
            this.assets.speaker = gltf.scene.children;
        })
    }
}