import { Node } from './node';
import { PolygonTreeNode } from "./polygon-tree-node";


// # class Tree
// This is the root of a BSP tree
// We are using this separate class for the root of the tree, to hold the PolygonTreeNode root
// The actual tree is kept in this.rootnode
export class Tree {
  polygonTree: PolygonTreeNode;
  rootnode: Node;
  constructor(polygons) {
    this.polygonTree = new PolygonTreeNode();
    this.rootnode = new Node();
    if (polygons) {
      this.addPolygons(polygons);
    }
  }

  invert() {
    this.polygonTree.invert();
    this.rootnode.invert();
  }

  // Remove all polygons in this BSP tree that are inside the other BSP tree
  // `tree`.
  clipTo(tree, alsoRemovecoplanarFront) {
    alsoRemovecoplanarFront = !!alsoRemovecoplanarFront;
    this.rootnode.clipTo(tree, alsoRemovecoplanarFront);
  }

  allPolygons() {
    let result = [];
    this.polygonTree.getPolygons(result);
    return result;
  }

  addPolygons(polygons) {
    let polygontreenodes = new Array(polygons.length);
    for (let i = 0; i < polygons.length; i++) {
      polygontreenodes[i] = this.polygonTree.addChild(polygons[i]);
    }
    this.rootnode.addPolygonTreeNodes(polygontreenodes);
  }

  clear() {
    this.polygonTree.clear();
  }

  toString() {
    let result = `Tree: ${this.polygonTree.toString()}`;
    return result;
  }
}

export default Tree;
