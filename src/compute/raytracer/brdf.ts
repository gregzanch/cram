import { discretize } from '../../common/discretize';

export interface BRDFProps {
  /**
   * the number of discrete chunks in the BRDF
   */
  steps?: number;

  absorptionCoefficient: number;
  diffusionCoefficient: number;
}

export class BRDF {
  coefficients: number[][];
  steps: number;
  getIndex: (v: number) => number;
  constructor(props: BRDFProps) {
    //set member variables;
    this.steps = (props && props.steps) || 10;
    this.coefficients = [] as number[][];
    for (let j = 0; j < this.steps; j++) {
      this.coefficients.push([] as number[]);
    }
    this.getIndex = discretize(this.steps, 0, Math.PI);
    this.set(props.absorptionCoefficient, props.diffusionCoefficient);
  }

  get(angle_in: number, angle_out: number) {
    return this.coefficients[this.getIndex(angle_in)][this.getIndex(angle_out)];
  }
  
  set(absorptionCoefficient: number, diffusionCoefficient: number) {
    const reflected = 1 - absorptionCoefficient;
    const specularEnergy = reflected * (1 - diffusionCoefficient);
    const diffuse = reflected - specularEnergy;
    const diffusedEnergyPerSlot = diffuse / this.steps; // Other than the specular direction
    
    // for each incoming slot
    for (let incoming = 0; incoming < this.steps; incoming++) {
      
      // for each outgoing slot
      for (let outgoing = 0; outgoing < this.steps; outgoing++) {
        
        // set the coefficient to the diffuse energy per slot
        this.coefficients[incoming][outgoing] = diffusedEnergyPerSlot;
        
        
        let specular = this.steps - incoming - 1;
        if (outgoing == specular)
          this.coefficients[incoming][outgoing] += specularEnergy;
      }
    }
    return this;
  }

  randomize() {
    let sum;
    for (let incoming = 0; incoming < this.steps; incoming++) {
      sum = 0;
      for (let outgoing = 0; outgoing < this.steps; outgoing++) {
        this.coefficients[incoming][outgoing] = Math.random();
        sum += this.coefficients[incoming][outgoing];
      }
      for (let outgoing = 0; outgoing < this.steps; outgoing++)
        this.coefficients[incoming][outgoing] =
          this.coefficients[incoming][outgoing] / sum;
    }
    return this;
  }
}

