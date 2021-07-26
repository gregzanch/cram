import { Float32BufferAttribute, IcosahedronBufferGeometry, Vector3 } from 'three';

const DEFAULT_BRDF_DETAIL = 1;

export class BRDF {
  /* number of subdivisions */
  public detail: number;

  /**
   * 
   * @param detail number of subdivisions
   */
  constructor(detail: number = DEFAULT_BRDF_DETAIL, absorption){
    this.detail = detail;
    const geometry = new IcosahedronBufferGeometry(1, this.detail);
    const positions = geometry.getAttribute('position') as Float32BufferAttribute;
    const hemiPoints = [] as Vector3[];
    for(let i = 0; i<positions.count; i++){
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      if(z >= 0){
        hemiPoints.push(new Vector3(x,y,z));
      }
    }
  }
}