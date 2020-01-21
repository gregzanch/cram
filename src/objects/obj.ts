export default class Obj{
    renderObject: THREE.Group|THREE.Mesh|THREE.Object3D;
    constructor() {
        this.renderObject = {} as THREE.Group;
    }
    setRenderObject(renderObject: THREE.Group | THREE.Mesh) {
        this.renderObject = renderObject.clone();
    }
}

