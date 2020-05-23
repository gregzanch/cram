import map from "../../common/map";
import rasterizeLine from './rasterize-line';

export interface FDTDWallProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

class FDTDWall {
  enabled: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cells: number[][];
  previousCells: number[][];
  shouldClearPreviousCells: boolean;
  constructor(props: FDTDWallProps) {
    this.x1 = props.x1;
    this.y1 = props.y1;
    this.x2 = props.x2;
    this.y2 = props.y2;
    this.cells = rasterizeLine(this.x1, this.y1, this.x2, this.y2);
    this.previousCells = this.cells;
    this.shouldClearPreviousCells = false;
    this.enabled = true;
  }
  
  move(props: FDTDWallProps) {
    this.previousCells = this.cells;
    this.x1 = props.x1;
    this.y1 = props.y1;
    this.x2 = props.x2;
    this.y2 = props.y2;
    this.cells = rasterizeLine(this.x1, this.y1, this.x2, this.y2);
    this.shouldClearPreviousCells = true;
  }
}

export { FDTDWall };

export default FDTDWall;
