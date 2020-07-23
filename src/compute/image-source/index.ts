
import * as THREE from "three";
import Surface from "../../objects/surface";

export class ImageSourceTreeNode {
  surface?: Surface;
  source: THREE.Vector3;
  children: ImageSourceTreeNode[];
  depth: number;
  getParent: () => ImageSourceTreeNode | undefined;
  constructor(source: THREE.Vector3, depth: number, surface?: Surface, parent?: ImageSourceTreeNode) {
    this.depth = depth;
    this.source = source;
    this.surface = surface;
    this.children = [] as ImageSourceTreeNode[];
    this.getParent = () => parent;
  }
}